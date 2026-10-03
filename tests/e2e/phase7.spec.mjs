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
