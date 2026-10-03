// Phase 4 PLAN "Method", in every project: a recipe written by a different AI
// from WIDGET-GUIDE.md alone installs and runs like a student would use it,
// with no hand-fixing. No real network: the shared guard still applies.
//
// {{today}}: the browser clock is fixed at contract FIXED_TIME (2026-10-03),
// the same day prompt.md was built, so prompt-box is compared to prompt.md
// exactly. Replacing the date would hide a hub that filled {{today}} wrongly.
//
// Tests that need answer.md FAIL with "answer.md missing" until it exists.
import { test as base, expect } from '../helpers/fixtures.mjs'
import { tid, setup, toBrainStep, openTool, setHash, installRecipe, noHorizontalScroll } from '../helpers/hub.mjs'
import { PERMISSION_TEXT, PRIVACY_WARNING, WEBSEARCH_TEXT } from '../helpers/contract.mjs'
import { checkSources } from '../../core/lib/output.js'
import { StandinBrain, STANDIN_URL, STANDIN_KEY, STANDIN_USER } from '../standin/brain-standin.mjs'
import { RECIPE, RECIPE_FILE_NAME, TOOL_ID, INPUTS, PROMPT, SECTIONS, readAnswer } from '../helpers/phase4.mjs'

const QUERY = 'resume background skills experience' // the agent's brain_context.query
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
  await toBrainStep(page, 'Maria')
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

async function runJobPrep(page) {
  await openTool(page, TOOL_ID)
  await tid(page, 'field-job_posting').fill(INPUTS.job_posting)
  await tid(page, 'field-known_weaknesses').fill(INPUTS.known_weaknesses)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  return tid(page, 'prompt-box').inputValue()
}

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

// ---------------------------------------------------------------- Install

test('install by paste: no recipe-errors; summary shows the agent\'s permissions, query, web search and warning; Install → tile', async ({ page }) => {
  await setup(page, { name: 'Maria' })
  await tid(page, 'nav-add').click()
  await expect(tid(page, 'screen-add')).toBeVisible()
  await tid(page, 'recipe-paste').fill(RECIPE)
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toBeVisible()
  await expect(tid(page, 'recipe-errors')).toHaveCount(0)
  const perms = tid(page, 'summary-permissions').locator('li')
  await expect(perms).toHaveText([PERMISSION_TEXT.search_brain(QUERY), PERMISSION_TEXT.save_to_brain, PERMISSION_TEXT.run_ai].map((t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))))
  await expect(tid(page, 'summary-query')).toHaveText(QUERY)
  await expect(tid(page, 'summary-websearch')).toContainText(WEBSEARCH_TEXT.required)
  await expect(tid(page, 'summary-warning')).toContainText(PRIVACY_WARNING)
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await setHash(page, '#/home')
  await expect(tile(page)).toBeVisible()
  await expect(tile(page)).toContainText('Job & Interview Prep')
})

test('install via plugins/: the fake GitHub listing alone gives a tile, no plugins.json edit or fetch; it runs', async ({ page, github, net }) => {
  github.repo('maria', 'brain-hub', { [RECIPE_FILE_NAME]: RECIPE })
  await setup(page, { name: 'Maria' })
  await tid(page, 'nav-settings').click()
  await tid(page, 'settings-repo-override').fill('maria/brain-hub')
  await tid(page, 'settings-repo-override').press('Enter')
  await tid(page, 'settings-repo-override').blur()
  await setHash(page, '#/home')
  // Before the override the hub reads its own shipped (empty) plugins.json;
  // only requests after the refresh show how the tile was found.
  const before = net.requests.length
  await tid(page, 'refresh-tools').click()
  await expect(tile(page)).toBeVisible()
  expect(github.log.map((e) => e.url)).toEqual(expect.arrayContaining([
    'https://api.github.com/repos/maria/brain-hub/contents/plugins',
    `https://raw.githubusercontent.com/maria/brain-hub/main/plugins/${RECIPE_FILE_NAME}`,
  ]))
  expect(net.requests.slice(before).filter((r) => r.url.includes('plugins/plugins.json')), 'the manifest was needed').toEqual([])

  // A repo tool is reviewed once before use; then it runs like a pasted one.
  await tile(page).click()
  await expect(tid(page, 'tool-review')).toBeVisible()
  await tid(page, 'tool-accept').click()
  await tid(page, 'field-job_posting').fill(INPUTS.job_posting)
  await tid(page, 'field-known_weaknesses').fill(INPUTS.known_weaknesses)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toHaveValue(PROMPT)
})

