// Phase 3 PLAN "Tests Nitpick writes" → E2E, in every project, against the
// local stand-in brain (Express's real migration in PGlite). No real network:
// the shared network guard and CSP check from helpers/fixtures.mjs still apply.
//
// Tests that replay the real Deere answer FAIL with "answer.md missing" until
// tests/fixtures/real-run/deere/answer.md exists. The same flows also run with
// a synthetic answer, so the mechanism is proven independently of it.
import { test as base, expect } from '../helpers/fixtures.mjs'
import { tid, toBrainStep, openTool, noHorizontalScroll } from '../helpers/hub.mjs'
import { NO_BRAIN_TEXT } from '../helpers/contract.mjs'
import { checkSources } from '../../core/lib/output.js'
import { StandinBrain, STANDIN_URL, STANDIN_KEY, STANDIN_USER } from '../standin/brain-standin.mjs'
import { INPUTS, PROMPT, readAnswer, GOOD_ANSWER, GOOD_SUMMARY, WEAK_ANSWER, WEAK_UNSOURCED, RULES_ANSWER } from '../helpers/phase3.mjs'

const NOTES_HEADER = 'What I already have in my notes about this company:'
// DECISIONS #13, spelled out from the contract (not imported from core).
const CONTEXT_LINE = 'Company Analysis: Deere & Company (NYSE: DE) · Construction & Forestry · Class assignment'

// A fresh stand-in per test (~1.2–1.7 s to build; measured), so tests never share rows.
const test = base.extend({
  standin: async ({ context, net }, use) => {
    void net // the guard's catch-all route must be registered first, so ours wins
    const s = await StandinBrain.create()
    await s.attach(context)
    await use(s)
  },
})

async function connectStandin(page) {
  await toBrainStep(page, 'Ana')
  await tid(page, 'brain-url').fill(STANDIN_URL)
  await tid(page, 'brain-key').fill(STANDIN_KEY)
  await tid(page, 'brain-email').fill(STANDIN_USER.email)
  await tid(page, 'brain-password').fill(STANDIN_USER.password)
  await tid(page, 'brain-connect').click()
  await expect(tid(page, 'ai-mode-manual')).toBeVisible()
  await tid(page, 'ai-mode-manual').click()
  await tid(page, 'ai-app-claude').click()
  await tid(page, 'setup-finish').click()
  await expect(tid(page, 'screen-home')).toBeVisible()
  await expect(tid(page, 'brain-badge')).toHaveText('Brain connected')
}

async function runDeere(page, { inputs = INPUTS, again = false } = {}) {
  await openTool(page, 'company-analysis')
  if (again) await tid(page, 'clear-run').click() // "the next time the tool runs": a fresh run
  await tid(page, 'field-company').fill(inputs.company)
  await tid(page, 'field-focus_unit').fill(inputs.focus_unit)
  await tid(page, 'field-purpose').selectOption(inputs.purpose)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  return tid(page, 'prompt-box').inputValue()
}

async function useAnswer(page, text) {
  await tid(page, 'answer-box').fill(text)
  await tid(page, 'use-answer').click()
  await expect(tid(page, 'result')).toBeVisible()
}

async function save(page) {
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-summary')).toBeVisible()
  const summary = await tid(page, 'save-summary').inputValue()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  return summary
}

// Calls the stand-in's search-brain from the page, with the hub's own session,
// exactly as the hub would (Authorization: Bearer <access_token>).
async function searchStandin(page, query) {
  return page.evaluate(async ({ url, key, query }) => {
    const s = JSON.parse(localStorage.getItem('hub.session'))
    const r = await fetch(`${url}/functions/v1/search-brain`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 10 }),
    })
    return { status: r.status, body: await r.json() }
  }, { url: STANDIN_URL, key: STANDIN_KEY, query })
}

async function expectSourceCheckOk(page) {
  await expect(tid(page, 'source-check')).toBeVisible()
  await expect(tid(page, 'source-check')).toContainText(/^All \d+ factual claims have a source or are marked \[unverified\]\./)
  await expect(tid(page, 'unsourced-list')).toHaveCount(0)
}

