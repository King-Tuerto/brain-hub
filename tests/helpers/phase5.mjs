// Phase 5 shared fixtures: the planted Deere report, the real fact-checker
// verdict tables, and the Phase 4 rerun (guide v1.1) recipe and answer.
//
// Fixtures written by independent agents are read through need(): until a
// file lands, every test that needs it FAILS with "<file> missing". None skip.
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const P5 = new URL('../fixtures/phase-5/', import.meta.url)
const RERUN = new URL('../fixtures/phase-4-rerun/', import.meta.url)
const DEERE = new URL('../fixtures/real-run/deere/', import.meta.url)
const P4 = new URL('../fixtures/phase-4/', import.meta.url)

function need(dir, name) {
  const u = new URL(name, dir)
  const shown = u.pathname.slice(u.pathname.indexOf('tests/fixtures/'))
  if (!existsSync(u)) throw new Error(`${shown.split('/').pop()} missing: ${shown} has not been written yet (Phase 5 PLAN)`)
  return readFileSync(u, 'utf8')
}

export const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

// ---- The Checker (Part B)
export const COMPANY_RECIPE_TEXT = readFileSync(new URL('../../core/tools/company-analysis.recipe.md', import.meta.url), 'utf8')
export const DEERE_INPUTS = JSON.parse(readFileSync(new URL('inputs.json', DEERE), 'utf8'))
export const PLANTS = JSON.parse(need(P5, 'plants.json')).plants
export const plantedReport = () => need(P5, 'planted.md')
export const cleanReport = () => need(DEERE, 'answer.md') // run 3, the clean control
export const checkerPrompt = (which) => need(P5, `checker-prompt-${which}.md`)
export const checkerAnswer = (which) => need(P5, `checker-answer-${which}.md`)

// ---- The Phase 4 rerun (Part A 5)
export const RERUN_FILE_NAME = 'interview-prep.recipe.md'
export const RERUN_TOOL_ID = 'interview-prep'
export const RERUN_RECIPE_BYTES = readFileSync(new URL(RERUN_FILE_NAME, RERUN))
export const RERUN_RECIPE = RERUN_RECIPE_BYTES.toString('utf8')
export const RERUN_INPUTS = JSON.parse(readFileSync(new URL('inputs.json', RERUN), 'utf8'))
export const RERUN_PROMPT = readFileSync(new URL('prompt.md', RERUN), 'utf8')
export const rerunAnswer = () => need(RERUN, 'answer.md')
export const RERUN_SECTIONS = ['Resume essentials', 'Defending your weaknesses', 'Questions to prepare for', 'Smart questions to ask']
// PLAN Part A 5 records the hash shortened as 03fc5519…a79c6e; this is the
// full value, and the test also checks it against the PLAN's short form.
export const RERUN_SHA256 = '03fc5519062b3f0aa0ea5f8fa6cce7fbc4bc697546bc22647d4cbbabeda79c6e'
export const PLAN_TEXT = readFileSync(new URL('../../docs/phase-5/PLAN.md', import.meta.url), 'utf8')

// ---- The v1.0 answers and the prompts they really answered (Part A 6)
export const V10_ANSWER = need(P4, 'answer.md')
export const V10_RECIPE_TEXT = readFileSync(new URL('job-interview-prep.recipe.md', P4), 'utf8')
export const pair = (dir) => ({ prompt: need(dir, 'prompt.md'), answerPrompt: need(dir, 'answer-prompt.md') })
export const DIRS = { deere: DEERE, phase4: P4, rerun: RERUN }
export const hasAnswerPrompt = (dir) => existsSync(new URL('answer-prompt.md', dir))

