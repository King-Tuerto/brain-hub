// UI flows for the hub, using only data-testids from docs/phase-2/PLAN.md.
import { expect } from '@playwright/test'
import { BRAIN_URL, ANON_KEY, STUDENT } from './fake-brain.mjs'
import { OR_KEY, FREE_IDS } from './fake-openrouter.mjs'

export const tid = (page, id) => page.getByTestId(id)

export async function goto(page, hash = '') {
  await page.goto(`./${hash}`)
}

export async function setHash(page, hash) {
  await page.evaluate((h) => { location.hash = h }, hash)
}

// Fill and submit setup step 2 (brain). Does not wait for the outcome.
export async function submitBrain(page, { password = STUDENT.password, email = STUDENT.email } = {}) {
  await tid(page, 'brain-url').fill(BRAIN_URL)
  await tid(page, 'brain-key').fill(ANON_KEY)
  await tid(page, 'brain-email').fill(email)
  await tid(page, 'brain-password').fill(password)
  await tid(page, 'brain-connect').click()
}

export async function toBrainStep(page, name = 'Ana') {
  await goto(page)
  await expect(tid(page, 'screen-setup')).toBeVisible()
  await tid(page, 'setup-name').fill(name)
  await tid(page, 'setup-next').click()
  await expect(tid(page, 'brain-url')).toBeVisible()
}

/**
 * Complete first-run setup through the UI.
 * brain: 'connect' | 'skip'; mode: 'auto' | 'manual'
 */
export async function setup(page, { name = 'Ana', brain = 'skip', mode = 'manual', aiApp = 'claude', models = FREE_IDS, paidSearch = false } = {}) {
  await toBrainStep(page, name)
  if (brain === 'connect') {
    await submitBrain(page)
  } else {
    await tid(page, 'brain-skip').click()
  }
  // Assumption (see TEST-PLAN ambiguities): a successful connect or a skip goes straight to step 3.
  await expect(tid(page, 'ai-mode-auto')).toBeVisible()
  if (mode === 'auto') {
    await tid(page, 'ai-mode-auto').click()
    await tid(page, 'or-key').fill(OR_KEY)
    await tid(page, 'or-load-models').click()
    await expect(tid(page, 'model-select').locator('option')).toHaveCount(FREE_IDS.length)
    await tid(page, 'model-select').selectOption(models)
    if (paidSearch) await tid(page, 'paid-search').check()
  } else {
    await tid(page, 'ai-mode-manual').click()
    await tid(page, `ai-app-${aiApp}`).click()
  }
  await tid(page, 'setup-finish').click()
  await expect(tid(page, 'screen-home')).toBeVisible()
}

export async function openTool(page, id) {
  await tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`)).click()
  await expect(tid(page, 'screen-tool')).toBeVisible()
}

export async function fillHello(page, { topic = 'pricing', depth = 'Quick' } = {}) {
  await tid(page, 'field-topic').fill(topic)
  await tid(page, 'field-depth').selectOption(depth)
}

export async function installRecipe(page, text) {
  await setHash(page, '#/add')
  await expect(tid(page, 'screen-add')).toBeVisible()
  await tid(page, 'recipe-paste').fill(text)
  await tid(page, 'recipe-check').click()
  await expect(tid(page, 'install-summary')).toBeVisible()
  await tid(page, 'install-btn').click()
  await expect(tid(page, 'installed-notice')).toBeVisible()
  await setHash(page, '#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
}

export async function localStorageDump(page) {
  return page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))))
}

export async function noHorizontalScroll(page, label) {
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  expect(m.sw, `horizontal scroll on ${label}: scrollWidth ${m.sw} > clientWidth ${m.cw}`).toBeLessThanOrEqual(m.cw)
}

// Visible buttons smaller than 44x44 CSS px.
export async function smallTapTargets(page) {
  return page.evaluate(() => {
    const els = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]')
    const out = []
    for (const el of els) {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      if (r.width === 0 || r.height === 0 || s.visibility === 'hidden' || s.display === 'none') continue
      if (r.width < 44 || r.height < 44) out.push(`${el.dataset.testid || el.textContent.trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`)
    }
    return out
  })
}
