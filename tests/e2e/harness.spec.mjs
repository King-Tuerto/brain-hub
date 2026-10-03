// Self-check of the test harness. Does not touch the app: it loads a static
// file from the test server and calls the fakes with fetch, in every browser,
// so CORS/preflight handling and the network guard are proven independently.
import { test, expect } from '../helpers/fixtures.mjs'
import { BRAIN_URL, ANON_KEY, STUDENT } from '../helpers/fake-brain.mjs'
import { OR_KEY } from '../helpers/fake-openrouter.mjs'
import { GH_TOOL } from '../helpers/recipes.mjs'

test.beforeEach(async ({ page }) => {
  await page.goto('./package.json')
})

const call = (page, url, init) => page.evaluate(async ([url, init]) => {
  try {
    const r = await fetch(url, init)
    const text = await r.text()
    let json; try { json = JSON.parse(text) } catch {}
    return { status: r.status, json, text }
  } catch (e) { return { error: String(e) } }
}, [url, init])

const anonProbe = {
  method: 'POST',
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
  body: JSON.stringify({ content: null }),
}

test('fake brain: open-check semantics in each mode', async ({ page, brain }) => {
  const before = brain.rows.length
  let r = await call(page, `${BRAIN_URL}/rest/v1/thoughts`, anonProbe)
  expect(r.status).toBe(401)
  expect(r.json).toMatchObject({ code: '42501', details: null, hint: null })
  r = await call(page, `${BRAIN_URL}/functions/v1/search-brain`, { method: 'OPTIONS', headers: { apikey: ANON_KEY } })
  expect(r.status).toBe(200)

  brain.mode = 'open'
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts`, anonProbe)
  expect(r.status).toBe(400)
  expect(r.json.code).toBe('23502')

  brain.mode = 'not-express'
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts`, anonProbe)
  expect(r.json.code).toBe('42501')
  r = await call(page, `${BRAIN_URL}/functions/v1/search-brain`, { method: 'OPTIONS', headers: { apikey: ANON_KEY } })
  expect(r.status).toBe(404)

  brain.mode = 'down'
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts`, anonProbe)
  expect(r.error).toBeTruthy()
  expect(brain.rows.length).toBe(before)
})

test('fake brain: sign-in, upsert dedup, recent/profile GET, PATCH, search', async ({ page, brain }) => {
  let r = await call(page, `${BRAIN_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: STUDENT.email, password: 'wrong' }),
  })
  expect(r.status).toBe(400)
  expect(r.json.error_description).toBe('Invalid login credentials')
  r = await call(page, `${BRAIN_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: STUDENT.email, password: STUDENT.password }),
  })
  expect(r.status).toBe(200)
  const at = r.json.access_token
  const auth = { apikey: ANON_KEY, Authorization: `Bearer ${at}`, 'Content-Type': 'application/json' }
  const row = { user_id: STUDENT.id, source: 'brain-hub', content: 'Harness summary', metadata: { hub: { tool: 't', type: 'work_product', archived: false } } }
  for (let i = 0; i < 2; i++) {
    r = await call(page, `${BRAIN_URL}/rest/v1/thoughts?on_conflict=dedup_key,user_id`, {
      method: 'POST', headers: { ...auth, Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(row),
    })
    expect(r.status).toBe(201)
  }
  expect(brain.hubRows().filter((x) => x.content === 'Harness summary')).toHaveLength(1)
  const id = r.json[0].id

  const qs = new URLSearchParams({ select: 'id,content,created_at,metadata', source: 'eq.brain-hub', order: 'created_at.desc', limit: '40' })
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts?${qs}`, { headers: auth })
  expect(r.json.map((x) => x.content)).toContain('Harness summary')
  expect(Object.keys(r.json[0]).sort()).toEqual(['content', 'created_at', 'id', 'metadata'])

  qs.set('metadata->hub->>type', 'eq.profile'); qs.set('limit', '100')
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts?${qs}`, { headers: auth })
  expect(r.json.map((x) => x.content)).toEqual(['Skills: Excel, SQL and negotiation.'])

  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts?id=eq.${id}`, {
    method: 'PATCH', headers: auth, body: JSON.stringify({ metadata: { hub: { ...row.metadata.hub, archived: true } } }),
  })
  expect(r.status).toBe(204)
  expect(brain.rows.find((x) => x.id === id).metadata.hub.archived).toBe(true)

  r = await call(page, `${BRAIN_URL}/functions/v1/search-brain`, { method: 'POST', headers: auth, body: JSON.stringify({ query: 'pricing', limit: 3 }) })
  expect(r.json).toMatchObject({ ok: true, mode: 'hybrid', count: 1 })
  expect(r.json.results[0].content).toMatch(/^Pricing notes/)

  // anon cannot read
  r = await call(page, `${BRAIN_URL}/rest/v1/thoughts?${qs}`, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } })
  expect(r.json).toEqual([])
})

test('fake openrouter: models, scripted 429 then ok, web plugin logged', async ({ page, openrouter }) => {
  let r = await call(page, 'https://openrouter.ai/api/v1/models', {})
  expect(r.json.data).toHaveLength(3)
  openrouter.script('a:free', 429)
  const chat = (model, extra = {}) => call(page, 'https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${OR_KEY}`, 'X-Title': 'Brain Hub', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Format your answer in Markdown with these sections, in this order, each as a "## " heading:\n- One\n- Two\n- Summary' }], ...extra }),
  })
  r = await chat('a:free')
  expect(r.status).toBe(429)
  r = await chat('b:free', { plugins: [{ id: 'web' }] })
  expect(r.status).toBe(200)
  expect(r.json.choices[0].message.content).toMatch(/^## One\n[\s\S]*## Two\n[\s\S]*## Summary\n/)
  expect(openrouter.chats().map((c) => [c.model, c.webPlugin, c.xTitle])).toEqual([['a:free', false, 'Brain Hub'], ['b:free', true, 'Brain Hub']])
})

test('fake github: listing and raw download', async ({ page, github }) => {
  github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL, 'README.md': '# hi' })
  let r = await call(page, 'https://api.github.com/repos/alice/brain-hub/contents/plugins', {})
  expect(r.json.filter((e) => e.type === 'file').map((e) => e.name)).toEqual(['gh-tool.recipe.md', 'README.md'])
  r = await call(page, r.json[0].download_url, {})
  expect(r.text).toBe(GH_TOOL)
  github.failApi = true
  r = await call(page, 'https://api.github.com/repos/alice/brain-hub/contents/plugins', {})
  expect(r.status).toBe(403)
})

test('network guard blocks and records un-faked origins', async ({ page, net }) => {
  const r = await call(page, 'https://example.org/anything', {})
  expect(r.error).toBeTruthy()
  expect(net.violations).toEqual(['GET https://example.org/anything'])
  net.violations.length = 0 // expected here; any other test fails on this
})
