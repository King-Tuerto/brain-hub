// Build the prompt for a recipe. Pure text: building a prompt never calls an AI.
import { PLACEHOLDER_RE } from './recipe.js'

export const WEB_SEARCH_LINE = 'Search the web for current information before answering, and cite what you find.'
export const NO_BRAIN_TEXT = '(No personal notes available.)'
export const EMPTY_INPUT_TEXT = '(not provided)'

// Single pass, so text a student types that happens to contain {{...}} is
// never expanded a second time.
export function fillTemplate(template, values) {
  return String(template).replace(new RegExp(PLACEHOLDER_RE.source, 'g'), (whole, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : whole)
}

export const SOURCE_RULE_FACTS = 'Every factual claim must include a source link in Markdown form [title](https://…). If you cannot source a claim, mark it [unverified].'
export const SOURCE_RULE_ADVICE = 'Every factual statement (figures, dates, names, statistics, quotations, claims about real organisations) must include a source link in Markdown form [title](https://…), or be marked [unverified]. Advice and recommendations do not need sources.'
export const NOTE_RULE = 'Statements about your own method or about what you could not verify are not factual claims: start them with "Note:".'
// DECISIONS #18: appended to every prompt, whatever the recipe says.
// The second sentence was added after a real answer (job prep, no background)
// wrote example resume bullets with made-up figures ("reduced tickets by 23%"):
// examples are exactly what a student copies onto a real resume.
export const NO_INVENTION_RULE = 'Never invent facts about me (numbers, achievements, dates, names). Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them.'

export function STANDARD_BLOCK(recipe) {
  const sections = recipe?.output?.sections ?? []
  return [
    '---',
    'Format your answer in Markdown with these sections, in this order, each as a "## " heading:',
    ...sections.map((s) => `- ${s}`),
    '- Summary',
    // sourcing: none — tools that work on the student's own text (Builder, Tester): no source rule.
    ...(recipe?.sourcing === 'none' ? [] : [recipe?.sourcing === 'advice' ? SOURCE_RULE_ADVICE : SOURCE_RULE_FACTS, NOTE_RULE]),
    NO_INVENTION_RULE,
    'End with "## Summary": 2–3 sentences someone could search for later.',
  ].join('\n')
}

export function inputValues(recipe, inputs = {}) {
  const values = {}
  for (const inp of recipe.inputs ?? []) {
    const v = inputs[inp.id]
    values[inp.id] = v == null || String(v).trim() === '' ? EMPTY_INPUT_TEXT : String(v).trim()
  }
  return values
}

export const NO_GUIDE_TEXT = '(The Brain Hub widget guide could not be loaded. Ask the student to paste WIDGET-GUIDE.md.)'

export function buildPrompt(recipe, inputs, { brainContext = null, today, webSearchLine = null, widgetGuide = null } = {}) {
  const values = {
    ...inputValues(recipe, inputs),
    brain_context: brainContext == null || brainContext === '' ? NO_BRAIN_TEXT : brainContext,
    today: today ?? new Date().toISOString().slice(0, 10),
    widget_guide: widgetGuide || NO_GUIDE_TEXT,
  }
  const body = fillTemplate(recipe.body, values)
  return body + '\n\n' + (webSearchLine ? webSearchLine + '\n\n' : '') + STANDARD_BLOCK(recipe)
}

export function formatBrainContext(results) {
  if (!Array.isArray(results) || results.length === 0) return NO_BRAIN_TEXT
  return results.map((r) => {
    const date = String(r.created_at ?? '').slice(0, 10)
    let content = String(r.content ?? '').replace(/\s+/g, ' ').trim()
    if (content.length > 600) content = content.slice(0, 600) + '…'
    return `- (${date}) ${content}`
  }).join('\n')
}

// Fill a short template (brain_context.query, save tags) using raw input values.
export function fillShort(template, recipe, inputs, today) {
  const values = { today: today ?? new Date().toISOString().slice(0, 10) }
  for (const inp of recipe.inputs ?? []) values[inp.id] = String(inputs?.[inp.id] ?? '').trim()
  return fillTemplate(template, values).replace(/\s+/g, ' ').trim()
}
