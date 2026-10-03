// PLAN core/lib/plugins.js; DECISIONS Q4.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { repoFromLocation, discoverTools } from '../../core/lib/plugins.js'
import { fakeFetch, memStore, flexNow } from './_fixtures.mjs'

describe('repoFromLocation', () => {
  const cases = [
    [{ hostname: 'alice.github.io', pathname: '/brain-hub/' }, { owner: 'alice', repo: 'brain-hub' }],
    [{ hostname: 'alice.github.io', pathname: '/brain-hub/index.html' }, { owner: 'alice', repo: 'brain-hub' }],
    [{ hostname: 'alice.github.io', pathname: '/my-hub' }, { owner: 'alice', repo: 'my-hub' }],
    [{ hostname: 'bob-99.github.io', pathname: '/hub/#/home' }, { owner: 'bob-99', repo: 'hub' }],
    [{ hostname: 'localhost', pathname: '/brain-hub/' }, null],
    // User site: a fork renamed alice.github.io is served at the root.
    [{ hostname: 'alice.github.io', pathname: '/' }, { owner: 'alice', repo: 'alice.github.io' }],
    [{ hostname: 'alice.github.io.evil.com', pathname: '/brain-hub/' }, null],
    [{ hostname: 'github.io', pathname: '/brain-hub/' }, null],
    [{ hostname: 'hub.example.edu', pathname: '/brain-hub/' }, null],
  ]
  for (const [loc, expected] of cases) {
    test(`${loc.hostname}${loc.pathname} → ${JSON.stringify(expected)}`, () => {
      assert.deepEqual(repoFromLocation(loc), expected)
    })
  }
})

const BASE = 'http://localhost:4173/brain-hub/'
const REPO = { owner: 'alice', repo: 'brain-hub' }
const API = 'https://api.github.com/repos/alice/brain-hub/contents/plugins'
const RAW = (n) => `https://raw.githubusercontent.com/alice/brain-hub/main/plugins/${n}`
const T0 = 1_790_000_000_000

function world({ api = 'ok', manifest = { recipes: ['m-tool.recipe.md'] }, listing } = {}) {
  const apiListing = listing ?? [
    { name: 'gh-tool.recipe.md', type: 'file', download_url: RAW('gh-tool.recipe.md') },
    { name: 'README.md', type: 'file', download_url: RAW('README.md') },
    { name: 'plugins.json', type: 'file', download_url: RAW('plugins.json') },
    { name: 'folder.recipe.md', type: 'dir', download_url: null },
  ]
  let apiMode = api
  const ff = fakeFetch((req) => {
    const u = req.url
    if (u === `${BASE}core/tools/index.json`) return { status: 200, body: ['hello-hub.recipe.md'] }
    if (u.startsWith(`${BASE}core/tools/`)) return { status: 200, text: '---\n...', headers: { 'content-type': 'text/markdown' } }
    if (u.startsWith(API)) {
      if (apiMode === 'ok') return { status: 200, body: apiListing }
      if (apiMode === 'throw') throw new TypeError('Failed to fetch')
      return { status: 403, body: { message: 'API rate limit exceeded' } }
    }
    if (u.startsWith('https://raw.githubusercontent.com/')) return { status: 200, text: '---\n...' }
    if (u === `${BASE}plugins/plugins.json`) return manifest === null ? { status: 404, text: 'not found' } : { status: 200, body: manifest }
    if (u.startsWith(`${BASE}plugins/`)) return { status: 200, text: '---\n...' }
    return { status: 404, text: 'not found' }
  })
  return { ...ff, setApi: (m) => { apiMode = m }, apiCalls: () => ff.calls.filter((c) => c.url.startsWith('https://api.github.com/')).length }
}

const run = (w, { store = memStore(), now = T0, repo = REPO } = {}) =>
  discoverTools({ fetch: w.fetch, store, now: flexNow(now), repo, base: BASE })

const byName = (tools) => Object.fromEntries(tools.map((t) => [t.fileName, t]))

