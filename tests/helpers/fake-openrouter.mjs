// In-memory fake of the OpenRouter API (models list + chat completions).
// Per-model scripts: 'ok' | 429 | 401 | 402 | 400 | 'empty'. A script may be
// an array, consumed one entry per call; the last entry repeats.
export const OPENROUTER = 'https://openrouter.ai'
export const OR_KEY = 'sk-or-v1-fake-e2e-key-0000'

export const MODELS = [
  { id: 'alpha/first:free', name: 'Alpha First (free)', pricing: { prompt: '0', completion: '0' } },
  { id: 'beta/second:free', name: 'Beta Second (free)', pricing: { prompt: '0', completion: '0' } },
  { id: 'gamma/paid', name: 'Gamma Paid', pricing: { prompt: '0.000003', completion: '0.000015' } },
]
// Sorted by name, the free models are already in fallback order.
export const FREE_IDS = ['alpha/first:free', 'beta/second:free']

export const SUMMARY_TEXT = 'Value-based pricing is the strongest lever. Test it on one product first.'
export const SOURCE_URL = 'https://example.com/pricing-study'

// Answer in the format the standard block asks for, built from the prompt.
export function answerFor(prompt) {
  const lines = String(prompt).split('\n')
  const start = lines.findIndex((l) => l.startsWith('Format your answer in Markdown'))
  const sections = []
  for (let i = start + 1; start >= 0 && i < lines.length; i++) {
    const m = /^- (.+)$/.exec(lines[i])
    if (!m) { if (sections.length) break; else continue }
    if (m[1] === 'Summary') break
    sections.push(m[1])
  }
  const body = sections.map((s) => `## ${s}\n- A point about ${s.toLowerCase()} [Pricing study](${SOURCE_URL}).\n`).join('\n')
  return `${body}\n## Summary\n${SUMMARY_TEXT}\n`
}

export class FakeOpenRouter {
  constructor() {
    this.scripts = {}
    this.log = []
    this.modelsLog = []
    this.gate = null
  }
  script(model, s) { this.scripts[model] = Array.isArray(s) ? [...s] : [s]; return this }
  chats() { return this.log }
  // The next chat call waits until release() is called.
  hold() {
    let release
    const p = new Promise((r) => { release = r })
    this.gate = p
    return () => { this.gate = null; release() }
  }

  async attach(context) {
    await context.route((url) => url.origin === OPENROUTER, (route) => this.handle(route))
  }

  cors(req) {
    const h = req.headers()
    return {
      'access-control-allow-origin': h.origin || '*',
      'access-control-allow-headers': h['access-control-request-headers'] || 'authorization, content-type, x-title, http-referer',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
    }
  }

  json(route, status, body) {
    return route.fulfill({ status, headers: { ...this.cors(route.request()), 'content-type': 'application/json' }, body: JSON.stringify(body) })
  }

  async handle(route) {
    const req = route.request()
    const url = new URL(req.url())
    const h = req.headers()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: this.cors(req), body: '' })
    if (url.pathname === '/api/v1/models' && req.method() === 'GET') {
      this.modelsLog.push({ headers: h })
      return this.json(route, 200, { data: MODELS })
    }
    if (url.pathname === '/api/v1/chat/completions' && req.method() === 'POST') {
      let body = {}
      try { body = JSON.parse(req.postData() || '{}') } catch {}
      const entry = {
        model: body.model, plugins: body.plugins, messages: body.messages,
        prompt: body.messages?.[0]?.content ?? '', authorization: h.authorization, xTitle: h['x-title'],
        webPlugin: Array.isArray(body.plugins) && body.plugins.some((p) => p && p.id === 'web'),
      }
      this.log.push(entry)
      if (this.gate) await this.gate
      const q = this.scripts[body.model] || ['ok']
      const s = q.length > 1 ? q.shift() : q[0]
      if (s === 'ok') {
        return this.json(route, 200, {
          id: `gen-${this.log.length}`, model: body.model,
          choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: answerFor(entry.prompt) } }],
        })
      }
      if (s === 'empty') return this.json(route, 200, { id: 'gen-x', choices: [] })
      const messages = { 429: 'Rate limit exceeded: free-models-per-min', 401: 'No auth credentials found', 402: 'Insufficient credits', 400: 'Bad request from fake' }
      return this.json(route, s, { error: { code: s, message: messages[s] || 'error' } })
    }
    return this.json(route, 404, { error: { message: 'not found in fake openrouter' } })
  }
}
