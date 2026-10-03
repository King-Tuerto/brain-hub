// In-memory fake of the GitHub contents API and raw file downloads.
export const GH_API = 'https://api.github.com'
export const GH_RAW = 'https://raw.githubusercontent.com'

export class FakeGitHub {
  constructor() {
    this.repos = new Map() // "owner/repo" → { files: { name: text } }
    this.failApi = false
    this.log = []
  }
  repo(owner, repo, files) { this.repos.set(`${owner}/${repo}`, { files }); return this }
  apiCalls() { return this.log.filter((e) => e.url.startsWith(GH_API)) }

  async attach(context) {
    await context.route((url) => url.origin === GH_API || url.origin === GH_RAW, (route) => this.handle(route))
  }

  cors(req) {
    const h = req.headers()
    return {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': h['access-control-request-headers'] || '*',
      'access-control-expose-headers': 'etag, link, x-ratelimit-remaining',
    }
  }

  async handle(route) {
    const req = route.request()
    const url = new URL(req.url())
    this.log.push({ url: req.url(), method: req.method() })
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: this.cors(req), body: '' })
    const headers = this.cors(req)
    if (url.origin === GH_API) {
      if (this.failApi) {
        return route.fulfill({ status: 403, headers: { ...headers, 'content-type': 'application/json', 'x-ratelimit-remaining': '0' }, body: JSON.stringify({ message: 'API rate limit exceeded for 127.0.0.1.' }) })
      }
      const m = /^\/repos\/([^/]+)\/([^/]+)\/contents\/plugins\/?$/.exec(url.pathname)
      const r = m && this.repos.get(`${m[1]}/${m[2]}`)
      if (!r) return route.fulfill({ status: 404, headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Not Found' }) })
      const listing = Object.keys(r.files).map((name) => ({
        name, path: `plugins/${name}`, type: 'file', size: r.files[name].length,
        download_url: `${GH_RAW}/${m[1]}/${m[2]}/main/plugins/${name}`,
      }))
      listing.push({ name: 'old', path: 'plugins/old', type: 'dir', download_url: null })
      return route.fulfill({ status: 200, headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(listing) })
    }
    const m = /^\/([^/]+)\/([^/]+)\/main\/plugins\/(.+)$/.exec(url.pathname)
    const r = m && this.repos.get(`${m[1]}/${m[2]}`)
    const text = r?.files[decodeURIComponent(m[3])]
    if (text == null) return route.fulfill({ status: 404, headers, body: '404: Not Found' })
    return route.fulfill({ status: 200, headers: { ...headers, 'content-type': 'text/plain; charset=utf-8' }, body: text })
  }
}
