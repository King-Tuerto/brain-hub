// PLAN core/lib/summary.js; WIDGET-GUIDE §6, §6a; DECISIONS change 6.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { installSummary, PRIVACY_WARNING } from '../../core/lib/summary.js'
import { parseRecipe } from '../../core/lib/recipe.js'
import { NETWORKING_PREP, HELLO } from './_fixtures.mjs'

const PERM = {
  search_brain: (q) => `Search your brain for: "${q}"`,
  save_to_brain: 'Show a Save to brain button (you choose each time)',
  run_ai: 'Send its prompt to your AI automatically in Automatic mode',
}

test('PRIVACY_WARNING exact text (WIDGET-GUIDE §6)', () => {
  assert.equal(PRIVACY_WARNING, 'In Automatic mode, notes from your brain are sent to OpenRouter and the AI company behind the model you picked.')
})

test('networking-prep (parsed): full summary', () => {
  const { recipe } = parseRecipe(NETWORKING_PREP)
  const s = installSummary(recipe)
  assert.equal(s.name, 'Networking Prep')
  assert.equal(s.author, 'Paul Waterman')
  assert.equal(s.version, '1.0.0')
  assert.equal(s.description, recipe.description)
  assert.equal(s.query, '[Event name] contacts goals')
  assert.deepEqual(s.permissions, [
    { id: 'search_brain', text: PERM.search_brain('[Event name] contacts goals') },
    { id: 'save_to_brain', text: PERM.save_to_brain },
    { id: 'run_ai', text: PERM.run_ai },
  ])
  assert.equal(s.webSearch, 'Needs web search')
  assert.deepEqual(s.warnings, [PRIVACY_WARNING])
})

test('query substitution handles {{ id }} with spaces and every occurrence', () => {
  const r = { ...HELLO, brain_context: { query: '{{ topic }} and {{depth}} {{topic}}', limit: 3 } }
  assert.equal(installSummary(r).query, '[Topic] and [How deep?] [Topic]')
})

test('no brain_context → query null; no privacy warning without search_brain', () => {
  const r = { ...HELLO, permissions: ['save_to_brain', 'run_ai'], brain_context: undefined }
  const s = installSummary(r)
  assert.equal(s.query, null)
  assert.deepEqual(s.permissions.map((p) => p.id), ['save_to_brain', 'run_ai'])
  assert.deepEqual(s.warnings, [])
})

test('search_brain without run_ai → no warning', () => {
  const s = installSummary({ ...HELLO, permissions: ['search_brain', 'save_to_brain'] })
  assert.deepEqual(s.warnings, [])
  assert.equal(s.permissions[0].text, PERM.search_brain('[Topic]'))
})

test('run_ai only → no warning', () => {
  assert.deepEqual(installSummary({ ...HELLO, permissions: ['run_ai'], brain_context: undefined, save: undefined }).warnings, [])
})

test('webSearch texts', () => {
  assert.equal(installSummary({ ...HELLO, web_search: 'required' }).webSearch, 'Needs web search')
  assert.equal(installSummary({ ...HELLO, web_search: 'helpful' }).webSearch, 'Better with web search')
  assert.equal(installSummary({ ...HELLO, web_search: 'none' }).webSearch, 'No web search')
})
