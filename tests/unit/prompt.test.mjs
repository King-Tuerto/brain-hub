// PLAN core/lib/prompt.js; WIDGET-GUIDE §5, §8.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  fillTemplate, buildPrompt, STANDARD_BLOCK, formatBrainContext,
  WEB_SEARCH_LINE, NO_BRAIN_TEXT, EMPTY_INPUT_TEXT,
} from '../../core/lib/prompt.js'
import { HELLO } from './_fixtures.mjs'

describe('constants (exact strings)', () => {
  test('WEB_SEARCH_LINE', () => assert.equal(WEB_SEARCH_LINE, 'Search the web for current information before answering, and cite what you find.'))
  test('NO_BRAIN_TEXT matches WIDGET-GUIDE §5', () => assert.equal(NO_BRAIN_TEXT, '(No personal notes available.)'))
  test('EMPTY_INPUT_TEXT matches WIDGET-GUIDE §8', () => assert.equal(EMPTY_INPUT_TEXT, '(not provided)'))
})

describe('fillTemplate', () => {
  test('replaces known keys, with or without inner spaces', () => {
    assert.equal(fillTemplate('Hi {{name}} and {{ name }}!', { name: 'Ana' }), 'Hi Ana and Ana!')
  })
  test('unknown keys are left as-is', () => {
    assert.equal(fillTemplate('Hi {{name}} {{ other }}', { name: 'Ana' }), 'Hi Ana {{ other }}')
  })
  test('values are inserted literally ($& and $1 are not replacement patterns)', () => {
    assert.equal(fillTemplate('[{{a}}]', { a: '$& $1 $$ $`' }), '[$& $1 $$ $`]')
  })
  test('single pass: a value containing {{x}} is not expanded again', () => {
    assert.equal(fillTemplate('{{a}} {{b}}', { a: '{{b}}', b: 'B' }), '{{b}} B')
  })
  test('is reusable (global regex lastIndex does not leak between calls)', () => {
    for (let i = 0; i < 3; i++) assert.equal(fillTemplate('{{x}}{{x}}', { x: i }), `${i}${i}`)
  })
})

const EXPECTED_BLOCK_LINES = [
  '---',
  'Format your answer in Markdown with these sections, in this order, each as a "## " heading:',
  '- Key points',
  '- Next steps',
  '- Summary',
  'Every factual claim must include a source link in Markdown form [title](https://…). If you cannot source a claim, mark it [unverified].',
  // Fourth standard rule: Phase 3 PLAN §2a (amends WIDGET-GUIDE §8).
  'Statements about your own method or about what you could not verify are not factual claims: start them with "Note:".',
  'End with "## Summary": 2–3 sentences someone could search for later.',
]

describe('STANDARD_BLOCK', () => {
  test('has exactly the PLAN lines, in order (blank lines allowed between)', () => {
    const block = STANDARD_BLOCK(HELLO)
    assert.equal(typeof block, 'string')
    const lines = block.split('\n').filter((l) => l.trim() !== '')
    assert.deepEqual(lines, EXPECTED_BLOCK_LINES)
  })
  test('one "- <section>" line per recipe section, then "- Summary"', () => {
    const r = { ...HELLO, output: { sections: ['A', 'B', 'C'] } }
    const lines = STANDARD_BLOCK(r).split('\n').filter((l) => l.startsWith('- '))
    assert.deepEqual(lines, ['- A', '- B', '- C', '- Summary'])
  })
})

describe('formatBrainContext', () => {
  test('one "- (YYYY-MM-DD) content" line per result', () => {
    const out = formatBrainContext([
      { id: '1', content: 'First note', created_at: '2026-09-01T12:00:00Z' },
      { id: '2', content: 'Second note', created_at: '2026-09-15T12:00:00.000+00:00' },
    ])
    assert.equal(out, '- (2026-09-01) First note\n- (2026-09-15) Second note')
  })
  test('content over 600 characters is cut to 600 plus …', () => {
    const out = formatBrainContext([{ content: 'x'.repeat(700), created_at: '2026-09-01T12:00:00Z' }])
    assert.equal(out, `- (2026-09-01) ${'x'.repeat(600)}…`)
  })
  test('content of exactly 600 characters is not cut', () => {
    const out = formatBrainContext([{ content: 'y'.repeat(600), created_at: '2026-09-01T12:00:00Z' }])
    assert.equal(out, `- (2026-09-01) ${'y'.repeat(600)}`)
  })
  test('empty array → NO_BRAIN_TEXT', () => assert.equal(formatBrainContext([]), NO_BRAIN_TEXT))
})

describe('buildPrompt', () => {
  const today = '2026-10-03'
  test('no brain, no web line: body + \\n\\n + STANDARD_BLOCK; blank input → (not provided)', () => {
    const p = buildPrompt(HELLO, { topic: 'Pricing', depth: '   ' }, { brainContext: null, today })
    const body = 'Topic: Pricing\nDepth: (not provided)\nDate: 2026-10-03\nNotes:\n(No personal notes available.)'
    assert.equal(p, body + '\n\n' + STANDARD_BLOCK(HELLO))
    assert.ok(!p.includes(WEB_SEARCH_LINE))
  })
  test('an input missing from the values object also becomes (not provided)', () => {
    const p = buildPrompt(HELLO, { topic: 'Pricing' }, { brainContext: null, today })
    assert.ok(p.includes('Depth: (not provided)'))
  })
  test('brain context string is inserted verbatim', () => {
    const ctx = '- (2026-09-01) My pricing notes'
    const p = buildPrompt(HELLO, { topic: 'Pricing', depth: 'Quick' }, { brainContext: ctx, today })
    assert.ok(p.startsWith(`Topic: Pricing\nDepth: Quick\nDate: 2026-10-03\nNotes:\n${ctx}\n\n`))
    assert.ok(!p.includes(NO_BRAIN_TEXT))
  })
  test('webSearchLine goes between the body and the standard block', () => {
    const p = buildPrompt(HELLO, { topic: 'T', depth: 'Quick' }, { brainContext: null, today, webSearchLine: WEB_SEARCH_LINE })
    const body = 'Topic: T\nDepth: Quick\nDate: 2026-10-03\nNotes:\n(No personal notes available.)'
    assert.equal(p, body + '\n\n' + WEB_SEARCH_LINE + '\n\n' + STANDARD_BLOCK(HELLO))
  })
  test('an input value cannot inject another placeholder (e.g. pull in brain notes)', () => {
    const p = buildPrompt(HELLO, { topic: '{{brain_context}}', depth: 'Quick' }, { brainContext: 'SECRET NOTE', today })
    assert.ok(p.startsWith('Topic: {{brain_context}}\n'))
  })
})
