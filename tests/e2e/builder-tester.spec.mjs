// Builder & Tester specialists — Nitpick E2E (docs/builder-tester/PLAN.md, docs/builder-tester/TEST-PLAN.md).
//
// The hub pieces, in all three projects, replayed from the REAL run's fixtures
// (tests/helpers/buildertester.mjs points at the attempt under test). No real
// network: the shared guard still applies; WIDGET-GUIDE.md comes from the local
// test server. The full Builder → Tester → fix → PASS → install loop is added
// when El Código's rerun lands.
//
// sectionText and recipesIn are exported from core/app.js, which cannot load in
// Node (it touches the DOM and routes on import). They are tested here by
// importing the module the page has already loaded: same URL, same instance,
// so importing it again does not re-run the app.
import { test, expect } from '../helpers/fixtures.mjs'
import { tid, setup, openTool, setHash, noHorizontalScroll, smallTapTargets } from '../helpers/hub.mjs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { buildPrompt, NO_GUIDE_TEXT } from '../../core/lib/prompt.js'
import { fx, fxJson, GUIDE, readRepo } from '../helpers/buildertester.mjs'

const BUILDER_ANSWER = fx('1-builder.answer.md')
const SPEC = fx('1-spec.md')
const BUILT = fx('1-recipe.recipe.md')
const TESTER1_ANSWER = fx('2-tester-write.answer.md')
const BUILT_ID = 'exam-study-planner'
const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))
const builderRecipe = () => parseRecipe(readRepo('core/tools/tool-builder.recipe.md'), { fileName: 'tool-builder.recipe.md' }).recipe

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

async function runBuilder(page, inputs = fxJson('1-builder.inputs.json')) {
  await openTool(page, 'tool-builder')
  await tid(page, 'field-idea').fill(inputs.idea)
  if (inputs.users) await tid(page, 'field-users').fill(inputs.users)
  if (inputs.fixes) await tid(page, 'field-fixes').fill(inputs.fixes)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  return tid(page, 'prompt-box').inputValue()
}

// Click a copy button and return what reached the clipboard (Chromium), or
// null after recording the WebKit platform limit (Playwright WebKit has no
// clipboard permission; a real iPhone is on PILOT-CHECKLIST).
async function clickCopy(page, button, status, browserName, what) {
  await button.click()
  await expect(status).toHaveText(/Copied\.|Could not copy/)
  if (browserName === 'chromium') {
    await expect(status).toHaveText('Copied.')
    // Windows turns LF into CRLF on the system clipboard; normalise before comparing.
    return (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n')
  }
  test.info().annotations.push({ type: 'webkit-platform-limit', description: `${what}: clipboard not readable in Playwright WebKit (status: "${await status.textContent()}"); real-device check is on PILOT-CHECKLIST` })
  return null
}

// ---------------------------------------------------------------- Builder: prompt

test('Builder in Manual mode: prompt-box is the hub’s prompt with WIDGET-GUIDE.md embedded, fetched from the hub itself', async ({ page, net }) => {
  await setup(page, { mode: 'manual' })
  const inputs = fxJson('1-builder.inputs.json')
  const prompt = await runBuilder(page, inputs)
  expect(prompt).toBe(buildPrompt(builderRecipe(), inputs, { widgetGuide: GUIDE() }))
  expect(prompt).toContain(`<<<\n${GUIDE()}\n>>>`)
  expect(prompt).not.toContain(NO_GUIDE_TEXT)
  const fetched = net.requests.filter((r) => /\/brain-hub\/WIDGET-GUIDE\.md$/.test(r.url))
  expect(fetched.length, 'the guide is fetched same-origin').toBeGreaterThanOrEqual(1)
  await noHorizontalScroll(page, 'Builder prompt screen')
})

test('only a recipe that uses {{widget_guide}} fetches the guide', async ({ page, net }) => {
  await setup(page, { mode: 'manual' })
  await openTool(page, 'tool-tester-write')
  await tid(page, 'field-spec').fill(SPEC)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  expect(net.requests.filter((r) => /WIDGET-GUIDE\.md/.test(r.url))).toEqual([])
})

test('if the guide cannot be fetched, the Builder prompt says so instead of breaking', async ({ page }) => {
  await page.route('**/WIDGET-GUIDE.md', (r) => r.fulfill({ status: 404, body: 'nope' }))
  await setup(page, { mode: 'manual' })
  const prompt = await runBuilder(page)
  expect(prompt).toContain(`<<<\n${NO_GUIDE_TEXT}\n>>>`)
})

// ---------------------------------------------------------------- Builder: result card

test('pasting the Builder answer: a Copy button per section, Install Exam Study Planner, no Check this answer', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  const copies = tid(page, 'copy-section')
  await expect(copies).toHaveCount(4)
  expect(await copies.evaluateAll((els) => els.map((e) => [e.dataset.section, e.textContent])))
    .toEqual([['Steps', 'Copy “Steps”'], ['Spec', 'Copy “Spec”'], ['Recipe', 'Copy “Recipe”'], ['Summary', 'Copy “Summary”']])
  // Each sits right under its own heading.
  expect(await tid(page, 'result').evaluate((root) => [...root.querySelectorAll('h2')]
    .every((h2) => h2.nextElementSibling?.querySelector('[data-testid="copy-section"]')?.dataset.section === h2.textContent.trim()))).toBe(true)

  const install = tid(page, 'install-from-answer')
  await expect(install).toHaveCount(1)
  await expect(install).toHaveText('Install Exam Study Planner')
  await expect(install).toHaveAttribute('data-tool-id', BUILT_ID)
  await expect(tid(page, 'copy-answer')).toBeVisible()
  await expect(tid(page, 'check-btn'), 'sourcing: none hides Check this answer').toHaveCount(0)
  await expect(tid(page, 'source-check'), 'sourcing: none counts no claims').toHaveCount(0)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  await noHorizontalScroll(page, 'Builder result (recipe code block)')
})

