// Phase 7 (Nitpick): the open Checker panel survives the trip to the AI app.
// The guide says: tap Check this answer → Copy check prompt → go to your AI app
// → come back, paste, Score it. On a phone, coming back can mean a full reload
// (iOS often discards a backgrounded home-screen app), so an opened, not yet
// scored check must reopen by itself (st.checkOpen), and must not outlive the
// answer it belongs to.
import { test, expect } from '../helpers/fixtures.mjs'
import { tid, setup, openTool } from '../helpers/hub.mjs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { claimsToCheck, buildCheckerPrompt } from '../../core/lib/checker.js'
import { GH_TOOL } from '../helpers/recipes.mjs'
import { COMPANY_RECIPE_TEXT, DEERE_INPUTS, plantedReport, cleanReport } from '../helpers/phase5.mjs'

const COMPANY = parseRecipe(COMPANY_RECIPE_TEXT, { fileName: 'company-analysis.recipe.md' }).recipe
const hubPrompt = (report) => buildCheckerPrompt(claimsToCheck(report, COMPANY).checked)
const SO_FAR = 'Score so far: 46 / 50 — the citation check has not been run yet' // planted report, pinned in phase5-checker

async function toResult(page, report) {
  await setup(page) // no brain, Manual, Claude — the guide's path
  await openTool(page, 'company-analysis')
  await tid(page, 'field-company').fill(DEERE_INPUTS.company)
  await tid(page, 'field-purpose').selectOption(DEERE_INPUTS.purpose)
  await tid(page, 'run-btn').click()
  await tid(page, 'answer-box').fill(report)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

const visiblePanel = (page) => tid(page, 'checker-panel').filter({ visible: true })

test('an opened, unscored check reopens after a reload, ready to paste into, with the same check prompt', async ({ page }) => {
  await toResult(page, plantedReport())
  await expect(visiblePanel(page)).toHaveCount(0) // closed until the student asks
  await tid(page, 'check-btn').click()
  await expect(tid(page, 'checker-score')).toHaveText(SO_FAR)
  await page.reload() // the student went to the AI app and the phone reloaded the hub
  await expect(visiblePanel(page)).toHaveCount(1)
  await expect(tid(page, 'checker-score')).toHaveText(SO_FAR)
  await expect(tid(page, 'checker-prompt')).toHaveValue(hubPrompt(plantedReport()))
  await expect(tid(page, 'checker-answer')).toBeVisible()
  await expect(tid(page, 'use-checker-answer')).toHaveText('Score it')
})

test('leaving for Home and coming back to the tool also reopens the check', async ({ page }) => {
  await toResult(page, plantedReport())
  await tid(page, 'check-btn').click()
  await page.goto('./#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
  await openTool(page, 'company-analysis')
  await expect(visiblePanel(page)).toHaveCount(1)
  await expect(tid(page, 'checker-score')).toHaveText(SO_FAR)
})

test('a new answer closes the check, and it stays closed after a reload', async ({ page }) => {
  await toResult(page, plantedReport())
  await tid(page, 'check-btn').click()
  await tid(page, 'answer-box').fill(cleanReport())
  await tid(page, 'use-answer').click()
  await expect(visiblePanel(page)).toHaveCount(0)
  await page.reload()
  await expect(tid(page, 'result')).toBeVisible()
  await expect(visiblePanel(page)).toHaveCount(0)
  expect((await page.evaluate(() => JSON.parse(localStorage.getItem('hub.runs.company-analysis')))).checkOpen).toBe(false)
})

test('a new Run closes the check, and it stays closed after a reload', async ({ page }) => {
  await toResult(page, plantedReport())
  await tid(page, 'check-btn').click()
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  await expect(visiblePanel(page)).toHaveCount(0)
  await page.reload()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  await expect(visiblePanel(page)).toHaveCount(0)
})

// ---------------------------------------------------------------- N2: "keep it on every device"
// The guide's own path: install a tool by paste (Make your own tools, step 3),
// then save the same file into plugins/ on GitHub and tap Refresh tools (step 4).
// That is a promotion, not a clash: one tile, no warning, and the pasted copy is
// kept in storage (hidden, never deleted). A real clash must still warn.
const toolTile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))

