// Phase 4 PLAN "Method": the Sonnet agent's recipe, unchanged, validates,
// builds the recorded prompt, and the separate agent's answer parses.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRecipe, PLACEHOLDER_RE } from '../../core/lib/recipe.js'
import { buildPrompt } from '../../core/lib/prompt.js'
import { parseOutput, checkSources } from '../../core/lib/output.js'
import { buildSaveRow } from '../../core/lib/save.js'
import { flexNow } from './_fixtures.mjs'
import { WEB_SEARCH_LINE, NO_BRAIN_TEXT, TODAY } from '../helpers/contract.mjs'
import { RECIPE, RECIPE_BYTES, RECIPE_FILE_NAME, TOOL_ID, INPUTS, PROMPT, SECTIONS, sha256, recordedHash, readAnswer } from '../helpers/phase4.mjs'

function recipe() {
  const r = parseRecipe(RECIPE, { fileName: RECIPE_FILE_NAME })
  assert.equal(r.ok, true, `recipe does not parse: ${JSON.stringify(r.errors)}`)
  return r.recipe
}

test('no hand-fixing: the fixture SHA-256 equals the one recorded in RESULT.md', () => {
  assert.equal(recordedHash(), '355bc6b0248fc350638b254859d006f94a083f82d208917f0c17b5c9423adbc4')
  assert.equal(sha256(RECIPE_BYTES), recordedHash())
})

test('parseRecipe: ok with the file name, no errors, id matches the file', () => {
  const r = parseRecipe(RECIPE, { fileName: RECIPE_FILE_NAME })
  assert.equal(r.ok, true)
  assert.deepEqual(r.errors ?? [], [])
  assert.equal(r.recipe.id, TOOL_ID)
  assert.deepEqual([...r.recipe.permissions].sort(), ['run_ai', 'save_to_brain', 'search_brain'])
  assert.equal(r.recipe.web_search, 'required')
  assert.deepEqual(r.recipe.output.sections, SECTIONS)
  assert.deepEqual(r.recipe.inputs.map((i) => [i.id, i.type, i.required]),
    [['job_posting', 'long_text', true], ['known_weaknesses', 'long_text', false]])
})

// {{today}}: the hub fills it from the clock. prompt.md was built on
// 2026-10-03, which is also the e2e tests' fixed browser clock (contract
// TODAY), so the comparison is exact rather than "with the date stripped".
test('prompt for inputs.json (empty brain, web-search line, today = TODAY) equals prompt.md byte for byte', () => {
  const built = buildPrompt(recipe(), INPUTS, { brainContext: null, today: TODAY, webSearchLine: WEB_SEARCH_LINE })
  assert.equal(built, PROMPT)
  assert.ok(PROMPT.includes(INPUTS.job_posting), 'prompt contains the whole posting')
  assert.ok(PROMPT.includes(INPUTS.known_weaknesses))
  assert.ok(PROMPT.includes(NO_BRAIN_TEXT))
  assert.ok(PROMPT.includes(WEB_SEARCH_LINE))
})

test('prompt.md has no unfilled placeholder, and {{today}} is the only date-dependent part', () => {
  assert.equal([...PROMPT.matchAll(PLACEHOLDER_RE)].length, 0)
  assert.ok(!PROMPT.includes('{{'))
  const other = buildPrompt(recipe(), INPUTS, { today: '2030-12-31', webSearchLine: WEB_SEARCH_LINE })
  assert.notEqual(other, PROMPT)
  assert.equal(other.replace('2030-12-31', TODAY), PROMPT)
})

test('answer.md: every section present, a Summary, and the source-check counts (reported, not graded)', (t) => {
  const answer = readAnswer() // fails with "answer.md missing" until it lands
  const o = parseOutput(answer, recipe())
  assert.deepEqual(o.missingSections, [])
  assert.ok(o.summary && o.summary.trim().length > 0, 'answer has a Summary')
  const sc = checkSources(answer)
  t.diagnostic(`source-check: claims=${sc.claims} sourced=${sc.sourced} unverified=${sc.unverified} unsourced=${sc.unsourced.length}`)
})

test('buildSaveRow for the answer: metadata.hub.tool is the agent\'s tool id', () => {
  const answer = readAnswer()
  const o = parseOutput(answer, recipe())
  const row = buildSaveRow({ recipe: recipe(), inputs: INPUTS, report: answer, summary: o.summary, sources: [], userId: 'u', now: flexNow(Date.parse('2026-10-03T12:00:00Z')) })
  assert.equal(row.metadata.hub.tool, TOOL_ID)
  assert.equal(row.metadata.hub.tool_version, '1.0.0')
  assert.equal(row.metadata.hub.type, 'work_product')
})
