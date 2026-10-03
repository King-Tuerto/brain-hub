// PLAN "Web search decision" table; ai.js fallback; run-error handling.
import { test, expect } from '../helpers/fixtures.mjs'
import { FREE_IDS } from '../helpers/fake-openrouter.mjs'
import { WEB_SEARCH_LINE } from '../helpers/contract.mjs'
import { REQUIRED_TOOL, NONE_TOOL } from '../helpers/recipes.mjs'
import { tid, setup, openTool, fillHello, installRecipe } from '../helpers/hub.mjs'

async function runRequired(page) {
  await openTool(page, 'company-news')
  await tid(page, 'field-company').fill('Acme Corp')
  await tid(page, 'run-btn').click()
}
async function runNone(page) {
  await openTool(page, 'tidy-text')
  await tid(page, 'field-text').fill('this paragraph is messy')
  await tid(page, 'run-btn').click()
}
async function runHelpful(page) {
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
}

test.describe('Automatic mode, paid search ON', () => {
  test('helpful → web plugin on, no prompt line, no label', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto', paidSearch: true })
    await runHelpful(page)
    await expect(tid(page, 'result')).toBeVisible()
    expect(openrouter.chats()[0].plugins).toEqual([{ id: 'web' }])
    expect(openrouter.chats()[0].prompt).not.toContain(WEB_SEARCH_LINE)
    await expect(tid(page, 'no-websearch-label')).toBeHidden()
  })
  test('required → web plugin on, no warning', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto', paidSearch: true })
    await installRecipe(page, REQUIRED_TOOL)
    await runRequired(page)
    await expect(tid(page, 'result')).toBeVisible()
    await expect(tid(page, 'websearch-warning')).toBeHidden()
    expect(openrouter.chats()[0].plugins).toEqual([{ id: 'web' }])
    expect(openrouter.chats()[0].prompt).not.toContain(WEB_SEARCH_LINE)
  })
  test('none → never searches', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto', paidSearch: true })
    await installRecipe(page, NONE_TOOL)
    await runNone(page)
    await expect(tid(page, 'result')).toBeVisible()
    expect(openrouter.chats()[0].webPlugin).toBe(false)
    expect(openrouter.chats()[0].prompt).not.toContain(WEB_SEARCH_LINE)
    await expect(tid(page, 'no-websearch-label')).toBeHidden()
  })
})

test.describe('Automatic mode, paid search OFF', () => {
  test('required → websearch-warning before any call; run-anyway runs without search', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto' })
    await installRecipe(page, REQUIRED_TOOL)
    await runRequired(page)
    await expect(tid(page, 'websearch-warning')).toBeVisible()
    await expect(tid(page, 'websearch-warning').getByTestId('switch-to-manual')).toBeVisible()
    await expect(tid(page, 'websearch-warning').getByTestId('run-anyway')).toBeVisible()
    expect(openrouter.chats(), 'nothing sent before the student chooses').toEqual([])
    await tid(page, 'run-anyway').click()
    await expect(tid(page, 'result')).toBeVisible()
    expect(openrouter.chats()).toHaveLength(1)
    expect(openrouter.chats()[0].webPlugin).toBe(false)
  })
  test('required → switch-to-manual gives a prompt with the web-search line', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto' })
    await installRecipe(page, REQUIRED_TOOL)
    await runRequired(page)
    await tid(page, 'websearch-warning').getByTestId('switch-to-manual').click()
    await expect(tid(page, 'prompt-box')).toBeVisible()
    expect(await tid(page, 'prompt-box').inputValue()).toContain(WEB_SEARCH_LINE)
    expect(await tid(page, 'prompt-box').inputValue()).toContain('Acme Corp')
    expect(openrouter.chats()).toEqual([])
  })
  test('helpful → runs without search and labels the result', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto' })
    await runHelpful(page)
    await expect(tid(page, 'result')).toBeVisible()
    await expect(tid(page, 'websearch-warning')).toBeHidden()
    await expect(tid(page, 'no-websearch-label')).toBeVisible()
    expect(openrouter.chats()[0].webPlugin).toBe(false)
  })
  test('none → no warning, no label, no search', async ({ page, openrouter }) => {
    await setup(page, { mode: 'auto' })
    await installRecipe(page, NONE_TOOL)
    await runNone(page)
    await expect(tid(page, 'result')).toBeVisible()
    await expect(tid(page, 'websearch-warning')).toBeHidden()
    await expect(tid(page, 'no-websearch-label')).toBeHidden()
    expect(openrouter.chats()[0].webPlugin).toBe(false)
  })
})

test.describe('Manual mode', () => {
  test('required → WEB_SEARCH_LINE in the prompt', async ({ page }) => {
    await setup(page, { mode: 'manual' })
    await installRecipe(page, REQUIRED_TOOL)
    await runRequired(page)
    expect(await tid(page, 'prompt-box').inputValue()).toContain(WEB_SEARCH_LINE)
    await expect(tid(page, 'websearch-warning')).toBeHidden()
  })
  test('helpful → WEB_SEARCH_LINE in the prompt', async ({ page }) => {
    await setup(page, { mode: 'manual' })
    await runHelpful(page)
    expect(await tid(page, 'prompt-box').inputValue()).toContain(WEB_SEARCH_LINE)
  })
  test('none → no WEB_SEARCH_LINE', async ({ page }) => {
    await setup(page, { mode: 'manual' })
    await installRecipe(page, NONE_TOOL)
    await runNone(page)
    expect(await tid(page, 'prompt-box').inputValue()).not.toContain(WEB_SEARCH_LINE)
  })
})

test('model fallback: 429 on the first model → the next model answers', async ({ page, openrouter }) => {
  openrouter.script(FREE_IDS[0], 429)
  await setup(page, { mode: 'auto' })
  await runHelpful(page)
  await expect(tid(page, 'result')).toBeVisible()
  expect(openrouter.chats().map((c) => c.model)).toEqual(FREE_IDS)
  await expect(tid(page, 'run-error')).toBeHidden()
})

test('bad key (401): run-error with switch-to-manual; no further models tried', async ({ page, openrouter }) => {
  openrouter.script(FREE_IDS[0], 401)
  await setup(page, { mode: 'auto' })
  await runHelpful(page)
  await expect(tid(page, 'run-error')).toBeVisible()
  expect(openrouter.chats().map((c) => c.model)).toEqual([FREE_IDS[0]])
  await tid(page, 'run-error').getByTestId('switch-to-manual').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  expect(await tid(page, 'prompt-box').inputValue()).toContain('pricing')
})

test('every model rate-limited: run-error offers manual mode', async ({ page, openrouter }) => {
  for (const m of FREE_IDS) openrouter.script(m, 429)
  await setup(page, { mode: 'auto' })
  await runHelpful(page)
  await expect(tid(page, 'run-error')).toBeVisible()
  await expect(tid(page, 'run-error').getByTestId('switch-to-manual')).toBeVisible()
  expect(openrouter.chats().map((c) => c.model)).toEqual(FREE_IDS)
})
