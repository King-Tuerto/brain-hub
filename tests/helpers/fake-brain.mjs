// In-memory fake of an Express brain (Supabase REST + Auth + search-brain),
// served through Playwright routes. Wire formats follow docs/phase-2/PLAN.md.
// Modes:
//   locked       RLS on, no anon policy  → anon insert gets 401 / 42501
//   open         June-cohort open policy → anon insert of null content gets 400 / 23502
//   not-express  locked, but functions/v1/search-brain is missing (404)
//   down         every request fails at the network level
import { createHash, randomUUID } from 'node:crypto'
import { FIXED_S } from './contract.mjs'

export const BRAIN_URL = 'https://fake-brain.supabase.co'
export const ANON_KEY = 'sb_publishable_fakeE2Ekey000'
export const STUDENT = Object.freeze({
  id: '0b0b0b0b-1111-4222-8333-444444444444',
  email: 'student@example.com',
  password: 'correct-horse',
})

const md5 = (s) => createHash('md5').update(String(s)).digest('hex')
const pgErr = (code, message) => ({ code, message, details: null, hint: null })

function getPath(obj, path) {
  // "metadata->hub->>type" → obj.metadata.hub.type
  const parts = path.split(/->>?/)
  let v = obj
  for (const p of parts) v = v == null ? undefined : v[p]
  return v
}

export class FakeBrain {
  constructor() {
    this.mode = 'locked'
    this.rows = []
    this.log = []
    this.sessions = new Map() // access_token → user
    this.refresh = new Map() // refresh_token → user
    this.n = 0
    this.nowS = () => FIXED_S // matches the fixed browser clock
  }

  seedDefaults() {
    this.rows.push(
      {
        id: randomUUID(), user_id: STUDENT.id, source: 'text', created_at: '2026-09-15T12:00:00.000Z',
        content: 'Pricing notes: value-based pricing beat cost-plus at my internship.',
        tags: [], category: null, summary: null, metadata: {},
      },
      {
        id: randomUUID(), user_id: STUDENT.id, source: 'brain-hub', created_at: '2026-09-20T12:00:00.000Z',
        content: 'Skills: Excel, SQL and negotiation.', tags: [], category: null, summary: null,
        metadata: { hub: { tool: 'profile-builder', tool_version: '1.0.0', type: 'profile', profile_part: 'skills', tags: ['skills'], report: '## Skills', sources: [], saved_at: '2026-09-20T12:00:00.000Z', archived: false } },
      },
    )
    for (const r of this.rows) r.dedup_key = md5(r.content)
    return this
  }

  async attach(context) {
    await context.route((url) => url.origin === BRAIN_URL, (route) => this.handle(route))
  }

  // ---- log queries for tests ----
  requests(filter = () => true) { return this.log.filter((e) => !e.preflight && filter(e)) }
  authRequests() { return this.requests((e) => e.path.startsWith('/auth/')) }
  hubRows() { return this.rows.filter((r) => r.source === 'brain-hub' && r.metadata?.hub?.tool !== 'profile-builder') }

  cors(req) {
    const h = req.headers()
    return {
      'access-control-allow-origin': h.origin || '*',
      'access-control-allow-headers': h['access-control-request-headers'] || 'apikey, authorization, content-type, prefer, x-client-info',
      'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'access-control-expose-headers': 'content-range',
    }
  }

  send(route, status, body) {
    const headers = { ...this.cors(route.request()) }
    if (body === undefined || status === 204) return route.fulfill({ status, headers, body: '' })
    headers['content-type'] = 'application/json'
    return route.fulfill({ status, headers, body: JSON.stringify(body) })
  }

  userFor(headers) {
    const m = /^Bearer (.+)$/.exec(headers.authorization || '')
    if (!m) return null
    return this.sessions.get(m[1]) || null
  }

  issue(user) {
    this.n++
    const access_token = `fake-access-${this.n}`
    const refresh_token = `fake-refresh-${this.n}`
    this.sessions.set(access_token, user)
    this.refresh.set(refresh_token, user)
    return {
      access_token, token_type: 'bearer', expires_in: 3600, expires_at: this.nowS() + 3600, refresh_token,
      user: { id: user.id, email: user.email, aud: 'authenticated', role: 'authenticated' },
    }
  }

  async handle(route) {
    const req = route.request()
    const url = new URL(req.url())
    const method = req.method()
    const headers = req.headers()
    const entry = {
      method, url: req.url(), path: url.pathname, params: Object.fromEntries(url.searchParams), headers,
      body: req.postData(), preflight: method === 'OPTIONS' && !!headers['access-control-request-method'],
    }
    try { entry.json = entry.body ? JSON.parse(entry.body) : undefined } catch {}
    this.log.push(entry)

    if (this.mode === 'down') return route.abort('connectionrefused')
    if (entry.preflight) return route.fulfill({ status: 204, headers: this.cors(req), body: '' })
    if (headers.apikey !== ANON_KEY) return this.send(route, 401, { message: 'Invalid API key', hint: 'Double check your Supabase `anon` or `service_role` API key.' })

    const p = url.pathname
    if (p === '/auth/v1/token') return this.token(route, entry)
    if (p === '/auth/v1/logout') return this.send(route, 204)
    if (p === '/functions/v1/search-brain') return this.search(route, entry)
    if (p === '/rest/v1/thoughts') {
      if (method === 'POST') return this.insert(route, entry)
      if (method === 'GET') return this.select(route, entry)
      if (method === 'PATCH') return this.patch(route, entry)
    }
    return this.send(route, 404, { message: 'not found in fake brain' })
  }

