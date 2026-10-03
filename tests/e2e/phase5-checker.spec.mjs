// Phase 5 PLAN "Done when" and Part B UI, in every project, plus the Part A
// rerun tool installing by paste and running. Real fact-checker tables are
// replayed from fixtures; no real network (the shared guard and CSP check
// from helpers/fixtures.mjs still apply).
//
// Tests that need a fixture still being written FAIL with "<file> missing".
import { test as base, expect } from '../helpers/fixtures.mjs'
import { tid, setup, toBrainStep, openTool, fillHello, noHorizontalScroll } from '../helpers/hub.mjs'
import { AI_APP_URLS, WEBSEARCH_TEXT, NO_BRAIN_TEXT } from '../helpers/contract.mjs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { claimsToCheck, buildCheckerPrompt } from '../../core/lib/checker.js'
import { StandinBrain, STANDIN_URL, STANDIN_KEY, STANDIN_USER } from '../standin/brain-standin.mjs'
import {
  COMPANY_RECIPE_TEXT, DEERE_INPUTS, PLANTS, plantedReport, cleanReport, checkerPrompt, checkerAnswer,
  RERUN_RECIPE, RERUN_TOOL_ID, RERUN_INPUTS, RERUN_PROMPT, RERUN_SECTIONS, rerunAnswer,
} from '../helpers/phase5.mjs'

// Pinned from the real runs (the unit tests derive the same numbers from the
// code); pinned here so a scoring change can't move both sides at once.
const PLANTED = { mech: 46, score: 86, grade: 'Needs work', counts: [33, 16, 2, 0], parts: { sections: 18, sources: 28, support: 40 } }
const CLEAN = { mech: 49, score: 95, grade: 'Strong', counts: [43, 8, 0, 0], parts: { sections: 20, sources: 29, support: 46 } }

// The check prompt the hub builds today. The first two real checkers answered
// the pre-M1 wording (checker-prompt-planted.md / -clean.md); the unit tests
// prove their claims lists equal today's, and that checker-prompt-planted-v2.md
// (answered by the v2 checker) is exactly today's prompt.
const COMPANY = parseRecipe(COMPANY_RECIPE_TEXT, { fileName: 'company-analysis.recipe.md' }).recipe
const hubPrompt = (report) => buildCheckerPrompt(claimsToCheck(report, COMPANY).checked)

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
}

async function runDeere(page) {
  await openTool(page, 'company-analysis')
  await tid(page, 'field-company').fill(DEERE_INPUTS.company)
  await tid(page, 'field-focus_unit').fill(DEERE_INPUTS.focus_unit)
  await tid(page, 'field-purpose').selectOption(DEERE_INPUTS.purpose)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
}

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

async function openChecker(page) {
  await tid(page, 'check-btn').click()
  await expect(tid(page, 'checker-panel')).toBeVisible()
}

async function scoreWith(page, table) {
  await tid(page, 'checker-answer').fill(table)
  await tid(page, 'use-checker-answer').click()
}

const fix = (page, kind) => tid(page, 'checker-fixes').locator(`li[data-kind="${kind}"]`)
const partsText = (c) => `(${c[0]} supported, ${c[1]} partly, ${c[2]} not supported, ${c[3]} unreachable)`
const plant = (id) => PLANTS.find((p) => p.id === id)

// ---------------------------------------------------------------- Done when: the planted report

