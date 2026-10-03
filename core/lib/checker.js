// The Checker specialist (Phase 5): grades any tool output against a rubric
// and lists specific fixes.
//
//   sections covered  20 pts   mechanical (parseOutput)
//   sources present   30 pts   mechanical (checkSources)
//   claims supported  50 pts   citation check: an AI with web access opens
//                              each claim's own link and returns a verdict
//
// A browser app cannot read other websites itself (CORS and the hub's own
// CSP), so the citation check is done by an AI. The hub builds the prompt,
// the AI answers with a verdict table, and the hub parses and scores it.
import { parseOutput, checkSources, claimItems } from './output.js'

export const VERDICTS = ['SUPPORTED', 'PARTLY', 'NOT SUPPORTED', 'UNREACHABLE']
// Enough for a full company analysis (run 3 has 51 sourced claims). Claims past
// this are never silently dropped: the fixes list says how many went unchecked.
export const MAX_CLAIMS = 60
export const POINTS = { sections: 20, sources: 30, support: 50 }

// Claims the citation check will verify: every sourced claim, in order, up to MAX_CLAIMS.
export function claimsToCheck(report, recipe) {
  const items = claimItems(report, { sourcing: recipe?.sourcing })
  const sourced = items.filter((i) => i.status === 'sourced')
  return {
    checked: sourced.slice(0, MAX_CLAIMS).map((c, i) => ({ n: i + 1, section: c.section, text: c.text, urls: c.urls })),
    skipped: Math.max(0, sourced.length - MAX_CLAIMS),
  }
}

const clean = (t) => String(t).replace(/\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g, '$1').replace(/\s+/g, ' ').trim()

export function buildCheckerPrompt(checked) {
  return [
    'You are a strict fact-checker. Below is a numbered list of claims from a report, each with the link it cites.',
    'For each claim, open its link (or links) and decide whether that page supports the claim. Judge only against the cited page, not other sources or your own knowledge.',
    '',
    'Reply with ONLY a Markdown table, one row per claim, in this exact form:',
    '| # | Verdict | Evidence | Fix |',
    '|---|---|---|---|',
    '',
    'Verdict must be exactly one of: SUPPORTED, PARTLY, NOT SUPPORTED, UNREACHABLE.',
    '- SUPPORTED: the page clearly says this, including any figures.',
    '- PARTLY: the page supports part of it, or a figure, date or name differs.',
    '- NOT SUPPORTED: the page does not say this, or says something different.',
    '- UNREACHABLE: the page could not be opened or read.',
    'Evidence: a short quote or figure from the page (25 words at most), or why it could not be read.',
    'Fix: for PARTLY or NOT SUPPORTED, what the claim should say or what source it needs; otherwise "-".',
    'Do not skip claims and do not add rows for anything else.',
    '',
    'Claims:',
    ...checked.map((c) => `${c.n}. ${clean(c.text)}\n   Link: ${c.urls.join(' , ')}`),
  ].join('\n')
}

function normVerdict(v) {
  const s = String(v).toUpperCase().replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()
  if (s === 'UNSUPPORTED' || s === 'NOT_SUPPORTED') return 'NOT SUPPORTED'
  if (s === 'PARTIAL' || s === 'PARTIALLY' || s === 'PARTLY SUPPORTED' || s === 'PARTIALLY SUPPORTED') return 'PARTLY'
  return VERDICTS.includes(s) ? s : null
}