  token(route, e) {
    const grant = e.params.grant_type
    if (e.method !== 'POST') return this.send(route, 405, {})
    if (grant === 'password') {
      if (e.json?.email === STUDENT.email && e.json?.password === STUDENT.password) return this.send(route, 200, this.issue(STUDENT))
      return this.send(route, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' })
    }
    if (grant === 'refresh_token') {
      const user = this.refresh.get(e.json?.refresh_token)
      if (!user) return this.send(route, 400, { error: 'invalid_grant', error_description: 'Invalid Refresh Token: Refresh Token Not Found' })
      this.refresh.delete(e.json.refresh_token)
      return this.send(route, 200, this.issue(user))
    }
    return this.send(route, 400, { error: 'unsupported_grant_type' })
  }

  search(route, e) {
    if (this.mode === 'not-express') return this.send(route, 404, { code: 'NOT_FOUND', message: 'Requested function was not found' })
    if (e.method === 'OPTIONS') return route.fulfill({ status: 200, headers: this.cors(route.request()), body: 'ok' })
    if (e.method !== 'POST') return this.send(route, 405, {})
    const user = this.userFor(e.headers)
    if (!user) return this.send(route, 401, { msg: 'Invalid JWT' })
    const q = String(e.json?.query ?? '').toLowerCase().trim()
    const limit = Number(e.json?.limit ?? 5)
    const hits = this.rows
      .filter((r) => r.user_id === user.id && q && r.content.toLowerCase().includes(q))
      .slice(0, limit)
      .map((r) => ({ id: r.id, content: r.content, created_at: r.created_at, source: r.source, category: r.category, tags: r.tags, similarity: 0.8, match_source: 'thought' }))
    return this.send(route, 200, { ok: true, mode: 'hybrid', count: hits.length, results: hits })
  }

  insert(route, e) {
    const user = this.userFor(e.headers)
    const prefer = e.headers.prefer || ''
    const list = Array.isArray(e.json) ? e.json : [e.json ?? {}]
    if (!user) {
      // Not signed in: the anon role.
      if (this.mode !== 'open') return this.send(route, 401, pgErr('42501', 'new row violates row-level security policy for table "thoughts"'))
      if (list.some((r) => r.content == null)) {
        return this.send(route, 400, pgErr('23502', 'null value in column "content" of relation "thoughts" violates not-null constraint'))
      }
      // An open brain would accept this. The hub must never get here.
      for (const r of list) this.rows.push(this.newRow(r))
      return this.send(route, 201)
    }
    for (const r of list) {
      if (r.user_id !== user.id) return this.send(route, 403, pgErr('42501', 'new row violates row-level security policy for table "thoughts"'))
      if (r.content == null) return this.send(route, 400, pgErr('23502', 'null value in column "content" of relation "thoughts" violates not-null constraint'))
    }
    const merge = /resolution=merge-duplicates/.test(prefer)
    const conflictCols = e.params.on_conflict
    const out = []
    for (const r of list) {
      const key = r.dedup_key ?? md5(r.content)
      const existing = this.rows.find((x) => x.dedup_key === key && x.user_id === user.id)
      if (existing) {
        if (!(merge && conflictCols === 'dedup_key,user_id')) {
          return this.send(route, 409, pgErr('23505', 'duplicate key value violates unique constraint "idx_thoughts_dedup_key"'))
        }
        Object.assign(existing, r, { dedup_key: key })
        out.push(existing)
      } else {
        const row = this.newRow({ ...r, dedup_key: key })
        this.rows.push(row)
        out.push(row)
      }
    }
    if (/return=representation/.test(prefer)) return this.send(route, 201, out)
    return this.send(route, 201)
  }

  newRow(r) {
    return {
      id: randomUUID(), created_at: new Date(this.nowS() * 1000 + this.rows.length).toISOString(),
      source: 'text', tags: [], category: null, summary: null, metadata: {}, user_id: null,
      ...r, dedup_key: r.dedup_key ?? md5(r.content),
    }
  }

  filtered(e, user) {
    let rows = this.rows.filter((r) => r.user_id === user.id)
    for (const [k, v] of Object.entries(e.params)) {
      if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(k)) continue
      const m = /^eq\.(.*)$/.exec(v)
      if (!m) throw new Error(`fake brain: unsupported filter ${k}=${v}`)
      rows = rows.filter((r) => String(getPath(r, k)) === m[1])
    }
    return rows
  }

  select(route, e) {
    const user = this.userFor(e.headers)
    if (!user) return this.send(route, 200, []) // RLS: anon sees nothing
    let rows
    try { rows = this.filtered(e, user) } catch (err) { return this.send(route, 400, pgErr('PGRST100', err.message)) }
    const order = e.params.order
    if (order) {
      const [col, dir] = order.split('.')
      rows = [...rows].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1))
    }
    if (e.params.limit) rows = rows.slice(0, Number(e.params.limit))
    const cols = e.params.select && e.params.select !== '*' ? e.params.select.split(',') : null
    const out = rows.map((r) => (cols ? Object.fromEntries(cols.map((c) => [c, r[c]])) : { ...r }))
    return this.send(route, 200, JSON.parse(JSON.stringify(out)))
  }

  patch(route, e) {
    const user = this.userFor(e.headers)
    if (!user) return this.send(route, 204) // RLS: matches nothing
    let rows
    try { rows = this.filtered(e, user) } catch (err) { return this.send(route, 400, pgErr('PGRST100', err.message)) }
    for (const r of rows) Object.assign(r, JSON.parse(JSON.stringify(e.json || {})))
    if (/return=representation/.test(e.headers.prefer || '')) return this.send(route, 200, rows)
    return this.send(route, 204)
  }
}
