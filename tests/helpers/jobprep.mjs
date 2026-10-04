// starter-job-prep shared fixtures: the core Job & Interview Prep recipe and
// the two Northwind cases. Case A (no background, no gaps) was answered by a
// fresh Haiku agent, case B (true background + gaps) by a fresh Sonnet agent.
// *-v1 files are the first round: the answers and the exact prompts they
// answered, before NO_INVENTION_RULE gained its second sentence. *-v2 files are
// the second round, answered under the two-sentence rule, before it was
// narrowed (v3) so practice questions get concrete made-up numbers.
import { readFileSync, existsSync } from 'node:fs'

const DIR = new URL('../fixtures/job-prep/', import.meta.url)
export const RECIPE_FILE_NAME = 'job-interview-prep.recipe.md'
export const RECIPE_TEXT = readFileSync(new URL(`../../core/tools/${RECIPE_FILE_NAME}`, import.meta.url), 'utf8')
export const INDEX_FILE = new URL('../../core/tools/index.json', import.meta.url)
export const PLAN_FILE = new URL('../../docs/starter-job-prep/PLAN.md', import.meta.url)
export const TOOL_ID = 'job-interview-prep'
export const SECTIONS = ['Resume essentials', 'Handling your gaps', 'Questions to prepare for', 'Smart questions to ask']
export const CASES = { A: 'a-no-background', B: 'b-with-background' }

function need(name) {
  const u = new URL(name, DIR)
  if (!existsSync(u)) throw new Error(`${name} missing: tests/fixtures/job-prep/${name} has not been written yet (starter-job-prep PLAN)`)
  return readFileSync(u, 'utf8')
}

export const inputsOf = (c) => JSON.parse(need(`${CASES[c]}.inputs.json`))
export const promptOf = (c) => need(`${CASES[c]}.prompt.md`)
export const answerOf = (c) => need(`${CASES[c]}.answer.md`)
export const promptV1Of = (c) => need(`${CASES[c]}.prompt-v1.md`)
export const answerV1Of = (c) => need(`${CASES[c]}.answer-v1.md`)
export const promptV2Of = (c) => need(`${CASES[c]}.prompt-v2.md`)
export const answerV2Of = (c) => need(`${CASES[c]}.answer-v2.md`)
// Everything the student typed: the invention check's "given" figures.
export const studentText = (c) => Object.values(inputsOf(c)).join('\n')
