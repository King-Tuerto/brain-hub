// PLAN "Settings".
import { test, expect } from '../helpers/fixtures.mjs'
import { OR_KEY } from '../helpers/fake-openrouter.mjs'
import { tid, setup } from '../helpers/hub.mjs'

test('settings export excludes hub.openrouterKey and hub.session', async ({ page }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  const ls = await page.evaluate(() => ({ key: localStorage.getItem('hub.openrouterKey'), session: localStorage.getItem('hub.session') }))
  expect(ls.key, 'precondition: key stored').toBeTruthy()
  expect(ls.session, 'precondition: session stored').toBeTruthy()
  const session = JSON.parse(ls.session)

  await tid(page, 'nav-settings').click()
  await expect(tid(page, 'screen-settings')).toBeVisible()
  const [dl] = await Promise.all([page.waitForEvent('download'), tid(page, 'settings-export').click()])
  expect(dl.suggestedFilename()).toBe('brain-hub-settings.json')
  const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c)
  const text = Buffer.concat(chunks).toString('utf8')
  const data = JSON.parse(text)
  expect(text).not.toContain(OR_KEY)
  expect(text).not.toContain(session.access_token)
  expect(text).not.toContain(session.refresh_token)
  expect(text).not.toContain('hub.openrouterKey')
  expect(text).not.toContain('hub.session')
  expect(text).toContain('Ana') // hub.settings is included
  expect(typeof data).toBe('object')
})

test('settings shows brain status; sign out → No brain; reconnect goes to setup step 2', async ({ page }) => {
  await setup(page, { brain: 'connect', mode: 'manual' })
  await tid(page, 'nav-settings').click()
  await expect(tid(page, 'settings-brain-status')).toBeVisible()
  await tid(page, 'settings-signout').click()
  expect(await page.evaluate(() => localStorage.getItem('hub.session'))).toBeNull()
  await tid(page, 'settings-reconnect').click()
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await expect(tid(page, 'brain-url')).toBeVisible()
})

test('settings can change AI mode and paid search', async ({ page }) => {
  await setup(page, { mode: 'auto' })
  await tid(page, 'nav-settings').click()
  await expect(tid(page, 'settings-models')).toBeVisible()
  await tid(page, 'settings-paid-search').check()
  await tid(page, 'settings-ai-mode').selectOption('manual')
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hub.settings')))).toMatchObject({ aiMode: 'manual', paidSearch: true })
})

test('settings-reset clears every hub.* key after a confirm', async ({ page }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await page.evaluate(() => localStorage.setItem('not-hub', 'keep'))
  await tid(page, 'nav-settings').click()
  let dialogs = 0
  page.on('dialog', (d) => { dialogs++; d.accept() })
  await tid(page, 'settings-reset').click()
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('hub.')))).toEqual([])
  expect(dialogs).toBe(1)
  expect(await page.evaluate(() => localStorage.getItem('not-hub'))).toBe('keep')
  await page.reload()
  await expect(tid(page, 'screen-setup')).toBeVisible()
})

test('settings-reset does nothing when the confirm is dismissed', async ({ page }) => {
  await setup(page, { mode: 'manual' })
  await tid(page, 'nav-settings').click()
  page.on('dialog', (d) => d.dismiss())
  await tid(page, 'settings-reset').click()
  expect(await page.evaluate(() => localStorage.getItem('hub.settings'))).toBeTruthy()
})
