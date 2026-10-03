// Phase 3 PLAN §1 (company-analysis recipe), §2 (buildSaveRow sourceCheck)
// and §4 (prompt.md is exactly what the hub builds for inputs.json).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { buildPrompt, fillShort } from '../../core/lib/prompt.js'
import { buildSaveRow, resolveTags } from '../../core/lib/save.js'
import { parseOutput, checkSources } from '../../core/lib/output.js'
import { flexNow } from './_fixtures.mjs'
import { recipeText, INDEX_FILE, INPUTS, PROMPT, SECTIONS, GOOD_ANSWER, GOOD_SUMMARY } from '../helpers/phase3.mjs'

// Spelled out here (not imported from core) so a change in core is caught.
const WEB_SEARCH_LINE = 'Search the web for current information before answering, and cite what you find.'

function recipe() {
  const r = parseRecipe(recipeText(), { fileName: 'company-analysis.recipe.md' })
  assert.equal(r.ok, true, `recipe does not parse: ${JSON.stringify(r.errors)}`)
  return r.recipe
}

test('company-analysis parses with no errors and its id matches the file name', () => {
  const r = recipe()
  assert.equal(r.id, 'company-analysis')
  assert.equal(r.recipe_format, 1)
  assert.match(r.version, /^\d+\.\d+\.\d+$/)
})

test('permissions are exactly [search_brain, save_to_brain, run_ai]; web_search is required', () => {
  const r = recipe()
  assert.deepEqual([...r.permissions].sort(), ['run_ai', 'save_to_brain', 'search_brain'])
  assert.equal(r.web_search, 'required')
})

test('inputs: company (text, required), focus_unit (text, optional), purpose (choose_one, required)', () => {
  const ins = recipe().inputs
  assert.deepEqual(ins.map((i) => i.id), ['company', 'focus_unit', 'purpose'])
  assert.deepEqual(ins.map((i) => [i.type, i.required]), [['text', true], ['text', false], ['choose_one', true]])
  const purpose = ins[2]
  assert.ok(purpose.options.length >= 2)
  assert.ok(purpose.options.includes(INPUTS.purpose), 'inputs.json purpose must be one of the options')
})

test('brain_context: query "{{company}}", limit 5', () => {
  assert.deepEqual(recipe().brain_context, { query: '{{company}}', limit: 5 })
})

test('output sections are the seven PLAN sections, in order (Summary added by the hub)', () => {
  assert.deepEqual(recipe().output.sections, SECTIONS)
})

test('save: work_product, tagged with the tool and the company', () => {
  const r = recipe()
  assert.equal(r.save.type, 'work_product')
  assert.deepEqual(resolveTags(r, INPUTS), ['company-analysis', 'deere & company (nyse: de)'])
})

test('body asks for PESTLE, 2–4 competitors with strength and weakness, questions, private-company limits', () => {
  const body = recipe().body
  assert.match(body, /PESTLE/)
  assert.match(body, /political, economic, social, technological, legal, environmental/i)
  assert.match(body, /two to four main competitors/i)
  assert.match(body, /one strength and one weakness/i)
  assert.match(body, /phrased as a question/i)
  assert.match(body, /private or a subsidiary/i)
  assert.match(body, /\[unverified\]/)
})

test('index.json lists company-analysis right after hello-hub', () => {
  const idx = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
  const h = idx.indexOf('hello-hub.recipe.md')
  assert.ok(h >= 0, 'hello-hub is listed')
  assert.equal(idx[h + 1], 'company-analysis.recipe.md')
})

test('prompt for inputs.json (no brain notes, web-search line) equals prompt.md byte for byte', () => {
  const built = buildPrompt(recipe(), INPUTS, { brainContext: null, today: '2026-10-03', webSearchLine: WEB_SEARCH_LINE })
  assert.equal(built, PROMPT)
  assert.ok(PROMPT.includes(WEB_SEARCH_LINE))
  assert.ok(PROMPT.includes('(No personal notes available.)'))
})