async function pasteInstall(page, text) {
  await tid(page, 'nav-add').click()
  await tid(page, 'recipe-paste').fill(text)
  await tid(page, 'recipe-check').click()
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await page.goto('./#/home')
}

async function pointAtRepo(page, repo) {
  await tid(page, 'nav-settings').click()
  await tid(page, 'settings-repo-override').fill(repo)
  await tid(page, 'settings-repo-override').press('Enter')
  await tid(page, 'settings-repo-override').blur()
  await page.goto('./#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
}

test('N2: a pasted tool later saved into plugins/ shows once, with no tool-conflict, and the pasted copy is kept', async ({ page, github }) => {
  await setup(page)
  await pasteInstall(page, GH_TOOL)
  await expect(toolTile(page, 'gh-tool')).toHaveCount(1)
  // Step 4: the same file is committed to plugins/ in the student's copy.
  github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL })
  await pointAtRepo(page, 'alice/brain-hub')
  await tid(page, 'refresh-tools').click()
  await expect.poll(() => github.log.some((e) => e.url.endsWith('/plugins/gh-tool.recipe.md'))).toBe(true)
  await expect(toolTile(page, 'gh-tool')).toHaveCount(1)
  await expect(tid(page, 'tool-conflict')).toHaveCount(0)
  await page.reload()
  await expect(toolTile(page, 'gh-tool')).toHaveCount(1)
  await expect(tid(page, 'tool-conflict')).toHaveCount(0)
  const local = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.localTools')))
  expect(local.map((t) => t.id)).toEqual(['gh-tool']) // hidden, not deleted
})

test('N2: once the tool is in plugins/, pasting a new version of it is refused with a clear reason (never silently ignored)', async ({ page, github }) => {
  github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL })
  await setup(page)
  await pointAtRepo(page, 'alice/brain-hub')
  await tid(page, 'refresh-tools').click()
  await expect(toolTile(page, 'gh-tool')).toHaveCount(1)
  await tid(page, 'nav-add').click()
  await tid(page, 'recipe-paste').fill(GH_TOOL.replace('version: 1.0.0', 'version: 1.1.0'))
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'recipe-errors')).toContainText('A plugins/ tool already uses the id "gh-tool"')
  await expect(tid(page, 'install-btn')).toHaveCount(0)
})

test('N2 guard: a genuine clash still warns — a plugins/ tool using a built-in tool\'s id', async ({ page, github }) => {
  github.repo('alice', 'brain-hub', { 'hello-hub.recipe.md': GH_TOOL.replace('id: gh-tool', 'id: hello-hub') })
  await setup(page)
  await pointAtRepo(page, 'alice/brain-hub')
  await tid(page, 'refresh-tools').click()
  await expect(tid(page, 'tool-conflict')).toBeVisible()
  await expect(tid(page, 'tool-conflict')).toContainText('hello-hub.recipe.md in plugins/ (id "hello-hub") is hidden because a built-in tool uses the same id')
  await expect(toolTile(page, 'hello-hub')).toHaveCount(1)
})

test('N2 guard: a genuine clash still warns — a pasted tool using a built-in tool\'s id (stored before the built-in existed)', async ({ page }) => {
  await setup(page)
  await page.evaluate((text) => localStorage.setItem('hub.localTools', JSON.stringify([{ id: 'hello-hub', text, installedAt: '2026-10-01T00:00:00Z' }])),
    GH_TOOL.replace('id: gh-tool', 'id: hello-hub'))
  await page.reload()
  await expect(tid(page, 'tool-conflict')).toBeVisible()
  await expect(tid(page, 'tool-conflict')).toContainText('The tool you pasted (id "hello-hub") is hidden because a built-in tool uses the same id')
  await expect(toolTile(page, 'hello-hub')).toHaveCount(1)
})
