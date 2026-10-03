// The local stand-in brain: a real Express database (the verbatim migration,
// run in PGlite) behind the exact HTTP endpoints the hub calls, served to the
// browser through Playwright routes at https://standin-brain.supabase.co.
//
// Unlike tests/helpers/fake-brain.mjs (an in-memory imitation), every row here
// passes through Express's real row-level security, dedup trigger, unique
// index and hybrid search function. It is how Phase 3 proves "saved, then
// found again" without touching anyone's real brain.
//
// What it does NOT reproduce: Supabase's gateway, real JWTs, CORS, embeddings
// (no AI key, so search runs keyword-only, exactly as Express does when its
// embedding call fails) and the enrich-thought webhook.
//
// Nitpick review (Phase 3) changed, so the stand-in can't hide a hub regression:
//  - POST honours Prefer like PostgREST: without resolution=merge-duplicates a
//    duplicate is a plain INSERT and fails 409/23505; without
//    return=representation the body is empty. It inserts exactly the columns
//    sent (an unknown column fails, as it would for real).
//  - GET rejects query parameters it does not implement instead of ignoring them.
//  - 42501 is 401 for anon and 403 for a signed-in user, as PostgREST maps it;
//    anon GET/PATCH run as anon (RLS returns nothing) instead of a blanket 401.
//  - Access and refresh tokens are separate; a used refresh token is revoked.
//  - expires_at follows the tests' fixed browser clock (as the fake brain does),
//    so tokens are not "expired" or "fresh" depending on the hour tests run.
//  - A handler that throws answers 500 instead of leaving the request hanging.
import { createBrain, USER_A } from '../db/pglite-brain.mjs'
import { FIXED_S } from '../helpers/contract.mjs'

export const STANDIN_URL = 'https://standin-brain.supabase.co'
export const STANDIN_KEY = 'sb_publishable_standin'
export const STANDIN_USER = { id: USER_A, email: 'student@example.com', password: 'standin-password' }

const PG_STATUS = { '23502': 400, '23505': 409, '22P02': 400, '42703': 400, '42P10': 400 }
const pgStatus = (code, signedIn) => (code === '42501' ? (signedIn ? 403 : 401) : PG_STATUS[code] ?? 500)
const GET_PARAMS = new Set(['select', 'order', 'limit', 'source', 'metadata->hub->>type'])
const qi = (c) => `"${String(c).replace(/"/g, '')}"`
const param = (v) => (v !== null && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : v)

export class StandinBrain {
  constructor() {
    this.log = []
    this.sessions = new Map() // access_token → user id
    this.refresh = new Map() // refresh_token → user id
    this.n = 0
    this.queue = Promise.resolve() // PGlite has one connection: run handlers one at a time
  }

  static async create() {
    const s = new StandinBrain()
    s.db = (await createBrain()).db
    return s
  }

  async attach(context) {
    await context.route((url) => url.origin === STANDIN_URL, (route) => {
      const run = this.queue.then(() => this.handle(route)).catch((e) =>
        this.send(route, 500, { message: `stand-in error: ${e?.message ?? e}` }).catch(() => {}))
      this.queue = run.catch(() => {})
      return run
    })
  }

  cors(req) {
    const h = req.headers()
    return {
      'access-control-allow-origin': h.origin || '*',
      'access-control-allow-headers': h['access-control-request-headers'] || 'apikey, authorization, content-type, prefer',
      'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
    }
  }

