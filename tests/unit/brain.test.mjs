// PLAN core/lib/brain.js — wire formats, open check, sign-in, refresh.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createBrain, classifyOpenCheck } from '../../core/lib/brain.js'
import { fakeFetch, memStore, flexNow, sameUrl } from './_fixtures.mjs'

const URL_ = 'https://fake-brain.supabase.co'
const ANON = 'sb_publishable_TESTKEY'
const PASSWORD = 'correct-horse'
const NOW_MS = 1_790_000_000_000 // whole seconds
const NOW_S = NOW_MS / 1000
const USER = { id: '11111111-1111-4111-8111-111111111111', email: 'student@example.com' }

const RLS = { status: 401, body: { code: '42501', message: 'new row violates row-level security policy for table "thoughts"', details: null, hint: null } }
const NOTNULL = { status: 400, body: { code: '23502', message: 'null value in column "content" of relation "thoughts" violates not-null constraint', details: null, hint: null } }

function session(over = {}) {
  return { access_token: 'at-1', refresh_token: 'rt-1', expires_at: NOW_S + 3600, user: { ...USER }, ...over }
}

function make(handler, { store = memStore(), now = NOW_MS, url = URL_ + '/' } = {}) {
  const ff = fakeFetch(handler)
  const brain = createBrain({ url, anonKey: ANON, fetch: ff.fetch, store, now: flexNow(now) })
  return { brain, calls: ff.calls, store }
}

function everyCallHasApikey(calls) {
  for (const c of calls) assert.equal(c.headers.apikey, ANON, `apikey missing on ${c.method} ${c.url}`)
}

describe('classifyOpenCheck (pure)', () => {
  test('42501 → locked', () => {
    assert.equal(classifyOpenCheck(401, { code: '42501' }), 'locked')
    assert.equal(classifyOpenCheck(403, { code: '42501' }), 'locked')
  })
  test('23502 → open', () => assert.equal(classifyOpenCheck(400, { code: '23502' }), 'open'))
  test('anything else → unknown', () => {
    assert.equal(classifyOpenCheck(404, { code: '42P01', message: 'relation "thoughts" does not exist' }), 'unknown')
    assert.equal(classifyOpenCheck(400, { code: 'PGRST204' }), 'unknown')
    assert.equal(classifyOpenCheck(201, null), 'unknown')
    assert.equal(classifyOpenCheck(500, {}), 'unknown')
    assert.equal(classifyOpenCheck(401, { message: 'Invalid API key' }), 'unknown')
  })
})

describe('openCheck', () => {
  test('locked brain: exact first request, then OPTIONS search-brain 200 → locked', async () => {
    const { brain, calls } = make((req) => (req.method === 'POST' ? RLS : { status: 200, text: 'ok' }))
    assert.equal(await brain.openCheck(), 'locked')
    assert.equal(calls.length, 2)
    const [probe, opt] = calls
    assert.equal(probe.method, 'POST')
    assert.equal(probe.url, `${URL_}/rest/v1/thoughts`, 'trailing / on url is stripped')
    assert.equal(probe.headers.authorization, `Bearer ${ANON}`)
    assert.match(probe.headers['content-type'], /^application\/json/)
    assert.equal(probe.headers.prefer, 'return=minimal')
    assert.deepEqual(probe.json, { content: null })
    assert.equal(opt.method, 'OPTIONS')
    assert.equal(opt.url, `${URL_}/functions/v1/search-brain`)
    everyCallHasApikey(calls)
  })

  test('open brain (23502) → open, and no OPTIONS request', async () => {
    const { brain, calls } = make(() => NOTNULL)
    assert.equal(await brain.openCheck(), 'open')
    assert.equal(calls.length, 1)
  })

  test('locked + OPTIONS 404 → not-express', async () => {
    const { brain } = make((req) => (req.method === 'POST' ? RLS : { status: 404, body: { message: 'Function not found' } }))
    assert.equal(await brain.openCheck(), 'not-express')
  })

  // PLAN revision 2026-10-03: anything but 404 on the OPTIONS step → locked.
  for (const [label, resp] of [['204', { status: 204 }], ['401', { status: 401, body: {} }], ['500', { status: 500, body: {} }], ['403', { status: 403, body: {} }]]) {
    test(`locked + OPTIONS ${label} → locked`, async () => {
      const { brain } = make((req) => (req.method === 'POST' ? RLS : resp))
      assert.equal(await brain.openCheck(), 'locked')
    })
  }
  test('locked + OPTIONS network failure → locked', async () => {
    const { brain } = make((req) => { if (req.method === 'POST') return RLS; throw new TypeError('Failed to fetch') })
    assert.equal(await brain.openCheck(), 'locked')
  })

  test('network failure on the probe → unreachable', async () => {
    const { brain } = make(() => { throw new TypeError('Failed to fetch') })
    assert.equal(await brain.openCheck(), 'unreachable')
  })

  test('missing table / bad key / non-JSON → unknown, no OPTIONS', async () => {
    for (const resp of [
      { status: 404, body: { code: '42P01', message: 'relation does not exist' } },
      { status: 401, body: { message: 'Invalid API key' } },
      { status: 200, text: '<html>not supabase</html>', headers: { 'content-type': 'text/html' } },
      { status: 201, text: '' },
    ]) {
      const { brain, calls } = make(() => resp)
      assert.equal(await brain.openCheck(), 'unknown', JSON.stringify(resp))
      assert.equal(calls.length, 1)
    }
  })

  test('openCheck never touches auth', async () => {
    const { brain, calls } = make((req) => (req.method === 'POST' ? RLS : { status: 200 }))
    await brain.openCheck()
    assert.ok(calls.every((c) => !c.url.includes('/auth/')))
  })
})