// ---- "The answer invents no facts about the student" (Part A 5)
//
// A mechanical check, so it can't be argued with and fails the same way twice.
// Invention shows up in two shapes (both are in the v1.0 Haiku answer):
//  1. words written for the student to say about themselves, in the first
//     person ("I talked to 150+ members … attendance grow 35%");
//  2. accomplishments stated as the student's ("Ran 6 events serving 150+
//     members", "event attendance up 40%, member satisfaction 4.5/5").
// So: every declarative (non-question) sentence in the first person singular,
// or with an accomplishment verb/metric word, must carry no figure, except a
// figure the student gave the AI (it appears in their inputs) or one inside a
// [placeholder]. Questions and hypotheticals ("Imagine…", "If…") are
// skipped. Link titles ("2026 Guide") and (1)-style enumerators are
// removed first; they are not claims about the student.
const LINK = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g
const PLACEHOLDER = /\[[^\]]*\]/g
// "I" stays case-sensitive; My/Me/Myself count at the start of a sentence too.
// Until starter-job-prep the pattern missed a capital "My", so "My goal in the
// first 90 days…" was never examined at all (Nitpick, starter-job-prep).
const FIRST_PERSON = /\b(I|I'm|I’m|I've|I’ve|I'd|I’d|[Mm]y|[Mm]e|[Mm]yself)\b/
// starter-job-prep PLAN, the clarified bar: a first-person goal or plan the
// student would choose to say ("My goal in the first 90 days is to…") is not a
// fact about their past or present. Exempt only when the sentence has no
// past-tense accomplishment too, so "I want to build on how I grew sign-ups
// 35%" is still examined.
export const GOAL = /\b(my (goal|plan|aim)s?\b|I (will|plan to|aim to|intend to|hope to|want to)\b|I(?:'|’)d (like|love) to\b)/i
// NO_INVENTION_RULE v3 rerun (Nitpick): a conditional plan — "In the first 90
// days, I'd talk to customers" / "I would interview…" — is the same kind of
// sentence as "I'd like to…": something the student would do, not something
// they did. Narrow on purpose: "I'd" is also "I had", so a following past
// participle ("I'd grown", "I'd increased", "I'd led") is NOT a plan.
export const CONDITIONAL_PLAN = /\b(?:I(?:'|’)d|I would) (?!(?:been|had|done|grown|run|led|built|won|cut|gone|made|taken|seen|written|spent|met|sold|taught|brought|held|got|gotten|have)\b)(?![a-z]+(?:ed|en)\b)[a-z]+\b/i
const PAST_ACCOMPLISHMENT =/\b(ran|led|managed|grew|increased|raised|served|talked|surveyed|organi[sz]ed|achieved|boosted|improved|built|cut|reduced|launched|delivered|won)\b/i
const ACCOMPLISHMENT = /\b(ran|led|managed|grew|grow|increased|raised|served|talked|surveyed|organi[sz]ed|achieved|boosted|improved|attendance|satisfaction|members|retention)\b/i
// A scenario posed to the student ("Imagine our adoption rate is up 20%…") is not a fact about them.
const HYPOTHETICAL = /^["“]?(imagine|suppose|if|say)\b/i
const FIGURE = /\$?\d[\d,.]*(?:\/\d+)?\+?%?/g

export function sentencesOf(markdown) {
  const out = []
  for (const raw of String(markdown).split(/\r?\n/)) {
    const line = raw.replace(LINK, ' ').replace(/^\s*(?:[-*+>]|\d+[.)])\s+/, '').replace(/[*_`]/g, '').trim()
    if (!line || /^#/.test(line)) continue
    for (const s of line.split(/(?<=[.!?]["”’)]*)\s+/)) if (s.trim()) out.push(s.trim())
  }
  return out
}

// A percentage change worked out from two figures the student gave, in the same
// sentence ("from 22 to 41 students (+86%)"), is arithmetic on their own numbers,
// not invention. Only an exact match, rounded to a whole percent, counts: a
// wrong percentage, or one without both of its figures beside it, is still flagged.
const num = (f) => Number(f.replace(/[$,+%]/g, ''))
function derivedPercents(sentence, given) {
  const figs = [...sentence.matchAll(FIGURE)].map((m) => m[0].replace(/[.,]+$/, ''))
    .filter((f) => !f.endsWith('%') && given.has(f)).map(num).filter((n) => Number.isFinite(n) && n > 0)
  const out = new Set()
  for (const a of figs) for (const b of figs) if (a !== b) out.add(`${Math.round((Math.abs(b - a) / a) * 100)}%`)
  return out
}

const isQuestion = (s) => /\?["”'’)\]]*$/.test(s.replace(/\s*\[[^\]]*\]\s*$/, '').trim())

export function inventedStudentFacts(answer, studentText) {
  const given = new Set([...String(studentText).matchAll(FIGURE)].map((m) => m[0].replace(/[.,]+$/, '')))
  const found = []
  for (const s of sentencesOf(answer)) {
    if (isQuestion(s) || HYPOTHETICAL.test(s)) continue
    if ((GOAL.test(s) || CONDITIONAL_PLAN.test(s)) && !PAST_ACCOMPLISHMENT.test(s)) continue
    const bare = s.replace(PLACEHOLDER, ' ').replace(/\(\d+\)/g, ' ')
    if (!FIRST_PERSON.test(bare) && !ACCOMPLISHMENT.test(bare)) continue
    const derived = derivedPercents(bare, given)
    const figs = [...bare.matchAll(FIGURE)].map((m) => m[0].replace(/[.,]+$/, ''))
      .filter((f) => !given.has(f) && !(f.endsWith('%') && derived.has(f)))
    if (figs.length) found.push({ sentence: s, figures: figs })
  }
  return found
}

// Placeholders, in any style: [Your coursework…], [X% improvement…],
// [department], [coursework/internship/project]. Not link titles, not
// [unverified], and not bracketed asides (a full sentence ending in ".").
export function placeholdersIn(answer) {
  const noLinks = String(answer).replace(LINK, ' ')
  return [...noLinks.matchAll(PLACEHOLDER)].map((m) => m[0])
    .filter((p) => !/^\[unverified\b/i.test(p) && !/[.!]\]$/.test(p))
}
