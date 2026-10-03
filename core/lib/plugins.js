// Find the hub's tools: core starter tools, the student's plugins/ folder
// (listed through the public GitHub API, so nobody edits a manifest), and
// recipes installed by pasting.
import { parseRecipe } from './recipe.js'

const CACHE_KEY = 'hub.pluginCache'
const CACHE_MS = 10 * 60 * 1000
const RECIPE_RE = /\.recipe\.md$/

export function repoFromLocation({ hostname, pathname } = {}) {
  const m = /^([a-z0-9-]+)\.github\.io$/i.exec(String(hostname ?? ''))
  if (!m) return null
  const owner = m[1]
  const first = String(pathname ?? '').split('/').filter(Boolean)[0]
  return { owner, repo: first || `${owner}.github.io` }
}

export function parseRepo(text) {
  const m = /^\s*([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)\s*$/.exec(String(text ?? ''))
  return m ? { owner: m[1], repo: m[2] } : null
}

const idOf = (fileName) => String(fileName).replace(RECIPE_RE, '')

async function getJson(doFetch, url) {
  const res = await doFetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function discoverTools({ fetch: f, store, now = () => Date.now(), repo, base = './', force = false }) {
  const doFetch = (...a) => (f ? f(...a) : globalThis.fetch(...a))
  const all = []

  // Core starter tools.
  try {
    const list = await getJson(doFetch, `${base}core/tools/index.json`)
    for (const fileName of Array.isArray(list) ? list : []) {
      if (RECIPE_RE.test(fileName)) all.push({ fileName, url: `${base}core/tools/${fileName}`, origin: 'core' })
    }
  } catch { /* no core tools is survivable */ }

  // Student plugins.
  let via = 'none'
  let pluginFiles = null
  const repoKey = repo ? `${repo.owner}/${repo.repo}` : null
  if (repoKey) {
    const cache = store?.get(CACHE_KEY, null)
    if (!force && cache && cache.repo === repoKey && now() - cache.at < CACHE_MS && Array.isArray(cache.files)) {
      pluginFiles = cache.files
      via = 'cache'
    } else {
      try {
        const list = await getJson(doFetch, `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/plugins`)
        if (!Array.isArray(list)) throw new Error('not a folder listing')
        pluginFiles = list
          .filter((e) => e && e.type === 'file' && RECIPE_RE.test(e.name) && e.download_url)
          .map((e) => ({ fileName: e.name, url: e.download_url }))
        store?.set(CACHE_KEY, { repo: repoKey, at: now(), files: pluginFiles })
        via = 'api'
      } catch {
        pluginFiles = null
      }
    }
  }
  if (pluginFiles === null) {
    try {
      const manifest = await getJson(doFetch, `${base}plugins/plugins.json`)
      const names = (Array.isArray(manifest?.recipes) ? manifest.recipes : []).filter((n) => RECIPE_RE.test(n))
      pluginFiles = names.map((fileName) => ({ fileName, url: `${base}plugins/${fileName}` }))
      via = pluginFiles.length ? 'manifest' : 'none'
    } catch {
      pluginFiles = []
      via = 'none'
    }
  }
  for (const p of pluginFiles) all.push({ ...p, origin: 'plugin' })

  // Pasted (local) tools.
  for (const t of store?.get('hub.localTools', []) ?? []) {
    if (t && t.id && typeof t.text === 'string') all.push({ fileName: `${t.id}.recipe.md`, url: null, origin: 'local', text: t.text })
  }

  // One tool per id: core > plugin > local.
  const rank = { core: 0, plugin: 1, local: 2 }
  const tools = []
  const conflicts = []
  const byId = new Map()
  for (const t of [...all].sort((a, b) => rank[a.origin] - rank[b.origin])) {
    const id = idOf(t.fileName)
    if (byId.has(id)) conflicts.push({ ...t, id, keptOrigin: byId.get(id).origin })
    else { byId.set(id, t); tools.push(t) }
  }
  return { tools, via, conflicts }
}

// Fetch and parse each discovered tool. Broken recipes come back with errors
// instead of disappearing, so the student can see why a tool is missing.
export async function loadTools(entries, { fetch: f } = {}) {
  const doFetch = (...a) => (f ? f(...a) : globalThis.fetch(...a))
  return Promise.all(entries.map(async (entry) => {
    try {
      let text = entry.text
      if (text == null) {
        const res = await doFetch(entry.url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        text = await res.text()
      }
      return { entry, text, ...parseRecipe(text, { fileName: entry.fileName }) }
    } catch (e) {
      return { entry, ok: false, errors: [`Could not load ${entry.fileName}: ${e.message}`] }
    }
  }))
}