describe('signIn', () => {
  const okToken = (over = {}) => ({ status: 200, body: { access_token: 'at-1', token_type: 'bearer', expires_in: 3600, expires_at: NOW_S + 3600, refresh_token: 'rt-1', user: { ...USER, role: 'authenticated', aud: 'authenticated' }, ...over } })

  test('exact request; stores session; never stores the password', async () => {
    const { brain, calls, store } = make(() => okToken())
    assert.equal(brain.isSignedIn(), false)
    const r = await brain.signIn(USER.email, PASSWORD)
    assert.deepEqual(r, { ok: true })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].method, 'POST')
    assert.ok(sameUrl(calls[0].url, `${URL_}/auth/v1/token?grant_type=password`), calls[0].url)
    assert.deepEqual(calls[0].json, { email: USER.email, password: PASSWORD })
    everyCallHasApikey(calls)
    assert.deepEqual(store.get('hub.session'), session())
    assert.equal(brain.isSignedIn(), true)
    assert.equal(brain.email(), USER.email)
    assert.ok(!store.dumpAll().includes(PASSWORD))
  })

  test('expires_at missing → now/1000 + expires_in', async () => {
    const { brain, store } = make(() => okToken({ expires_at: undefined }))
    await brain.signIn(USER.email, PASSWORD)
    assert.equal(store.get('hub.session').expires_at, NOW_S + 3600)
  })

  const errs = [
    [{ error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'm', message: 'x' }, 'Invalid login credentials'],
    [{ msg: 'Email not confirmed', message: 'x' }, 'Email not confirmed'],
    [{ message: 'Too many requests' }, 'Too many requests'],
    [{}, 'Sign-in failed'],
  ]
  for (const [body, expected] of errs) {
    test(`error → "${expected}"; nothing stored`, async () => {
      const { brain, store } = make(() => ({ status: 400, body }))
      const r = await brain.signIn(USER.email, PASSWORD)
      assert.equal(r.ok, false)
      assert.equal(r.error, expected)
      assert.equal(brain.isSignedIn(), false)
      assert.equal(brain.email(), null)
      assert.equal(store.get('hub.session', null), null)
      assert.ok(!store.dumpAll().includes(PASSWORD))
    })
  }

  test('network failure → ok:false, does not throw', async () => {
    const { brain } = make(() => { throw new TypeError('Failed to fetch') })
    const r = await brain.signIn(USER.email, PASSWORD)
    assert.equal(r.ok, false)
  })

  test('signOut clears the session', async () => {
    const store = memStore({ 'hub.session': session() })
    const { brain } = make(() => ({ status: 204 }), { store })
    assert.equal(brain.isSignedIn(), true)
    await brain.signOut()
    assert.equal(brain.isSignedIn(), false)
    assert.equal(store.get('hub.session', null), null)
  })
})

