// Phase 3 PLAN §2 "Source check" and DECISIONS #12: checkSources(markdown).
// Synthetic fixtures only; the real Deere answer is in real-answer.test.mjs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkSources } from '../../core/lib/output.js'

const L = (n) => `https://example.com/${n}`
const texts = (r) => r.unsourced.map((u) => u.text)

test('shape: { claims, sourced, unverified, unsourced: [{ section, text }] }', () => {
  const r = checkSources(`## A\n- one ${L(1)}\n- two [unverified]\n- three`)
  assert.deepEqual(r, { claims: 3, sourced: 1, unverified: 1, unsourced: [{ section: 'A', text: 'three' }] })
})

test('every list marker is a claim: -, *, +, 1. and 1)', () => {
  const md = ['## Facts', '- dash', '* star', '+ plus', '1. dot', '2) paren'].join('\n')
  const r = checkSources(md)
  assert.equal(r.claims, 5)
  assert.deepEqual(texts(r), ['dash', 'star', 'plus', 'dot', 'paren'])
})

test('each table body row is a claim; header and separator rows are not', () => {
  const md = [
    '## Competitors',
    '| Rival | Strength |',
    '|:---|---:|',
    `| Caterpillar | Dealer network [CAT](${L('cat')}) |`,
    '| Komatsu | Mining share |',
  ].join('\n')
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.equal(r.sourced, 1)
  assert.deepEqual(texts(r), ['| Komatsu | Mining share |'])
})

test('a paragraph is one claim, however many lines it spans', () => {
  const md = '## Snapshot\nDeere makes tractors\nand construction equipment.\n\nSecond paragraph ' + L(2)
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.equal(r.sourced, 1)
  assert.deepEqual(texts(r), ['Deere makes tractors and construction equipment.'])
})

