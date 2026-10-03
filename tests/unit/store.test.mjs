// PLAN core/lib/store.js — JSON localStorage wrapper that never throws.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

class MemStorage {
  constructor() { this.m = new Map() }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null }
  setItem(k, v) { this.m.set(k, String(v)) }
  removeItem(k) { this.m.delete(k) }
  key(i) { return [...this.m.keys()][i] ?? null }
  get length() { return this.m.size }
  clear() { this.m.clear() }
}

function install(value) {
  Object.defineProperty(globalThis, 'localStorage', { value, configurable: true, writable: true })
}
function installThrowingGetter() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true, get() { throw new DOMException('The operation is insecure.', 'SecurityError') },
  })
}

let ls
beforeEach(() => { ls = new MemStorage(); install(ls) })

const store = await (async () => { install(new MemStorage()); return import('../../core/lib/store.js') })()

test('set/get round-trip as JSON under the exact key', () => {
  const v = { name: 'Ana', aiMode: 'manual', models: ['a', 'b'], paidSearch: false, setupDone: true }
  store.set('hub.settings', v)
  assert.equal(ls.getItem('hub.settings'), JSON.stringify(v))
  assert.deepEqual(store.get('hub.settings'), v)
})

test('get missing → fallback', () => {
  assert.equal(store.get('hub.nothing', 'fb'), 'fb')
  assert.deepEqual(store.get('hub.nothing', { a: 1 }), { a: 1 })
})

test('remove', () => {
  store.set('hub.session', { access_token: 'x' })
  store.remove('hub.session')
  assert.equal(ls.getItem('hub.session'), null)
  assert.equal(store.get('hub.session', null), null)
})

test('falsy stored values come back as stored, not as the fallback', () => {
  store.set('hub.a', false); store.set('hub.b', 0); store.set('hub.c', '')
  assert.equal(store.get('hub.a', 'fb'), false)
  assert.equal(store.get('hub.b', 'fb'), 0)
  assert.equal(store.get('hub.c', 'fb'), '')
})

test('corrupt JSON → fallback, no throw', () => {
  ls.setItem('hub.settings', '{not json')
  assert.equal(store.get('hub.settings', 'fb'), 'fb')
})

test('getItem/setItem/removeItem throwing (quota, Safari private mode) → never throws', () => {
  const boom = () => { throw new DOMException('QuotaExceededError', 'QuotaExceededError') }
  install({ getItem: boom, setItem: boom, removeItem: boom, key: boom, length: 0, clear: boom })
  assert.doesNotThrow(() => store.set('hub.settings', { a: 1 }))
  assert.equal(store.get('hub.settings', 'fb'), 'fb')
  assert.doesNotThrow(() => store.remove('hub.settings'))
})

test('accessing localStorage itself throws (blocked storage) → never throws', () => {
  installThrowingGetter()
  assert.doesNotThrow(() => store.set('hub.x', 1))
  assert.equal(store.get('hub.x', 'fb'), 'fb')
  assert.doesNotThrow(() => store.remove('hub.x'))
})

test('localStorage undefined → never throws', () => {
  install(undefined)
  assert.doesNotThrow(() => store.set('hub.x', 1))
  assert.equal(store.get('hub.x', 'fb'), 'fb')
  assert.doesNotThrow(() => store.remove('hub.x'))
})

test('unserialisable value (circular) → no throw', () => {
  const a = {}; a.self = a
  assert.doesNotThrow(() => store.set('hub.x', a))
})
