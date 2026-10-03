// What gets saved to the brain, and what gets downloaded.
import { fillShort } from './prompt.js'

// The student's own calendar date, not UTC: after 6 pm in Mexico, UTC is already tomorrow.
export function localDate(now) {
  const d = new Date(now ?? Date.now())
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const isoDate = localDate

export function resolveTags(recipe, inputs, now) {
  const tags = (recipe.save?.tags ?? []).map((t) => fillShort(t, recipe, inputs, isoDate(now)).toLowerCase()).filter(Boolean)
  return [...new Set(tags)]
}

export function buildSaveRow({ recipe, inputs, report, summary, sources, userId, now, tags, sourceCheck }) {
  const hub = {
    tool: recipe.id,
    tool_version: recipe.version,
    type: recipe.save?.type ?? 'work_product',
    tags: tags ?? resolveTags(recipe, inputs, now),
    report,
    sources: sources ?? [],
    saved_at: new Date(now ?? Date.now()).toISOString(),
    archived: false,
  }
  if (recipe.save?.type === 'profile') hub.profile_part = recipe.save.profile_part
  if (sourceCheck) hub.source_check = sourceCheck
  return { user_id: userId, source: 'brain-hub', content: withContext(summary, recipe, inputs), metadata: { hub } }
}

// The searchable text is the summary plus one line naming the tool and what the
// student typed. Without embeddings, brain search is keyword-only and needs
// every word of the query, and the next run's query is built from those same
// inputs (e.g. "Deere & Company (NYSE: DE)"). The summary alone may not
// contain them, so the save would never be found again (Nitpick A4).
export function contextLine(recipe, inputs) {
  const values = (recipe.inputs ?? [])
    .filter((i) => i.type !== 'long_text')
    .map((i) => String(inputs?.[i.id] ?? '').replace(/\s+/g, ' ').trim())
    .filter((v) => v && v.length <= 120)
  return values.length ? `${recipe.name}: ${values.join(' · ')}` : ''
}

function withContext(summary, recipe, inputs) {
  const line = contextLine(recipe, inputs)
  return line ? `${summary}\n\n${line}` : summary
}

export function downloadFile({ recipe, inputs, report, now }) {
  const date = isoDate(now)
  const lines = [`# ${recipe.name}`, '', date, '']
  for (const inp of recipe.inputs ?? []) {
    const v = String(inputs?.[inp.id] ?? '').trim()
    lines.push(`- **${inp.label}:** ${v || '(not provided)'}`)
  }
  lines.push('', report ?? '')
  return { fileName: `${recipe.id}-${date}.md`, text: lines.join('\n') }
}
