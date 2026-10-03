// Shared fixtures for unit tests. Not a test file itself.
import { load, dump, CORE_SCHEMA } from 'js-yaml'

// WIDGET-GUIDE.md §10, verbatim.
export const NETWORKING_PREP = `---
recipe_format: 1
id: networking-prep
name: Networking Prep
description: Get ready for a networking event — who to meet, what to say, what to ask.
version: 1.0.0
author: Paul Waterman
permissions: [search_brain, save_to_brain, run_ai]
web_search: required
inputs:
  - id: event_name
    label: Event name
    type: text
    required: true
  - id: event_details
    label: Paste the event page or invite
    type: long_text
    required: false
    help: Speakers, companies attending, agenda — whatever you have.
  - id: goal
    label: Main goal
    type: choose_one
    required: true
    options: [Find a job, Find a mentor, Learn an industry, Meet founders]
brain_context:
  query: "{{event_name}} contacts goals"
  limit: 5
output:
  sections: [Who to meet, My 30-second introduction, Questions to ask, Follow-up plan]
save:
  type: work_product
  tags: [networking, "{{event_name}}"]
---
I'm a university student going to a networking event on {{today}}.

Event: {{event_name}}
Details: {{event_details}}
My main goal: {{goal}}

What I already know about myself and my contacts:
{{brain_context}}

Research the event and the organisations attending. Tell me who is most worth
meeting given my goal, write a 30-second introduction in my voice using what
you know about me, give me five specific questions that show I did my
homework, and give me a follow-up plan for the week after.
`

export function split(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  return { fm: load(m[1], { schema: CORE_SCHEMA }), body: m[2] }
}

// Build a recipe text from the networking-prep example with the front matter
// mutated. mutate(fm) may edit in place; set a key to undefined to delete it.
export function variant(mutate = () => {}, bodyOverride) {
  const { fm, body } = split(NETWORKING_PREP)
  mutate(fm)
  for (const k of Object.keys(fm)) if (fm[k] === undefined) delete fm[k]
  return `---\n${dump(fm, { lineWidth: -1 })}---\n${bodyOverride ?? body}`
}

// A parsed-recipe-shaped object matching PLAN "Starter dummy recipe".
export const HELLO = Object.freeze({
  recipe_format: 1,
  id: 'hello-hub',
  name: 'Hello Hub',
  description: 'A dummy tool that proves the hub works end to end.',
  version: '1.0.0',
  author: 'El Código',
  permissions: ['search_brain', 'save_to_brain', 'run_ai'],
  web_search: 'helpful',
  inputs: [
    { id: 'topic', label: 'Topic', type: 'text', required: true },
    { id: 'depth', label: 'How deep?', type: 'choose_one', required: true, options: ['Quick', 'Thorough'] },
  ],
  brain_context: { query: '{{topic}}', limit: 3 },
  output: { sections: ['Key points', 'Next steps'] },
  save: { type: 'work_product', tags: ['hello-hub', '{{topic}}'] },
  body: 'Topic: {{topic}}\nDepth: {{depth}}\nDate: {{today}}\nNotes:\n{{brain_context}}',
  fileName: 'hello-hub.recipe.md',
})

// `now` is injected; PLAN doesn't say whether it is a function or a number.
// This value works as both: now() and now/1000 and new Date(now).
export function flexNow(ms) {
  const f = () => ms
  f.valueOf = () => ms
  return f
}

// In-memory store with the store.js interface.
export function memStore(initial = {}) {
  const m = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]))
  return {
    map: m,
    get: (k, fallback) => (m.has(k) ? JSON.parse(JSON.stringify(m.get(k))) : fallback),
    set: (k, v) => { m.set(k, JSON.parse(JSON.stringify(v))) },
    remove: (k) => { m.delete(k) },
    keys: (prefix = '') => [...m.keys()].filter((k) => k.startsWith(prefix)),
    dumpAll: () => JSON.stringify([...m.entries()]),
  }
}

// Scripted fake fetch. handler(req) returns {status, body, text, headers} or
// throws to simulate a network failure. Every request is recorded.
export function fakeFetch(handler) {
  const calls = []
  const fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url ?? String(input)
    const method = (init.method || input?.method || 'GET').toUpperCase()
    const headers = {}
    new Headers(init.headers || input?.headers || {}).forEach((v, k) => { headers[k] = v })
    let body = init.body
    let json
    if (typeof body === 'string') { try { json = JSON.parse(body) } catch {} }
    const req = { url, method, headers, body, json }
    calls.push(req)
    const r = await handler(req, calls)
    if (r instanceof Response) return r
    const text = r.text ?? (r.body === undefined ? '' : JSON.stringify(r.body))
    const status = r.status ?? 200
    const nullBody = [204, 205, 304].includes(status)
    return new Response(nullBody ? null : text, {
      status, headers: { 'content-type': 'application/json', ...(r.headers || {}) },
    })
  }
  return { fetch, calls }
}

// Compare a URL to an expected one: same origin+path, same query params
// (order and percent-encoding ignored).
export function sameUrl(actual, expected) {
  const a = new URL(actual), e = new URL(expected)
  const norm = (u) => [...u.searchParams.entries()].map(([k, v]) => `${k}=${v}`).sort()
  return a.origin === e.origin && a.pathname === e.pathname &&
    JSON.stringify(norm(a)) === JSON.stringify(norm(e))
}
