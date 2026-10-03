// Renders icon.svg to the PNG sizes the web app manifest needs. Re-run after editing icon.svg.
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const svg = await readFile(new URL('../icon.svg', import.meta.url), 'utf8')
const browser = await chromium.launch()
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<style>html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`)
  await page.screenshot({ path: fileURLToPath(new URL(`../icon-${size}.png`, import.meta.url)), omitBackground: true })
}
await browser.close()
console.log('icons written')
