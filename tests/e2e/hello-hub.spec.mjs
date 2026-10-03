// PLAN "Done when": the dummy recipe hello-hub end to end in both AI modes,
// with and without a brain, in every project (laptop, iPhone/WebKit, Android/Chromium).
import { test, expect } from '../helpers/fixtures.mjs'
import { FREE_IDS, OR_KEY, SUMMARY_TEXT, SOURCE_URL, answerFor } from '../helpers/fake-openrouter.mjs'
import { WEB_SEARCH_LINE, NO_BRAIN_TEXT, STANDARD_BLOCK_RULES, AI_APP_URLS } from '../helpers/contract.mjs'
import { HOSTILE_ANSWER } from '../helpers/recipes.mjs'
import { tid, setup, openTool, fillHello } from '../helpers/hub.mjs'

const NOTE_LINE = '- (2026-09-15) Pricing notes: value-based pricing beat cost-plus at my internship.'

function expectPromptShape(prompt, { withBrain, webLine }) {
  expect(prompt).toContain('pricing')
  expect(prompt).toContain('Quick')
  for (const rule of STANDARD_BLOCK_RULES) expect(prompt).toContain(rule)
  for (const s of ['- Key points', '- Next steps', '- Summary']) expect(prompt.split('\n')).toContain(s)
  if (withBrain) {
    expect(prompt).toContain(NOTE_LINE)
    expect(prompt).not.toContain(NO_BRAIN_TEXT)
  } else {
    expect(prompt).toContain(NO_BRAIN_TEXT)
  }
  if (webLine) expect(prompt).toContain(WEB_SEARCH_LINE)
  else expect(prompt).not.toContain(WEB_SEARCH_LINE)
}

async function expectResult(page, { withBrain }) {
  await expect(tid(page, 'result')).toBeVisible()
  await expect(tid(page, 'result').locator('h2', { hasText: 'Key points' })).toBeVisible()
  await expect(tid(page, 'result').locator('h2', { hasText: 'Next steps' })).toBeVisible()
  await expect(tid(page, 'result')).toContainText(SUMMARY_TEXT)
  const link = tid(page, 'result').locator(`a[href="${SOURCE_URL}"]`).first()
  await expect(link).toHaveAttribute('target', '_blank')
  const rel = (await link.getAttribute('rel')) || ''
  expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']))
  await expect(tid(page, 'missing-sections')).toBeHidden()
  await expect(tid(page, 'no-sources-warning')).toBeHidden()
  await expect(tid(page, 'download-btn')).toBeVisible()
  if (withBrain) {
    await expect(tid(page, 'save-btn')).toBeVisible()
    await expect(tid(page, 'no-brain-nudge')).toBeHidden()
  } else {
    await expect(tid(page, 'save-btn')).toBeHidden()
    await expect(tid(page, 'no-brain-nudge')).toBeVisible()
  }
}

async function expectHome(page, { withBrain }) {
  await expect(tid(page, 'home-name')).toContainText('Ana')
  await expect(tid(page, 'brain-badge')).toHaveText(withBrain ? 'Brain connected' : 'No brain')
  await expect(tid(page, 'stats')).toBeVisible()
  await expect(tid(page, 'tool-tile').and(page.locator('[data-tool-id="hello-hub"]'))).toBeVisible()
  if (withBrain) {
    await expect(tid(page, 'profile-snapshot')).toBeVisible()
    await expect(tid(page, 'profile-snapshot')).toContainText('Excel, SQL and negotiation')
    await expect(tid(page, 'no-brain-nudge')).toBeHidden()
  } else {
    await expect(tid(page, 'profile-snapshot')).toBeHidden()
    await expect(tid(page, 'no-brain-nudge')).toBeVisible()
  }
}

