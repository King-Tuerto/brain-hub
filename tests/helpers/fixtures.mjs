// Playwright fixtures: every test gets a network guard plus the three fakes.
// No test may reach the real network. Any request to an origin that is not
// the local test server or a fake fails the test.
import { test as base, expect } from '@playwright/test'
import { FakeBrain } from './fake-brain.mjs'
import { FakeOpenRouter } from './fake-openrouter.mjs'
import { FakeGitHub } from './fake-github.mjs'
import { FIXED_TIME } from './contract.mjs'

export const LOCAL_ORIGIN = 'http://localhost:4173'

export const test = base.extend({
  net: [async ({ context }, use) => {
    const net = { violations: [], requests: [] }
    // Registered first, so it runs last: only requests no fake handled reach it.
    await context.route(() => true, (route) => {
      const u = route.request().url()
      if (u.startsWith(`${LOCAL_ORIGIN}/`)) return route.continue()
      net.violations.push(`${route.request().method()} ${u}`)
      return route.abort('blockedbyclient')
    })
    context.on('request', (r) => {
      net.requests.push({ url: r.url(), method: r.method(), postData: r.postData(), headers: r.headers() })
    })
    await use(net)
    expect(net.violations, 'the app called an origin that is not faked').toEqual([])
  }, { auto: true }],

  brain: [async ({ context, net }, use) => {
    void net
    const b = new FakeBrain().seedDefaults()
    await b.attach(context)
    await use(b)
  }, { auto: true }],

  openrouter: [async ({ context, net }, use) => {
    void net
    const o = new FakeOpenRouter()
    await o.attach(context)
    await use(o)
  }, { auto: true }],

  github: [async ({ context, net }, use) => {
    void net
    const g = new FakeGitHub()
    await g.attach(context)
    await use(g)
  }, { auto: true }],

  page: async ({ page }, use) => {
    await page.clock.setFixedTime(new Date(FIXED_TIME))
    await use(page)
  },
})

export { expect }