test('planted report, mechanical: score so far out of 50; fixes show P1 (unsourced) and P4 (missing section); the check prompt is the fixture', async ({ page, standin }) => {
  void standin
  const report = plantedReport()
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, report)
  await openChecker(page)
  await expect(tid(page, 'checker-score')).toHaveText(`Score so far: ${PLANTED.mech} / 50 — the citation check has not been run yet`)
  await expect(tid(page, 'checker-parts')).toContainText('Claims supported –/50')
  await expect(fix(page, 'unsourced').filter({ hasText: plant('P1').find })).toHaveCount(1)
  await expect(fix(page, 'missing-section').filter({ hasText: plant('P4').find })).toHaveCount(1)
  // Manual citation step: read-only prompt (exactly what the checker agent answered), copy, open the AI app.
  await expect(tid(page, 'checker-prompt')).toHaveValue(checkerPrompt('planted-v2'))
  await expect(tid(page, 'checker-prompt')).toHaveJSProperty('readOnly', true)
  await expect(tid(page, 'copy-checker-prompt')).toBeVisible()
  await expect(tid(page, 'checker-open-ai')).toHaveAttribute('href', AI_APP_URLS.claude)
  await expect(tid(page, 'checker-needs-web')).toHaveCount(0)
  await expect(tid(page, 'run-checker')).toHaveCount(0)
})

test('planted report + the real verdict table: P2, P3, P5, P6 are not supported or partly; the score is complete; Needs work; Save stores metadata.hub.check', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await scoreWith(page, checkerAnswer('planted'))

  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${PLANTED.score} / 100 — ${PLANTED.grade}`)
  await expect(tid(page, 'checker-parts')).toContainText(`Sections ${PLANTED.parts.sections}/20 · Sources present ${PLANTED.parts.sources}/30 · Claims supported ${PLANTED.parts.support}/50`)
  await expect(tid(page, 'checker-parts')).toContainText(partsText(PLANTED.counts))
  await expect(tid(page, 'checker-contradicted')).toContainText('2 claims are not supported')
  for (const [id, kinds] of [['P2', ['not-supported', 'partly']], ['P3', ['not-supported']], ['P5', ['not-supported']], ['P6', ['not-supported', 'partly']]]) {
    const p = plant(id)
    const li = tid(page, 'checker-fixes').locator('li').filter({ hasText: `Claim ${p.claim_n} ` }).filter({ hasText: p.find })
    await expect(li, id).toHaveCount(1)
    expect(kinds, `${id} came back as ${await li.getAttribute('data-kind')}`).toContain(await li.getAttribute('data-kind'))
  }
  // The mechanical plants are still there after the citation check.
  await expect(fix(page, 'unsourced').filter({ hasText: plant('P1').find })).toHaveCount(1)
  await expect(fix(page, 'missing-section').filter({ hasText: plant('P4').find })).toHaveCount(1)
  await expect(tid(page, 'checker-redo')).toBeVisible()
  await expect(tid(page, 'checker-prompt')).toHaveCount(0)

  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  const [s, p, n, u] = PLANTED.counts
  expect(rows[0].metadata.hub.check).toEqual({
    score: PLANTED.score, outOf: 100, parts: PLANTED.parts,
    counts: { SUPPORTED: s, PARTLY: p, 'NOT SUPPORTED': n, UNREACHABLE: u }, checked: 51,
  })
})

test('clean control: the real verdict table scores higher than the planted report (Strong, nothing contradicted)', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, cleanReport())
  await openChecker(page)
  await expect(tid(page, 'checker-score')).toHaveText(`Score so far: ${CLEAN.mech} / 50 — the citation check has not been run yet`)
  await expect(tid(page, 'checker-prompt')).toHaveValue(hubPrompt(cleanReport()))
  await scoreWith(page, checkerAnswer('clean'))
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${CLEAN.score} / 100 — ${CLEAN.grade}`)
  await expect(tid(page, 'checker-parts')).toContainText(partsText(CLEAN.counts))
  await expect(tid(page, 'checker-contradicted')).toHaveCount(0)
  await expect(fix(page, 'not-supported')).toHaveCount(0)
  await expect(fix(page, 'missing-section')).toHaveCount(0)
  expect(CLEAN.score).toBeGreaterThan(PLANTED.score)
})

// ---------------------------------------------------------------- State

