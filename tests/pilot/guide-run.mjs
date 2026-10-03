// Runs START-HERE.md steps 3–5 on a REAL published copy of the hub, as a new
// student would, in a phone browser (iPhone/WebKit or Android/Chromium).
// Buttons are found by the words the guide tells students to tap, not by test
// ids, so this also proves the guide's wording matches the app.
//
// Not part of `npm test` (real network). The "AI app" steps happen outside:
// stage `prompt` saves what the student would copy; an AI answers it; stage
// `answer` pastes the answer back, and so on. The phone's storage persists
// between stages in a profile folder, as the installed app would.
//
//   node tests/pilot/guide-run.mjs <stage> <outDir> [--device iphone|android] [--brain standin]
//   stages: setup | prompt | answer | check | finish
import { webkit, chromium, devices } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const [stage, outDirArg, ...rest] = process.argv.slice(2)
const opt = (name, dflt) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : dflt }
const device = opt('device', 'iphone')
const useBrain = opt('brain', 'none') === 'standin'
const URL_ = process.env.LIVE_URL || 'https://king-tuerto.github.io/brain-hub-pilot-test/'
const outDir = resolve(outDirArg)
const input = JSON.parse(await readFile(resolve(outDir, 'inputs.json'), 'utf8'))
await mkdir(resolve(outDir, `profile-${device}`), { recursive: true })

const engine = device === 'iphone' ? webkit : chromium
const ctx = await engine.launchPersistentContext(resolve(outDir, `profile-${device}`), {
  ...devices[device === 'iphone' ? 'iPhone 13' : 'Pixel 7'],
  acceptDownloads: true,
  ...(device === 'android' ? { permissions: ['clipboard-read', 'clipboard-write'] } : {}),
})
let standin = null
if (useBrain) {
  const { StandinBrain } = await import('../standin/brain-standin.mjs')
  standin = await StandinBrain.create()
  // Restore what earlier stages saved, so the stand-in survives between runs like a real brain.
  try {
    const rows = JSON.parse(await readFile(resolve(outDir, `standin-${device}.json`), 'utf8'))
    for (const r of rows) {
      await standin.db.query(`INSERT INTO thoughts (id, user_id, source, content, metadata, created_at) VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
        [r.id, '11111111-1111-4111-8111-111111111111', r.source, r.content, JSON.stringify(r.metadata), r.created_at])
    }
  } catch { /* first stage */ }
  // This run uses the real clock (not the test suite's fixed one), and the
  // stand-in restarts between stages; a real brain keeps its sessions. So:
  // real expiry times, and session tokens persisted across stages.
  const issue = standin.issue.bind(standin)
  standin.issue = () => { const s = issue(); s.expires_at = Math.floor(Date.now() / 1000) + 3600; return s }
  try {
    const saved = JSON.parse(await readFile(resolve(outDir, `standin-sessions-${device}.json`), 'utf8'))
    for (const [k, v] of saved.sessions) standin.sessions.set(k, v)
    for (const [k, v] of saved.refresh) standin.refresh.set(k, v)
    standin.n = saved.n
  } catch { /* first stage */ }
  await standin.attach(ctx)
}
const page = ctx.pages()[0] ?? await ctx.newPage()
const errors = []
// Playwright's screenshot() injects a <style> to hide the caret; the hub's CSP
// (correctly) refuses it and WebKit logs that. Ignore messages raised during our
// own screenshots — they are the test tool, not the app (verified 2026-10-03).
let shooting = false
page.on('pageerror', (e) => errors.push(String(e)))
const failed = []
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.request().method()} ${r.url().replace(/^https:\/\/[^/]+/, '')}`) })
page.on('console', (m) => { if (m.type() === 'error' && !(shooting && /Refused to apply a stylesheet/.test(m.text()))) errors.push(m.text()) })
const log = []
const say = (s) => { log.push(s); console.log(s) }
const btn = (name) => page.getByRole('button', { name, exact: false }).first()
const shot = async (n) => {
  shooting = true
  try { await page.screenshot({ path: resolve(outDir, `${device}-${n}.png`) }); await page.waitForTimeout(200) } finally { shooting = false }
}

await page.goto(URL_, { waitUntil: 'networkidle' })

if (stage === 'setup') {
  // Step 3 can only be checked for installability here (no real home screen in emulation).
  const manifest = await page.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); return l ? (await fetch(l.href)).json() : null })
  const sw = await page.evaluate(async () => { await new Promise((r) => setTimeout(r, 1500)); return !!(await navigator.serviceWorker?.getRegistration()) })
  say(`step 3: manifest ${manifest ? `"${manifest.name}", display=${manifest.display}, icons=${manifest.icons.length}` : 'MISSING'}; service worker ${sw ? 'registered' : 'not registered (WebKit in Playwright may not support it)'}`)
  // Step 4.1 name
  await page.getByLabel('What should we call you?').fill(input.name)
  await btn('Next').click()
  // Step 4.2 brain
  if (useBrain) {
    await page.getByLabel(/Brain address/).fill('https://standin-brain.supabase.co')
    await page.getByLabel(/Public key/).fill('sb_publishable_standin')
    await page.getByLabel(/Email/).fill('student@example.com')
    await page.getByLabel('Password').fill('standin-password')
    await btn('Connect my brain').click()
    say('step 4.2: connected to the local stand-in brain (never a real one)')
  } else {
    await btn('Skip').click()
    say('step 4.2: tapped "Skip — I don’t have a brain yet"')
  }
  // Step 4.3 AI mode
  await btn('Manual (copy and paste)').click()
  await page.getByRole('button', { name: input.aiApp, exact: true }).click()
  await btn('Finish').click()
  await page.getByText('Company Analysis').first().waitFor()
  const tiles = await page.getByTestId('tool-tile').count()
  say(`step 4: Home shows "${await page.locator('h1').first().textContent()}", ${tiles} tools, badge "${await page.getByTestId('brain-badge').textContent()}"`)
  await shot('1-home')
}