// ---------------------------------------------------------------- Setup

test('setup: connects to the stand-in; the open check passes from the real RLS', async ({ page, standin }) => {
  await connectStandin(page)
  const probe = standin.log.find((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts')
  expect(probe.json).toEqual({ content: null })
  // That exact insert, replayed as anon, is refused by Express's RLS (42501 → "locked").
  await expect(standin.as('anon', null, `INSERT INTO thoughts (content) VALUES (NULL)`)).rejects.toMatchObject({ code: '42501' })
  // Not an Express-older brain: the search-brain probe answered, so connect went on to sign in.
  expect(standin.log.some((e) => e.method === 'OPTIONS' && e.path === '/functions/v1/search-brain')).toBe(true)
  expect(standin.log.some((e) => e.path === '/auth/v1/token' && e.search === '?grant_type=password')).toBe(true)
  expect(await standin.hubRows()).toEqual([])
})

// ---------------------------------------------------------------- Real Deere run

// DECISIONS #15 bar: every unsourced claim appears in source-check, and at
// least 95% of claims are sourced or [unverified]. Run 3 has exactly two
// unsourced claims, the "What it sells" bullets in Business units.
test('real run: prompt-box equals prompt.md; answer.md renders, every unsourced claim is listed, >= 95% sourced', async ({ page, standin }) => {
  void standin
  const answer = readAnswer() // fails with "answer.md missing" until it lands
  const sc = checkSources(answer)
  expect((sc.sourced + sc.unverified) / sc.claims, 'share sourced or [unverified]').toBeGreaterThanOrEqual(0.95)
  await connectStandin(page)
  expect(await runDeere(page)).toBe(PROMPT)
  await useAnswer(page, answer)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  await expect(tid(page, 'no-sources-warning')).toHaveCount(0)
  await expect(tid(page, 'source-check')).toContainText(`${sc.unsourced.length} of ${sc.claims} claims have no source`)
  const shown = tid(page, 'unsourced-list').locator('li')
  await expect(shown).toHaveText(sc.unsourced.map((u) => {
    const t = u.text.length > 160 ? u.text.slice(0, 160) + '…' : u.text
    return `${u.section}: ${t}`
  }))
  // Pinned independently of checkSources, so a checker change can't move both sides at once.
  await expect(shown).toHaveCount(2)
  for (const li of await shown.all()) await expect(li).toHaveText(/^Business units: What it sells: /)
})

test('real run: save, then found again on Home, by search for "Deere", and in the next prompt', async ({ page, standin }) => {
  const answer = readAnswer()
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, answer)
  const summary = await save(page)

  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  const hub = rows[0].metadata.hub
  expect(rows[0].content).toBe(`${summary}\n\n${CONTEXT_LINE}`)
  expect(hub).toMatchObject({ tool: 'company-analysis', tool_version: '1.0.0', type: 'work_product', report: answer.trim(), archived: false })
  expect(hub.tags).toEqual(expect.arrayContaining(['company-analysis', 'deere & company (nyse: de)']))
  expect(hub.sources.length).toBeGreaterThanOrEqual(10)
  const sc = checkSources(answer)
  expect(hub.source_check).toEqual({ claims: sc.claims, sourced: sc.sourced, unverified: sc.unverified, unsourced: sc.unsourced.length })
  expect(hub.source_check.unsourced).toBe(2)

  await page.goto('./#/home')
  await expect(tid(page, 'recent-item').first()).toContainText(summary.slice(0, 60))

  const found = await searchStandin(page, 'Deere')
  expect(found.status).toBe(200)
  expect(found.body.results.map((r) => r.id)).toContain(rows[0].id)

  const prompt = await runDeere(page, { again: true })
  const notes = prompt.split(NOTES_HEADER + '\n')[1]
  expect(notes, 'the saved Deere analysis was not pulled into the next prompt').not.toMatch(/^\(No personal notes available\.\)/)
  expect(notes.startsWith('- (')).toBe(true)
  expect(notes).toContain(summary.replace(/\s+/g, ' ').trim().slice(0, 120))
})

// ---------------------------------------------------------------- Same flows, synthetic answer

test('synthetic answer: prompt has no notes on an empty brain; result passes the source check', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  const prompt = await runDeere(page)
  expect(prompt).toContain(`${NOTES_HEADER}\n${NO_BRAIN_TEXT}`)
  await useAnswer(page, GOOD_ANSWER)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  await expect(tid(page, 'source-check')).toHaveText('All 8 factual claims have a source or are marked [unverified]. 1 marked [unverified].')
})