// Reads the AI's verdict table. Rows it can't read, numbers outside the list
// and duplicates are ignored; claims with no usable row are reported missing.
export function parseCheckerAnswer(text, checked) {
  const want = new Set(checked.map((c) => c.n))
  const byN = new Map()
  for (const raw of String(text ?? '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line.startsWith('|')) continue
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    if (cells.length < 2) continue
    const n = Number(cells[0].replace(/[^\d]/g, ''))
    if (!want.has(n) || byN.has(n)) continue
    const verdict = normVerdict(cells[1])
    if (!verdict) continue
    byN.set(n, { n, verdict, evidence: cells[2] ?? '', fix: (cells[3] ?? '').replace(/^-$/, '') })
  }
  const verdicts = checked.filter((c) => byN.has(c.n)).map((c) => byN.get(c.n))
  const missing = checked.filter((c) => !byN.has(c.n)).map((c) => c.n)
  return { verdicts, missing }
}

const short = (t, n = 140) => { const s = clean(t); return s.length > n ? s.slice(0, n) + '…' : s }

// The rubric. `citation` is the parsed verdict table, or null if the citation
// check hasn't been run (then the score is out of 50, and says so).
export function scoreReport(report, recipe, citation = null) {
  const out = parseOutput(report, recipe)
  const sc = checkSources(report, { sourcing: recipe?.sourcing })
  const { checked, skipped } = claimsToCheck(report, recipe)

  const wanted = (recipe?.output?.sections ?? []).length + 1
  const sectionsPts = POINTS.sections * Math.max(0, wanted - out.missingSections.length) / wanted
  const sourcesPts = sc.claims ? POINTS.sources * (sc.sourced + sc.unverified) / sc.claims : POINTS.sources

  const fixes = []
  for (const s of out.missingSections) fixes.push({ kind: 'missing-section', text: `Add the missing section "${s}".` })
  for (const u of sc.unsourced) fixes.push({ kind: 'unsourced', text: `Add a source, or mark [unverified]: ${u.section}: ${short(u.text)}` })

  let supportPts = null
  let counts = null
  if (citation) {
    counts = Object.fromEntries(VERDICTS.map((v) => [v, 0]))
    for (const v of citation.verdicts) counts[v.verdict]++
    supportPts = checked.length ? POINTS.support * (counts.SUPPORTED + 0.5 * counts.PARTLY) / checked.length : POINTS.support
    const textOf = (n) => short(checked.find((c) => c.n === n)?.text ?? '')
    for (const v of citation.verdicts) {
      if (v.verdict === 'NOT SUPPORTED') fixes.push({ kind: 'not-supported', n: v.n, text: `Claim ${v.n} is not supported by its link: ${textOf(v.n)}${v.fix ? ` — Fix: ${v.fix}` : ''}` })
    }
    for (const v of citation.verdicts) {
      if (v.verdict === 'PARTLY') fixes.push({ kind: 'partly', n: v.n, text: `Claim ${v.n} is only partly supported: ${textOf(v.n)}${v.fix ? ` — Fix: ${v.fix}` : ''}` })
    }
    for (const v of citation.verdicts) {
      if (v.verdict === 'UNREACHABLE') fixes.push({ kind: 'unreachable', n: v.n, text: `Claim ${v.n}: its link could not be opened. Replace it: ${checked.find((c) => c.n === v.n)?.urls[0] ?? ''}` })
    }
    for (const n of citation.missing) fixes.push({ kind: 'not-checked', n, text: `Claim ${n} was not checked by the AI. Run the check again or check it yourself: ${textOf(n)}` })
  }
  if (skipped) fixes.push({ kind: 'skipped', text: `${skipped} sourced claim${skipped === 1 ? ' was' : 's were'} beyond the first ${MAX_CLAIMS} and not sent for checking. Check them yourself, or split the report.` })

  const earned = sectionsPts + sourcesPts + (supportPts ?? 0)
  const outOf = POINTS.sections + POINTS.sources + (citation ? POINTS.support : 0)
  return {
    score: Math.round(earned),
    outOf,
    complete: !!citation,
    parts: {
      sections: Math.round(sectionsPts),
      sources: Math.round(sourcesPts),
      support: supportPts == null ? null : Math.round(supportPts),
    },
    counts,
    checked: checked.length,
    skipped,
    fixes,
  }
}

export function grade(result) {
  const pct = result.outOf ? result.score / result.outOf : 0
  if (pct >= 0.9) return 'Strong'
  if (pct >= 0.75) return 'Good'
  if (pct >= 0.5) return 'Needs work'
  return 'Weak'
}