  send(route, status, body) {
    const headers = this.cors(route.request())
    if (body === undefined || status === 204) return route.fulfill({ status, headers, body: '' })
    return route.fulfill({ status, headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  }

  pgError(route, e, signedIn) {
    return this.send(route, pgStatus(e.code, signedIn), { code: e.code ?? 'XX000', message: e.message, details: null, hint: null })
  }

  // Run SQL as a PostgREST role, with the JWT subject set, then reset.
  async as(role, sub, sql, params = []) {
    await this.db.exec(`SET ROLE ${role}`)
    await this.db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [sub ?? ''])
    try {
      return await this.db.query(sql, params)
    } finally {
      await this.db.exec('RESET ROLE')
      await this.db.query(`SELECT set_config('request.jwt.claim.sub', '', false)`)
    }
  }

  userFor(headers) {
    const m = /^Bearer (.+)$/.exec(headers.authorization || '')
    return m ? this.sessions.get(m[1]) ?? null : null
  }

  issue() {
    this.n++
    const access_token = `standin-access-${this.n}`
    const refresh_token = `standin-refresh-${this.n}`
    this.sessions.set(access_token, STANDIN_USER.id)
    this.refresh.set(refresh_token, STANDIN_USER.id)
    return {
      access_token, refresh_token, token_type: 'bearer', expires_in: 3600,
      expires_at: FIXED_S + 3600,
      user: { id: STANDIN_USER.id, email: STANDIN_USER.email },
    }
  }

  static row(r) {
    return { ...r, created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at }
  }

  async handle(route) {
    const req = route.request()
    const url = new URL(req.url())
    const method = req.method()
    const headers = req.headers()
    let json
    try { json = req.postData() ? JSON.parse(req.postData()) : undefined } catch { json = undefined }
    this.log.push({ method, path: url.pathname, search: url.search, json })

    if (method === 'OPTIONS' && headers['access-control-request-method']) return route.fulfill({ status: 204, headers: this.cors(req), body: '' })
    if (headers.apikey !== STANDIN_KEY) return this.send(route, 401, { message: 'Invalid API key' })
    const p = url.pathname

    if (p === '/auth/v1/token') {
      const grant = url.searchParams.get('grant_type')
      if (grant === 'password' && json?.email === STANDIN_USER.email && json?.password === STANDIN_USER.password) return this.send(route, 200, this.issue())
      if (grant === 'refresh_token' && this.refresh.has(json?.refresh_token)) {
        this.refresh.delete(json.refresh_token)
        return this.send(route, 200, this.issue())
      }
      return this.send(route, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' })
    }
    if (p === '/auth/v1/logout') return this.send(route, 204)

    if (p === '/functions/v1/search-brain') {
      if (method === 'OPTIONS') return this.send(route, 200, {})
      const sub = this.userFor(headers)
      if (!sub) return this.send(route, 401, { ok: false, error: 'Not signed in' })
      const q = String(json?.query ?? '').trim()
      if (!q) return this.send(route, 400, { ok: false, error: 'Nothing to search for' })
      // As the edge function does: service role, explicit user id, keyword-only when there is no embedding.
      const r = await this.db.query(
        `SELECT * FROM search_thoughts_hybrid($1::uuid, $2, NULL, 0.3, $3)`, [sub, q, Math.min(Number(json?.limit) || 20, 50)])
      const results = r.rows.map(StandinBrain.row)
      return this.send(route, 200, { ok: true, mode: 'keyword', count: results.length, results })
    }

    if (p === '/rest/v1/thoughts') {
      const sub = this.userFor(headers)
      const role = sub ? 'authenticated' : 'anon'
      const prefer = headers.prefer || ''
      try {
        if (method === 'POST') {
          // Exactly the columns sent, as PostgREST does. Anonymous = the open-database probe.
          const rows = Array.isArray(json) ? json : [json ?? {}]
          const cols = Object.keys(rows[0] ?? {})
          const merge = /resolution=merge-duplicates/.test(prefer)
          const onConflict = url.searchParams.get('on_conflict')
          if (merge && !onConflict) return this.send(route, 400, { message: 'stand-in expects on_conflict with merge-duplicates' })
          const conflict = merge
            ? ` ON CONFLICT (${onConflict.split(',').map(qi).join(',')}) DO UPDATE SET ${cols.map((c) => `${qi(c)} = EXCLUDED.${qi(c)}`).join(', ')}`
            : ''
          const out = []
          for (const row of rows) {
            const r = await this.as(role, sub,
              `INSERT INTO thoughts (${cols.map(qi).join(',')}) VALUES (${cols.map((c, i) => `$${i + 1}${c === 'metadata' ? '::jsonb' : ''}`).join(',')})${conflict}
               RETURNING id, content, created_at, metadata`,
              cols.map((c) => param(row[c])))
            out.push(...r.rows)
          }
          return /return=representation/.test(prefer) ? this.send(route, 201, out.map(StandinBrain.row)) : this.send(route, 201)
        }
        if (method === 'GET') {
          const where = []
          const params = []
          for (const [k, v] of url.searchParams) {
            if (!GET_PARAMS.has(k)) return this.send(route, 400, { code: 'PGRST100', message: `stand-in does not implement ${k}=${v}` })
            if (k === 'order' && v !== 'created_at.desc') return this.send(route, 400, { code: 'PGRST100', message: `stand-in does not implement order=${v}` })
            if (k === 'source' || k === 'metadata->hub->>type') {
              if (!v.startsWith('eq.')) return this.send(route, 400, { code: 'PGRST100', message: `stand-in does not implement ${k}=${v}` })
              params.push(v.slice(3))
              where.push(`${k === 'source' ? 'source' : "metadata->'hub'->>'type'"} = $${params.length}`)
            }
          }
          const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 200)
          const r = await this.as(role, sub,
            `SELECT id, content, created_at, metadata FROM thoughts ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
             ORDER BY created_at DESC LIMIT ${limit}`, params)
          return this.send(route, 200, r.rows.map(StandinBrain.row))
        }
        if (method === 'PATCH') {
          const id = (url.searchParams.get('id') ?? '').replace(/^eq\./, '')
          const r = await this.as(role, sub,
            `UPDATE thoughts SET metadata = $1::jsonb WHERE id = $2::uuid RETURNING id`, [JSON.stringify(json?.metadata ?? {}), id])
          return /return=representation/.test(prefer) ? this.send(route, 200, r.rows) : this.send(route, 204)
        }
      } catch (e) {
        return this.pgError(route, e, !!sub)
      }
    }
    return this.send(route, 404, { message: `stand-in has no ${method} ${p}` })
  }

  // Direct reads for test assertions (as the superuser, outside RLS).
  async hubRows() {
    const r = await this.db.query(`SELECT id, content, source, metadata, created_at FROM thoughts WHERE source = 'brain-hub' ORDER BY created_at`)
    return r.rows.map(StandinBrain.row)
  }
}
