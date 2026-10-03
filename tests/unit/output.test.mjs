// PLAN core/lib/output.js.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseOutput } from '../../core/lib/output.js'
import { HELLO } from './_fixtures.mjs'

const GOOD = `Intro line.

## Key points
- Value pricing works [Pricing guide](https://example.com/pricing).
### A sub-heading that is not a section
- More, see https://example.org/b.

## Next steps ##
- Call (https://example.net/c); then http://example.com/d,
- Again [dup](https://example.com/pricing)

## Summary
  Pricing matters. Start with value.
`

test('sections in order, ## only, trailing #s stripped', () => {
  const o = parseOutput(GOOD, HELLO)
  assert.deepEqual(o.sections, ['Key points', 'Next steps', 'Summary'])
  assert.deepEqual(o.missingSections, [])
})

test('summary = text under ## Summary, trimmed', () => {
  assert.equal(parseOutput(GOOD, HELLO).summary, 'Pricing matters. Start with value.')
})

test('sources: unique http(s) URLs, first-appearance order, trailing ).,; stripped', () => {
  assert.deepEqual(parseOutput(GOOD, HELLO).sources, [
    'https://example.com/pricing',
    'https://example.org/b',
    'https://example.net/c',
    'http://example.com/d',
  ])
})

test('non-http links are not sources', () => {
  const o = parseOutput('## Key points\n[x](ftp://a.b/c) mailto:a@b.c\n## Next steps\n## Summary\nS', HELLO)
  assert.deepEqual(o.sources, [])
})

test('missingSections: case-insensitive, ignores surrounding punctuation/whitespace; Summary checked too', () => {
  const md = '## key POINTS:\ntext\n##   Other  \n'
  const o = parseOutput(md, HELLO)
  assert.deepEqual(o.missingSections, ['Next steps', 'Summary'])
  assert.equal(o.summary, '')
})

test('**bold** heading text still matches its section', () => {
  const o = parseOutput('## **Key points**\n## Next steps.\n## Summary\nS', HELLO)
  assert.deepEqual(o.missingSections, [])
})

test('# and ### headings are not sections', () => {
  const o = parseOutput('# Key points\n### Next steps\n#### Summary\n', HELLO)
  assert.deepEqual(o.sections, [])
  assert.deepEqual(o.missingSections, ['Key points', 'Next steps', 'Summary'])
})

test('summary comes from the LAST ## Summary and stops at the next ##', () => {
  const md = '## Summary\nfirst\n## Key points\nk\n## Summary\nsecond one\n## Next steps\nn\n'
  assert.equal(parseOutput(md, HELLO).summary, 'second one')
})

test('empty answer', () => {
  const o = parseOutput('', HELLO)
  assert.deepEqual(o, { summary: '', sections: [], missingSections: ['Key points', 'Next steps', 'Summary'], sources: [] })
})
