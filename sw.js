// Brain Hub service worker. Network first for the app shell, so students always
// get updates when online; the cache only matters when the network fails.
// Never caches other origins (brain, AI, GitHub) or tool recipes.
const CACHE = 'brain-hub-v4'
const SHELL = [
  './', 'index.html', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'core/styles.css', 'core/app.js', 'core/sw-register.js',
  'core/lib/recipe.js', 'core/lib/prompt.js', 'core/lib/summary.js', 'core/lib/output.js',
  'core/lib/brain.js', 'core/lib/ai.js', 'core/lib/plugins.js', 'core/lib/save.js', 'core/lib/store.js', 'core/lib/checker.js',
  'core/vendor/js-yaml.mjs', 'core/vendor/marked.esm.js', 'core/vendor/purify.es.mjs',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()))
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  const scope = new URL(self.registration.scope)
  const path = url.pathname.slice(scope.pathname.length)
  if (path.startsWith('plugins/') || path.startsWith('core/tools/')) return
  event.respondWith(
    // cache: 'no-cache' revalidates with GitHub Pages every time (a cheap 304 when
    // nothing changed). Without it the browser trusts Pages' max-age=600, so an
    // update could take ~10 minutes to reach an installed app (Phase 7 guide run).
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
        return res
      })
      .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  )
})
