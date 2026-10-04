// The real Builder & Tester run (docs/builder-tester/PLAN.md "The final run").
// It lives at the top of tests/fixtures/builder-tester/ as r1-* … rN-*; earlier
// failed attempts are archived in attempt-* folders and are not tested.
//
// Rounds are found by file name, so a new round is picked up without editing
// this file. A round with no rN-builder.* files re-tests the previous recipe
// unchanged (round 6: the same v1.0.4 under the narrowed no-invention rule and
// the word-form-aware Testers).
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { NO_INVENTION_RULE } from '../../core/lib/prompt.js'

export const DIR = 'tests/fixtures/builder-tester/'
const root = new URL('../../', import.meta.url)
export const readRepo = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
export const fx = (name) => readRepo(DIR + name)
export const fxJson = (name) => JSON.parse(fx(name))
export const has = (name) => existsSync(new URL(DIR + name, root))
export const GUIDE = () => readRepo('WIDGET-GUIDE.md')

export const ROUNDS = readdirSync(new URL(DIR, root)).map((f) => /^r(\d+)-cases\.json$/.exec(f)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b)
export const LAST = ROUNDS.at(-1)
export const TODAY = '2026-10-04' // the date the run was made with (tests/pilot/builder-loop.mjs)
export const BUILT_ID = 'syllabus-study-planner'
export const BUILT_NAME = 'Syllabus Study Planner'

// Round n's files, as the pilot wrote them.
export const round = (n) => {
  const builder = has(`r${n}-builder.answer.md`)
  return {
    n,
    builder,
    builderPrompt: builder ? fx(`r${n}-builder.prompt.md`) : null,
    builderAnswer: builder ? fx(`r${n}-builder.answer.md`) : null,
    recipe: fx(`r${n}-recipe.recipe.md`),
    spec: fx(`r${n}-spec.md`),
    testsPrompt: fx(`r${n}-tests.prompt.md`),
    testsAnswer: fx(`r${n}-tests.answer.md`),
    cases: fxJson(`r${n}-cases.json`),
    runPrompt: (k) => fx(`r${n}-run-test${k}.prompt.md`),
    runAnswer: (k) => fx(`r${n}-run-test${k}.answer.md`),
    gradePrompt: fx(`r${n}-grade.prompt.md`),
    gradeAnswer: fx(`r${n}-grade.answer.md`),
  }
}

// What the student pastes into the Builder's fixes box for round n: the
// Tester's Fixes, the current Spec and the current recipe, as the guides say
// and as tests/pilot/builder-loop.mjs built it.
export const fixesFor = (n, fixesSection) => `Fixes from the Tester:\n${fixesSection}\n\nMy current Spec:\n${fx(`r${n - 1}-spec.md`).trim()}\n\nMy current recipe:\n${fx(`r${n - 1}-recipe.recipe.md`).trim()}`

// What the student pastes into Tester 2's results box: the three answers, labelled.
export const resultsFor = (n) => {
  let s = `Ran on ${TODAY}.\n\n`
  for (const k of [1, 2, 3]) s += `Test ${k}:\n${fx(`r${n}-run-test${k}.answer.md`).trim()}\n\n`
  return s.trim()
}

// ---- Lines the hub has changed since earlier rounds were run.
//
// Rounds 1–5 were run before NO_INVENTION_RULE was narrowed and before the
// Testers counted word forms. Their prompts are still checked byte for byte
// against today's hub, with only these whole lines allowed to be the older
// wording. The old lines are written out here (not read back from git), and
// the new line must be what core says now.
const firstLineStarting = (text, start) => text.split('\n').find((l) => l.startsWith(start))
export const SUPERSEDED = [
  {
    what: 'NO_INVENTION_RULE v2',
    old: 'Never invent facts about me (numbers, achievements, dates, names). Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them.',
    now: () => NO_INVENTION_RULE,
  },
  {
    // A draft of v3 that never shipped. Only round 6's Tester 1 prompt was built
    // with it (Tester 1 writes tests and never runs the tool, so it did not affect
    // the round); the test below pins that it is used nowhere else.
    what: 'NO_INVENTION_RULE v3 draft',
    old: 'Never invent facts about me (numbers, achievements, dates, names), and never present made-up facts as real. Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy as my own, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them. Made-up numbers are fine in clearly hypothetical practice questions, worked examples or exercises; say they are hypothetical if that is not obvious.',
    now: () => NO_INVENTION_RULE,
  },
  {
    what: 'Tester 1 checks line, before word forms',
    old: 'For each test give "Inputs to type", listing every input label with the exact value to enter (or "leave blank"), and "Expected", a checklist of things a person can see in the answer, each tied to a criterion, e.g. "[A2] one row for each of the 5 weeks". Every check must be decidable without a judgment call: count something, compare a date, or look for exact words. When a criterion is about what something is about, turn it into words: list the exact words that must not appear (e.g. the names of later topics), or that must. Two careful people must always agree on the result. Never predict exact wording; check things that must be true.',
    now: () => firstLineStarting(readRepo('core/tools/tool-tester-write.recipe.md'), 'For each test give "Inputs to type"'),
  },
  {
    what: 'Tester 2 Results line, before word forms',
    old: 'Results: a table with columns Test | Check | Result | Evidence. One row per expected check in every test. Result is PASS or FAIL. Grade each check exactly as its words say, no wider: if a check lists words that must not appear, it fails only if one of those words appears. Evidence is a short quote or description from that answer (under 20 words), or "missing". If an answer for a test is missing, every check in that test is FAIL with evidence "answer missing".',
    now: () => firstLineStarting(readRepo('core/tools/tool-tester-grade.recipe.md'), 'Results: a table with columns'),
  },
]
// A fixture prompt with any superseded line replaced by today's wording, plus
// which superseded lines it had. Only whole lines are swapped.
export function asBuiltToday(prompt) {
  const used = []
  const text = prompt.split('\n').map((l) => {
    const s = SUPERSEDED.find((x) => x.old === l)
    if (!s) return l
    used.push(s.what)
    return s.now()
  }).join('\n')
  return { text, used: [...new Set(used)] }
}

// sectionText / recipesIn from core/app.js, for Node. app.js itself cannot be
// imported in Node (it touches the DOM and routes on load), so — exactly as
// tests/pilot/builder-loop.mjs does — the pure functions are lifted out of its
// source. The browser tests call the real loaded module instead.
export async function appHelpers() {
  const { parseRecipe } = await import('../../core/lib/recipe.js')
  const src = readRepo('core/app.js')
  const grab = (name) => {
    const i = src.indexOf('export function ' + name)
    if (i < 0) throw new Error(`core/app.js has no export function ${name}`)
    let d = 0
    for (let k = src.indexOf(') {', i) + 2; k < src.length; k++) {
      if (src[k] === '{') d++
      if (src[k] === '}' && --d === 0) return src.slice(i, k + 1).replace('export ', '')
    }
  }
  // eslint-disable-next-line no-new-func
  return new Function('parseRecipe', `${grab('fenceMap')};${grab('isHeading')};${grab('sectionText')};${grab('recipesIn')};return { sectionText, recipesIn }`)(parseRecipe)
}
