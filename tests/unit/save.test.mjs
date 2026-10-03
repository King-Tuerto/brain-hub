// PLAN core/lib/save.js; DECISIONS Q2, Q6.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSaveRow, downloadFile } from '../../core/lib/save.js'
import { HELLO, flexNow } from './_fixtures.mjs'

const NOW = Date.parse('2026-10-03T12:00:00.000Z')
const REPORT = '## Key points\n- a [x](https://example.com/a)\n\n## Next steps\n- b\n\n## Summary\nShort summary.'

test('buildSaveRow: exact row for a work_product save', () => {
  const row = buildSaveRow({
    recipe: HELLO, inputs: { topic: 'Pricing Strategy', depth: 'Quick' }, report: REPORT,
    summary: 'Short summary.', sources: ['https://example.com/a'], userId: 'u-1', now: flexNow(NOW),
  })
  assert.deepEqual(row, {
    user_id: 'u-1',
    source: 'brain-hub',
    // DECISIONS #13: summary + blank line + '<Tool name>: <input values joined with " · ">'.
    content: 'Short summary.\n\nHello Hub: Pricing Strategy · Quick',
    metadata: {
      hub: {
        tool: 'hello-hub', tool_version: '1.0.0', type: 'work_product',
        tags: ['hello-hub', 'pricing strategy'],
        report: REPORT, sources: ['https://example.com/a'],
        saved_at: '2026-10-03T12:00:00.000Z', archived: false,
      },
    },
  })
  assert.ok(!('profile_part' in row.metadata.hub))
})

test('buildSaveRow: profile save carries profile_part', () => {
  const recipe = { ...HELLO, save: { type: 'profile', profile_part: 'skills', tags: ['Skills'] } }
  const row = buildSaveRow({ recipe, inputs: { topic: 't', depth: 'Quick' }, report: REPORT, summary: 'S', sources: [], userId: 'u', now: flexNow(NOW) })
  assert.equal(row.metadata.hub.type, 'profile')
  assert.equal(row.metadata.hub.profile_part, 'skills')
  assert.deepEqual(row.metadata.hub.tags, ['skills'])
})

test('buildSaveRow: no top-level tags/category/summary columns (enrichment overwrites those)', () => {
  const row = buildSaveRow({ recipe: HELLO, inputs: { topic: 't', depth: 'Quick' }, report: REPORT, summary: 'S', sources: [], userId: 'u', now: flexNow(NOW) })
  for (const k of ['tags', 'category', 'summary', 'dedup_key', 'id']) assert.ok(!(k in row), `row must not set ${k}`)
})

test('buildSaveRow: an explicit tags array replaces the recipe tags (PLAN amendment 1)', () => {
  const row = buildSaveRow({
    recipe: HELLO, inputs: { topic: 'Pricing', depth: 'Quick' }, report: REPORT, summary: 'S',
    sources: [], userId: 'u', now: flexNow(NOW), tags: ['mine', 'edited'],
  })
  assert.deepEqual(row.metadata.hub.tags, ['mine', 'edited'])
})

test('buildSaveRow: tags omitted → resolved from save.tags', () => {
  const row = buildSaveRow({ recipe: HELLO, inputs: { topic: 'Pricing', depth: 'Quick' }, report: REPORT, summary: 'S', sources: [], userId: 'u', now: flexNow(NOW) })
  assert.deepEqual(row.metadata.hub.tags, ['hello-hub', 'pricing'])
})

test('downloadFile: fileName <id>-<YYYY-MM-DD>.md; text = # name, date, inputs list, blank line, report', () => {
  const f = downloadFile({ recipe: HELLO, inputs: { topic: 'Pricing', depth: 'Thorough' }, report: REPORT, now: flexNow(NOW) })
  assert.equal(f.fileName, 'hello-hub-2026-10-03.md')
  const lines = f.text.split('\n')
  assert.equal(lines[0], '# Hello Hub')
  assert.ok(f.text.includes('2026-10-03'))
  const listLines = lines.filter((l) => l.startsWith('- ') && !REPORT.includes(l))
  assert.ok(listLines.some((l) => l.includes('Pricing')), f.text)
  assert.ok(listLines.some((l) => l.includes('Thorough')), f.text)
  assert.ok(f.text.endsWith(REPORT) || f.text.endsWith(REPORT + '\n'), 'report comes last')
  assert.ok(f.text.includes('\n\n' + REPORT), 'blank line before the report')
  assert.ok(f.text.indexOf('Pricing') < f.text.indexOf(REPORT))
})