test('the check survives a reload; Check again clears it', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await scoreWith(page, checkerAnswer('planted'))
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${PLANTED.score} / 100 — ${PLANTED.grade}`)
  await page.reload()
  await expect(tid(page, 'checker-panel')).toBeVisible()
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${PLANTED.score} / 100 — ${PLANTED.grade}`)
  await tid(page, 'checker-redo').click()
  await expect(tid(page, 'checker-score')).toHaveText(`Score so far: ${PLANTED.mech} / 50 — the citation check has not been run yet`)
  await expect(tid(page, 'checker-answer')).toBeVisible()
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.runs.company-analysis')))
  expect(st.checkAnswer ?? null).toBeNull()
})

test('a new pasted answer clears the check: no stale score, prompt or fixes from the old answer, and Save stores no check', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await scoreWith(page, checkerAnswer('planted'))
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${PLANTED.score} / 100 — ${PLANTED.grade}`)

  await useAnswer(page, cleanReport())
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.runs.company-analysis')))
  expect(st.checkAnswer ?? null).toBeNull()
  // Whatever the panel shows now must be about the new answer, not the old one.
  await expect(tid(page, 'checker-score').filter({ hasText: `Score: ${PLANTED.score} / 100` })).toHaveCount(0)
  await expect(tid(page, 'checker-contradicted')).toHaveCount(0)
  await expect(fix(page, 'missing-section')).toHaveCount(0) // P4 belongs to the old answer
  await expect(tid(page, 'checker-redo')).toHaveCount(0)

  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  expect(rows[0].metadata.hub.check).toBeUndefined()
})

test('opening the checker, then pasting a new answer, never scores the new answer against the old one\'s claims', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page) // panel open on the planted answer, not yet scored
  await useAnswer(page, cleanReport())
  // No panel from the old answer may survive (H1): nothing showing the planted prompt.
  const planted = hubPrompt(plantedReport())
  for (const box of await tid(page, 'checker-prompt').all()) expect(await box.inputValue()).not.toBe(planted)
  await expect(tid(page, 'checker-panel').filter({ visible: true })).toHaveCount(0)
  // Checking the new answer checks the new answer's claims, and saves that check with it.
  await openChecker(page)
  await expect(tid(page, 'checker-panel')).toHaveCount(1)
  await expect(tid(page, 'checker-prompt')).toHaveValue(hubPrompt(cleanReport()))
  await scoreWith(page, checkerAnswer('clean'))
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${CLEAN.score} / 100 — ${CLEAN.grade}`)
  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const rows = await standin.hubRows()
  expect(rows[0].metadata.hub.report).toBe(cleanReport().trim())
  expect(rows[0].metadata.hub.check.score).toBe(CLEAN.score)
  await page.reload()
  await expect(tid(page, 'checker-score')).toHaveText(`Score: ${CLEAN.score} / 100 — ${CLEAN.grade}`)
})

test('M1 evidence replayed: the v2 checker table (revised prompt) marks P2, P3, P5, P6 not supported; 82 / 100 — Needs work', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await expect(tid(page, 'checker-prompt')).toHaveValue(checkerPrompt('planted-v2'))
  await scoreWith(page, checkerAnswer('planted-v2'))
  await expect(tid(page, 'checker-score')).toHaveText('Score: 82 / 100 — Needs work')
  await expect(tid(page, 'checker-parts')).toContainText(partsText([28, 18, 5, 0]))
  await expect(tid(page, 'checker-contradicted')).toContainText('5 claims are not supported')
  for (const id of ['P2', 'P3', 'P5', 'P6']) {
    const p = plant(id)
    await expect(fix(page, 'not-supported').filter({ hasText: `Claim ${p.claim_n} ` }).filter({ hasText: p.find }), id).toHaveCount(1)
  }
  await expect(fix(page, 'not-supported').filter({ hasText: 'Claim 2 ' }).filter({ hasText: 'NYSE as DE' })).toHaveCount(1)
})

