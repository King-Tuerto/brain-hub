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
// Rules (docs/phase-3/PLAN.md §2 and §2a):
// - labels (an item or paragraph that is entirely **bold** / *italic*) are not claims;
// - "Note: …" lines (about the analysis itself) are not claims;
// - a list item plus its indented continuation lines is one block; a nested
//   item with no link of its own inherits its top-level item's source.
const LINK_RE = /https?:\/\/[^\s)>\]]+/
const UNVERIFIED_RE = /\[unverified\b[^\]]*\]/i
const LIST_RE = /^(?:[-*+]|\d+[.)])\s+(.*)$/

const indentOf = (raw) => raw.replace(/\t/g, '    ').match(/^ */)[0].length
const plain = (t) => t.replace(/[*_`]/g, '').trim()
// A label is short, wholly emphasised and not a sentence: "**Caterpillar**",
// "**1. Construction equipment**", "*Political*:". A wholly bold full sentence
// is still a claim (Nitpick A1).
const isLabel = (t) => {
  const s = t.trim()
  if (!(/^(\*\*|__)[^*_]+\1:?$/.test(s) || /^(\*|_)[^*_]+\1:?$/.test(s))) return false
  const inner = plain(s).replace(/:$/, '')
  return inner.split(/\s+/).length <= 15 && !/[.!?]$/.test(inner)
}
const isNote = (t) => /^note\s*:/i.test(plain(t))
const FENCE_RE = /^(```|~~~)/
const RULE_RE = /^(?:-{3,}|\*{3,}|_{3,})$/
// Same normalisation as parseOutput, so "## **Summary**" and "## Summary:" agree (Nitpick D3).
export const isSummaryHeading = (name) => norm(name) === 'summary'

// In `sourcing: advice` recipes only factual-looking statements need a source:
// ones with a figure, a percentage, a currency amount or a quotation. Coaching
// ("Lead with the metric…") is not counted; an invented "attendance up 40%" is.
// Quotations are not counted: in coaching answers they are suggested wording
// or words quoted from the student's own input (Phase 5 rerun finding).
// Placeholders like [X%] and enumerators like (1) are ignored.
const FACT_RE = /\d|%|[$€£]/
const forFactTest = (t) => t.replace(/\[[^\]]*\]/g, ' ').replace(/\(\d+\)/g, ' ')
// "…?" followed only by closing quotes, brackets or a trailing [note] is a question.
const isQuestion = (t) => /\?["”'’)\]]*$/.test(t.replace(/\s*\[[^\]]*\]\s*$/, '').trim())

export function checkSources(markdown, { sourcing = 'facts', returnItems = false } = {}) {
  if (sourcing === 'none') return returnItems ? [] : { claims: 0, sourced: 0, unverified: 0, unsourced: [] }
  const lines = String(markdown ?? '').split(/\r?\n/)
  const claims = []
  let section = null
  let para = []
  let inCode = false
  let tableRow = 0
  let top = null // the current top-level list item, which collects its continuation lines
  let lastWasItem = false // previous line belonged to a list item (for lazy continuation)
  const flush = () => { if (para.length) claims.push({ section, text: para.join(' ') }); para = [] }

  for (const raw of lines) {
    const line = raw.trim()
    if (FENCE_RE.test(line)) { flush(); top = null; lastWasItem = false; inCode = !inCode; continue }
    if (inCode) continue
    const h = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line)
    if (h) { flush(); top = null; lastWasItem = false; if (h[1].length === 2) section = h[2]; tableRow = 0; continue }
    if (!line) { flush(); tableRow = 0; lastWasItem = false; continue }
    if (RULE_RE.test(line)) { flush(); top = null; lastWasItem = false; continue } // horizontal rule (Nitpick D2)
    if (section == null || isSummaryHeading(section)) continue

    if (line.startsWith('|')) {
      flush(); top = null
      tableRow++
      if (tableRow === 1 || /^\|[\s:|-]+\|?$/.test(line)) continue // header or separator
      claims.push({ section, text: line })
      continue
    }
    tableRow = 0
    const indent = indentOf(raw)
    const item = LIST_RE.exec(line)
    if (item) {
      flush()
      if (indent >= 2 && top) {
        claims.push({ section, text: item[1], parent: top })
      } else {
        top = { section, text: item[1] }
        claims.push(top)
      }
      lastWasItem = true
      continue
    }
    // Continuation of the list item: indented, or a "lazy" line straight after
    // it with no blank line in between (Nitpick A2).
    if (top && (indent >= 2 || lastWasItem)) { top.text += ' ' + line; lastWasItem = true; continue }
    top = null
    lastWasItem = false
    para.push(line)
  }
  flush()

  const real = claims.filter((c) => {
    const t = plain(c.text)
    if (!t || isQuestion(t) || t.endsWith(':') || isLabel(c.text) || isNote(c.text)) return false
    return sourcing !== 'advice' || FACT_RE.test(forFactTest(t))
  })
  const result = { claims: real.length, sourced: 0, unverified: 0, unsourced: [] }
  for (const c of classify(real)) {
    if (c.status === 'sourced') result.sourced++
    else if (c.status === 'unverified') result.unverified++
    else result.unsourced.push({ section: c.section, text: c.text })
  }
  if (returnItems) return classify(real)
  return result
}

const urlsIn = (t) => [...t.matchAll(new RegExp(LINK_RE.source, 'g'))].map((m) => m[0].replace(/[).,;]+$/, ''))

// The item's own marks win over inheritance (Nitpick A3).
function classify(claims) {
  return claims.map((c) => {
    let urls = urlsIn(c.text)
    let status
    if (urls.length) status = 'sourced'
    else if (UNVERIFIED_RE.test(c.text)) status = 'unverified'
    else if (c.parent && LINK_RE.test(c.parent.text)) { status = 'sourced'; urls = urlsIn(c.parent.text) }
    else status = 'unsourced'
    return { section: c.section, text: c.text, status, urls }
  })
}

// Every counted claim with its status and the URLs that back it. Used by the
// Checker (Phase 5) to ask an AI to verify each claim against its own link.
export function claimItems(markdown, { sourcing = 'facts' } = {}) {
  return checkSources(markdown, { sourcing, returnItems: true })
}

export function extractSources(markdown) {
  const text = String(markdown ?? '')
  const seen = []
  const found = []
  // Markdown links first, then bare URLs; ordering by position in the text.
  const spans = []
  for (const m of text.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) {
    found.push([m.index, m[1]])
    spans.push([m.index, m.index + m[0].length])
  }
  // A bare-URL match inside a Markdown link is the same link, possibly cut short
  // at a character like ' (Nitpick F1), so skip it.
  for (const m of text.matchAll(/https?:\/\/[^\s<>"'\]]+/g)) {
    if (spans.some(([a, b]) => m.index >= a && m.index < b)) continue
    found.push([m.index, m[0]])
  }
  found.sort((a, b) => a[0] - b[0])
  for (const [, raw] of found) {
    const url = raw.replace(/[).,;]+$/, '')
    if (!seen.includes(url)) seen.push(url)
  }
  return seen
}
