// The real Builder & Tester run (docs/builder-tester/PLAN.md "The final run").
// The final run lives at the top of tests/fixtures/builder-tester/ (r1-* … r5-*);
// earlier failed attempts are archived in attempt-1 … attempt-6 and not tested.
import { readFileSync } from 'node:fs'

export const DIR = 'tests/fixtures/builder-tester/'
export const ROUNDS = [1, 2, 3, 4, 5]
export const LAST = ROUNDS.at(-1)
export const TODAY = '2026-10-04' // the date the final run was made with (tests/pilot/builder-loop.mjs)
export const BUILT_ID = 'syllabus-study-planner'
export const BUILT_NAME = 'Syllabus Study Planner'
const root = new URL('../../', import.meta.url)
export const readRepo = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
export const fx = (name) => readRepo(DIR + name)
export const fxJson = (name) => JSON.parse(fx(name))
export const GUIDE = () => readRepo('WIDGET-GUIDE.md')

// Round n's files, as the pilot wrote them.
export const round = (n) => ({
  builderPrompt: fx(`r${n}-builder.prompt.md`),
  builderAnswer: fx(`r${n}-builder.answer.md`),
  recipe: fx(`r${n}-recipe.recipe.md`),
  spec: fx(`r${n}-spec.md`),
  testsPrompt: fx(`r${n}-tests.prompt.md`),
  testsAnswer: fx(`r${n}-tests.answer.md`),
  cases: fxJson(`r${n}-cases.json`),
  runPrompt: (k) => fx(`r${n}-run-test${k}.prompt.md`),
  runAnswer: (k) => fx(`r${n}-run-test${k}.answer.md`),
  gradePrompt: fx(`r${n}-grade.prompt.md`),
  gradeAnswer: fx(`r${n}-grade.answer.md`),
})

// What the student pastes into the Builder's fixes box for round n (n ≥ 2):
// the Tester's Fixes, the current Spec and the current recipe, as the guides
// say and as tests/pilot/builder-loop.mjs built it.
export const fixesFor = (n, fixesSection) => `Fixes from the Tester:\n${fixesSection}\n\nMy current Spec:\n${fx(`r${n - 1}-spec.md`).trim()}\n\nMy current recipe:\n${fx(`r${n - 1}-recipe.recipe.md`).trim()}`

// What the student pastes into Tester 2's results box: the three answers, labelled.
export const resultsFor = (n) => {
  let s = `Ran on ${TODAY}.\n\n`
  for (const k of [1, 2, 3]) s += `Test ${k}:\n${fx(`r${n}-run-test${k}.answer.md`).trim()}\n\n`
  return s.trim()
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
