// PLAN "Add tool", "In-progress state", plugins.js discovery (DECISIONS Q4).
import { test, expect } from '../helpers/fixtures.mjs'
import { PERMISSION_TEXT, PRIVACY_WARNING, WEBSEARCH_TEXT } from '../helpers/contract.mjs'
import { NETWORKING_PREP, BAD_RECIPE, NONE_TOOL, GH_TOOL, MANIFEST_TOOL } from '../helpers/recipes.mjs'
import { tid, setup, openTool, fillHello, setHash, installRecipe } from '../helpers/hub.mjs'

const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))

test.describe('Add tool', () => {
  test('a bad recipe lists every error and offers no install', async ({ page }) => {
    await setup(page)
    await tid(page, 'nav-add').click()
    await expect(tid(page, 'screen-add')).toBeVisible()
    await tid(page, 'recipe-paste').fill(BAD_RECIPE)
    await tid(page, 'recipe-check').click()
    await expect(tid(page, 'recipe-errors')).toBeVisible()
    // recipe_format, id, version, permissions, web_search, inputs[0].type, sections, <script>, {{ghost}}
    expect(await tid(page, 'recipe-errors').locator('li').count()).toBeGreaterThanOrEqual(8)
    await expect(tid(page, 'recipe-errors')).toContainText('inputs[0].type must be one of text, long_text, choose_one, number')
    await expect(tid(page, 'install-summary')).toBeHidden()
    await expect(tid(page, 'install-btn')).toBeHidden()
  })

  test('install summary for networking-prep: exact permissions, query with [Label], web search, privacy warning; install → tile', async ({ page }) => {
    await setup(page)
    await tid(page, 'nav-add').click()
    await tid(page, 'recipe-paste').fill(NETWORKING_PREP)
    await tid(page, 'recipe-check').click()
    await expect(tid(page, 'install-summary')).toBeVisible()
    await expect(tid(page, 'recipe-errors')).toBeHidden()
    const perms = tid(page, 'summary-permissions').locator('li')
    await expect(perms).toHaveCount(3)
    await expect(perms.nth(0)).toContainText(PERMISSION_TEXT.search_brain('[Event name] contacts goals'))
    await expect(perms.nth(1)).toContainText(PERMISSION_TEXT.save_to_brain)
    await expect(perms.nth(2)).toContainText(PERMISSION_TEXT.run_ai)
    await expect(tid(page, 'summary-query')).toContainText('[Event name] contacts goals')
    await expect(tid(page, 'summary-query')).not.toContainText('{{')
    await expect(tid(page, 'summary-websearch')).toContainText(WEBSEARCH_TEXT.required)
    await expect(tid(page, 'summary-warning')).toContainText(PRIVACY_WARNING)

    await tid(page, 'install-btn').click()
    await expect(tid(page, 'installed-notice')).toBeVisible()
    await expect(tid(page, 'installed-notice')).toContainText('plugins/')
    const [dl] = await Promise.all([page.waitForEvent('download'), tid(page, 'download-recipe').click()])
    expect(dl.suggestedFilename()).toBe('networking-prep.recipe.md')
    const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c)
    expect(Buffer.concat(chunks).toString('utf8').replace(/\r\n/g, '\n').trim()).toBe(NETWORKING_PREP.trim())

    await setHash(page, '#/home')
    await expect(tile(page, 'networking-prep')).toBeVisible()
    // installed tools survive a reload (hub.localTools)
    await page.reload()
    await expect(tile(page, 'networking-prep')).toBeVisible()
  })

  test('no privacy warning without search_brain + run_ai', async ({ page }) => {
    await setup(page)
    await tid(page, 'nav-add').click()
    await tid(page, 'recipe-paste').fill(NONE_TOOL)
    await tid(page, 'recipe-check').click()
    await expect(tid(page, 'install-summary')).toBeVisible()
    await expect(tid(page, 'summary-websearch')).toContainText(WEBSEARCH_TEXT.none)
    await expect(tid(page, 'summary-warning')).toBeHidden()
  })
})