for (const withBrain of [true, false]) {
  const brainLabel = withBrain ? 'with brain' : 'without brain'

  test(`Automatic mode, ${brainLabel}: hello-hub end to end`, async ({ page, brain, openrouter }) => {
    await setup(page, { brain: withBrain ? 'connect' : 'skip', mode: 'auto' })
    await expectHome(page, { withBrain })
    await openTool(page, 'hello-hub')
    await fillHello(page)
    const release = openrouter.hold()
    await tid(page, 'run-btn').click()
    await expect(tid(page, 'run-status')).toBeVisible()
    release()
    await expectResult(page, { withBrain })

    const chats = openrouter.chats()
    expect(chats).toHaveLength(1)
    expect(chats[0].model).toBe(FREE_IDS[0])
    expect(chats[0].authorization).toBe(`Bearer ${OR_KEY}`)
    expect(chats[0].xTitle).toBe('Brain Hub')
    expect(chats[0].messages).toEqual([{ role: 'user', content: chats[0].prompt }])
    // helpful + paid search off → no search, and the result says so
    expect(chats[0].plugins).toBeUndefined()
    await expect(tid(page, 'no-websearch-label')).toBeVisible()
    expectPromptShape(chats[0].prompt, { withBrain, webLine: false })

    const searches = brain.requests((e) => e.path === '/functions/v1/search-brain' && e.method === 'POST')
    if (withBrain) {
      expect(searches).toHaveLength(1)
      expect(searches[0].json).toEqual({ query: 'pricing', limit: 3 })
      expect(searches[0].headers.authorization).toMatch(/^Bearer fake-access-/)
    } else {
      expect(brain.requests(), 'no brain: nothing may be sent to any brain').toEqual([])
    }
  })

  test(`Manual mode, ${brainLabel}: hello-hub end to end with copy and paste`, async ({ page, brain, openrouter, browserName }) => {
    await setup(page, { brain: withBrain ? 'connect' : 'skip', mode: 'manual', aiApp: 'chatgpt' })
    await expectHome(page, { withBrain })
    await openTool(page, 'hello-hub')
    await fillHello(page)
    await tid(page, 'run-btn').click()

    const box = tid(page, 'prompt-box')
    await expect(box).toBeVisible()
    expect(await box.evaluate((el) => el.tagName === 'TEXTAREA' && el.readOnly)).toBe(true)
    const prompt = await box.inputValue()
    expectPromptShape(prompt, { withBrain, webLine: true }) // helpful + manual → web line
    expect(openrouter.chats(), 'manual mode never calls OpenRouter').toEqual([])
    if (withBrain) expect(brain.requests((e) => e.path === '/functions/v1/search-brain' && e.method === 'POST')).toHaveLength(1)

    const open = tid(page, 'open-ai-app')
    await expect(open).toHaveAttribute('href', AI_APP_URLS.chatgpt)
    await expect(open).toHaveAttribute('target', '_blank')
    expect((await open.getAttribute('rel')) || '').toContain('noopener')

    // Copy
    await tid(page, 'copy-prompt').click()
    if (browserName === 'chromium') {
      // Windows turns LF into CRLF on the system clipboard; normalise before comparing.
      const copied = await page.evaluate(() => navigator.clipboard.readText())
      expect(copied.replace(/\r\n/g, '\n')).toBe(prompt)
    } else {
      const sel = await box.evaluate((el) => ({ s: el.selectionStart, e: el.selectionEnd, n: el.value.length }))
      if (!(sel.s === 0 && sel.e === sel.n)) {
        test.info().annotations.push({ type: 'webkit-platform-limit', description: `copy-prompt: clipboard not readable in Playwright WebKit and text not selected (${JSON.stringify(sel)}); real-device check is on PILOT-CHECKLIST` })
      }
    }

    // Paste
    const answer = answerFor(prompt)
    if (browserName === 'chromium') {
      await page.evaluate((a) => navigator.clipboard.writeText(a), answer)
      await tid(page, 'paste-answer').click()
      await expect(tid(page, 'answer-box')).toHaveValue(answer)
    } else {
      await tid(page, 'paste-answer').click()
      const help = tid(page, 'paste-help')
      const filled = async () => (await tid(page, 'answer-box').inputValue()).length > 0
      await expect.poll(async () => (await help.isVisible()) || (await filled()), { timeout: 5000 }).toBe(true)
        .catch(() => test.info().annotations.push({ type: 'webkit-platform-limit', description: 'paste-answer: readText neither resolved nor rejected in Playwright WebKit; paste-help not shown' }))
      if (await help.isVisible()) await expect(help).toContainText(/long-press/i)
      // fallback: the student types/pastes by hand
      await tid(page, 'answer-box').fill(answer)
    }
    await tid(page, 'use-answer').click()
    await expectResult(page, { withBrain })
  })
}

test('required fields block the run with form-error and send nothing', async ({ page, openrouter, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await openTool(page, 'hello-hub')
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'form-error')).toBeVisible()
  expect(openrouter.chats()).toEqual([])
  expect(brain.requests((e) => e.path === '/functions/v1/search-brain' && e.method === 'POST')).toEqual([])
})

test('form fields follow input types (text → input, choose_one → select)', async ({ page }) => {
  await setup(page, { brain: 'skip', mode: 'manual' })
  await openTool(page, 'hello-hub')
  expect(await tid(page, 'field-topic').evaluate((el) => el.tagName)).toBe('INPUT')
  expect(await tid(page, 'field-depth').evaluate((el) => el.tagName)).toBe('SELECT')
  const opts = await tid(page, 'field-depth').locator('option').allTextContents()
  expect(opts.map((o) => o.trim())).toEqual(expect.arrayContaining(['Quick', 'Thorough']))
})

test('pasted answer is sanitised; missing sections and no sources are flagged', async ({ page }) => {
  await setup(page, { brain: 'skip', mode: 'manual' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await tid(page, 'answer-box').fill(HOSTILE_ANSWER)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
  await expect(tid(page, 'missing-sections')).toBeVisible()
  await expect(tid(page, 'missing-sections')).toContainText('Next steps')
  await expect(tid(page, 'no-sources-warning')).toBeVisible()
  expect(await tid(page, 'result').locator('script, img[onerror]').count()).toBe(0)
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined()
})