test('prompt.md does not depend on the date (the recipe never uses {{today}})', () => {
  const a = buildPrompt(recipe(), INPUTS, { today: '2020-01-01', webSearchLine: WEB_SEARCH_LINE })
  const b = buildPrompt(recipe(), INPUTS, { today: '2030-12-31', webSearchLine: WEB_SEARCH_LINE })
  assert.equal(a, b)
})

test('blank focus_unit becomes "(not provided)", which the body tells the AI how to handle', () => {
  const p = buildPrompt(recipe(), { ...INPUTS, focus_unit: '  ' }, { webSearchLine: WEB_SEARCH_LINE })
  assert.match(p, /Business unit to scan in depth: \(not provided\) \(if "\(not provided\)"/)
})

test('brain search query is the company exactly as typed', () => {
  const r = recipe()
  assert.equal(fillShort(r.brain_context.query, r, INPUTS), 'Deere & Company (NYSE: DE)')
})

test('a synthetic complete answer: no missing sections, 0 unsourced', () => {
  const o = parseOutput(GOOD_ANSWER, recipe())
  assert.deepEqual(o.missingSections, [])
  assert.equal(o.summary, GOOD_SUMMARY)
  const sc = checkSources(GOOD_ANSWER)
  assert.deepEqual(sc.unsourced, [])
  assert.equal(sc.unverified, 1)
  assert.equal(sc.sourced, 7)
  assert.equal(sc.claims, 8)
})

// ---- buildSaveRow with sourceCheck (PLAN §2 "Save") ----
const NOW = Date.parse('2026-10-03T12:00:00.000Z')
const SC = { claims: 12, sourced: 10, unverified: 1, unsourced: 1 }

test('buildSaveRow: sourceCheck is stored as metadata.hub.source_check, verbatim', () => {
  const row = buildSaveRow({
    recipe: recipe(), inputs: INPUTS, report: GOOD_ANSWER, summary: GOOD_SUMMARY,
    sources: ['https://example.com/a'], userId: 'u-1', now: flexNow(NOW), sourceCheck: SC,
  })
  assert.deepEqual(row.metadata.hub.source_check, SC)
  assert.equal(row.metadata.hub.tool, 'company-analysis')
  assert.equal(row.metadata.hub.report, GOOD_ANSWER)
  assert.equal(row.content, GOOD_SUMMARY)
  assert.equal(row.source, 'brain-hub')
})

test('buildSaveRow: unsourced is stored as a count, not the list', () => {
  const sc = checkSources(GOOD_ANSWER)
  const row = buildSaveRow({
    recipe: recipe(), inputs: INPUTS, report: GOOD_ANSWER, summary: 'S', sources: [], userId: 'u', now: flexNow(NOW),
    sourceCheck: { claims: sc.claims, sourced: sc.sourced, unverified: sc.unverified, unsourced: sc.unsourced.length },
  })
  assert.equal(typeof row.metadata.hub.source_check.unsourced, 'number')
  assert.equal(row.metadata.hub.source_check.unsourced, 0)
})

test('buildSaveRow: without sourceCheck there is no source_check key (Phase 2 rows unchanged)', () => {
  const row = buildSaveRow({ recipe: recipe(), inputs: INPUTS, report: 'r', summary: 'S', sources: [], userId: 'u', now: flexNow(NOW) })
  assert.ok(!('source_check' in row.metadata.hub))
  assert.deepEqual(Object.keys(row.metadata.hub).sort(),
    ['archived', 'report', 'saved_at', 'sources', 'tags', 'tool', 'tool_version', 'type'])
})

test('buildSaveRow: source_check with 0 claims is still stored (an empty check is a fact too)', () => {
  const zero = { claims: 0, sourced: 0, unverified: 0, unsourced: 0 }
  const row = buildSaveRow({ recipe: recipe(), inputs: INPUTS, report: 'r', summary: 'S', sources: [], userId: 'u', now: flexNow(NOW), sourceCheck: zero })
  assert.deepEqual(row.metadata.hub.source_check, zero)
})
