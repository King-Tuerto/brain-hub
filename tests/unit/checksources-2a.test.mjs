// Phase 3 PLAN §2a: source-check revision after the first real run.
// Labels, [unverified …], list items as blocks with inheritance, Note: lines,
// the fourth standard-block rule, and run 1 as a regression fixture.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { checkSources, parseOutput, extractSources } from '../../core/lib/output.js'
import { buildPrompt } from '../../core/lib/prompt.js'
import { parseRecipe } from '../../core/lib/recipe.js'
import { recipeText, INPUTS, PROMPT, RULES_ANSWER } from '../helpers/phase3.mjs'

const L = (n) => `https://example.com/${n}`
const texts = (r) => r.unsourced.map((u) => u.text)
const NOTE_RULE = 'Statements about your own method or about what you could not verify are not factual claims: start them with "Note:".'

// ---- labels ----
test('an item or paragraph that is entirely emphasis is a label, not a claim', () => {
  const md = [
    '## Industries and main competitors',
    '**1. Construction equipment**',
    '',
    '*Political*',
    '',
    '__Economic__',
    '',
    '- **Caterpillar**',
    '- *Komatsu*',
    '- _Volvo CE_',
    `- real claim ${L(1)}`,
  ].join('\n')
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('partly emphasised text is still a claim', () => {
  const md = '## A\n- **Tariffs (hurts):** Deere expects $1.1bn of tariff cost.\n\nPESTLE for **Construction & Forestry only**.'
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.deepEqual(texts(r), ['**Tariffs (hurts):** Deere expects $1.1bn of tariff cost.', 'PESTLE for **Construction & Forestry only**.'])
})

// ---- [unverified …] ----
test('[unverified …] with extra words counts as unverified (/\\[unverified\\b[^\\]]*\\]/i)', () => {
  const md = [
    '## A',
    '- one [unverified – not checked against a 2026 source]',
    '- two [Unverified: estimate]',
    '- three [UNVERIFIED]',
    '- four [unverifiedish]',
    '- five (unverified, sorry)',
  ].join('\n')
  const r = checkSources(md)
  assert.equal(r.unverified, 3)
  assert.deepEqual(texts(r), ['four [unverifiedish]', 'five (unverified, sorry)'])
})

// ---- list items are blocks ----
test('indented non-list lines after an item belong to that item, not a new paragraph', () => {
  const md = `## A\n- Deere makes tractors\n  and excavators. ${L(1)}\n- second item\n  continued`
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.equal(r.sourced, 1)
  assert.deepEqual(texts(r), ['second item continued'])
})

test('an indented paragraph after a blank line still belongs to the item above it', () => {
  const md = `## A\n- Construction & Forestry sells machines\n\n  It sells through dealers. ${L(1)}\n\nA new, unindented paragraph.`
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.equal(r.sourced, 1)
  assert.deepEqual(texts(r), ['A new, unindented paragraph.'])
})

test('a nested item without a link inherits the source of its top-level item block', () => {
  const md = [
    '## Business units',
    `- **CF:** sells four kinds of equipment ${L('cf')}`,
    '  - excavators and dozers',
    '  - compact loaders',
    '    - skid steers (third level)',
  ].join('\n')
  assert.deepEqual(checkSources(md), { claims: 4, sourced: 4, unverified: 0, unsourced: [] })
})

test('inheritance counts the top-level continuation lines (run 1: lead-in, product list, then sourced paragraph)', () => {
  const md = [
    '## Business units',
    '- **Construction & Forestry (CF):** this unit sells four kinds of equipment:',
    '  - construction machines: excavators and dozers',
    '  - forestry machines such as harvesters',
    '',
    `  It sells to contractors through dealers. Fiscal 2025 net sales were $11.4bn. [10-K](${L('10k')})`,
  ].join('\n')
  const r = checkSources(md)
  assert.deepEqual(r.unsourced, [])
  assert.equal(r.sourced, 3)
})

test('the block is the item and its continuation lines, never its siblings', () => {
  const md = [
    '## Industries and main competitors',
    '- **Caterpillar**',
    `  - Strength: bigger scale ${L('cat')}`,
    '  - Weakness: one-off profit',
    `- Komatsu is number two ${L('kom')}`,
  ].join('\n')
  const r = checkSources(md)
  // The label has no link, so the unlinked child has nothing to inherit; its sibling's link does not count.
  assert.deepEqual(r.unsourced, [{ section: 'Industries and main competitors', text: 'Weakness: one-off profit' }])
  assert.equal(r.claims, 3)
})

test('a top-level item does not inherit from its own children', () => {
  const md = `## A\n- Deere sells machines\n  - excavators ${L(1)}`
  const r = checkSources(md)
  assert.deepEqual(texts(r), ['Deere sells machines'])
  assert.equal(r.sourced, 1)
})

test('PLAN §2b A3: an item\'s own [unverified] beats inheritance; a plain child still inherits', () => {
  const md = `## A\n- Deere sells machines ${L(1)}\n  - market share about 15% [unverified]\n  - plain child`
  assert.deepEqual(checkSources(md), { claims: 3, sourced: 2, unverified: 1, unsourced: [] })
})

// ---- Note: ----
test('lines starting with Note: (any case, after list markers and emphasis) are not claims', () => {
  const md = [
    '## Limits of this analysis',
    '- Note: revenue shares are my own arithmetic.',
    '- **Note:** the Kubota page could not be opened.',
    '* note: fiscal 2026 is not finished.',
    '1. NOTE: quarters do not line up.',
    'Note: this paragraph is about method.',
    '_Note_: emphasis around the word only.',
    '- Notes: plural is not the rule word.',
    '- Note that this has no colon.',
  ].join('\n')
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.deepEqual(texts(r), ['Notes: plural is not the rule word.', 'Note that this has no colon.'])
})

// ---- end to end on a synthetic answer using every new rule ----
test('a synthetic answer using every 2a rule has 0 unsourced', () => {
  const r = checkSources(RULES_ANSWER)
  assert.deepEqual(r.unsourced, [])
  assert.ok(r.unverified >= 1)
  assert.equal(r.claims, r.sourced + r.unverified)
})

// ---- the fourth standard rule ----
test('the standard block tells every AI to start method statements with "Note:"', () => {
  const recipe = parseRecipe(recipeText(), { fileName: 'company-analysis.recipe.md' }).recipe
  const p = buildPrompt(recipe, INPUTS, { webSearchLine: null })
  assert.ok(p.split('\n').includes(NOTE_RULE), 'NOTE rule line missing from the built prompt')
  assert.ok(PROMPT.split('\n').includes(NOTE_RULE), 'prompt.md has not been regenerated with the NOTE rule')
})

// ---- run 1 regression (the old-prompt answer, PLAN §2a) ----
const RUN1 = new URL('../fixtures/real-run/deere/run-1/answer.md', import.meta.url)
function run1() {
  if (!existsSync(RUN1)) throw new Error('run-1/answer.md missing: tests/fixtures/real-run/deere/run-1/answer.md (PLAN §2a) is not there yet')
  return readFileSync(RUN1, 'utf8')
}

test('run 1 regression: labels, [unverified – …] and the product list are no longer flagged', () => {
  const r = checkSources(run1())
  const t = texts(r).join('\n')
  assert.doesNotMatch(t, /^\*\*(Caterpillar|Komatsu|Political|1\. Construction)/m, 'a label is still counted')
  assert.doesNotMatch(t, /unverified –/, '[unverified – …] is still unsourced')
  assert.doesNotMatch(t, /^construction machines:/m, 'the CF product list did not inherit its source')
})

test('run 1 regression: its method statements (no "Note:") are still flagged — 60 claims, 8 unsourced', () => {
  const r = checkSources(run1())
  const bySection = {}
  for (const u of r.unsourced) bySection[u.section] = (bySection[u.section] ?? 0) + 1
  assert.deepEqual(bySection, { 'Business units': 1, 'Environmental scan': 1, 'Limits of this analysis': 6 })
  assert.deepEqual({ claims: r.claims, sourced: r.sourced, unverified: r.unverified }, { claims: 60, sourced: 49, unverified: 3 })
  assert.match(texts(r).join('\n'), /^Revenue shares below are my own calculations/m)
})

// ---- run 2 regression (answer to the Note-rule prompt, before the recipe's scope line became a Note) ----
const RUN2 = new URL('../fixtures/real-run/deere/run-2/answer.md', import.meta.url)
test('run 2 regression: 53 claims, 52 sourced; only the unmarked PESTLE scope line is flagged', () => {
  if (!existsSync(RUN2)) throw new Error('run-2/answer.md missing: tests/fixtures/real-run/deere/run-2/answer.md is not there')
  const r = checkSources(readFileSync(RUN2, 'utf8'))
  assert.deepEqual({ claims: r.claims, sourced: r.sourced, unverified: r.unverified }, { claims: 53, sourced: 52, unverified: 0 })
  assert.equal(r.unsourced.length, 1)
  assert.equal(r.unsourced[0].section, 'Environmental scan')
  assert.match(r.unsourced[0].text, /^PESTLE for .* only\.$/)
})

test('the recipe now opens the Environmental scan with a "Note:" line naming the unit', () => {
  // So run 2's one miss (an unmarked scope line) is prompted away in run 3.
  assert.match(PROMPT, /Environmental scan:[^\n]*Note:/)
})

// ---- PLAN §2b fixes for Nitpick D1–D3, A1, A2 ----

test('§2b D1: ~~~ fences with a language tag hide their contents too', () => {
  const md = ['## A', '~~~markdown', '- not a claim', '| a | b |', '| c | d |', '~~~', `- claim ${L(1)}`].join('\n')
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('§2b D2: ---, *** and ___ rules are not claims', () => {
  const md = `## A\n- ok ${L(1)}\n\n***\n\n___\n\n---\n\n- ok ${L(2)}`
  assert.deepEqual(checkSources(md), { claims: 2, sourced: 2, unverified: 0, unsourced: [] })
})

test('§2b D2: a rule straight after an item is not a continuation of it (no link leaks across)', () => {
  const md = `## A\n- unsourced item\n---\nSourced paragraph ${L(1)}`
  const r = checkSources(md)
  assert.deepEqual(texts(r), ['unsourced item'])
  assert.equal(r.claims, 2)
})

test('§2b D3: parseOutput and checkSources agree on **Summary** and Summary: headings', () => {
  for (const h of ['## **Summary**', '## Summary:', '## _Summary_']) {
    const md = `## Key points\n- ok ${L(1)}\n\n## Next steps\n- ok ${L(2)}\n\n${h}\nUnsourced summary sentence.`
    assert.equal(parseOutput(md, { output: { sections: ['Key points', 'Next steps'] } }).summary, 'Unsourced summary sentence.', h)
    assert.equal(checkSources(md).unsourced.length, 0, h)
  }
})

test('§2b A1: a wholly bold sentence ending in . ! or ? is a claim, not a label', () => {
  const md = '## A\n- **Deere revenue fell 12%.**\n- **Deere beat estimates!**\n\n**CF margins doubled.**'
  const r = checkSources(md)
  assert.equal(r.claims, 3)
  assert.equal(r.unsourced.length, 3)
})

test('§2b A1: a wholly emphasised label is at most 15 words; 16 words is a claim', () => {
  const w = (n) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')
  const r15 = checkSources(`## A\n- **${w(15)}**`)
  assert.equal(r15.claims, 0, '15-word bold line should be a label')
  const r16 = checkSources(`## A\n- **${w(16)}**`)
  assert.equal(r16.claims, 1, '16-word bold line should be a claim')
})

test('§2b A2: a lazy continuation line (no indent, no blank line) belongs to the item', () => {
  const r = checkSources(`## A\n- Deere makes tractors\nand excavators ${L(1)}`)
  assert.deepEqual(r, { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('§2b A2: after a blank line, an unindented line is a new paragraph again', () => {
  const r = checkSources(`## A\n- Deere makes tractors ${L(1)}\n\nUnsourced paragraph.`)
  assert.deepEqual(texts(r), ['Unsourced paragraph.'])
})

// ---- SOURCE-AUDIT F1: a URL with an apostrophe is saved twice, once truncated ----
test('extractSources: a Markdown link whose URL contains an apostrophe is one source, not a truncated duplicate', () => {
  const u = "https://aashtojournal.transportation.org/house-passes-senate-cr-to-extend-federal-gov't-funding/"
  assert.deepEqual(extractSources(`- Funding runs to 11 December. ([AASHTO Journal](${u}))`), [u])
})
