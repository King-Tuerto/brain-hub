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
import { createBrain, USER_A } from '../db/pglite-brain.mjs'

export const STANDIN_URL = 'https://standin-brain.supabase.co'
export const STANDIN_KEY = 'sb_publishable_standin'
export const STANDIN_USER = { id: USER_A, email: 'student@example.com', password: 'standin-password' }

const PG_STATUS = { '42501': 401, '23502': 400, '23505': 409, '22P02': 400 }

export class StandinBrain {
  constructor() {
    this.log = []
    this.sessions = new Map()
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
      const run = this.queue.then(() => this.handle(route))
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

  pgError(route, e) {
    return this.send(route, PG_STATUS[e.code] ?? 500, { code: e.code ?? 'XX000', message: e.message, details: null, hint: null })
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
    this.sessions.set(refresh_token, STANDIN_USER.id)
    return {
      access_token, refresh_token, token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
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
      if (grant === 'refresh_token' && this.sessions.has(json?.refresh_token)) return this.send(route, 200, this.issue())
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
      try {
        if (method === 'POST' && !sub) {
          // The open-database probe: an anonymous insert, exactly as sent.
          const cols = Object.keys(json ?? {})
          await this.as('anon', null,
            `INSERT INTO thoughts (${cols.map((c) => `"${c.replace(/"/g, '')}"`).join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})`,
            cols.map((c) => json[c]))
          return this.send(route, 201)
        }
        if (!sub) return this.send(route, 401, { code: '42501', message: 'permission denied' })
        if (method === 'POST') {
          if (url.searchParams.get('on_conflict') !== 'dedup_key,user_id') return this.send(route, 400, { message: 'stand-in expects on_conflict=dedup_key,user_id' })
          const r = await this.as('authenticated', sub,
            `INSERT INTO thoughts (user_id, source, content, metadata) VALUES ($1, $2, $3, $4::jsonb)
             ON CONFLICT (dedup_key, user_id) DO UPDATE SET source = EXCLUDED.source, metadata = EXCLUDED.metadata
             RETURNING id, content, created_at, metadata`,
            [json.user_id, json.source, json.content, JSON.stringify(json.metadata ?? {})])
          return this.send(route, 201, r.rows.map(StandinBrain.row))
        }
        if (method === 'GET') {
          const where = []
          const params = []
          for (const [k, v] of url.searchParams) {
            if (k === 'source' && v.startsWith('eq.')) { params.push(v.slice(3)); where.push(`source = $${params.length}`) }
            if (k === 'metadata->hub->>type' && v.startsWith('eq.')) { params.push(v.slice(3)); where.push(`metadata->'hub'->>'type' = $${params.length}`) }
          }
          const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 200)
          const r = await this.as('authenticated', sub,
            `SELECT id, content, created_at, metadata FROM thoughts ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
             ORDER BY created_at DESC LIMIT ${limit}`, params)
          return this.send(route, 200, r.rows.map(StandinBrain.row))
        }
        if (method === 'PATCH') {
          const id = (url.searchParams.get('id') ?? '').replace(/^eq\./, '')
          const r = await this.as('authenticated', sub,
            `UPDATE thoughts SET metadata = $1::jsonb WHERE id = $2::uuid RETURNING id`, [JSON.stringify(json?.metadata ?? {}), id])
          return this.send(route, 200, r.rows)
        }
      } catch (e) {
        return this.pgError(route, e)
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