describe('token refresh', () => {
  const searchOk = { status: 200, body: { ok: true, mode: 'hybrid', count: 0, results: [] } }

  test('within 60s of expiry → refresh first, then the call uses the new token', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S + 59 }) })
    const { brain, calls } = make((req) => {
      if (req.url.includes('/auth/v1/token')) return { status: 200, body: { access_token: 'at-2', refresh_token: 'rt-2', expires_in: 3600, expires_at: NOW_S + 3600, user: USER } }
      return searchOk
    }, { store })
    const r = await brain.search('pricing', 3)
    assert.equal(r.ok, true)
    assert.equal(calls.length, 2)
    assert.ok(sameUrl(calls[0].url, `${URL_}/auth/v1/token?grant_type=refresh_token`), calls[0].url)
    assert.equal(calls[0].method, 'POST')
    assert.deepEqual(calls[0].json, { refresh_token: 'rt-1' })
    assert.equal(calls[1].headers.authorization, 'Bearer at-2')
    assert.equal(store.get('hub.session').access_token, 'at-2')
    assert.equal(store.get('hub.session').refresh_token, 'rt-2')
    everyCallHasApikey(calls)
  })

  test('exactly 60s before expiry → no refresh (now/1000 > expires_at - 60 is false)', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S + 60 }) })
    const { brain, calls } = make(() => searchOk, { store })
    await brain.search('x', 1)
    assert.equal(calls.length, 1)
    assert.ok(calls[0].url.includes('/functions/v1/search-brain'))
  })

  test('already expired → refresh', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S - 10 }) })
    const { calls, brain } = make((req) => (req.url.includes('/auth/') ? { status: 200, body: { access_token: 'at-2', refresh_token: 'rt-2', expires_in: 3600, user: USER } } : searchOk), { store })
    await brain.search('x', 1)
    assert.ok(calls[0].url.includes('grant_type=refresh_token'))
    assert.equal(store.get('hub.session').expires_at, NOW_S + 3600, 'missing expires_at on refresh → now/1000 + expires_in')
  })

  test('refresh failure → session cleared, { ok:false, error:"signed-out" }, call not sent', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S + 10 }) })
    const { brain, calls } = make((req) => (req.url.includes('/auth/') ? { status: 400, body: { error: 'invalid_grant' } } : searchOk), { store })
    for (const call of [() => brain.search('x', 1), () => brain.save({ content: 'c' }), () => brain.recent(), () => brain.profile()]) {
      store.set('hub.session', session({ expires_at: NOW_S + 10 }))
      const before = calls.length
      const r = await call()
      assert.equal(r.ok, false)
      assert.equal(r.error, 'signed-out')
      assert.equal(store.get('hub.session', null), null)
      assert.equal(brain.isSignedIn(), false)
      assert.ok(calls.slice(before).every((c) => c.url.includes('/auth/')), 'no data call after failed refresh')
    }
  })

  test('refresh network failure → signed-out as well', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S }) })
    const { brain } = make(() => { throw new TypeError('Failed to fetch') }, { store })
    const r = await brain.search('x', 1)
    assert.deepEqual({ ok: r.ok, error: r.error }, { ok: false, error: 'signed-out' })
  })
})

