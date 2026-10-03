// Live smoke test for the published site. Run after every merge to main, once
// GitHub Pages has rebuilt:   node tests/live-smoke.mjs
// It is not part of `npm test` (that never touches the real network).
//
// It checks what the local test server cannot: that GitHub Pages serves every
// file the hub fetches exactly as committed (see tests/unit/pages-raw.test.mjs),
// and that the app starts cleanly in laptop, iPhone and Android browsers.
import { chromium, webkit, devices } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const BASE = process.env.LIVE_URL || 'https://king-tuerto.github.io/brain-hub/'
const bust = () => `?v=${Date.now()}`
let failures = 0
const fail = (msg) => { failures++; console.log('FAIL', msg) }

// 1. Every core tool is served raw, byte-identical to the committed file.
const index = JSON.parse(await readFile(new URL('../core/tools/index.json', import.meta.url), 'utf8'))
for (const file of index) {
  const res = await fetch(`${BASE}core/tools/${file}${bust()}`)
  const local = await readFile(new URL(`../core/tools/${file}`, import.meta.url), 'utf8')
  const body = res.ok ? await res.text() : ''
  if (!res.ok) fail(`core/tools/${file}: HTTP ${res.status}`)
  else if (body.replace(/\r\n/g, '\n') !== local.replace(/\r\n/g, '\n')) fail(`core/tools/${file}: served content differs from the committed file`)
  else console.log('ok  ', `core/tools/${file}`)
}

// 2. The app starts with no errors and no failed requests on three devices,
//    and every core tool loads (no "has problems" notices, one tile each).
for (const [name, engine, opts] of [['laptop', chromium, {}], ['iphone', webkit, devices['iPhone 13']], ['android', chromium, devices['Pixel 7']]]) {
  const browser = await engine.launch()
  const page = await (await browser.newContext(opts)).newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  await page.addInitScript(() => {
    try { localStorage.setItem('hub.settings', JSON.stringify({ setupDone: true, name: 'Live check', aiMode: 'manual' })) } catch {}
  })
  await page.goto(BASE + bust(), { waitUntil: 'networkidle' })
  await page.getByTestId('screen-home').waitFor({ timeout: 20000 })
  await page.getByTestId('tool-tile').first().waitFor({ timeout: 20000 }).catch(() => {})
  const tiles = await page.getByTestId('tool-tile').count()
  const broken = await page.getByTestId('tool-broken').count()
  if (tiles !== index.length) fail(`${name}: ${tiles} tool tiles, expected ${index.length}`)
  if (broken) fail(`${name}: ${broken} tool(s) reported as broken`)
  if (errors.length) fail(`${name}: ${errors.join(' | ')}`)
  if (tiles === index.length && !broken && !errors.length) console.log('ok  ', `${name}: home shows all ${tiles} tools, no errors`)
  await browser.close()
}

console.log(failures ? `\n${failures} live check(s) FAILED` : '\nlive site OK')
process.exit(failures ? 1 : 0)
