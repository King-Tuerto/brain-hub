// Browser tests for the hub: laptop size plus iPhone (WebKit) and Android
// (Chromium) emulation. Every external service is faked in tests/helpers.
import { defineConfig, devices } from '@playwright/test'

const clipboard = ['clipboard-read', 'clipboard-write']

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.mjs',
  retries: 0,
  reporter: 'list',
  fullyParallel: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://localhost:4173/brain-hub/',
    timezoneId: 'UTC',
    // Service workers would hide requests from the route fakes. Only the
    // PWA spec turns them on.
    serviceWorkers: 'block',
    acceptDownloads: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node tests/serve.mjs',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], permissions: clipboard } },
    { name: 'iphone-webkit', use: { ...devices['iPhone 13'] } },
    { name: 'android-chromium', use: { ...devices['Pixel 7'], permissions: clipboard } },
  ],
})
