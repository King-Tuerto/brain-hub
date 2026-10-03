// OpenRouter client. Free models are rate-limited and come and go, so nothing
// is hard-coded: the student picks models in order, and we fall through them.

const API = 'https://openrouter.ai/api/v1'

export function isFreeModel(m) {
  return typeof m?.id === 'string' &&
    (m.id.endsWith(':free') || (String(m.pricing?.prompt) === '0' && String(m.pricing?.completion) === '0'))
}

async function readJson(res) {
  try { return await res.json() } catch { return null }
}

export function createAI({ key, fetch: f }) {
  const doFetch = (...a) => (f ? f(...a) : globalThis.fetch(...a))

  return {
    async listFreeModels() {
      try {
        const res = await doFetch(`${API}/models`)
        const body = await readJson(res)
        if (!res.ok) return { ok: false, error: body?.error?.message || `HTTP ${res.status}` }
        const models = (body?.data ?? []).filter(isFreeModel)
          .map((m) => ({ id: m.id, name: m.name || m.id }))
          .sort((a, b) => a.name.localeCompare(b.name))
        return { ok: true, models }
      } catch {
        return { ok: false, error: 'Could not reach OpenRouter' }
      }
    },

    async run(prompt, { models = [], webSearch = false } = {}) {
      const tried = []
      for (const model of models) {
        tried.push(model)
        const body = { model, messages: [{ role: 'user', content: prompt }] }
        if (webSearch) body.plugins = [{ id: 'web' }]
        let res
        try {
          res = await doFetch(`${API}/chat/completions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': 'Brain Hub' },
            body: JSON.stringify(body),
          })
        } catch {
          continue // network error: try the next model
        }
        const json = await readJson(res)
        if (res.status === 401) return { ok: false, error: 'bad-key', tried }
        if (res.status === 402) return { ok: false, error: 'no-credits', tried }
        if (res.status === 400) return { ok: false, error: json?.error?.message || 'The request was rejected', tried }
        if (res.status === 429 || res.status === 404 || res.status === 408 || res.status >= 500) continue
        if (!res.ok) continue
        const text = json?.choices?.[0]?.message?.content
        if (typeof text !== 'string' || !text.trim()) continue
        return { ok: true, text, model, tried }
      }
      return { ok: false, error: 'all-models-failed', tried }
    },
  }
}
