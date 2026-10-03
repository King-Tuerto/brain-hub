// PLAN "PWA": manifest and service worker.
import { test, expect } from '../helpers/fixtures.mjs'
import { tid } from '../helpers/hub.mjs'

test('manifest is linked and correct; icons exist', async ({ page, request }) => {
  await page.goto('./')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href, 'manifest link').toBeTruthy()
  expect(href.startsWith('/') || /^https?:/.test(href), 'manifest href must be relative').toBe(false)
  const url = new URL(href, page.url()).toString()
  const res = await request.get(url)
  expect(res.status()).toBe(200)
  const m = JSON.parse(await res.text())
  expect(m.start_url).toBe('./')
  expect(m.scope).toBe('./')
  expect(m.display).toBe('standalone')
  expect(m.name || m.short_name).toBeTruthy()
  for (const size of ['192x192', '512x512']) {
    const icon = (m.icons || []).find((i) => i.sizes === size && i.type === 'image/png')
    expect(icon, `PNG icon ${size}`).toBeTruthy()
    const ir = await request.get(new URL(icon.src, url).toString())
    expect(ir.status()).toBe(200)
    expect(ir.headers()['content-type']).toBe('image/png')
    const buf = await ir.body()
    expect(buf.subarray(1, 4).toString('latin1')).toBe('PNG')
    const [w, h] = [buf.readUInt32BE(16), buf.readUInt32BE(20)]
    expect(`${w}x${h}`).toBe(size)
  }
})

test.describe('service worker', () => {
  test.use({ serviceWorkers: 'allow' })

  test('registers from a relative path with scope /brain-hub/; caches only same-origin shell files', async ({ page, browserName }) => {
    await page.goto('./')
    await expect(tid(page, 'screen-setup')).toBeVisible()
    const supported = await page.evaluate(() => 'serviceWorker' in navigator)
    test.skip(!supported, `${browserName} in Playwright exposes no navigator.serviceWorker here`)
    const reg = await page.evaluate(async () => {
      const r = await navigator.serviceWorker.ready
      return { scope: r.scope, script: (r.active || r.waiting || r.installing).scriptURL }
    })
    expect(reg.scope).toBe('http://localhost:4173/brain-hub/')
    expect(reg.script).toBe('http://localhost:4173/brain-hub/sw.js')
    // let it install, then look at what it cached
    await page.reload()
    await expect(tid(page, 'screen-setup')).toBeVisible()
    const cached = await page.evaluate(async () => {
      const out = []
      for (const k of await caches.keys()) for (const req of await (await caches.open(k)).keys()) out.push(req.url)
      return out
    })
    expect(cached.length, 'the app shell is cached').toBeGreaterThan(0)
    expect(cached.some((u) => u.endsWith('/brain-hub/') || u.endsWith('/brain-hub/index.html'))).toBe(true)
    for (const u of cached) {
      expect(u.startsWith('http://localhost:4173/brain-hub/'), `cross-origin cached: ${u}`).toBe(true)
      expect(u, 'plugins/ must never be cached').not.toContain('/brain-hub/plugins/')
      expect(u, 'core/tools/ must never be cached').not.toContain('/brain-hub/core/tools/')
    }
  })

  test('offline: the shell still loads from cache', async ({ page, context, browserName }) => {
    await page.goto('./')
    await expect(tid(page, 'screen-setup')).toBeVisible()
    const supported = await page.evaluate(() => 'serviceWorker' in navigator)
    test.skip(!supported, `${browserName} in Playwright exposes no navigator.serviceWorker here`)
    // Playwright's WebKit build fails page.reload() under setOffline with an internal error
    // (not proven to be the app's fault either). Offline on a real iPhone is on PILOT-CHECKLIST.
    test.skip(browserName === 'webkit', 'Playwright WebKit cannot reload while offline (internal error)')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.reload()
    await expect(tid(page, 'screen-setup')).toBeVisible()
    await context.setOffline(true)
    await page.reload()
    await expect(tid(page, 'screen-setup')).toBeVisible()
    await context.setOffline(false)
  })
})