describe('authed calls', () => {
  const signedIn = () => memStore({ 'hub.session': session() })

  test('search: exact request and results passthrough', async () => {
    const results = [{ id: 't1', content: 'Pricing notes', created_at: '2026-09-15T12:00:00Z', similarity: 0.8 }]
    const { brain, calls } = make(() => ({ status: 200, body: { ok: true, mode: 'hybrid', count: 1, results } }), { store: signedIn() })
    const r = await brain.search('pricing', 3)
    assert.equal(r.ok, true)
    assert.deepEqual(r.results, results)
    assert.equal(calls[0].method, 'POST')
    assert.equal(calls[0].url, `${URL_}/functions/v1/search-brain`)
    assert.equal(calls[0].headers.authorization, 'Bearer at-1')
    assert.deepEqual(calls[0].json, { query: 'pricing', limit: 3 })
    everyCallHasApikey(calls)
  })

  test('search not signed in → ok:false, no request', async () => {
    const { brain, calls } = make(() => ({ status: 200, body: {} }))
    const r = await brain.search('x', 1)
    assert.equal(r.ok, false)
    assert.equal(calls.length, 0)
  })

  test('search server error → ok:false', async () => {
    const { brain } = make(() => ({ status: 500, body: { ok: false, error: 'boom' } }), { store: signedIn() })
    assert.equal((await brain.search('x', 1)).ok, false)
  })

  test('save: exact upsert request, returns id of the returned row', async () => {
    const row = { user_id: USER.id, source: 'brain-hub', content: 'S', metadata: { hub: { tool: 'hello-hub', archived: false } } }
    const { brain, calls } = make(() => ({ status: 201, body: [{ id: 'new-id', ...row }] }), { store: signedIn() })
    const r = await brain.save(row)
    assert.deepEqual(r, { ok: true, id: 'new-id' })
    const c = calls[0]
    assert.equal(c.method, 'POST')
    assert.ok(sameUrl(c.url, `${URL_}/rest/v1/thoughts?on_conflict=dedup_key,user_id`), c.url)
    assert.equal(c.headers.prefer, 'resolution=merge-duplicates,return=representation')
    assert.equal(c.headers.authorization, 'Bearer at-1')
    assert.match(c.headers['content-type'], /^application\/json/)
    assert.deepEqual(c.json, row)
    everyCallHasApikey(calls)
  })

  test('save failure → ok:false with an error', async () => {
    const { brain } = make(() => ({ status: 403, body: { code: '42501', message: 'new row violates row-level security policy' } }), { store: signedIn() })
    const r = await brain.save({ content: 'x' })
    assert.equal(r.ok, false)
    assert.ok(r.error)
  })

  const hubRow = (id, created_at, hub = {}) => ({ id, content: `c-${id}`, created_at, metadata: { other: 1, hub: { tool: 'hello-hub', type: 'work_product', archived: false, ...hub } } })

  test('recent(): exact GET with limit*2, archived dropped, cut to limit, server order kept', async () => {
    const rows = [
      hubRow('a', '2026-10-03T10:00:00Z'),
      hubRow('b', '2026-10-02T10:00:00Z', { archived: true }),
      hubRow('c', '2026-10-01T10:00:00Z'),
      hubRow('d', '2026-09-30T10:00:00Z'),
    ]
    const { brain, calls } = make(() => ({ status: 200, body: rows }), { store: signedIn() })
    const r = await brain.recent(2)
    assert.equal(r.ok, true)
    assert.deepEqual(r.items.map((i) => i.id), ['a', 'c'])
    assert.equal(calls[0].method, 'GET')
    assert.ok(sameUrl(calls[0].url, `${URL_}/rest/v1/thoughts?select=id,content,created_at,metadata&source=eq.brain-hub&order=created_at.desc&limit=4`), calls[0].url)
    assert.equal(calls[0].headers.authorization, 'Bearer at-1')
  })

  test('recent() default limit is 20 → limit=40', async () => {
    const { brain, calls } = make(() => ({ status: 200, body: [] }), { store: signedIn() })
    await brain.recent()
    assert.equal(new URL(calls[0].url).searchParams.get('limit'), '40')
  })

  test('profile(): exact GET, newest row per profile_part', async () => {
    const rows = [
      hubRow('s2', '2026-10-03T10:00:00Z', { type: 'profile', profile_part: 'skills' }),
      hubRow('g1', '2026-10-02T10:00:00Z', { type: 'profile', profile_part: 'goals' }),
      hubRow('s1', '2026-10-01T10:00:00Z', { type: 'profile', profile_part: 'skills' }),
    ]
    const { brain, calls } = make(() => ({ status: 200, body: rows }), { store: signedIn() })
    const r = await brain.profile()
    assert.equal(r.ok, true)
    assert.deepEqual(r.items.map((i) => i.id).sort(), ['g1', 's2'])
    assert.ok(sameUrl(calls[0].url,
      `${URL_}/rest/v1/thoughts?select=id,content,created_at,metadata&source=eq.brain-hub&order=created_at.desc&metadata->hub->>type=eq.profile&limit=100`), calls[0].url)
  })

  test('archive(): PATCH id=eq.<id> with merged metadata, archived:true', async () => {
    const item = hubRow('t9', '2026-10-03T10:00:00Z', { tags: ['x'] })
    const { brain, calls } = make(() => ({ status: 204 }), { store: signedIn() })
    const r = await brain.archive(item)
    assert.equal(r.ok, true)
    assert.equal(calls[0].method, 'PATCH')
    assert.ok(sameUrl(calls[0].url, `${URL_}/rest/v1/thoughts?id=eq.t9`), calls[0].url)
    assert.deepEqual(calls[0].json, { metadata: { other: 1, hub: { tool: 'hello-hub', type: 'work_product', archived: true, tags: ['x'] } } })
    assert.equal(calls[0].headers.authorization, 'Bearer at-1')
    assert.equal(item.metadata.hub.archived, false, 'the caller’s object is not mutated')
  })

  test('no request ever carries the password or a secret key', async () => {
    const { brain, calls } = make((req) => {
      if (req.url.includes('/auth/')) return { status: 200, body: { access_token: 'at-1', refresh_token: 'rt-1', expires_in: 3600, user: USER } }
      if (req.method === 'POST' && req.url.endsWith('/rest/v1/thoughts')) return RLS
      return { status: 200, body: { ok: true, results: [] } }
    })
    await brain.openCheck()
    await brain.signIn(USER.email, PASSWORD)
    await brain.search('x', 1)
    await brain.recent()
    for (const c of calls) {
      const blob = c.url + JSON.stringify(c.headers) + (c.body || '')
      if (!c.url.includes('grant_type=password')) assert.ok(!blob.includes(PASSWORD), `password leaked to ${c.url}`)
      assert.ok(!/service_role|sb_secret_/.test(blob))
    }
  })
})
