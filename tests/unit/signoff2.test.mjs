// Second sign-off pass: PLAN "Amendments after Nitpick's sign-off review".
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createBrain, keyProblem, isSupabaseUrl } from '../../core/lib/brain.js'
import { localDate, downloadFile } from '../../core/lib/save.js'
import { fakeFetch, memStore, flexNow, HELLO } from './_fixtures.mjs'

const URL_ = 'https://fake-brain.supabase.co'
const NOW_MS = 1_790_000_000_000
const NOW_S = NOW_MS / 1000
const session = (over = {}) => ({ access_token: 'at-1', refresh_token: 'rt-1', expires_at: NOW_S + 3600, user: { id: 'u1', email: 'e@x.y' }, ...over })
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const jwt = (payload) => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.c2lnbmF0dXJl`

describe('L8 keyProblem', () => {
  test('sb_secret_ keys are secret (also with surrounding spaces)', () => {
    assert.equal(keyProblem('sb_secret_abc123'), 'secret')
    assert.equal(keyProblem('  sb_secret_abc123\n'), 'secret')
  })
  test('service_role JWTs are secret, including payloads that need base64url decoding', () => {
    assert.equal(keyProblem(jwt({ iss: 'supabase', ref: 'abc', role: 'service_role', iat: 1, exp: 2 })), 'secret')
    // payload chosen so its base64url has - and _ characters
    assert.equal(keyProblem(jwt({ role: 'service_role', pad: '>>>???~~~' })), 'secret')
  })
  test('publishable and anon keys are fine', () => {
    assert.equal(keyProblem('sb_publishable_abc'), null)
    assert.equal(keyProblem(jwt({ iss: 'supabase', role: 'anon' })), null)
    assert.equal(keyProblem('not.a.jwt'), null)
    assert.equal(keyProblem(''), null)
  })
})

describe('L7 isSupabaseUrl', () => {
  for (const u of ['https://abc.supabase.co', 'https://abc.supabase.co/', 'https://ABC.Supabase.CO']) {
    test(`accepts ${u}`, () => assert.equal(isSupabaseUrl(u), true))
  }
  for (const u of ['http://abc.supabase.co', 'https://supabase.co.evil.com', 'https://evil.com/abc.supabase.co',
    'https://abc.supabase.co.evil.com', 'https://evilsupabase.co', 'javascript:alert(1)//.supabase.co', 'abc.supabase.co', '']) {
    test(`refuses ${JSON.stringify(u)}`, () => assert.equal(isSupabaseUrl(u), false))
  }
})

describe('M1 signOut', () => {
  test('removes the session and every hub.runs.*, keeps other keys, then POSTs auth/v1/logout with the old token', async () => {
    const store = memStore({ 'hub.session': session(), 'hub.runs.hello-hub': { prompt: 'secret notes' }, 'hub.runs.other': {}, 'hub.settings': { name: 'Ana' } })
    const { fetch, calls } = fakeFetch(() => ({ status: 204 }))
    const b = createBrain({ url: URL_, anonKey: 'pk', fetch, store, now: flexNow(NOW_MS) })
    await b.signOut()
    assert.equal(store.get('hub.session', null), null)
    assert.deepEqual(store.keys('hub.runs.'), [])
    assert.deepEqual(store.get('hub.settings'), { name: 'Ana' })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].method, 'POST')
    assert.equal(calls[0].url, `${URL_}/auth/v1/logout`)
    assert.equal(calls[0].headers.authorization, 'Bearer at-1')
    assert.equal(calls[0].headers.apikey, 'pk')
  })
  test('logout network failure still signs out locally, without throwing', async () => {
    const store = memStore({ 'hub.session': session(), 'hub.runs.x': {} })
    const { fetch } = fakeFetch(() => { throw new TypeError('offline') })
    const b = createBrain({ url: URL_, anonKey: 'pk', fetch, store, now: flexNow(NOW_MS) })
    await b.signOut()
    assert.equal(b.isSignedIn(), false)
    assert.deepEqual(store.keys('hub.runs.'), [])
  })
})

describe('M4 single refresh', () => {
  test('two concurrent calls near expiry send exactly one refresh_token request', async () => {
    const store = memStore({ 'hub.session': session({ expires_at: NOW_S + 10 }) })
    const { fetch, calls } = fakeFetch(async (req) => {
      if (req.url.includes('grant_type=refresh_token')) {
        await new Promise((r) => setTimeout(r, 20))
        return { status: 200, body: { access_token: 'at-2', refresh_token: 'rt-2', expires_in: 3600, user: { id: 'u1', email: 'e@x.y' } } }
      }
      return { status: 200, body: [] }
    })
    const b = createBrain({ url: URL_, anonKey: 'pk', fetch, store, now: flexNow(NOW_MS) })
    const [r1, r2] = await Promise.all([b.recent(), b.profile()])
    assert.equal(r1.ok, true); assert.equal(r2.ok, true)
    assert.equal(calls.filter((c) => c.url.includes('refresh_token')).length, 1)
    for (const c of calls.filter((c) => c.url.includes('/rest/'))) assert.equal(c.headers.authorization, 'Bearer at-2')
  })
})

describe('L5 archive', () => {
  const item = { id: 'gone', metadata: { hub: { tool: 't', archived: false } } }
  test('asks for return=representation; empty result → not ok', async () => {
    const store = memStore({ 'hub.session': session() })
    const { fetch, calls } = fakeFetch(() => ({ status: 200, body: [] }))
    const r = await createBrain({ url: URL_, anonKey: 'pk', fetch, store, now: flexNow(NOW_MS) }).archive(item)
    assert.equal(r.ok, false)
    assert.equal(r.error, 'not-found')
    assert.match(calls[0].headers.prefer, /return=representation/)
  })
  test('one row back → ok', async () => {
    const store = memStore({ 'hub.session': session() })
    const { fetch } = fakeFetch(() => ({ status: 200, body: [{ id: 'gone' }] }))
    assert.equal((await createBrain({ url: URL_, anonKey: 'pk', fetch, store, now: flexNow(NOW_MS) }).archive(item)).ok, true)
  })
})

describe('L1 local date', () => {
  test('localDate uses the local calendar (checked against the process timezone)', () => {
    const d = new Date(NOW_MS)
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    assert.equal(localDate(NOW_MS), expected)
    assert.equal(downloadFile({ recipe: HELLO, inputs: {}, report: 'r', now: NOW_MS }).fileName, `hello-hub-${expected}.md`)
  })
})
