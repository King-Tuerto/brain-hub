// Copies the three browser libraries from node_modules into core/vendor so the
// hub runs with no CDN and no build step. Re-run after upgrading any of them.
import { copyFile, mkdir, readFile } from 'node:fs/promises'

const FILES = [
  ['js-yaml', 'dist/js-yaml.mjs', 'js-yaml.mjs'],
  ['marked', 'lib/marked.esm.js', 'marked.esm.js'],
  ['dompurify', 'dist/purify.es.mjs', 'purify.es.mjs'],
]
const out = new URL('../core/vendor/', import.meta.url)
await mkdir(out, { recursive: true })
for (const [pkg, from, to] of FILES) {
  const base = new URL(`../node_modules/${pkg}/`, import.meta.url)
  const { version } = JSON.parse(await readFile(new URL('package.json', base), 'utf8'))
  await copyFile(new URL(from, base), new URL(to, out))
  console.log(`${pkg}@${version} -> core/vendor/${to}`)
}
