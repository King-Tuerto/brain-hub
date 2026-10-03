// Third sign-off pass: try to bypass the R1 fix (review tied to repo + recipe
// hash), and confirm R2 (connect runs once) for both click and Enter.
import { test, expect } from '../helpers/fixtures.mjs'
import { STUDENT, BRAIN_URL, ANON_KEY } from '../helpers/fake-brain.mjs'
import { GH_TOOL } from '../helpers/recipes.mjs'
import { tid, setup, setHash, toBrainStep } from '../helpers/hub.mjs'

const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))

async function setOverride(page, value) {
  await setHash(page, '#/settings')
  await expect(tid(page, 'screen-settings')).toBeVisible()
  await tid(page, 'settings-repo-override').fill(value)
  await tid(page, 'settings-repo-override').press('Enter')
  await tid(page, 'settings-repo-override').blur()
  await setHash(page, '#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
}

async function openGh(page) {
  await tile(page, 'gh-tool').click()
  await expect(tid(page, 'tool-review').or(tid(page, 'field-thing'))).toBeVisible()
  return (await tid(page, 'tool-review').count()) > 0
}

async function acceptGh(page) {
  expect(await openGh(page), 'first use must be reviewed').toBe(true)
  await tid(page, 'tool-accept').click()
  await expect(tid(page, 'field-thing')).toBeVisible()
}

async function refresh(page) {
  await setHash(page, '#/home')
  await tid(page, 'refresh-tools').click()
  await expect(tile(page, 'gh-tool')).toBeVisible()
}

test.describe('R1 bypass attempts', () => {
  test('a one-character edit to the recipe text (same id, version, permissions) is reviewed again', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await acceptGh(page)
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL.replace('Tell me about {{thing}}.', 'Tell me about {{thing}}!') })
    await refresh(page)
    expect(await openGh(page)).toBe(true)
  })

  test('the identical recipe text from a different repo is reviewed again', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('mallory', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await acceptGh(page)
    await setOverride(page, 'mallory/hub')
    expect(await openGh(page)).toBe(true)
  })

  test('a look-alike repo name (carol/hub2, carol-x/hub) is reviewed again', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('carol', 'hub2', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('carol-x', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await acceptGh(page)
    for (const other of ['carol/hub2', 'carol-x/hub']) {
      await setOverride(page, other)
      expect(await openGh(page), other).toBe(true)
    }
  })

  test('case and whitespace variants of the SAME repo keep the acceptance (GitHub names are case-insensitive)', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('Carol', 'Hub', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('CAROL', 'HUB', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await acceptGh(page)
    for (const v of ['Carol/Hub', '  CAROL/HUB  ']) {
      await setOverride(page, v)
      expect(await openGh(page), JSON.stringify(v)).toBe(false)
    }
  })

  test('reverting an edited recipe to the accepted text needs no new review; the edited text still does', async ({ page, github }) => {
    const edited = GH_TOOL.replace('permissions: [run_ai]', 'permissions: [search_brain, run_ai]').replace('output:', 'brain_context:\n  query: "{{thing}}"\noutput:')
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await acceptGh(page)
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': edited })
    await refresh(page)
    expect(await openGh(page)).toBe(true)
    await expect(tid(page, 'tool-review').getByTestId('summary-warning')).toBeVisible() // escalation is shown
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await refresh(page)
    expect(await openGh(page)).toBe(false)
  })

  test('acceptance is stored as repo|sha256(text), with no tool text or id-only keys', async ({ page, github }) => {
    github.repo('Carol', 'Hub', { 'gh-tool.recipe.md': GH_TOOL }) // the fake is case-sensitive; real GitHub is not
    await setup(page)
    await setOverride(page, 'Carol/Hub')
    await acceptGh(page)
    const acks = await page.evaluate(() => JSON.parse(localStorage.getItem('hub.toolAcks')))
    const expected = await page.evaluate(async (t) => {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))
      return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
    }, GH_TOOL)
    expect(Object.keys(acks)).toEqual([`carol/hub|${expected}`])
  })
})

test.describe('R2: connect runs exactly once', () => {
  for (const how of ['click', 'Enter in the password field']) {
    test(`locked brain via ${how}: one probe, one sign-in`, async ({ page, brain }) => {
      await toBrainStep(page)
      await tid(page, 'brain-url').fill(BRAIN_URL)
      await tid(page, 'brain-key').fill(ANON_KEY)
      await tid(page, 'brain-email').fill(STUDENT.email)
      await tid(page, 'brain-password').fill(STUDENT.password)
      if (how === 'click') await tid(page, 'brain-connect').click()
      else await tid(page, 'brain-password').press('Enter')
      await expect(tid(page, 'ai-mode-auto')).toBeVisible()
      expect(brain.requests((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts')).toHaveLength(1)
      expect(brain.authRequests()).toHaveLength(1)
    })

    test(`secret key via ${how}: the refusal stays visible and nothing is sent`, async ({ page, brain }) => {
      await toBrainStep(page)
      await tid(page, 'brain-url').fill(BRAIN_URL)
      await tid(page, 'brain-key').fill('sb_secret_fakeE2E0000')
      await tid(page, 'brain-email').fill(STUDENT.email)
      await tid(page, 'brain-password').fill(STUDENT.password)
      if (how === 'click') await tid(page, 'brain-connect').click()
      else await tid(page, 'brain-password').press('Enter')
      await expect(tid(page, 'brain-refused')).toBeVisible()
      await expect(tid(page, 'brain-refused')).toContainText(/rotate/i)
      await expect(tid(page, 'brain-status')).not.toContainText('Fill in all four boxes')
      expect(brain.requests()).toEqual([])
    })

    test(`wrong address via ${how}: the supabase.co message stays`, async ({ page, brain }) => {
      await toBrainStep(page)
      await tid(page, 'brain-url').fill('https://my-brain.example.com')
      await tid(page, 'brain-key').fill(ANON_KEY)
      await tid(page, 'brain-email').fill(STUDENT.email)
      await tid(page, 'brain-password').fill(STUDENT.password)
      if (how === 'click') await tid(page, 'brain-connect').click()
      else await tid(page, 'brain-password').press('Enter')
      await expect(tid(page, 'brain-status')).toContainText('supabase.co')
      await expect(tid(page, 'brain-status')).not.toContainText('Fill in all four boxes')
      expect(brain.requests()).toEqual([])
    })
  }

  test('a double click while the check is running still makes one probe', async ({ page, brain }) => {
    await toBrainStep(page)
    await tid(page, 'brain-url').fill(BRAIN_URL)
    await tid(page, 'brain-key').fill(ANON_KEY)
    await tid(page, 'brain-email').fill(STUDENT.email)
    await tid(page, 'brain-password').fill(STUDENT.password)
    await tid(page, 'brain-connect').dblclick()
    await expect(tid(page, 'ai-mode-auto')).toBeVisible()
    expect(brain.requests((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts')).toHaveLength(1)
    expect(brain.authRequests()).toHaveLength(1)
  })
})
