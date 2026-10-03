// PLAN "Setup"; DECISIONS Q3 (open-database check, password never stored).
import { test, expect } from '../helpers/fixtures.mjs'
import { STUDENT } from '../helpers/fake-brain.mjs'
import { FREE_IDS, OR_KEY } from '../helpers/fake-openrouter.mjs'
import { tid, goto, toBrainStep, submitBrain, localStorageDump, setup } from '../helpers/hub.mjs'

test('first run starts at #/setup with only step 1 visible', async ({ page }) => {
  await goto(page)
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await expect(page).toHaveURL(/#\/setup$/)
  await expect(tid(page, 'setup-name')).toBeVisible()
  await expect(tid(page, 'brain-url')).toBeHidden()
  await expect(tid(page, 'ai-mode-auto')).toBeHidden()
})

test('unfinished setup sends any route back to setup', async ({ page }) => {
  await goto(page, '#/home')
  await expect(tid(page, 'screen-setup')).toBeVisible()
})

for (const mode of ['open', 'not-express']) {
  test(`${mode} brain is refused: no sign-in, password cleared and never stored`, async ({ page, brain, net }) => {
    brain.mode = mode
    await toBrainStep(page)
    await submitBrain(page)
    await expect(tid(page, 'brain-refused')).toBeVisible()
    await expect(tid(page, 'brain-refused').locator('a[href*="UPGRADE.md"]')).toHaveCount(1)
    await expect(tid(page, 'brain-password')).toHaveValue('')
    await expect(tid(page, 'ai-mode-auto')).toBeHidden()
    expect(brain.authRequests(), 'no sign-in request may be made').toEqual([])
    const probes = brain.requests((e) => e.path === '/rest/v1/thoughts')
    expect(probes).toHaveLength(1)
    expect(probes[0].method).toBe('POST')
    expect(probes[0].json).toEqual({ content: null })
    if (mode === 'open') expect(brain.requests((e) => e.path.startsWith('/functions/'))).toEqual([])
    expect(await localStorageDump(page)).not.toContain(STUDENT.password)
    expect(net.requests.filter((r) => (r.postData || '').includes(STUDENT.password))).toEqual([])
  })
}

test('unreachable brain: setup does not continue, no sign-in, password cleared', async ({ page, brain }) => {
  brain.mode = 'down'
  await toBrainStep(page)
  await submitBrain(page)
  await expect(tid(page, 'brain-status')).toBeVisible()
  await expect(tid(page, 'brain-password')).toHaveValue('')
  await expect(tid(page, 'ai-mode-auto')).toBeHidden()
  expect(brain.authRequests()).toEqual([])
})

test('locked brain, wrong password: error shown, password cleared, still on step 2', async ({ page, brain }) => {
  await toBrainStep(page)
  await submitBrain(page, { password: 'wrong-password' })
  await expect(tid(page, 'brain-status')).toContainText('Invalid login credentials')
  await expect(tid(page, 'brain-password')).toHaveValue('')
  await expect(tid(page, 'ai-mode-auto')).toBeHidden()
  expect(brain.authRequests()).toHaveLength(1)
})

test('locked brain: open check first, then sign-in; password only ever sent to auth/v1/token', async ({ page, brain, net }) => {
  await toBrainStep(page)
  await submitBrain(page)
  await expect(tid(page, 'ai-mode-auto')).toBeVisible()
  const all = brain.requests()
  const probe = all.findIndex((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts')
  const signIn = all.findIndex((e) => e.path === '/auth/v1/token')
  expect(probe).toBeGreaterThanOrEqual(0)
  expect(signIn).toBeGreaterThan(probe)
  expect(all[signIn].params.grant_type).toBe('password')
  expect(all[signIn].json).toEqual({ email: STUDENT.email, password: STUDENT.password })
  // the probe used only the publishable key
  expect(all[probe].headers.authorization).toBe(`Bearer ${all[probe].headers.apikey}`)
  // Step 2 may be removed from the DOM after success; if it is still there it must be empty.
  if (await tid(page, 'brain-password').count()) await expect(tid(page, 'brain-password')).toHaveValue('')
  const leaks = net.requests.filter((r) => !(r.url.includes('/auth/v1/token') && r.url.includes('grant_type=password')) &&
    ((r.postData || '').includes(STUDENT.password) || r.url.includes(STUDENT.password)))
  expect(leaks).toEqual([])
  expect(await localStorageDump(page)).not.toContain(STUDENT.password)
  for (const e of all) expect(JSON.stringify(e.headers)).not.toMatch(/service_role|sb_secret_/)
})

test('auto mode: spending-limit reminder, only free models listed, paid search off by default', async ({ page, openrouter }) => {
  await toBrainStep(page)
  await tid(page, 'brain-skip').click()
  await tid(page, 'ai-mode-auto').click()
  await expect(tid(page, 'or-limit-reminder')).toBeVisible()
  await expect(tid(page, 'or-limit-reminder')).toContainText('spending limit')
  await tid(page, 'or-key').fill(OR_KEY)
  await tid(page, 'or-load-models').click()
  const options = tid(page, 'model-select').locator('option')
  await expect(options).toHaveCount(FREE_IDS.length)
  expect(await options.evaluateAll((os) => os.map((o) => o.value))).toEqual(FREE_IDS)
  expect(await tid(page, 'model-select').evaluate((el) => el.multiple)).toBe(true)
  await expect(tid(page, 'paid-search')).not.toBeChecked()
  expect(openrouter.modelsLog).toHaveLength(1)
})

test('manual mode offers the three AI apps', async ({ page }) => {
  await toBrainStep(page)
  await tid(page, 'brain-skip').click()
  await tid(page, 'ai-mode-manual').click()
  for (const app of ['claude', 'chatgpt', 'gemini']) await expect(tid(page, `ai-app-${app}`)).toBeVisible()
  await expect(tid(page, 'or-limit-reminder')).toBeHidden()
})

test('finished setup lands on home and survives a reload', async ({ page }) => {
  await setup(page, { brain: 'skip', mode: 'manual' })
  await expect(page).toHaveURL(/#\/home$/)
  await expect(tid(page, 'home-name')).toContainText('Ana')
  await page.reload()
  await expect(tid(page, 'screen-home')).toBeVisible()
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.settings')))
  expect(s).toMatchObject({ name: 'Ana', aiMode: 'manual', aiApp: 'claude', setupDone: true, paidSearch: false })
})

test('auto setup stores the key and the chosen models in fallback order', async ({ page }) => {
  await setup(page, { brain: 'skip', mode: 'auto' })
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.settings')))
  expect(s).toMatchObject({ aiMode: 'auto', models: FREE_IDS, paidSearch: false, setupDone: true })
  expect(await page.evaluate(() => localStorage.getItem('hub.openrouterKey'))).toContain(OR_KEY)
})