test('text before the first ## is ignored (title, H1, preamble)', () => {
  const md = '# Deere report\nAn unsourced preamble.\n- unsourced bullet\n\n## A\n- ok ' + L(3)
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('the Summary section is never counted, wherever it appears', () => {
  const md = `## Summary\nUnsourced summary sentence.\n\n## A\n- ok ${L(1)}\n\n## Summary\n- also unsourced`
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('Summary is recognised the same way parseOutput recognises it (case, trailing #s)', () => {
  for (const h of ['## summary', '## SUMMARY', '## Summary ##']) {
    const r = checkSources(`## A
- ok ${L(1)}

${h}
Unsourced summary.`)
    assert.equal(r.unsourced.length, 0, `${h} should be treated as Summary`)
  }
})

test('a Summary heading parseOutput accepts (bold, trailing colon) is also skipped by checkSources', () => {
  // parseOutput normalises punctuation, so it saves these as the Summary; checkSources must agree.
  for (const h of ['## **Summary**', '## Summary:']) {
    const r = checkSources(`## A\n- ok ${L(1)}\n\n${h}\nUnsourced summary.`)
    assert.equal(r.unsourced.length, 0, `${h} should be treated as Summary`)
  }
})

test('items ending in "?" or ":" (after stripping * _ `) are not claims', () => {
  const md = [
    '## Suggested further research',
    '- How exposed is C&F to housing starts?',
    '- **Will tariffs on steel persist?**',
    '- _What is the order backlog?_',
    '- `Which dealers carry Wirtgen?`',
    '- Competitors:',
    '- **Key risks:**',
    '- A real claim',
  ].join('\n')
  const r = checkSources(md)
  assert.equal(r.claims, 1)
  assert.deepEqual(texts(r), ['A real claim'])
})

test('lead-in paragraphs ending in ":" are not claims (DECISIONS #12)', () => {
  const r = checkSources(`## Business units\nDeere reports four segments:\n\n- PPA ${L(1)}`)
  assert.deepEqual(r, { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('a "?" in the middle does not exempt a claim; only the end counts', () => {
  const r = checkSources('## A\n- Is it cyclical? Yes, very.')
  assert.equal(r.claims, 1)
  assert.equal(r.unsourced.length, 1)
})

test('anything inside a ``` fenced code block is not a claim', () => {
  const md = ['## A', '```', '- not a claim', 'nor this', '| a | b |', '| c | d |', '```', `- claim ${L(1)}`].join('\n')
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('a fence with a language tag also hides its contents', () => {
  const md = ['## A', '```js', 'const x = 1', '```', '- claim [unverified]'].join('\n')
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 0, unverified: 1, unsourced: [] })
})

test('a ~~~ fenced code block (also a fence in CommonMark/GFM) hides its contents', () => {
  const md = ['## A', '~~~', '- not a claim', '~~~', `- claim ${L(1)}`].join('\n')
  assert.deepEqual(checkSources(md), { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('headings at any level are not claims, and ### does not start a new section', () => {
  const md = `## Environmental scan\n### Political\n- Tariffs ${L(1)}\n#### Detail\n###### Deep\n- untagged`
  const r = checkSources(md)
  assert.equal(r.claims, 2)
  assert.deepEqual(r.unsourced, [{ section: 'Environmental scan', text: 'untagged' }])
})

test('a thematic break (---) between sections is not a claim', () => {
  const md = `## A\n- ok ${L(1)}\n\n---\n\n## B\n- ok ${L(2)}`
  assert.deepEqual(checkSources(md), { claims: 2, sourced: 2, unverified: 0, unsourced: [] })
})

test('sourced = any http(s):// URL, bare or as a Markdown link', () => {
  const md = [
    '## A',
    '- bare https://example.com/x',
    '- http only http://example.com/y',
    '- md link [10-K](https://www.sec.gov/x)',
    '- in parens (https://example.com/z).',
  ].join('\n')
  assert.deepEqual(checkSources(md), { claims: 4, sourced: 4, unverified: 0, unsourced: [] })
})

test('not a URL: www. without scheme, ftp://, a link with no target', () => {
  const md = '## A\n- www.deere.com says so\n- ftp://example.com/file\n- [10-K]()'
  const r = checkSources(md)
  assert.equal(r.sourced, 0)
  assert.equal(r.unsourced.length, 3)
})

test('[unverified] in any case marks a claim unverified', () => {
  const md = '## A\n- one [unverified]\n- two [Unverified]\n- three [UNVERIFIED]\n- four (unverified)'
  const r = checkSources(md)
  assert.equal(r.unverified, 3)
  assert.deepEqual(texts(r), ['four (unverified)'])
})

test('a claim with both a URL and [unverified] counts as sourced, once', () => {
  const r = checkSources(`## A\n- estimate ${L(1)} [unverified]`)
  assert.deepEqual(r, { claims: 1, sourced: 1, unverified: 0, unsourced: [] })
})

test('claims = sourced + unverified + unsourced.length', () => {
  const md = `## A\n- a ${L(1)}\n- b [unverified]\n- c\n\nPara d.\n\n| h |\n|---|\n| e |`
  const r = checkSources(md)
  assert.equal(r.claims, r.sourced + r.unverified + r.unsourced.length)
  assert.equal(r.claims, 5)
})

test('unsourced entries carry the ## section name (trailing #s and spaces stripped)', () => {
  const md = '## Business units ##\n- PPA\n\n## Limits of this analysis   \n- private data'
  assert.deepEqual(checkSources(md).unsourced, [
    { section: 'Business units', text: 'PPA' },
    { section: 'Limits of this analysis', text: 'private data' },
  ])
})

test('CRLF line endings behave like LF', () => {
  const md = `## A\r\n- ok ${L(1)}\r\n- bad\r\n\r\n## Summary\r\nx`
  assert.deepEqual(checkSources(md), { claims: 2, sourced: 1, unverified: 0, unsourced: [{ section: 'A', text: 'bad' }] })
})

test('empty, null and heading-only input → 0 claims', () => {
  for (const md of ['', null, undefined, '## A\n## B\n## Summary\nx']) {
    assert.deepEqual(checkSources(md), { claims: 0, sourced: 0, unverified: 0, unsourced: [] })
  }
})

test('a weak answer (the e2e fixture) lists exactly its unsourced claims', async () => {
  const { WEAK_ANSWER, WEAK_UNSOURCED } = await import('../helpers/phase3.mjs')
  const r = checkSources(WEAK_ANSWER)
  assert.deepEqual(r.unsourced, WEAK_UNSOURCED)
  assert.ok(r.claims > r.unsourced.length)
})
