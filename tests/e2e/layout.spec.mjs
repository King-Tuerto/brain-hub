// PLAN "Constraints — phone first": no sideways scroll at 320px or at each
// device size, on every screen; buttons at least 44px on phones.
import { test, expect } from '../helpers/fixtures.mjs'
import { NETWORKING_PREP } from '../helpers/recipes.mjs'
import { tid, toBrainStep, setup, openTool, fillHello, setHash, noHorizontalScroll, smallTapTargets } from '../helpers/hub.mjs'

// Visit every screen and state, calling check(label) on each.
async function tour(page, check) {
  await toBrainStep(page)
  await check('setup step 2 (brain)')
  await tid(page, 'brain-skip').click()
  await tid(page, 'ai-mode-auto').click()
  await check('setup step 3 (auto)')
  await tid(page, 'ai-mode-manual').click()
  await check('setup step 3 (manual)')
  await page.evaluate(() => localStorage.clear())

  await setup(page, { brain: 'connect', mode: 'manual' })
  await check('home')
  await openTool(page, 'hello-hub')
  await check('tool form')
  await fillHello(page, { topic: 'a-really-long-unbroken-topic-name-that-could-push-the-layout-sideways-on-a-phone' })
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  await check('tool manual prompt')
  await tid(page, 'answer-box').fill('## Key points\n- https://example.com/a/very/long/url/that/does/not/wrap/easily/at/all/on/a/small/screen/xxxxxxxxxxxxxxxx\n\n## Next steps\n- x\n\n## Summary\nDone.')
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
  await check('tool result')
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-panel')).toBeVisible()
  await check('save panel')
  await setHash(page, '#/add')
  await expect(tid(page, 'screen-add')).toBeVisible()
  await check('add tool')
  await tid(page, 'recipe-paste').fill(NETWORKING_PREP)
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toBeVisible()
  await check('install summary')
  await setHash(page, '#/settings')
  await expect(tid(page, 'screen-settings')).toBeVisible()
  await check('settings')
}

test('no horizontal scroll at this project’s device size, on every screen', async ({ page }) => {
  await page.goto('./')
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await noHorizontalScroll(page, 'setup step 1')
  await tour(page, (label) => noHorizontalScroll(page, label))
})

test('no horizontal scroll at 320px wide, on every screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('./')
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await noHorizontalScroll(page, 'setup step 1 @320')
  await tour(page, (label) => noHorizontalScroll(page, `${label} @320`))
})

test('buttons are at least 44x44 on phones', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'tap-target rule applies to the phone projects')
  const problems = []
  const check = async (label) => {
    for (const p of await smallTapTargets(page)) problems.push(`${label}: ${p}`)
  }
  await page.goto('./')
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await check('setup step 1')
  await tour(page, check)
  expect(problems).toEqual([])
})
