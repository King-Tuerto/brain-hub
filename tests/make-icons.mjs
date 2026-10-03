// Renders icon.svg to the PNG sizes the web app manifest needs. Re-run after editing icon.svg.
//
// Paths: the script moves into the brain-hub folder first and then uses only
// paths relative to it. Never build a file path from a URL's .pathname: that
// keeps "%20" for spaces, and an earlier version of this script wrote its
// output into a new folder literally named "Claude%20Projects".
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url)) // decodes %20 back to spaces
process.chdir(ROOT)

function inRepo(rel) {
  const full = resolve(ROOT, rel)
  const back = relative(ROOT, full)
  if (rel.includes('%') || isAbsolute(rel) || back.startsWith('..') || isAbsolute(back)) {
    throw new Error(`Refusing to write outside the brain-hub folder: ${rel}`)
  }
  return rel
}

const svg = await readFile(inRepo('icon.svg'), 'utf8')
const browser = await chromium.launch()
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } })
    await page.setContent(`<style>html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}</style>${svg}`)
    await page.screenshot({ path: inRepo(`icon-${size}.png`), omitBackground: true })
  }
} finally {
  await browser.close()
}
console.log('icons written: icon-192.png, icon-512.png')
