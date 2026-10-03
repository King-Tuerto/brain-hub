// PLAN "Result" (save-panel, download), brain.js save/recent/archive,
// save.js row and file; DECISIONS Q2 (row layout), spec change 2 (archiving).
import { test, expect } from '../helpers/fixtures.mjs'
import { STUDENT } from '../helpers/fake-brain.mjs'
import { SUMMARY_TEXT, SOURCE_URL } from '../helpers/fake-openrouter.mjs'
import { TODAY, FIXED_TIME } from '../helpers/contract.mjs'
import { tid, setup, openTool, fillHello, setHash } from '../helpers/hub.mjs'

async function runHelloAuto(page) {
  await openTool(page, 'hello-hub')
  await fillHello(page, { topic: 'Pricing' })
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
}

// DECISIONS #13: saved content = summary, blank line, '<Tool name>: <inputs joined with " · ">'.
const HELLO_CONTEXT = 'Hello Hub: Pricing · Quick' // the topic exactly as typed

test('save to brain: panel prefilled from ## Summary, exact row sent, appears in recent, archive hides it', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await runHelloAuto(page)

  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-panel')).toBeVisible()
  await expect(tid(page, 'save-summary')).toHaveValue(SUMMARY_TEXT)
  const tags = (await tid(page, 'save-tags').inputValue()).split(',').map((t) => t.trim())
  expect(tags).toEqual(['hello-hub', 'pricing'])
  expect(brain.hubRows(), 'nothing is saved before the student confirms').toEqual([])

  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toBeVisible()
  await expect.poll(() => brain.hubRows().length).toBe(1)

  const posts = brain.requests((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts' && e.params.on_conflict)
  expect(posts).toHaveLength(1)
  expect(posts[0].params.on_conflict).toBe('dedup_key,user_id')
  expect(posts[0].headers.prefer).toBe('resolution=merge-duplicates,return=representation')
  const sent = posts[0].json
  expect(sent).toMatchObject({ user_id: STUDENT.id, source: 'brain-hub', content: `${SUMMARY_TEXT}\n\n${HELLO_CONTEXT}` }) // DECISIONS #13
  for (const col of ['tags', 'category', 'summary']) expect(sent).not.toHaveProperty(col)
  const hub = sent.metadata.hub
  expect(hub).toMatchObject({
    tool: 'hello-hub', type: 'work_product', tags: ['hello-hub', 'pricing'],
    sources: [SOURCE_URL], saved_at: FIXED_TIME, archived: false,
  })
  expect(hub.tool_version).toMatch(/^\d+\.\d+\.\d+$/)
  expect(hub.report).toContain('## Key points')
  expect(hub.report).toContain('## Summary')
  expect(hub).not.toHaveProperty('profile_part')

  // recent list
  await setHash(page, '#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
  const item = tid(page, 'recent-item').filter({ hasText: SUMMARY_TEXT })
  await expect(item).toHaveCount(1)
  const gets = brain.requests((e) => e.method === 'GET' && e.path === '/rest/v1/thoughts' && e.params.source === 'eq.brain-hub' && !e.params['metadata->hub->>type'])
  expect(gets.length).toBeGreaterThan(0)
  expect(gets.at(-1).params).toMatchObject({ select: 'id,content,created_at,metadata', order: 'created_at.desc' })

  // archive
  await item.getByTestId('archive-btn').click()
  await expect(item).toHaveCount(0)
  const patches = brain.requests((e) => e.method === 'PATCH')
  expect(patches).toHaveLength(1)
  const row = brain.hubRows()[0]
  expect(patches[0].params.id).toBe(`eq.${row.id}`)
  expect(patches[0].json.metadata.hub).toMatchObject({ tool: 'hello-hub', archived: true, report: hub.report })
  expect(row.metadata.hub.archived).toBe(true)
  expect(brain.rows.find((r) => r.id === row.id), 'archive never deletes').toBeTruthy()

  await page.reload()
  await expect(tid(page, 'screen-home')).toBeVisible()
  await expect(tid(page, 'recent-list')).toBeVisible()
  await expect(tid(page, 'recent-item').filter({ hasText: SUMMARY_TEXT })).toHaveCount(0)
})

test('saving the same report twice keeps one row (upsert)', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await runHelloAuto(page)
  for (let i = 0; i < 2; i++) {
    await tid(page, 'save-btn').click()
    await tid(page, 'save-confirm').click()
    await expect.poll(() => brain.requests((e) => e.method === 'POST' && e.params.on_conflict).length).toBe(i + 1)
  }
  expect(brain.hubRows()).toHaveLength(1)
})

test('edited summary is what gets saved', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await runHelloAuto(page)
  await tid(page, 'save-btn').click()
  await tid(page, 'save-summary').fill('My own words about pricing.')
  await tid(page, 'save-confirm').click()
  await expect.poll(() => brain.hubRows().map((r) => r.content)).toEqual([`My own words about pricing.\n\n${HELLO_CONTEXT}`])
})

for (const withBrain of [true, false]) {
  test(`download ${withBrain ? 'with' : 'without'} a brain: hello-hub-YYYY-MM-DD.md with the report`, async ({ page }) => {
    await setup(page, { brain: withBrain ? 'connect' : 'skip', mode: 'auto' })
    await runHelloAuto(page)
    const [download] = await Promise.all([page.waitForEvent('download'), tid(page, 'download-btn').click()])
    expect(download.suggestedFilename()).toBe(`hello-hub-${TODAY}.md`)
    const stream = await download.createReadStream()
    const chunks = []
    for await (const c of stream) chunks.push(c)
    const text = Buffer.concat(chunks).toString('utf8')
    expect(text.split('\n')[0]).toMatch(/^# \S/)
    expect(text).toContain(TODAY)
    expect(text).toContain('Pricing')
    expect(text).toContain('## Key points')
    expect(text).toContain(SUMMARY_TEXT)
  })
}
