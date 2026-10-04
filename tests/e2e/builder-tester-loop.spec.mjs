// Builder & Tester — the whole loop, through the real UI (Nitpick sign-off E2E).
//
// Replays the FINAL real run (tests/fixtures/builder-tester/r1-* … r5-*,
// docs/builder-tester/PLAN.md "The final run") exactly as a student on a phone
// would: Builder → Install → Copy “Spec” → Tester 1 → run the built tool three
// times with Copy answer → Tester 2 shows FIX → Builder with the Fixes, the Spec
// and the recipe → install the newer version over the old → Tester 1 again with
// the previous test cases → … → Tester 2 shows PASS → download the recipe for
// plugins/. All five rounds run, so every prompt the hub builds along the way is
// checked byte for byte against the prompt the real AIs answered.
//
// No AI and no network: the answers are the real ones, pasted in Manual mode, and
// the shared network guard fails the test on any request that is not local.
// The browser clock is set to the day the run was made (its {{today}}).
import { test, expect } from '../helpers/fixtures.mjs'
import { tid, setup, openTool, setHash } from '../helpers/hub.mjs'
import {
  ROUNDS, LAST, TODAY, BUILT_ID, BUILT_NAME, round, fixesFor, resultsFor, fxJson, appHelpers,
} from '../helpers/buildertester.mjs'

const REQUEST = fxJson('0-request.json')
const { sectionText } = await appHelpers()
const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))
const copySection = (page, name) => tid(page, 'copy-section').and(page.locator(`[data-section="${name}"]`))
const statusAfter = (btn) => btn.locator('xpath=following-sibling::span[@role="status"]')

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

async function runTool(page) {
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  return tid(page, 'prompt-box').inputValue()
}

