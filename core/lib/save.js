// What gets saved to the brain, and what gets downloaded.
import { fillShort } from './prompt.js'

const isoDate = (now) => new Date(now ?? Date.now()).toISOString().slice(0, 10)

export function resolveTags(recipe, inputs, now) {
  const tags = (recipe.save?.tags ?? []).map((t) => fillShort(t, recipe, inputs, isoDate(now)).toLowerCase()).filter(Boolean)
  return [...new Set(tags)]
}

export function buildSaveRow({ recipe, inputs, report, summary, sources, userId, now, tags }) {
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
  return { user_id: userId, source: 'brain-hub', content: summary, metadata: { hub } }
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
