// Binding strings and values copied from docs/phase-2/PLAN.md and
// WIDGET-GUIDE.md. Tests compare against these, never against app code.
export const WEB_SEARCH_LINE = 'Search the web for current information before answering, and cite what you find.'
export const NO_BRAIN_TEXT = '(No personal notes available.)'
export const EMPTY_INPUT_TEXT = '(not provided)'
export const PRIVACY_WARNING = 'In Automatic mode, notes from your brain are sent to OpenRouter and the AI company behind the model you picked.'
export const PERMISSION_TEXT = {
  search_brain: (q) => `Search your brain for: "${q}"`,
  save_to_brain: 'Show a Save to brain button (you choose each time)',
  run_ai: 'Send its prompt to your AI automatically in Automatic mode',
}
export const WEBSEARCH_TEXT = { required: 'Needs web search', helpful: 'Better with web search', none: 'No web search' }
export const STANDARD_BLOCK_RULES = [
  'Format your answer in Markdown with these sections, in this order, each as a "## " heading:',
  'Every factual claim must include a source link in Markdown form [title](https://…). If you cannot source a claim, mark it [unverified].',
  // Fourth standard rule: Phase 3 PLAN §2a (amends WIDGET-GUIDE §8).
  'Statements about your own method or about what you could not verify are not factual claims: start them with "Note:".',
  // Phase 5 / DECISIONS #18: appended to every prompt. Second sentence: starter-job-prep PLAN.
  // Third version (builder-tester): only facts about the student need placeholders; practice
  // questions and worked examples get concrete made-up numbers.
  'Never invent facts about me (numbers, achievements, dates, names), and never present made-up facts as real. Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy as my own, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them. Practice questions, worked examples and exercises are different: they are hypothetical, so give them concrete made-up numbers, not placeholders, even when they are written to "you"; say they are hypothetical if that is not obvious.',
  'End with "## Summary": 2–3 sentences someone could search for later.',
]
export const AI_APP_URLS = {
  claude: 'https://claude.ai/new',
  chatgpt: 'https://chatgpt.com/',
  gemini: 'https://gemini.google.com/app',
}
export const STORE_KEYS = ['hub.settings', 'hub.brain', 'hub.session', 'hub.openrouterKey', 'hub.localTools', 'hub.pluginCache']

// Fixed browser clock for every e2e test, so "today" is deterministic.
export const FIXED_TIME = '2026-10-03T12:00:00.000Z'
export const TODAY = '2026-10-03'
export const FIXED_S = Date.parse(FIXED_TIME) / 1000