test('an unreadable checker answer shows checker-error and keeps the paste step', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await scoreWith(page, 'I opened every link and they all look fine to me.')
  await expect(tid(page, 'checker-error')).toBeVisible()
  await expect(tid(page, 'checker-score')).toHaveText(`Score so far: ${PLANTED.mech} / 50 — the citation check has not been run yet`)
  await expect(tid(page, 'checker-answer')).toBeVisible()
  await expect(tid(page, 'checker-prompt')).toHaveValue(hubPrompt(plantedReport()))
})

test('verdict-table text is shown as text, never as HTML (no injected elements, CSP clean)', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  const evil = '| 1 | NOT SUPPORTED | <img src=x onerror="window.__pwned=1"> | <b id="inj">bold</b><script>window.__pwned=2</script> |'
  await scoreWith(page, evil)
  await expect(fix(page, 'not-supported')).toContainText('<b id="inj">bold</b>')
  expect(await tid(page, 'checker-panel').locator('img, b#inj, script').count()).toBe(0)
  expect(await page.evaluate(() => window.__pwned ?? null)).toBeNull()
})

// ---------------------------------------------------------------- Automatic mode

test('Automatic mode, paid search off: checker-needs-web says so, and the copy-and-paste step replaces run-checker', async ({ page }) => {
  await setup(page, { mode: 'auto' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await openChecker(page)
  await expect(tid(page, 'checker-needs-web')).toBeVisible()
  await expect(tid(page, 'checker-needs-web')).toContainText('paid web search is off')
  await expect(tid(page, 'run-checker')).toHaveCount(0)
  await expect(tid(page, 'checker-prompt')).toBeVisible()
  await expect(tid(page, 'checker-answer')).toBeVisible()
})

// L5: with paid search ON, the note must give the real reason, never "paid search is off".
for (const [label, breakIt, reason] of [
  ['no OpenRouter key', () => localStorage.removeItem('hub.openrouterKey'), 'no OpenRouter key'],
  ['no models chosen', () => { const s = JSON.parse(localStorage.getItem('hub.settings')); s.models = []; localStorage.setItem('hub.settings', JSON.stringify(s)) }, 'no Automatic-mode models'],
]) {
  test(`L5: Automatic mode, paid search on but ${label}: checker-needs-web gives that reason`, async ({ page }) => {
    await setup(page, { mode: 'auto', paidSearch: true })
    await openTool(page, 'hello-hub')
    await fillHello(page)
    await tid(page, 'run-btn').click()
    await expect(tid(page, 'result')).toBeVisible()
    await page.evaluate(breakIt)
    await page.reload()
    await expect(tid(page, 'result')).toBeVisible()
    await openChecker(page)
    await expect(tid(page, 'checker-needs-web')).toContainText(reason)
    await expect(tid(page, 'checker-needs-web')).not.toContainText('paid web search is off')
    await expect(tid(page, 'run-checker')).toHaveCount(0)
    await expect(tid(page, 'checker-prompt')).toBeVisible()
  })
}

test('Automatic mode, paid search on: run-checker sends the check prompt with the web plugin and scores the reply', async ({ page, openrouter }) => {
  const table = '| # | Verdict | Evidence | Fix |\n|---|---|---|---|\n| 1 | SUPPORTED | yes | - |\n| 2 | NOT SUPPORTED | no | Cite a real study |'
  openrouter.script('alpha/first:free', ['ok', { text: table }])
  await setup(page, { mode: 'auto', paidSearch: true })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await openChecker(page)
  await expect(tid(page, 'checker-needs-web')).toHaveCount(0)
  await expect(tid(page, 'checker-panel')).toContainText('weaker than opening each link')
  await tid(page, 'run-checker').click()
  await expect(tid(page, 'checker-score')).toHaveText('Score: 75 / 100 — Needs work') // 20 + 30 + 25, capped by the NOT SUPPORTED
  const call = openrouter.chats().at(-1)
  expect(call.webPlugin).toBe(true)
  expect(call.prompt).toMatch(/^You are a strict fact-checker\./)
  expect(call.prompt).toContain('\n1. ')
  expect(call.prompt).toContain('\n2. ')
  await expect(tid(page, 'checker-contradicted')).toBeVisible()
  await expect(fix(page, 'not-supported')).toContainText('Cite a real study')
})

test('Automatic mode, paid search on: a failed check run shows checker-error and leaves the score incomplete', async ({ page, openrouter }) => {
  openrouter.script('alpha/first:free', ['ok', 429])
  openrouter.script('beta/second:free', [429])
  await setup(page, { mode: 'auto', paidSearch: true })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await openChecker(page)
  await tid(page, 'run-checker').click()
  await expect(tid(page, 'checker-error')).toBeVisible()
  await expect(tid(page, 'checker-score')).toContainText('Score so far:')
  await expect(tid(page, 'run-checker')).toBeEnabled()
})

// ---------------------------------------------------------------- Part A: the rerun tool

test('rerun tool (guide v1.1): installs by paste with no errors; summary shows sourcing and web search; runs in Manual mode; prompt equals prompt.md', async ({ page }) => {
  await setup(page, { name: 'Ana' })
  await tid(page, 'nav-add').click()
  await tid(page, 'recipe-paste').fill(RERUN_RECIPE)
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toBeVisible()
  await expect(tid(page, 'recipe-errors')).toHaveCount(0)
  await expect(tid(page, 'summary-sourcing')).toContainText(/advice does not/i)
  await expect(tid(page, 'summary-websearch')).toContainText(WEBSEARCH_TEXT.helpful)
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await page.evaluate(() => { location.hash = '#/home' })
  await openTool(page, RERUN_TOOL_ID)
  await tid(page, 'field-company_name').fill(RERUN_INPUTS.company_name)
  await tid(page, 'field-job_posting').fill(RERUN_INPUTS.job_posting)
  // weaknesses left empty: the optional input the guide now tells authors to handle
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toHaveValue(RERUN_PROMPT)
  expect(RERUN_PROMPT).toContain(NO_BRAIN_TEXT)
})

test('rerun answer: renders every section, no missing-sections; advice-mode source check shows 3 of 4; the checker opens on it', async ({ page }) => {
  const answer = rerunAnswer()
  await setup(page, { name: 'Ana' })
  await tid(page, 'nav-add').click()
  await tid(page, 'recipe-paste').fill(RERUN_RECIPE)
  await tid(page, 'recipe-check').click()
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await page.evaluate(() => { location.hash = '#/home' })
  await openTool(page, RERUN_TOOL_ID)
  await tid(page, 'field-company_name').fill(RERUN_INPUTS.company_name)
  await tid(page, 'field-job_posting').fill(RERUN_INPUTS.job_posting)
  await tid(page, 'run-btn').click()
  await useAnswer(page, answer)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  for (const s of RERUN_SECTIONS) await expect(tid(page, 'result').getByRole('heading', { name: s, exact: true })).toBeVisible()
  // Pinned (PLAN 3a): 4 claims, 1 sourced, 3 unsourced.
  await expect(tid(page, 'source-check')).toContainText('3 of 4 claims have no source')
  await openChecker(page)
  await expect(tid(page, 'checker-score')).toContainText('Score so far:')
  await expect(tid(page, 'checker-prompt')).toHaveValue(/\n1\. [^\n]+\n {3}Link: https:\/\//)
  expect((await tid(page, 'checker-prompt').inputValue()).match(/^\d+\. /gm)).toHaveLength(1)
})

// ---------------------------------------------------------------- Layout

test('layout: the checker panel (prompt, fixes, score) never scrolls sideways, down to 320 px', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, plantedReport())
  await openChecker(page)
  await noHorizontalScroll(page, 'checker, before scoring')
  await scoreWith(page, checkerAnswer('planted'))
  await expect(tid(page, 'checker-score')).toContainText('/ 100')
  await noHorizontalScroll(page, 'checker, scored')
  await page.setViewportSize({ width: 320, height: 640 })
  await noHorizontalScroll(page, 'checker, scored @320')
})
