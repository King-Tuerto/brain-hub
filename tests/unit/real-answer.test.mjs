// Phase 3 "Done when" 2: the real Deere answer (written by an independent
// research agent from prompt.md alone) passes the hub's checks.
// If answer.md has not landed yet, every test here FAILS with "answer.md missing".
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRecipe } from '../../core/lib/recipe.js'
import { parseOutput, checkSources, extractSources } from '../../core/lib/output.js'
import { recipeText, readAnswer, SECTIONS } from '../helpers/phase3.mjs'

const recipe = () => parseRecipe(recipeText(), { fileName: 'company-analysis.recipe.md' }).recipe

test('real answer: every required section is present, in order, plus Summary', () => {
  const answer = readAnswer()
  const o = parseOutput(answer, recipe())
  assert.deepEqual(o.missingSections, [])
  const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  const order = [...SECTIONS, 'Summary'].map((s) => o.sections.map(norm).indexOf(norm(s)))
  assert.deepEqual(order, [...order].sort((a, b) => a - b), `sections out of order: ${o.sections.join(' | ')}`)
})

test('real answer: 0 unsourced claims', () => {
  const sc = checkSources(readAnswer())
  assert.ok(sc.claims > 0, 'the source check found no claims at all')
  assert.deepEqual(sc.unsourced, [], `unsourced claims:\n${sc.unsourced.map((u) => `  ${u.section}: ${u.text}`).join('\n')}`)
})

test('real answer: mostly sourced, not mostly [unverified]', () => {
  const sc = checkSources(readAnswer())
  assert.ok(sc.sourced >= 20, `only ${sc.sourced} sourced claims`)
  assert.ok(sc.unverified <= sc.sourced / 4, `${sc.unverified} unverified vs ${sc.sourced} sourced`)
})

test('real answer: a non-empty Summary that names Deere (it is what search finds later)', () => {
  const s = parseOutput(readAnswer(), recipe()).summary
  assert.ok(s.length > 40, 'summary too short')
  assert.match(s, /Deere/)
})

test('real answer: sources are real web addresses (no example.com placeholders)', () => {
  const urls = extractSources(readAnswer())
  assert.ok(urls.length >= 10, `only ${urls.length} distinct sources`)
  for (const u of urls) {
    assert.match(u, /^https?:\/\/[a-z0-9.-]+\.[a-z]{2,}/i, u)
    assert.doesNotMatch(u, /example\.(com|org|net)/i, u)
  }
})

test('real answer: Environmental scan covers all six PESTLE factors', () => {
  const answer = readAnswer()
  const m = /^##\s+Environmental scan\s*#*$([\s\S]*?)(?=^##\s)/im.exec(answer)
  assert.ok(m, 'no Environmental scan section')
  for (const f of ['Political', 'Economic', 'Social', 'Technolog', 'Legal', 'Environmental']) {
    assert.match(m[1], new RegExp(f, 'i'), `Environmental scan does not mention ${f}`)
  }
})

test('real answer: Suggested further research items are questions (so they are not claims)', () => {
  const answer = readAnswer()
  const m = /^##\s+Suggested further research\s*#*$([\s\S]*?)(?=^##\s)/im.exec(answer)
  assert.ok(m, 'no Suggested further research section')
  const items = m[1].split('\n').map((l) => l.trim()).filter((l) => /^(?:[-*+]|\d+[.)])\s+/.test(l))
  assert.ok(items.length >= 3 && items.length <= 5, `${items.length} items`)
  // A trailing source link is allowed (then it is a sourced item); the item itself must ask something.
  for (const it of items) assert.match(it, /\?/, it)
})