test('a recipe without search_brain never searches a connected brain, and offers no save without save_to_brain', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'manual' })
  await installRecipe(page, NONE_TOOL)
  await openTool(page, 'tidy-text')
  await tid(page, 'field-text').fill('pricing paragraph')
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  expect(brain.requests((e) => e.path === '/functions/v1/search-brain' && e.method === 'POST')).toEqual([])
  await tid(page, 'answer-box').fill('## Rewrite\nx\n## What changed\ny\n## Summary\nz')
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
  await expect(tid(page, 'save-btn')).toBeHidden()
})

test('in-progress run (inputs, prompt, answer) is restored after a reload; clear-run resets it', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await openTool(page, 'hello-hub')
  await fillHello(page, { topic: 'pricing', depth: 'Thorough' })
  await tid(page, 'run-btn').click()
  const prompt = await tid(page, 'prompt-box').inputValue()
  await tid(page, 'answer-box').fill('## Key points\nhalf-pasted answer')
  await page.reload()
  await expect(tid(page, 'screen-tool')).toBeVisible()
  await expect(tid(page, 'field-topic')).toHaveValue('pricing')
  await expect(tid(page, 'field-depth')).toHaveValue('Thorough')
  await expect(tid(page, 'prompt-box')).toHaveValue(prompt)
  await expect(tid(page, 'answer-box')).toHaveValue('## Key points\nhalf-pasted answer')
  expect(await page.evaluate(() => localStorage.getItem('hub.runs.hello-hub'))).toBeTruthy()

  await tid(page, 'clear-run').click()
  await expect(tid(page, 'field-topic')).toHaveValue('')
  await expect(tid(page, 'prompt-box')).toBeHidden()
})

test.describe('Plugin discovery', () => {
  test('repo override → GitHub API listing → plugin tile; download_url used', async ({ page, github }) => {
    github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL, 'README.md': '# not a recipe' })
    await setup(page)
    await tid(page, 'nav-settings').click()
    await expect(tid(page, 'screen-settings')).toBeVisible()
    await tid(page, 'settings-repo-override').fill('alice/brain-hub')
    await tid(page, 'settings-repo-override').press('Enter')
    await tid(page, 'settings-repo-override').blur()
    await setHash(page, '#/home')
    await expect(tid(page, 'screen-home')).toBeVisible()
    await tid(page, 'refresh-tools').click()
    await expect(tile(page, 'gh-tool')).toBeVisible()
    expect(github.log.map((e) => e.url)).toEqual(expect.arrayContaining([
      'https://api.github.com/repos/alice/brain-hub/contents/plugins',
      'https://raw.githubusercontent.com/alice/brain-hub/main/plugins/gh-tool.recipe.md',
    ]))
    expect(github.log.some((e) => e.url.endsWith('README.md'))).toBe(false)
    await expect(tile(page, 'hello-hub')).toBeVisible()
  })

  test('API failure → plugins/plugins.json fallback', async ({ page, github, context }) => {
    github.failApi = true
    await context.route('http://localhost:4173/brain-hub/plugins/plugins.json', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: ['manifest-tool.recipe.md'] }) }))
    await context.route('http://localhost:4173/brain-hub/plugins/manifest-tool.recipe.md', (r) =>
      r.fulfill({ status: 200, contentType: 'text/markdown', body: MANIFEST_TOOL }))
    await setup(page)
    await tid(page, 'nav-settings').click()
    await tid(page, 'settings-repo-override').fill('alice/brain-hub')
    await tid(page, 'settings-repo-override').press('Enter')
    await tid(page, 'settings-repo-override').blur()
    await setHash(page, '#/home')
    await tid(page, 'refresh-tools').click()
    await expect(tile(page, 'manifest-tool')).toBeVisible()
    expect(github.apiCalls().length).toBeGreaterThan(0)
  })

  test('local run with no repo: the shipped empty plugins.json, no GitHub call, core tools still work', async ({ page, github }) => {
    await setup(page)
    await tid(page, 'refresh-tools').click()
    await expect(tile(page, 'hello-hub')).toBeVisible()
    expect(github.apiCalls()).toEqual([])
  })
})
