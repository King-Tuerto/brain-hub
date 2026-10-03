// Phase 4 shared fixtures: the Sonnet agent's recipe (never modified), the
// fictional Northwind inputs, the prompt the hub built, and the answer written
// by a separate agent acting as the student's AI app.
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const DIR = new URL('../fixtures/phase-4/', import.meta.url)
export const RECIPE_FILE_NAME = 'job-interview-prep.recipe.md'
export const RECIPE_FILE = new URL(RECIPE_FILE_NAME, DIR)
export const ANSWER_FILE = new URL('answer.md', DIR)
export const RESULT_FILE = new URL('../../docs/phase-4/RESULT.md', import.meta.url)
export const TOOL_ID = 'job-interview-prep'

// Read as raw bytes, so the hash is over exactly what the agent wrote.
export const RECIPE_BYTES = readFileSync(RECIPE_FILE)
export const RECIPE = RECIPE_BYTES.toString('utf8')
export const INPUTS = JSON.parse(readFileSync(new URL('inputs.json', DIR), 'utf8'))
export const PROMPT = readFileSync(new URL('prompt.md', DIR), 'utf8')

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

// The hash recorded in RESULT.md, read from the doc rather than copied here,
// so the test proves the fixture matches what was published to Paul.
export function recordedHash() {
  const m = /\*\*SHA-256\*\*\s*\|\s*`([0-9a-f]{64})`/.exec(readFileSync(RESULT_FILE, 'utf8'))
  if (!m) throw new Error('RESULT.md has no SHA-256 row')
  return m[1]
}

// The answer is written by a separate agent. Until it lands, every test that
// needs it FAILS with this message; none of them skip.
export function readAnswer() {
  if (!existsSync(ANSWER_FILE)) {
    throw new Error('answer.md missing: tests/fixtures/phase-4/answer.md has not been written yet (Phase 4 PLAN Method 4)')
  }
  return readFileSync(ANSWER_FILE, 'utf8')
}

// The recipe's output sections, spelled out from the agent's file.
export const SECTIONS = ['Resume Highlights', 'Defending Your Weaknesses', 'Interview Questions to Prepare For', 'Smart Questions to Ask']