test('synthetic answer: saved row has tool, version, tags, report, sources and source_check', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, GOOD_ANSWER)
  expect(await save(page)).toBe(GOOD_SUMMARY)
  const rows = await standin.hubRows()
  expect(rows).toHaveLength(1)
  // DECISIONS #13: the student edits only the summary; the context line is added at save.
  expect(rows[0].content).toBe(`${GOOD_SUMMARY}\n\n${CONTEXT_LINE}`)
  const hub = rows[0].metadata.hub
  expect(hub).toMatchObject({
    tool: 'company-analysis', tool_version: '1.0.0', type: 'work_product', report: GOOD_ANSWER.trim(), archived: false,
    source_check: { claims: 8, sourced: 7, unverified: 1, unsourced: 0 },
  })
  expect(hub.tags).toEqual(['company-analysis', 'deere & company (nyse: de)'])
  expect(hub.sources).toContain('https://example.com/deere/10k')
  // The row really went through Express: owned by the signed-in user, dedup key set by its trigger.
  const r = await standin.db.query(`SELECT user_id, dedup_key = md5(content) AS keyed FROM thoughts WHERE id = $1`, [rows[0].id])
  expect(r.rows[0]).toEqual({ user_id: STANDIN_USER.id, keyed: true })
})

test('synthetic answer: found again on Home, by search for "Deere", and in the next Deere prompt', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, GOOD_ANSWER)
  await save(page)

  await page.goto('./#/home')
  await expect(tid(page, 'recent-item')).toHaveCount(1)
  await expect(tid(page, 'recent-item')).toContainText(GOOD_SUMMARY)
  await expect(tid(page, 'recent-item')).toContainText('company-analysis')

  const found = await searchStandin(page, 'Deere')
  expect(found.status).toBe(200)
  expect(found.body.results.map((r) => r.content)).toEqual([`${GOOD_SUMMARY}\n\n${CONTEXT_LINE}`])

  const prompt = await runDeere(page, { again: true })
  expect(prompt).toContain(`${NOTES_HEADER}\n- (`)
  expect(prompt).toContain(`) ${GOOD_SUMMARY}`)
  expect(prompt).not.toContain(NO_BRAIN_TEXT)
})

// ---------------------------------------------------------------- Saving twice, weak answer

test('saving twice: identical summary leaves one row (Express unique index), both saves succeed', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, GOOD_ANSWER)
  await save(page)
  await tid(page, 'save-confirm').click()
  await expect.poll(() => standin.log.filter((e) => e.method === 'POST' && e.path === '/rest/v1/thoughts' && e.json?.source === 'brain-hub').length).toBe(2)
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  await expect(tid(page, 'save-status')).not.toContainText('Could not save')
  expect(await standin.hubRows()).toHaveLength(1)
  const n = await standin.db.query(`SELECT count(*)::int AS n FROM thoughts`)
  expect(n.rows[0].n).toBe(1)
})

test('weak answer: source-check warns and lists every unsourced claim', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, WEAK_ANSWER)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  const check = tid(page, 'source-check')
  await expect(check).toBeVisible()
  await expect(check).toContainText('4 of 7 claims have no source')
  await expect(tid(page, 'unsourced-list').locator('li')).toHaveText(WEAK_UNSOURCED.map((u) => `${u.section}: ${u.text}`))
})

test('weak answer: a claim longer than 160 characters is cut in the list', async ({ page, standin }) => {
  void standin
  const long = 'Deere ' + 'x'.repeat(200)
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, `## Company snapshot\n- ${long}\n\n## Summary\nS`)
  await expect(tid(page, 'unsourced-list').locator('li')).toHaveText(`Company snapshot: ${long.slice(0, 160)}…`)
})

