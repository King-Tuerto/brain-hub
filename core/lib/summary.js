// What a student sees before installing a recipe.
import { PLACEHOLDER_RE } from './recipe.js'

export const PRIVACY_WARNING = 'In Automatic mode, notes from your brain are sent to OpenRouter and the AI company behind the model you picked.'

const WEB_TEXT = { required: 'Needs web search', helpful: 'Better with web search', none: 'No web search' }

export function installSummary(recipe) {
  const labels = Object.fromEntries((recipe.inputs ?? []).map((i) => [i.id, i.label]))
  const query = recipe.brain_context?.query == null ? null
    : recipe.brain_context.query.replace(new RegExp(PLACEHOLDER_RE.source, 'g'), (whole, key) =>
      key in labels ? `[${labels[key]}]` : whole)

  const perms = recipe.permissions ?? []
  const texts = {
    search_brain: `Search your brain for: "${query ?? ''}"`,
    save_to_brain: 'Show a Save to brain button (you choose each time)',
    run_ai: 'Send its prompt to your AI automatically in Automatic mode',
  }
  const permissions = perms.filter((p) => p in texts).map((id) => ({ id, text: texts[id] }))

  const warnings = []
  if (perms.includes('search_brain') && perms.includes('run_ai')) warnings.push(PRIVACY_WARNING)

  return {
    name: recipe.name,
    author: recipe.author,
    version: recipe.version,
    description: recipe.description,
    permissions,
    query,
    webSearch: WEB_TEXT[recipe.web_search] ?? recipe.web_search,
    sourcing: recipe.sourcing === 'advice' ? 'Statements with figures, percentages or amounts need sources; advice does not' : 'Every factual claim needs a source',
    warnings,
  }
}
