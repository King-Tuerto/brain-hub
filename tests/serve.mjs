// Static server for tests. Serves the repo root under /brain-hub/, the same
// sub-path GitHub Pages uses, so relative-URL mistakes fail here first.
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PREFIX = '/brain-hub/'
const PORT = Number(process.env.PORT || 4173)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (path === '/brain-hub') { res.writeHead(301, { Location: PREFIX }); return res.end() }
  if (!path.startsWith(PREFIX)) { res.writeHead(404); return res.end('not found') }
  let file = normalize(join(ROOT, path.slice(PREFIX.length)))
  if (!file.startsWith(normalize(ROOT)) || file.includes(`${sep}node_modules${sep}`)) {
    res.writeHead(403); return res.end()
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html')
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404); res.end('not found')
  }
}).listen(PORT, () => console.log(`serving http://localhost:${PORT}${PREFIX}`))
