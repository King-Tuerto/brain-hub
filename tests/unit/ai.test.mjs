// PLAN core/lib/ai.js — OpenRouter client and model fallback.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createAI } from '../../core/lib/ai.js'
import { fakeFetch } from './_fixtures.mjs'

const KEY = 'sk-or-v1-TESTKEY'
const CHAT = 'https://openrouter.ai/api/v1/chat/completions'
const answer = (content) => ({ status: 200, body: { id: 'gen-1', choices: [{ message: { role: 'assistant', content } }] } })

describe('listFreeModels', () => {
  test('GET /models; free = :free suffix or 0/0 pricing; sorted by name; {id,name} only', async () => {
    const data = [
      { id: 'z/zeta:free', name: 'Zeta', pricing: { prompt: '0.000001', completion: '0.000002' } },
      { id: 'a/paid', name: 'Alpha Paid', pricing: { prompt: '0.000001', completion: '0' } },
      { id: 'b/zero', name: 'Beta Zero', pricing: { prompt: '0', completion: '0' } },
      { id: 'c/no-pricing', name: 'Gamma' },
      { id: 'd/delta:free', name: 'Delta' },
      { id: 'e/half', name: 'Eps', pricing: { prompt: '0', completion: '0.1' } },
    ]
    const { fetch, calls } = fakeFetch(() => ({ status: 200, body: { data } }))
    const r = await createAI({ key: KEY, fetch }).listFreeModels()
    assert.equal(r.ok, true)
    assert.deepEqual(r.models, [
      { id: 'b/zero', name: 'Beta Zero' },
      { id: 'd/delta:free', name: 'Delta' },
      { id: 'z/zeta:free', name: 'Zeta' },
    ])
    assert.equal(calls[0].method, 'GET')
    assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/models')
  })
  test('failure → ok:false, no throw', async () => {
    const { fetch } = fakeFetch(() => ({ status: 500, body: {} }))
    assert.equal((await createAI({ key: KEY, fetch }).listFreeModels()).ok, false)
    const { fetch: f2 } = fakeFetch(() => { throw new TypeError('Failed to fetch') })
    assert.equal((await createAI({ key: KEY, fetch: f2 }).listFreeModels()).ok, false)
  })
})

function scripted(byModel) {
  return fakeFetch((req) => {
    const s = byModel[req.json?.model]
    if (typeof s === 'function') return s(req)
    if (s === 'throw') throw new TypeError('Failed to fetch')
    return s ?? { status: 500, body: {} }
  })
}

describe('run', () => {
  const M = ['m1:free', 'm2:free', 'm3:free']

  test('exact request; first model succeeds', async () => {
    const { fetch, calls } = scripted({ 'm1:free': answer('## A\nhi') })
    const r = await createAI({ key: KEY, fetch }).run('THE PROMPT', { models: M, webSearch: false })
    assert.deepEqual(r, { ok: true, text: '## A\nhi', model: 'm1:free', tried: ['m1:free'] })
    const c = calls[0]
    assert.equal(c.method, 'POST')
    assert.equal(c.url, CHAT)
    assert.equal(c.headers.authorization, `Bearer ${KEY}`)
    assert.equal(c.headers['x-title'], 'Brain Hub')
    assert.deepEqual(c.json, { model: 'm1:free', messages: [{ role: 'user', content: 'THE PROMPT' }] })
    assert.ok(!('plugins' in c.json))
  })

  test('webSearch:true adds plugins:[{id:"web"}] on every attempt', async () => {
    const { fetch, calls } = scripted({ 'm1:free': { status: 429, body: {} }, 'm2:free': answer('ok') })
    await createAI({ key: KEY, fetch }).run('P', { models: M, webSearch: true })
    assert.equal(calls.length, 2)
    for (const c of calls) assert.deepEqual(c.json.plugins, [{ id: 'web' }])
  })

  const moveOn = {
    '429': { status: 429, body: { error: { message: 'rate limited' } } },
    '404': { status: 404, body: { error: { message: 'no endpoints' } } },
    '408': { status: 408, body: {} },
    '500': { status: 500, body: {} },
    '502': { status: 502, body: {} },
    '503': { status: 503, body: {} },
    'network error': 'throw',
    '200 with no choices': { status: 200, body: { choices: [] } },
    '200 with empty content': answer(''),
    '200 with an error object': { status: 200, body: { error: { code: 429, message: 'upstream rate limit' } } },
  }
  for (const [label, resp] of Object.entries(moveOn)) {
    test(`moves to the next model on ${label}`, async () => {
      const { fetch, calls } = scripted({ 'm1:free': resp, 'm2:free': answer('second') })
      const r = await createAI({ key: KEY, fetch }).run('P', { models: M, webSearch: false })
      assert.equal(r.ok, true)
      assert.equal(r.text, 'second')
      assert.equal(r.model, 'm2:free')
      assert.deepEqual(r.tried, ['m1:free', 'm2:free'])
      assert.deepEqual(calls.map((c) => c.json.model), ['m1:free', 'm2:free'])
    })
  }

  const stop = [
    ['401', { status: 401, body: { error: { message: 'No auth credentials found' } } }, 'bad-key'],
    ['402', { status: 402, body: { error: { message: 'Insufficient credits' } } }, 'no-credits'],
    ['400', { status: 400, body: { error: { message: 'Prompt too long for this model' } } }, 'Prompt too long for this model'],
  ]
  for (const [label, resp, error] of stop) {
    test(`stops immediately on ${label} → error "${error}"`, async () => {
      const { fetch, calls } = scripted({ 'm1:free': { status: 429, body: {} }, 'm2:free': resp, 'm3:free': answer('never') })
      const r = await createAI({ key: KEY, fetch }).run('P', { models: M, webSearch: false })
      assert.equal(r.ok, false)
      assert.equal(r.error, error)
      assert.deepEqual(r.tried, ['m1:free', 'm2:free'])
      assert.equal(calls.length, 2, 'm3 never called')
    })
  }

  test('all models fail → all-models-failed, tried lists every model in order', async () => {
    const { fetch } = scripted({ 'm1:free': { status: 429, body: {} }, 'm2:free': 'throw', 'm3:free': { status: 503, body: {} } })
    const r = await createAI({ key: KEY, fetch }).run('P', { models: M, webSearch: false })
    assert.equal(r.ok, false)
    assert.equal(r.error, 'all-models-failed')
    assert.deepEqual(r.tried, M)
  })
})