describe('discoverTools', () => {
  test('core tools always listed from core/tools/index.json', async () => {
    const w = world()
    const r = await run(w)
    assert.deepEqual(byName(r.tools)['hello-hub.recipe.md'], {
      fileName: 'hello-hub.recipe.md', url: `${BASE}core/tools/hello-hub.recipe.md`, origin: 'core',
    })
    assert.ok(w.calls.some((c) => c.url === `${BASE}core/tools/index.json`))
  })

  test('repo known: GitHub API listing; only type=file *.recipe.md; download_url used; via api', async () => {
    const w = world()
    const r = await run(w)
    assert.equal(r.via, 'api')
    const plugins = r.tools.filter((t) => t.origin === 'plugin')
    assert.deepEqual(plugins, [{ fileName: 'gh-tool.recipe.md', url: RAW('gh-tool.recipe.md'), origin: 'plugin' }])
    const apiCall = w.calls.find((c) => c.url.startsWith('https://api.github.com/'))
    assert.equal(apiCall.url, API)
    assert.equal(apiCall.method, 'GET')
    assert.ok(!w.calls.some((c) => c.url.endsWith('plugins/plugins.json')), 'manifest not read when API works')
  })

  test('listing cached in hub.pluginCache; reused under 10 minutes (via cache)', async () => {
    const w = world(); const store = memStore()
    await run(w, { store })
    assert.ok(store.get('hub.pluginCache') !== undefined)
    const r2 = await run(w, { store, now: T0 + 9 * 60 * 1000 })
    assert.equal(r2.via, 'cache')
    assert.equal(w.apiCalls(), 1)
    assert.deepEqual(r2.tools.filter((t) => t.origin === 'plugin').map((t) => t.url), [RAW('gh-tool.recipe.md')])
  })

  test('cache at exactly 10 minutes is stale → API again', async () => {
    const w = world(); const store = memStore()
    await run(w, { store })
    const r = await run(w, { store, now: T0 + 10 * 60 * 1000 })
    assert.equal(r.via, 'api')
    assert.equal(w.apiCalls(), 2)
  })

  test('cache for one repo is not used for another (Settings override)', async () => {
    const w = world(); const store = memStore()
    await run(w, { store })
    await run(w, { store, now: T0 + 1000, repo: { owner: 'carol', repo: 'hub' } })
    assert.ok(w.calls.some((c) => c.url === 'https://api.github.com/repos/carol/hub/contents/plugins'))
  })

  for (const mode of ['403', 'throw']) {
    test(`API failure (${mode}) → manifest fallback (via manifest)`, async () => {
      const w = world({ api: mode })
      const r = await run(w)
      assert.equal(r.via, 'manifest')
      const plugins = r.tools.filter((t) => t.origin === 'plugin')
      assert.deepEqual(plugins, [{ fileName: 'm-tool.recipe.md', url: `${BASE}plugins/m-tool.recipe.md`, origin: 'plugin' }])
    })
  }

  test('a failed API call is not cached', async () => {
    const w = world({ api: '403' }); const store = memStore()
    await run(w, { store })
    w.setApi('ok')
    const r = await run(w, { store, now: T0 + 60 * 1000 })
    assert.equal(r.via, 'api')
  })

  test('no repo → manifest, GitHub API never called', async () => {
    const w = world()
    const r = await run(w, { repo: null })
    assert.equal(r.via, 'manifest')
    assert.equal(w.apiCalls(), 0)
  })

  test('manifest missing → via none, core tools still listed', async () => {
    const w = world({ manifest: null })
    const r = await run(w, { repo: null })
    assert.equal(r.via, 'none')
    assert.deepEqual(r.tools.map((t) => t.origin), ['core'])
  })

  test('manifest empty (the shipped plugins.json) → via none', async () => {
    const w = world({ manifest: { recipes: [] } })
    assert.equal((await run(w, { repo: null })).via, 'none')
  })

  test('duplicate id: core beats plugin; the loser is reported in conflicts', async () => {
    const w = world({ listing: [{ name: 'hello-hub.recipe.md', type: 'file', download_url: RAW('hello-hub.recipe.md') }] })
    const r = await run(w)
    const hello = r.tools.filter((t) => t.fileName === 'hello-hub.recipe.md')
    assert.equal(hello.length, 1)
    assert.equal(hello[0].origin, 'core')
    assert.ok(Array.isArray(r.conflicts) && r.conflicts.length === 1, JSON.stringify(r.conflicts))
    assert.match(JSON.stringify(r.conflicts[0]), /hello-hub/)
    assert.match(JSON.stringify(r.conflicts[0]), /plugin|raw\.githubusercontent/)
  })

  test('never throws when everything is down', async () => {
    const w = fakeFetch(() => { throw new TypeError('offline') })
    const r = await discoverTools({ fetch: w.fetch, store: memStore(), now: flexNow(T0), repo: REPO, base: BASE })
    assert.ok(Array.isArray(r.tools))
    assert.equal(r.via, 'none')
  })
})
