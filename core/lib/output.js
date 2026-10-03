// Read an AI answer: which sections it has, its summary, and its sources.

const HEADING_RE = /^##\s+(.+?)\s*#*$/

const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

export function parseOutput(markdown, recipe) {
  const lines = String(markdown ?? '').split(/\r?\n/)
  const sections = []
  const headingAt = []
  lines.forEach((line, i) => {
    if (line.startsWith('###')) return
    const m = HEADING_RE.exec(line)
    if (m) { sections.push(m[1]); headingAt.push(i) }
  })

  const have = new Set(sections.map(norm))
  const wanted = [...(recipe?.output?.sections ?? []), 'Summary']
  const missingSections = wanted.filter((s) => !have.has(norm(s)))

  let summary = ''
  for (let k = sections.length - 1; k >= 0; k--) {
    if (norm(sections[k]) === 'summary') {
      const start = headingAt[k] + 1
      const end = k + 1 < headingAt.length ? headingAt[k + 1] : lines.length
      summary = lines.slice(start, end).join('\n').trim()
      break
    }
  }

  return { summary, sections, missingSections, sources: extractSources(markdown) }
}

export function extractSources(markdown) {
  const text = String(markdown ?? '')
  const seen = []
  const found = []
  // Markdown links first, then bare URLs; ordering by position in the text.
  for (const m of text.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) found.push([m.index, m[1]])
  for (const m of text.matchAll(/https?:\/\/[^\s<>"'\]]+/g)) found.push([m.index, m[0]])
  found.sort((a, b) => a[0] - b[0])
  for (const [, raw] of found) {
    const url = raw.replace(/[).,;]+$/, '')
    if (!seen.includes(url)) seen.push(url)
  }
  return seen
}