// Tap a copy button. Chromium: return what reached the clipboard. WebKit cannot
// read the clipboard in Playwright: record the limit and return `fallback`,
// which is what the button is proven (in Chromium) to copy.
async function copy(page, button, status, browserName, fallback, what) {
  await button.click()
  await expect(status).toHaveText(/Copied\.|Could not copy/)
  if (browserName === 'chromium') {
    await expect(status).toHaveText('Copied.')
    // Windows turns LF into CRLF on the system clipboard.
    return (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')
  }
  test.info().annotations.push({ type: 'webkit-platform-limit', description: `${what}: clipboard not readable in Playwright WebKit; real-device check is on PILOT-CHECKLIST` })
  return fallback
}

async function installFromAnswer(page, version) {
  const install = tid(page, 'install-from-answer')
  await expect(install).toHaveCount(1)
  await expect(install).toHaveText(`Install ${BUILT_NAME}`)
  await install.click()
  await expect(tid(page, 'screen-add')).toBeVisible()
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toContainText(`Version ${version}`)
  await expect(tid(page, 'summary-sourcing')).toHaveText('No sources needed (it works on your own text)')
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
}

test('the full loop: FIX in rounds 1–4, the newer version installed over the old each time, PASS in round 5, recipe downloaded', async ({ page, browserName }) => {
  test.setTimeout(300_000)
  await page.clock.setFixedTime(new Date(`${TODAY}T12:00:00Z`))
  await setup(page, { mode: 'manual' })

  for (const n of ROUNDS) {
    const R = round(n)
    const version = `1.0.${n - 1}`

    // ---- 1. Build (Builder). Round 2+: the Tester's Fixes, the current Spec and the current recipe in the last box.
    await setHash(page, '#/home')
    await openTool(page, 'tool-builder')
    if (n === 1) {
      await tid(page, 'field-idea').fill(REQUEST.idea)
      await tid(page, 'field-users').fill(REQUEST.users)
    } else {
      // The hub kept the idea; the previous answer is still on screen, so the
      // student can copy its Spec and Recipe from there.
      await expect(tid(page, 'field-idea')).toHaveValue(REQUEST.idea)
      await expect(copySection(page, 'Spec')).toBeVisible()
      await expect(copySection(page, 'Recipe')).toBeVisible()
      await tid(page, 'field-fixes').fill(fixesFor(n, sectionText(round(n - 1).gradeAnswer, 'Fixes')))
    }
    expect(await runTool(page), `round ${n}: Builder prompt`).toBe(R.builderPrompt)
    await useAnswer(page, R.builderAnswer)
    await expect(tid(page, 'check-btn'), 'sourcing: none — no Check this answer').toHaveCount(0)
    await expect(tid(page, 'no-sources-warning')).toHaveCount(0)
    await expect(tid(page, 'recipe-problems')).toHaveCount(0)

    // Copy “Spec”: only the Spec — never the recipe — goes to the Tester.
    const specBtn = copySection(page, 'Spec')
    const spec = await copy(page, specBtn, statusAfter(specBtn), browserName, R.spec.trim(), `round ${n} Copy “Spec”`)
    expect(spec).toBe(R.spec.trim())
    expect(spec).not.toMatch(/recipe_format|permissions:|```|\{\{|^---$/m)

    // Install (round 2+: replaces the local copy — one tile, the new version).
    await installFromAnswer(page, version)
    const local = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.localTools')))
    expect(local.map((t) => t.id), `round ${n}: one local copy`).toEqual([BUILT_ID])
    expect(local[0].text).toBe(R.recipe)
    await setHash(page, '#/home')
    await expect(tile(page, BUILT_ID)).toHaveCount(1)

    // ---- 2. Write the tests (Tester 1), from the Spec only; round 2+ with the previous test cases.
    let previous = ''
    await openTool(page, 'tool-tester-write')
    if (n > 1) {
      // Last round's Tester 1 answer is still on screen: copy its Test cases first.
      const tcBtn = copySection(page, 'Test cases')
      previous = await copy(page, tcBtn, statusAfter(tcBtn), browserName, sectionText(round(n - 1).testsAnswer, 'Test cases'), `round ${n} Copy “Test cases”`)
      expect(previous).toBe(sectionText(round(n - 1).testsAnswer, 'Test cases'))
    }
    await tid(page, 'field-spec').fill(spec)
    await tid(page, 'field-previous_tests').fill(previous)
    expect(await runTool(page), `round ${n}: Tester 1 prompt`).toBe(R.testsPrompt)
    await useAnswer(page, R.testsAnswer)
    await expect(tid(page, 'install-from-answer')).toHaveCount(0)
    const tcBtn = copySection(page, 'Test cases')
    const testCases = await copy(page, tcBtn, statusAfter(tcBtn), browserName, sectionText(R.testsAnswer, 'Test cases'), `round ${n} Copy “Test cases”`)

    // ---- 3. Run the tests: the built tool once per test, Copy answer into Tester 2's last box.
    await setHash(page, '#/home')
    await openTool(page, 'tool-tester-grade')
    await tid(page, 'field-results').fill(`Ran on ${TODAY}.`)
    for (const k of ['1', '2', '3']) {
      await setHash(page, '#/home')
      await openTool(page, BUILT_ID)
      await tid(page, 'field-syllabus').fill(R.cases[k].syllabus)
      await tid(page, 'field-exam_date').fill(R.cases[k].exam_date)
      expect(await runTool(page), `round ${n}, test ${k}: the built tool’s prompt`).toBe(R.runPrompt(k))
      await useAnswer(page, R.runAnswer(k))
      const answer = await copy(page, tid(page, 'copy-answer'), tid(page, 'copy-answer-status'), browserName, R.runAnswer(k).trim(), `round ${n} test ${k} Copy answer`)
      expect(answer).toBe(R.runAnswer(k).trim())
      await setHash(page, '#/home')
      await openTool(page, 'tool-tester-grade')
      const box = tid(page, 'field-results')
      await box.fill(`${await box.inputValue()}\n\nTest ${k}:\n${answer}`)
    }

    // ---- 4. Grade (Tester 2): the Spec, the test cases and the answers. Never the recipe.
    await tid(page, 'field-spec').fill(spec)
    await tid(page, 'field-test_cases').fill(testCases)
    await expect(tid(page, 'field-results')).toHaveValue(resultsFor(n))
    const gradePrompt = await runTool(page)
    expect(gradePrompt, `round ${n}: Tester 2 prompt`).toBe(R.gradePrompt)
    expect(gradePrompt).not.toMatch(/recipe_format|```recipe/)
    await useAnswer(page, R.gradeAnswer)
    const result = tid(page, 'result')
    if (n < LAST) {
      await expect(result).toContainText('FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder')
      await expect(copySection(page, 'Fixes')).toBeVisible()
    } else {
      await expect(result).toContainText('PASS — install it')
      await expect(result).not.toContainText('FIX AND RETEST')
      await expect(result).toContainText('No fixes needed.')
    }
  }

  // ---- 5. Keep it: the passing version is installed; download it for plugins/.
  await openTool(page, 'tool-builder')
  await installFromAnswer(page, `1.0.${LAST - 1}`)
  const [dl] = await Promise.all([page.waitForEvent('download'), tid(page, 'download-recipe').click()])
  expect(dl.suggestedFilename()).toBe(`${BUILT_ID}.recipe.md`)
  const chunks = []
  for await (const c of await dl.createReadStream()) chunks.push(c)
  expect(Buffer.concat(chunks).toString('utf8').replace(/\r\n/g, '\n')).toBe(round(LAST).recipe)
  await setHash(page, '#/home')
  await expect(tile(page, BUILT_ID)).toHaveCount(1)
  const local = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.localTools')))
  expect(local).toHaveLength(1)
  expect(local[0].text).toContain('version: 1.0.4')
})