// ---------------------------------------------------------------- Run

test('run in Manual mode with inputs.json (stand-in brain connected, empty): prompt-box equals prompt.md', async ({ page, standin }) => {
  await connectStandin(page)
  await installRecipe(page, RECIPE)
  const prompt = await runJobPrep(page)
  expect(prompt).toBe(PROMPT)
  expect(prompt).not.toContain('{{')
  // The agent's fixed query really went to the brain.
  const search = standin.log.find((e) => e.method === 'POST' && e.path === '/functions/v1/search-brain')
  expect(search?.json?.query).toBe(QUERY)
})

test('answer.md: renders every section with no missing-sections; source-check warns and lists every unsourced line', async ({ page, standin }) => {
  void standin
  const answer = readAnswer() // fails with "answer.md missing" until it lands
  const sc = checkSources(answer)
  test.info().annotations.push({ type: 'source-check', description: `claims=${sc.claims} sourced=${sc.sourced} unverified=${sc.unverified} unsourced=${sc.unsourced.length}` })
  await connectStandin(page)
  await installRecipe(page, RECIPE)
  await runJobPrep(page)
  await useAnswer(page, answer)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  for (const s of SECTIONS) await expect(tid(page, 'result').getByRole('heading', { name: s, exact: true })).toBeVisible()
  // Reported, not graded (PLAN 5) — but the student must be told.
  await expect(tid(page, 'source-check')).toContainText(`${sc.unsourced.length} of ${sc.claims} claims have no source`)
  const shown = tid(page, 'unsourced-list').locator('li')
  await expect(shown).toHaveText(sc.unsourced.map((u) => {
    const t = u.text.length > 160 ? u.text.slice(0, 160) + '…' : u.text
    return `${u.section}: ${t}`
  }))
  // Pinned independently of checkSources (a regression pin, not a grade):
  // the Haiku answer has 32 unsourced of 41 claims. It was 41 of 50 until
  // Phase 5 PLAN 3a: quoted questions ("…?" + closing quote) are not claims.
  await expect(tid(page, 'source-check')).toContainText('32 of 41 claims have no source')
  await expect(shown).toHaveCount(32)
})

test('save with the stand-in brain: one row, metadata.hub.tool = job-interview-prep', async ({ page, standin }) => {
  const answer = readAnswer()
  await connectStandin(page)
  await installRecipe(page, RECIPE)
  await runJobPrep(page)
  await useAnswer(page, answer)
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-summary')).toBeVisible()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  expect(rows[0].metadata.hub).toMatchObject({ tool: TOOL_ID, tool_version: '1.0.0', type: 'work_product', report: answer.trim(), archived: false })
  expect(rows[0].metadata.hub.tags).toEqual(expect.arrayContaining(['job-search', 'interview-prep']))
})

test('layout: the job-prep prompt, the answer, its source-check list and save panel never scroll sideways', async ({ page, standin }) => {
  void standin
  const answer = readAnswer()
  await connectStandin(page)
  await installRecipe(page, RECIPE)
  await runJobPrep(page)
  await noHorizontalScroll(page, 'job-prep prompt')
  await useAnswer(page, answer)
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-panel')).toBeVisible()
  await noHorizontalScroll(page, 'job-prep result')
  await page.setViewportSize({ width: 320, height: 640 })
  await noHorizontalScroll(page, 'job-prep result @320')
})