if (stage === 'prompt') {
  // Step 5.1–5.4
  await page.getByText('Company Analysis').first().click()
  await page.getByLabel('Company').fill(input.company)
  if (input.focus_unit) await page.getByLabel(/Business unit/).fill(input.focus_unit)
  await page.getByLabel('What is this for?').selectOption(input.purpose)
  await btn('Run').click()
  await btn('Copy prompt').waitFor()
  await btn('Copy prompt').click()
  await page.getByTestId('copy-status').filter({ hasText: /./ }).waitFor({ timeout: 5000 }).catch(() => {})
  const status = await page.getByTestId('copy-status').textContent()
  const prompt = await page.getByTestId('prompt-box').inputValue()
  const openApp = await page.getByRole('link', { name: /^Open / }).getAttribute('href')
  await writeFile(resolve(outDir, 'prompt.md'), prompt)
  say(`step 5.3–5.4: prompt built (${prompt.length} chars); Copy prompt says "${status}"; Open link → ${openApp}`)
  await shot('2-prompt')
}

if (stage === 'answer') {
  // Step 5.7 — "Paste answer" or long-press paste; here we type it as a long-press paste would.
  await page.getByText('Company Analysis').first().click()
  const answer = await readFile(resolve(outDir, 'answer.md'), 'utf8')
  const prompt = await page.getByTestId('prompt-box').inputValue()
  say(`step 5 (return): prompt still there after leaving the app: ${prompt === await readFile(resolve(outDir, 'prompt.md'), 'utf8')}`)
  await page.getByTestId('answer-box').fill(answer)
  await btn('Use this answer').click()
  await page.getByTestId('result').waitFor()
  const sc = await page.getByTestId('source-check').textContent().catch(() => '(no source check shown)')
  const missing = await page.getByTestId('missing-sections').count()
  say(`step 5: result shown; missing sections: ${missing ? await page.getByTestId('missing-sections').textContent() : 'none'}; source check: ${sc.replace(/\s+/g, ' ').slice(0, 200)}`)
  await btn('Check this answer').click()
  const score = await page.getByTestId('checker-score').textContent()
  const checkPrompt = await page.getByTestId('checker-prompt').inputValue()
  await writeFile(resolve(outDir, 'checker-prompt.md'), checkPrompt)
  say(`step 5 (check): ${score.trim()}; check prompt built (${checkPrompt.length} chars)`)
  await shot('3-result')
}

if (stage === 'check') {
  await page.getByText('Company Analysis').first().click()
  await page.getByTestId('result').waitFor()
  await page.getByTestId('checker-answer').fill(await readFile(resolve(outDir, 'checker-answer.md'), 'utf8'))
  await btn('Score it').click()
  const score = (await page.getByTestId('checker-score').textContent()).trim()
  const parts = (await page.getByTestId('checker-parts').textContent()).trim()
  const fixes = await page.getByTestId('checker-fixes').locator('li').allTextContents()
  say(`step 5 (check): ${score} | ${parts}`)
  say(`fixes (${fixes.length}):\n` + fixes.map((f) => '  - ' + f).join('\n'))
  await shot('4-checked')
}

if (stage === 'finish') {
  await page.getByText('Company Analysis').first().click()
  await page.getByTestId('result').waitFor()
  const dl = page.waitForEvent('download')
  await btn('Download').click()
  const file = await dl
  await file.saveAs(resolve(outDir, file.suggestedFilename()))
  say(`step 5 (keep): Download → ${file.suggestedFilename()}`)
  if (useBrain) {
    await btn('Save to brain').click()
    await page.getByTestId('save-confirm').click()
    await page.getByText('Saved to your brain.').waitFor()
    say(`step 5 (keep): Save to brain → "Saved to your brain." (stand-in)`)
    await page.goto(URL_, { waitUntil: 'networkidle' })
    const recent = await page.getByTestId('recent-item').allTextContents()
    say(`found again on Home: ${recent.length} recent item(s): ${recent.map((r) => r.slice(0, 80)).join(' | ')}`)
    const hits = await page.evaluate(async () => {
      const s = JSON.parse(localStorage.getItem('hub.session'))
      const r = await fetch('https://standin-brain.supabase.co/functions/v1/search-brain', { method: 'POST', headers: { apikey: 'sb_publishable_standin', Authorization: `Bearer ${s.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'Costco', limit: 5 }) })
      return (await r.json()).count
    })
    say(`found again by brain search "Costco": ${hits} result(s)`)
  }
  await shot('5-done')
}

if (standin) {
  await writeFile(resolve(outDir, `standin-${device}.json`), JSON.stringify(await standin.hubRows(), null, 2))
  await writeFile(resolve(outDir, `standin-sessions-${device}.json`), JSON.stringify({ sessions: [...standin.sessions], refresh: [...standin.refresh], n: standin.n }))
}
say(errors.length ? `page errors: ${errors.join(' | ')}` : 'page errors: none')
if (failed.length) say(`failed requests: ${failed.join(' | ')}`)
await writeFile(resolve(outDir, `log-${device}-${stage}.txt`), log.join('\n') + '\n')
await ctx.close()
