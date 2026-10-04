// starter-job-prep PLAN "Tests (Nitpick)" → E2E, in every project, against
// the local stand-in brain. No real network: the shared guard still applies.
// The browser clock is fixed at contract FIXED_TIME, the day the prompt
// fixtures were built, so prompt-box is compared to them byte for byte.
import { test as base, expect } from '../helpers/fixtures.mjs'
import { tid, setup, toBrainStep, openTool, noHorizontalScroll } from '../helpers/hub.mjs'
import { checkSources } from '../../core/lib/output.js'
import { StandinBrain, STANDIN_URL, STANDIN_KEY, STANDIN_USER } from '../standin/brain-standin.mjs'
import { TOOL_ID, SECTIONS, inputsOf, promptOf, answerOf } from '../helpers/jobprep.mjs'

const CORE = ['hello-hub', 'company-analysis', 'job-interview-prep', 'tool-builder', 'tool-tester-write', 'tool-tester-grade']
const tile = (page) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${TOOL_ID}"]`))

const test = base.extend({
  standin: async ({ context, net }, use) => {
    void net // the guard's catch-all route must be registered first, so ours wins
    const s = await StandinBrain.create()
    await s.attach(context)
    await use(s)
  },
})

async function connectStandin(page) {
  await toBrainStep(page, 'Ana')
  await tid(page, 'brain-url').fill(STANDIN_URL)
  await tid(page, 'brain-key').fill(STANDIN_KEY)
  await tid(page, 'brain-email').fill(STANDIN_USER.email)
  await tid(page, 'brain-password').fill(STANDIN_USER.password)
  await tid(page, 'brain-connect').click()
  await expect(tid(page, 'ai-mode-manual')).toBeVisible()
  await tid(page, 'ai-mode-manual').click()
  await tid(page, 'ai-app-claude').click()
  await tid(page, 'setup-finish').click()
  await expect(tid(page, 'screen-home')).toBeVisible()
  await expect(tid(page, 'brain-badge')).toHaveText('Brain connected')
}

async function runCase(page, c) {
  const inputs = inputsOf(c)
  await openTool(page, TOOL_ID)
  for (const id of ['company_name', 'job_posting', 'my_background', 'weaknesses']) await tid(page, `field-${id}`).fill(inputs[id])
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  return tid(page, 'prompt-box').inputValue()
}

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

test('home: six core tiles, Job & Interview Prep among them, with no plugins and no brain', async ({ page }) => {
  await setup(page)
  await expect(tile(page)).toBeVisible()
  await expect(tile(page)).toContainText('Job & Interview Prep')
  await expect(tile(page)).toContainText('Paste a job posting')
  const ids = await tid(page, 'tool-tile').evaluateAll((els) => els.map((e) => e.dataset.toolId))
  expect(ids).toEqual(CORE)
  await expect(tid(page, 'tool-broken')).toHaveCount(0)
  await expect(tid(page, 'tool-conflict')).toHaveCount(0)
  await expect(tid(page, 'stats').locator('[data-k=tools] b')).toHaveText('6')
})

test('the tool screen shows the four fields; the two optional ones say "(optional)" once each', async ({ page }) => {
  await setup(page)
  await openTool(page, TOOL_ID)
  for (const id of ['company_name', 'job_posting', 'my_background', 'weaknesses']) await expect(tid(page, `field-${id}`)).toBeVisible()
  const text = await tid(page, 'screen-tool').innerText()
  expect(text, 'the label repeats the "(optional)" the hub adds').not.toMatch(/\(optional\)\s*\(optional\)/)
  expect(text.match(/\(optional\)/g) ?? []).toHaveLength(2)
  await noHorizontalScroll(page, 'job-prep tool screen')
})

test('case B in Manual mode (stand-in brain, empty): prompt-box equals the fixture; brain searched for the company only', async ({ page, standin }) => {
  await connectStandin(page)
  expect(await runCase(page, 'B')).toBe(promptOf('B'))
  const search = standin.log.find((e) => e.method === 'POST' && e.path === '/functions/v1/search-brain')
  expect(search?.json?.query).toBe('Northwind Analytics')
})

test('case A (both optional fields blank): prompt-box equals the fixture', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  expect(await runCase(page, 'A')).toBe(promptOf('A'))
})

test('case B answer: every section, no missing-sections; the advice-mode source-check is shown and matches checkSources', async ({ page, standin }) => {
  void standin
  const answer = answerOf('B')
  const sc = checkSources(answer, { sourcing: 'advice' })
  await connectStandin(page)
  await runCase(page, 'B')
  await useAnswer(page, answer)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  for (const s of SECTIONS) await expect(tid(page, 'result').getByRole('heading', { name: s, exact: true })).toBeVisible()
  await expect(tid(page, 'source-check')).toBeVisible()
  await expect(tid(page, 'source-check')).toContainText(`${sc.unsourced.length} of ${sc.claims} claims have no source`)
  // Pinned independently of checkSources: advice mode counts only figure-bearing
  // statements. The v3-rule answer has 5: one marked [unverified], and 4 with no
  // source (her own 22 → 41 figures twice, "Summer 2026", and the [X%] placeholder
  // line), not the dozen-plus a facts-mode count would give. (The v2 answer had 2 of 2.)
  await expect(tid(page, 'source-check')).toContainText('4 of 5 claims have no source')
  await expect(tid(page, 'unsourced-list').locator('li')).toHaveCount(4)
})

test('Save writes one row with metadata.hub.tool = job-interview-prep, tagged job-prep and the company', async ({ page, standin }) => {
  const answer = answerOf('B')
  await connectStandin(page)
  await runCase(page, 'B')
  await useAnswer(page, answer)
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-summary')).toBeVisible()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  expect(rows[0].metadata.hub).toMatchObject({ tool: TOOL_ID, tool_version: '1.0.0', type: 'work_product', report: answer.trim(), archived: false })
  // The hub lower-cases tags.
  expect(rows[0].metadata.hub.tags).toEqual(expect.arrayContaining(['job-prep', 'northwind analytics']))
})

test('layout: the prompt, the answer, its source-check list and the save panel never scroll sideways (also at 320 px)', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runCase(page, 'A')
  await noHorizontalScroll(page, 'job-prep prompt')
  await useAnswer(page, answerOf('A'))
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-panel')).toBeVisible()
  await noHorizontalScroll(page, 'job-prep result')
  await page.setViewportSize({ width: 320, height: 640 })
  await noHorizontalScroll(page, 'job-prep result @320')
})
