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

// Every factual claim must carry a source link or be marked [unverified]
// (WIDGET-GUIDE §8). A "claim" is each list item, table row or paragraph
// inside a ## section, except the Summary. Not claims: questions (end in "?"),
// lead-in lines (end in ":"), table header and separator rows, and code blocks.
const LINK_RE = /https?:\/\/[^\s)>\]]+/
const UNVERIFIED_RE = /\[unverified\]/i

export function checkSources(markdown) {
  const lines = String(markdown ?? '').split(/\r?\n/)
  const claims = []
  let section = null
  let para = []
  let inCode = false
  let tableRow = 0
  const flush = () => { if (para.length) claims.push({ section, text: para.join(' ') }); para = [] }

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('```')) { flush(); inCode = !inCode; continue }
    if (inCode) continue
    const h = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line)
    if (h) { flush(); if (h[1].length === 2) section = h[2]; tableRow = 0; continue }
    if (!line) { flush(); tableRow = 0; continue }
    if (section == null || section.trim().toLowerCase() === 'summary') continue

    if (line.startsWith('|')) {
      flush()
      tableRow++
      if (tableRow === 1 || /^\|[\s:|-]+\|?$/.test(line)) continue // header or separator
      claims.push({ section, text: line })
      continue
    }
    tableRow = 0
    const item = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line)
    if (item) { flush(); claims.push({ section, text: item[1] }); continue }
    para.push(line)
  }
  flush()

  const real = claims.filter((c) => {
    const t = c.text.replace(/[*_`]/g, '').trim()
    return t && !t.endsWith('?') && !t.endsWith(':')
  })
  const result = { claims: real.length, sourced: 0, unverified: 0, unsourced: [] }
  for (const c of real) {
    if (LINK_RE.test(c.text)) result.sourced++
    else if (UNVERIFIED_RE.test(c.text)) result.unverified++
    else result.unsourced.push({ section: c.section, text: c.text })
  }
  return result
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
