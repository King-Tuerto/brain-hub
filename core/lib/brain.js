// Talks to a student's Open Brain (Express). Plain fetch against Supabase's
// REST, auth and edge-function endpoints, so every request is visible to tests.
// Only the publishable key and the student's own session are ever used.

export function classifyOpenCheck(status, body) {
  const code = body && typeof body === 'object' ? String(body.code ?? '') : ''
  if (code === '42501') return 'locked'
  if (code === '23502') return 'open'
  return 'unknown'
}

async function readJson(res) {
  try { return await res.json() } catch { return null }
}

const errText = (body, fallback) =>
  (body && (body.error_description || body.msg || body.message || (typeof body.error === 'string' ? body.error : null))) || fallback

export function createBrain({ url, anonKey, fetch: f, store, now = () => Date.now() }) {
  const base = String(url ?? '').trim().replace(/\/+$/, '')
  const doFetch = (...a) => (f ? f(...a) : globalThis.fetch(...a))
  const SESSION = 'hub.session'

  const baseHeaders = () => ({ apikey: anonKey })

  async function tokenRequest(grant, body) {
    const res = await doFetch(`${base}/auth/v1/token?grant_type=${grant}`, {
      method: 'POST',
      headers: { ...baseHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await readJson(res)
    return { res, json }
  }

  function storeSession(json) {
    const nowSec = Math.floor(now() / 1000)
    const session = {
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      expires_at: Number(json.expires_at) || nowSec + (Number(json.expires_in) || 3600),
      user: { id: json.user?.id ?? null, email: json.user?.email ?? null },
    }
    store.set(SESSION, session)
    return session
  }

  async function session() {
    const s = store.get(SESSION, null)
    if (!s || !s.access_token) return null
    if (now() / 1000 > Number(s.expires_at) - 60) {
      try {
        const { res, json } = await tokenRequest('refresh_token', { refresh_token: s.refresh_token })
        if (!res.ok || !json?.access_token) throw new Error('refresh failed')
        return storeSession({ ...json, user: json.user ?? s.user })
      } catch {
        store.remove(SESSION)
        return null
      }
    }
    return s
  }

  async function authed(path, { method = 'GET', headers = {}, body } = {}) {
    const s = await session()
    if (!s) return { ok: false, error: 'signed-out' }
    let res
    try {
      res = await doFetch(`${base}${path}`, {
        method,
        headers: { ...baseHeaders(), Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      return { ok: false, error: 'network' }
    }
    const json = await readJson(res)
    if (!res.ok) return { ok: false, status: res.status, error: errText(json, `HTTP ${res.status}`), body: json }
    return { ok: true, status: res.status, body: json, session: s }
  }

  const LIST = 'select=id,content,created_at,metadata&source=eq.brain-hub'
  const notArchived = (row) => row?.metadata?.hub?.archived !== true

  return {
    async openCheck() {
      let res
      try {
        res = await doFetch(`${base}/rest/v1/thoughts`, {
          method: 'POST',
          headers: { ...baseHeaders(), Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
          body: JSON.stringify({ content: null }),
        })
      } catch {
        return 'unreachable'
      }
      const verdict = classifyOpenCheck(res.status, await readJson(res))
      if (verdict !== 'locked') return verdict
      // Express or older brain? Only a definite 404 counts; see PLAN.md.
      try {
        const probe = await doFetch(`${base}/functions/v1/search-brain`, { method: 'OPTIONS', headers: baseHeaders() })
        if (probe.status === 404) return 'not-express'
      } catch { /* doubt is not a reason to lock a student out */ }
      return 'locked'
    },

    async signIn(email, password) {
      try {
        const { res, json } = await tokenRequest('password', { email, password })
        if (!res.ok || !json?.access_token) return { ok: false, error: errText(json, 'Sign-in failed') }
        storeSession(json)
        return { ok: true }
      } catch {
        return { ok: false, error: 'Could not reach your brain' }
      }
    },

    signOut() { store.remove(SESSION) },
    isSignedIn() { return !!store.get(SESSION, null)?.access_token },
    email() { return store.get(SESSION, null)?.user?.email ?? null },
    userId() { return store.get(SESSION, null)?.user?.id ?? null },

    async search(query, limit) {
      const r = await authed('/functions/v1/search-brain', { method: 'POST', body: { query, limit } })
      if (!r.ok) return { ok: false, error: r.error }
      if (r.body?.ok === false) return { ok: false, error: r.body.error || 'Search failed' }
      return { ok: true, results: Array.isArray(r.body?.results) ? r.body.results : [] }
    },

    async save(row) {
      const r = await authed('/rest/v1/thoughts?on_conflict=dedup_key,user_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: row,
      })
      if (!r.ok) return { ok: false, error: r.error }
      const first = Array.isArray(r.body) ? r.body[0] : r.body
      return { ok: true, id: first?.id }
    },

    async recent(limit = 20) {
      const r = await authed(`/rest/v1/thoughts?${LIST}&order=created_at.desc&limit=${limit * 2}`)
      if (!r.ok) return { ok: false, error: r.error }
      const rows = Array.isArray(r.body) ? r.body : []
      return { ok: true, items: rows.filter(notArchived).slice(0, limit) }
    },

    async profile() {
      const r = await authed(`/rest/v1/thoughts?${LIST}&metadata->hub->>type=eq.profile&order=created_at.desc&limit=100`)
      if (!r.ok) return { ok: false, error: r.error }
      const rows = (Array.isArray(r.body) ? r.body : []).filter(notArchived)
      rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      const seen = new Set()
      const items = []
      for (const row of rows) {
        const part = row?.metadata?.hub?.profile_part ?? 'other'
        if (seen.has(part)) continue
        seen.add(part)
        items.push(row)
      }
      return { ok: true, items }
    },

    async archive(item) {
      const metadata = item?.metadata ?? {}
      const r = await authed(`/rest/v1/thoughts?id=eq.${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: { metadata: { ...metadata, hub: { ...(metadata.hub ?? {}), archived: true } } },
      })
      return r.ok ? { ok: true } : { ok: false, error: r.error }
    },
  }
}
