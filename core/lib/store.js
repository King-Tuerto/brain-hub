// Browser storage that never throws. Private windows, blocked site data and
// full quotas all make localStorage throw; the hub must keep working anyway.

function backend() {
  try { return globalThis.localStorage ?? null } catch { return null }
}

export function get(key, fallback = null) {
  try {
    const raw = backend()?.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function set(key, value) {
  try { backend()?.setItem(key, JSON.stringify(value)); return true } catch { return false }
}

export function remove(key) {
  try { backend()?.removeItem(key); return true } catch { return false }
}

export function keys(prefix = '') {
  try {
    const s = backend()
    if (!s) return []
    const out = []
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i)
      if (k != null && k.startsWith(prefix)) out.push(k)
    }
    return out
  } catch {
    return []
  }
}

// The object passed to lib modules that take a `store`.
export const store = { get, set, remove, keys }

export const DEFAULT_SETTINGS = Object.freeze({
  name: '',
  aiMode: 'manual',
  models: [],
  paidSearch: false,
  aiApp: 'claude',
  repoOverride: null,
  setupDone: false,
  stats: { runs: 0, saves: 0 },
})

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...get('hub.settings', {}) }
}

export function setSettings(patch) {
  return set('hub.settings', { ...getSettings(), ...patch })
}