test('PLAN §2a rules in the browser: labels, inherited sources, Note: lines and [unverified …] give source-check ok', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, RULES_ANSWER)
  await expect(tid(page, 'missing-sections')).toHaveCount(0)
  await expectSourceCheckOk(page)
  await expect(tid(page, 'source-check')).toContainText('1 marked [unverified].')
  await save(page)
  const [row] = await standin.hubRows()
  expect(row.metadata.hub.source_check).toMatchObject({ unverified: 1, unsourced: 0 })
})

test('no claims at all (N = 0): source-check is not shown', async ({ page, standin }) => {
  void standin
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, '## Company snapshot\n- What is Deere?\n\n## Summary\nNothing to check.')
  await expect(tid(page, 'missing-sections')).toBeVisible()
  await expect(tid(page, 'source-check')).toHaveCount(0)
})

// Nitpick A4 / DECISIONS #13: keyword-only search ANDs every query word, and the
// next run's query is the company exactly as typed. A summary that never names
// the ticker must still be found, through the context line added at save.
const PLAIN = 'Deere is growing its construction business while farm equipment sales fall.'

test('A4: a summary without the ticker is re-found by the next run (keyword-only stand-in search)', async ({ page, standin }) => {
  expect(PLAIN).not.toMatch(/NYSE|\bDE\b|Company/)
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, GOOD_ANSWER)
  await tid(page, 'save-btn').click()
  await tid(page, 'save-summary').fill(PLAIN)
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  const [row] = await standin.hubRows()
  expect(row.content).toBe(`${PLAIN}\n\n${CONTEXT_LINE}`)

  // The exact query the hub sends finds it, keyword-only.
  const found = await searchStandin(page, INPUTS.company)
  expect(found.body.mode).toBe('keyword')
  expect(found.body.results.map((r) => r.id)).toEqual([row.id])

  await page.goto('./#/home')
  const prompt = await runDeere(page, { again: true })
  expect(prompt).toContain(`${NOTES_HEADER}\n- (`)
  expect(prompt).toContain(`) ${PLAIN} ${CONTEXT_LINE}`)
  expect(prompt).not.toContain(NO_BRAIN_TEXT)
})

test('A4 control: the same summary without the context line is NOT found (stand-in search is AND)', async ({ page, standin }) => {
  await connectStandin(page)
  await standin.db.query(`INSERT INTO thoughts (user_id, source, content, metadata) VALUES ($1, 'brain-hub', $2, '{}'::jsonb)`, [STANDIN_USER.id, PLAIN])
  const found = await searchStandin(page, INPUTS.company)
  expect(found.status).toBe(200)
  expect(found.body.results).toEqual([])
})

test('DECISIONS #14: same summary + same inputs saved twice is one row, and the latest report wins', async ({ page, standin }) => {
  await connectStandin(page)
  await runDeere(page)
  await useAnswer(page, GOOD_ANSWER)
  await save(page)
  const second = GOOD_ANSWER.replace('Revenue was about $51bn', 'Revenue was about $45.7bn')
  expect(second).not.toBe(GOOD_ANSWER)
  await tid(page, 'answer-box').fill(second)
  await tid(page, 'use-answer').click()
  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toContainText('Saved to your brain.')
  await expect.poll(async () => (await standin.hubRows())[0]?.metadata.hub.report).toBe(second.trim())
  expect(await standin.hubRows()).toHaveLength(1)
})

test('layout: the real answer, its source-check list and the save panel never scroll sideways (device size and 320px)', async ({ page, standin }) => {
  void standin
  const answer = readAnswer()
  await connectStandin(page)
  await runDeere(page)
  await noHorizontalScroll(page, 'company-analysis prompt')
  await useAnswer(page, answer)
  await tid(page, 'save-btn').click()
  await expect(tid(page, 'save-panel')).toBeVisible()
  await noHorizontalScroll(page, 'company-analysis result')
  await page.setViewportSize({ width: 320, height: 640 })
  await noHorizontalScroll(page, 'company-analysis result @320')
})