test('the copy and install buttons on the result are phone-sized tap targets', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  const small = (await smallTapTargets(page)).filter((s) => /copy|install/i.test(s))
  expect(small).toEqual([])
})

test('KNOWN DEFECT: sourcing none still shows "This answer has no source links" on a Builder answer', async ({ page }) => {
  test.fail(process.env.NITPICK_SHOW_DEFECTS ? false : true, 'El Código: showResult shows no-sources-warning whatever the sourcing. For sourcing: none it is noise ("none of its facts can be checked") on an answer that is supposed to have no sources. Remove this test.fail when fixed.')
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  await expect(tid(page, 'no-sources-warning')).toHaveCount(0, { timeout: 1000 })
})

test('Copy “Spec” copies exactly the Spec, with no recipe syntax', async ({ page, browserName }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  const btn = tid(page, 'copy-section').and(page.locator('[data-section="Spec"]'))
  const status = btn.locator('xpath=following-sibling::span[@role="status"]')
  const copied = await clickCopy(page, btn, status, browserName, 'copy-section Spec')
  if (copied == null) return
  expect(copied).toBe(SPEC.trim())
  expect(copied).not.toMatch(/recipe_format|permissions:|```|\{\{|^---$/m)
})

test('Copy answer copies the whole answer', async ({ page, browserName }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  const copied = await clickCopy(page, tid(page, 'copy-answer'), tid(page, 'copy-answer-status'), browserName, 'copy-answer')
  if (copied == null) return
  expect(copied).toBe(BUILDER_ANSWER.trim())
})

test('Install → Add tool prefilled → Check recipe → Install → the tile appears and runs', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  await tid(page, 'install-from-answer').click()
  await expect(tid(page, 'screen-add')).toBeVisible()
  await expect(tid(page, 'recipe-paste')).toHaveValue(BUILT)
  expect(await page.evaluate(() => localStorage.getItem('hub.addDraft')), 'the draft is used once').toBeNull()
  // Nothing is installed until the student checks and confirms.
  expect(await page.evaluate(() => localStorage.getItem('hub.localTools'))).toBeNull()
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toBeVisible()
  await expect(tid(page, 'install-summary')).toContainText('Exam Study Planner')
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await setHash(page, '#/home')
  await expect(tile(page, BUILT_ID)).toHaveCount(1)
  await openTool(page, BUILT_ID)
  await expect(tid(page, 'field-syllabus')).toBeVisible()
  await expect(tid(page, 'field-exam_date')).toBeVisible()
  // Leaving Add tool and coming back does not refill an old draft.
  await setHash(page, '#/add')
  await expect(tid(page, 'recipe-paste')).toHaveValue('')
})

test('installing a revised version (1.0.1) from a later Builder answer replaces the local copy', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await runBuilder(page)
  await useAnswer(page, BUILDER_ANSWER)
  await tid(page, 'install-from-answer').click()
  await tid(page, 'recipe-check').click()
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()

  const v2 = BUILDER_ANSWER.replace('version: 1.0.0', 'version: 1.0.1').replace('in the order they appear there.', 'in the order they appear there, one entry per calendar week.')
  await setHash(page, '#/home')
  await runBuilder(page, { ...fxJson('1-builder.inputs.json'), fixes: '1. [A2, Test 1] count every week' })
  await useAnswer(page, v2)
  await tid(page, 'install-from-answer').click()
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toContainText('Version 1.0.1')
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  const local = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.localTools')))
  expect(local.map((t) => t.id)).toEqual([BUILT_ID])
  expect(local[0].text).toContain('version: 1.0.1')
  await setHash(page, '#/home')
  await expect(tile(page, BUILT_ID)).toHaveCount(1)
})

// ---------------------------------------------------------------- Tester 1

test('Tester 1: the prompt from the copied Spec is the fixture prompt; its answer gets Copy buttons and no Install', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await openTool(page, 'tool-tester-write')
  await tid(page, 'field-spec').fill(SPEC)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toHaveValue(fx('2-tester-write.prompt.md'))
  await useAnswer(page, TESTER1_ANSWER)
  expect(await tid(page, 'copy-section').evaluateAll((els) => els.map((e) => e.dataset.section)))
    .toEqual(['Test plan', 'Test cases', 'How to run them', 'Summary'])
  await expect(tid(page, 'install-from-answer')).toHaveCount(0)
  await expect(tid(page, 'check-btn')).toHaveCount(0)
  await expect(tid(page, 'save-btn'), 'Tester 1 has no save_to_brain').toHaveCount(0)
})

// ---------------------------------------------------------------- sectionText / recipesIn (in the page)

// Call one export of the already-loaded core/app.js. (No new Function / eval:
// the hub's CSP forbids it, and the CSP guard would rightly flag it.)
async function appExports(page) {
  await setup(page, { mode: 'manual' })
  return (name, ...args) => page.evaluate(async ([n, a]) => {
    const m = await import(new URL('core/app.js', document.baseURI).href)
    return m[n](...a)
  }, [name, args])
}

test('sectionText: the Spec from the real answer; headings matched loosely; missing → empty; last section runs to the end', async ({ page }) => {
  const call = await appExports(page)
  const st = (md, name) => call('sectionText', md, name)
  const r = {
    spec: await st(BUILDER_ANSWER, 'Spec'),
    bold: await st('## **Spec**\nx\n## Next\ny', 'spec'),
    missing: await st(BUILDER_ANSWER, 'Nope'),
    last: await st('## A\na\n## B\nb1\n\n### sub\nb2\n', 'B'),
    h3: await st('## A\na\n### A\nnot me\n', 'A'),
    crlf: await st('## Spec\r\nabc\r\n## Next\r\n', 'Spec'),
  }
  expect(r.spec).toBe(SPEC.trim())
  expect(r.bold).toBe('x')
  expect(r.missing).toBe('')
  expect(r.last).toBe('b1\n\n### sub\nb2')
  expect(r.h3).toBe('a\n### A\nnot me')
  expect(r.crlf).toBe('abc')
})

// A fenced block: the opening line may carry an info string; the closing line is the bare fence.
const fence = (open, body, close = /^[`~]+/.exec(open)[0]) => `${open}\n${body}${close}\n`
const recipeWith = (id, name) => BUILT.replace(`id: ${BUILT_ID}`, `id: ${id}`).replace('name: Exam Study Planner', `name: ${name}`)

test('recipesIn: ``` and ~~~ fences, any info string, invalid and unfenced recipes ignored, two recipes, duplicates once', async ({ page }) => {
  const call = await appExports(page)
  const cases = {
    real: BUILDER_ANSWER,
    tilde: `Here:\n\n${fence('~~~', BUILT)}`,
    yaml: fence('```yaml', BUILT),
    bare: fence('```', BUILT),
    longer: fence('````recipe', BUILT),
    leadingBlank: fence('```recipe', '\n\n' + BUILT),
    invalid: fence('```recipe', BUILT.replace('recipe_format: 1', 'recipe_format: 2')),
    notRecipe: fence('```js', 'console.log(1)\n'),
    unfenced: `## Recipe\n\n${BUILT}`,
    two: fence('```recipe', BUILT) + '\nand\n\n' + fence('~~~recipe', recipeWith('quiz-me', 'Quiz Me')),
    dup: fence('```recipe', BUILT) + fence('```recipe', BUILT),
  }
  const out = {}
  for (const [k, v] of Object.entries(cases)) out[k] = await call('recipesIn', v)
  expect(out.real).toEqual([{ id: BUILT_ID, name: 'Exam Study Planner', text: BUILT }])
  for (const k of ['tilde', 'yaml', 'bare', 'longer', 'leadingBlank']) expect(out[k].map((r) => r.id), k).toEqual([BUILT_ID])
  expect(out.leadingBlank[0].text.startsWith('---')).toBe(true)
  for (const k of ['invalid', 'notRecipe', 'unfenced']) expect(out[k], k).toEqual([])
  expect(out.two.map((r) => [r.id, r.name])).toEqual([[BUILT_ID, 'Exam Study Planner'], ['quiz-me', 'Quiz Me']])
  expect(out.dup).toHaveLength(1)
})

test('recipesIn: a recipe in a 4-backtick fence may contain a ``` block in its prompt', async ({ page }) => {
  const call = await appExports(page)
  const inner = BUILT.replace('Then give me exactly', 'Format each week like:\n```\nWeek 1: topic\n```\nThen give me exactly')
  const out = await call('recipesIn', fence('````recipe', inner))
  expect(out.map((r) => r.text)).toEqual([inner])
})

test('KNOWN DEFECT: a ``` block inside a ```recipe fence yields a truncated recipe that still offers Install', async ({ page }) => {
  test.fail(process.env.NITPICK_SHOW_DEFECTS ? false : true, 'El Código: recipesIn stops at the first inner ``` line, the cut-down recipe still validates, and Install installs a tool whose prompt is missing its end. Either refuse (no Install button) or have the Builder use ~~~ / ```` when the prompt contains ```. Remove this test.fail when fixed.')
  const call = await appExports(page)
  const inner = BUILT.replace('Then give me exactly', 'Format each week like:\n```\nWeek 1: topic\n```\nThen give me exactly')
  const out = await call('recipesIn', fence('```recipe', inner))
  // Acceptable: the whole recipe, or none. Never a cut-down one.
  for (const r of out) expect(r.text).toBe(inner)
})

test('KNOWN DEFECT: Copy “Recipe” stops at a "## " line inside the recipe’s code block', async ({ page }) => {
  test.fail(process.env.NITPICK_SHOW_DEFECTS ? false : true, 'El Código: sectionText ends a section at any line starting "## ", even inside a fenced block. A recipe whose prompt has a "## " line is copied cut short, and that is what the student pastes into the Builder’s fixes box. Remove this test.fail when fixed.')
  const call = await appExports(page)
  const inner = BUILT.replace('Build me a week-by-week', '## Study plan format\nBuild me a week-by-week')
  const md = `## Recipe\n\n${fence('```recipe', inner)}\n${BUILT_ID}.recipe.md\n\n## Summary\nx`
  const out = await call('sectionText', md, 'Recipe')
  expect(out).toContain('Then give me exactly 5 practice questions')
})

// ---------------------------------------------------------------- the phone flow between tools

test('Tester 2 keeps what was pasted while the student goes off to run the built tool (one clipboard on a phone)', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await openTool(page, 'tool-tester-grade')
  await tid(page, 'field-spec').fill(SPEC)
  await tid(page, 'field-test_cases').fill('Test 1 … Test 3')
  await tid(page, 'field-results').fill('Test 1\n(answer one)')
  // Off to another tool and back, as a student does between test runs.
  await setHash(page, '#/home')
  await openTool(page, 'tool-builder')
  await setHash(page, '#/home')
  await page.reload()
  await openTool(page, 'tool-tester-grade')
  await expect(tid(page, 'field-spec')).toHaveValue(SPEC)
  await expect(tid(page, 'field-results')).toHaveValue('Test 1\n(answer one)')
})
