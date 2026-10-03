// sw.js fetch policy (Phase 7, Nitpick). The service worker is run in a vm with
// a fake worker global, so its real source is what's tested.
//
// Why: Pages serves with max-age=600. A plain fetch() from the worker lets the
// browser's HTTP cache answer for up to ten minutes, so after "Sync fork" an
// installed app could keep running the old hub. `cache: 'no-cache'` makes every
// shell request revalidate (a 304 when nothing changed). Browsers don't expose
// which cache mode a worker used, so this is checked here, not in e2e.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const SRC = readFileSync(new URL('../../sw.js', import.meta.url), 'utf8')
const SCOPE = 'https://student.github.io/brain-hub/'

function loadWorker({ network = 'ok', cached = {} } = {}) {
  const handlers = {}
  const fetches = []
  const puts = []
  const caches = {
    open: async () => ({ put: async (req, res) => { puts.push(req.url) }, add: async () => {} }),
    match: async (req) => cached[typeof req === 'string' ? req : req.url] ?? cached[req] ?? undefined,
    keys: async () => [],
    delete: async () => true,
  }
  const self = {
    location: new URL(SCOPE + 'sw.js'),
    registration: { scope: SCOPE },
    addEventListener: (type, fn) => { handlers[type] = fn },
    skipWaiting: () => {}, clients: { claim: () => {} },
  }
  const fakeFetch = async (req, init) => {
    fetches.push({ url: req.url, init })
    if (network === 'down') throw new TypeError('Failed to fetch')
    return { ok: true, status: 200, clone() { return this }, body: 'fresh' }
  }
  vm.runInNewContext(SRC, { self, caches, fetch: fakeFetch, URL, Promise, Response: { error: () => ({ type: 'error' }) } })
  const dispatch = async (url, { method = 'GET', mode = 'cors' } = {}) => {
    let responded = null
    handlers.fetch({ request: { url, method, mode }, respondWith: (p) => { responded = p } })
    return responded ? { handled: true, res: await responded } : { handled: false }
  }
  return { dispatch, fetches, puts }
}

test('every app-shell request goes to the network with cache: "no-cache" (revalidate, never trust max-age)', async () => {
  const w = loadWorker()
  for (const path of ['', 'index.html', 'core/app.js', 'core/lib/checker.js', 'core/styles.css', 'manifest.json']) {
    const { handled, res } = await w.dispatch(SCOPE + path)
    assert.ok(handled, `${path || './'} is handled by the worker`)
    assert.equal(res.body, 'fresh')
  }
  assert.ok(w.fetches.length >= 6)
  for (const f of w.fetches) assert.equal(f.init?.cache, 'no-cache', `${f.url} fetched without cache: 'no-cache'`)
})

test('recipes, plugins, other origins and non-GET requests are left to the browser (never intercepted)', async () => {
  const w = loadWorker()
  for (const url of [SCOPE + 'core/tools/company-analysis.recipe.md', SCOPE + 'plugins/plugins.json',
    'https://abc.supabase.co/rest/v1/thoughts', 'https://api.github.com/repos/student/brain-hub/contents/plugins']) {
    assert.equal((await w.dispatch(url)).handled, false, url)
  }
  assert.equal((await w.dispatch(SCOPE + 'core/app.js', { method: 'POST' })).handled, false)
  assert.equal(w.fetches.length, 0)
})

test('offline: the shell falls back to the cache, and a navigation falls back to index.html', async () => {
  const w = loadWorker({ network: 'down', cached: { [SCOPE + 'core/app.js']: { body: 'cached app' }, 'index.html': { body: 'cached index' } } })
  assert.equal((await w.dispatch(SCOPE + 'core/app.js')).res.body, 'cached app')
  assert.equal((await w.dispatch(SCOPE + 'some/page', { mode: 'navigate' })).res.body, 'cached index')
  assert.equal((await w.dispatch(SCOPE + 'core/missing.js')).res.type, 'error')
})

test('a successful response refreshes the cache copy', async () => {
  const w = loadWorker()
  await w.dispatch(SCOPE + 'core/app.js')
  await new Promise((r) => setTimeout(r, 0))
  assert.deepEqual(w.puts, [SCOPE + 'core/app.js'])
})
