// starter-job-prep PLAN "Tests (Nitpick)" → Unit. The contract is spelled out
// here from the PLAN and WIDGET-GUIDE §8, never read back from core, so a
// change in core is caught rather than copied.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { buildPrompt, fillShort, STANDARD_BLOCK } from '../../core/lib/prompt.js'
import { parseOutput } from '../../core/lib/output.js'
import { WEB_SEARCH_LINE, NO_BRAIN_TEXT, EMPTY_INPUT_TEXT, TODAY } from '../helpers/contract.mjs'
import { inventedStudentFacts, placeholdersIn, sentencesOf, GOAL, CONDITIONAL_PLAN, V10_ANSWER } from '../helpers/phase5.mjs'
import {
  RECIPE_TEXT, RECIPE_FILE_NAME, INDEX_FILE, TOOL_ID, SECTIONS,
  inputsOf, promptOf, answerOf, promptV1Of, answerV1Of, promptV2Of, answerV2Of, studentText,
} from '../helpers/jobprep.mjs'

const RULE_V1 = 'Never invent facts about me (numbers, achievements, dates, names). Where a real detail of mine is needed and you do not have it, write a placeholder like [your number].'
const RULE_V2 = RULE_V1 + ' This includes example sentences I might copy, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them.'
// v3 (builder-tester): made-up numbers belong in practice questions, not in anything the student might say as their own.
const RULE = 'Never invent facts about me (numbers, achievements, dates, names), and never present made-up facts as real. Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy as my own, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them. Practice questions, worked examples and exercises are different: they are hypothetical, so give them concrete made-up numbers, not placeholders, even when they are written to "you"; say they are hypothetical if that is not obvious.'
const ADVICE_RULE = 'Every factual statement (figures, dates, names, statistics, quotations, claims about real organisations) must include a source link in Markdown form [title](https://…), or be marked [unverified]. Advice and recommendations do not need sources.'

function recipe() {
  const r = parseRecipe(RECIPE_TEXT, { fileName: RECIPE_FILE_NAME })
  assert.equal(r.ok, true, `recipe does not parse: ${JSON.stringify(r.errors)}`)
  assert.deepEqual(r.errors ?? [], [])
  return r.recipe
}
const build = (c) => buildPrompt(recipe(), inputsOf(c), { brainContext: null, today: TODAY, webSearchLine: WEB_SEARCH_LINE })

describe('the recipe (core/tools/job-interview-prep.recipe.md)', () => {
  test('parses with no errors; id matches the file name; format 1; semver', () => {
    const r = recipe()
    assert.equal(r.id, TOOL_ID)
    assert.equal(r.name, 'Job & Interview Prep')
    assert.equal(r.recipe_format, 1)
    assert.match(r.version, /^\d+\.\d+\.\d+$/)
  })
  test('permissions exactly [search_brain, save_to_brain, run_ai]; sourcing advice; web_search helpful', () => {
    const r = recipe()
    assert.deepEqual([...r.permissions].sort(), ['run_ai', 'save_to_brain', 'search_brain'])
    assert.equal(r.sourcing, 'advice')
    assert.equal(r.web_search, 'helpful')
  })
  test('inputs: company_name (text, req), job_posting (long_text, req), my_background (long_text, opt), weaknesses (long_text, opt)', () => {
    const ins = recipe().inputs
    assert.deepEqual(ins.map((i) => [i.id, i.type, i.required]), [
      ['company_name', 'text', true],
      ['job_posting', 'long_text', true],
      ['my_background', 'long_text', false],
      ['weaknesses', 'long_text', false],
    ])
    // The hub adds " (optional)" after every optional label itself (core/app.js),
    // so a label that says it too shows "(optional) (optional)" on screen.
    for (const i of ins.filter((x) => !x.required)) assert.doesNotMatch(i.label, /\(optional\)/i, `${i.id}: the hub already adds "(optional)"`)
    assert.match(ins[2].help, /only what is true/i, 'the background help must ask for true facts only')
  })
  test('brain_context: query is exactly "{{company_name}}" (one placeholder, guide v1.1), limit 5', () => {
    const r = recipe()
    assert.equal(r.brain_context.query, '{{company_name}}')
    assert.equal(r.brain_context.limit, 5)
    assert.equal(fillShort(r.brain_context.query, r, inputsOf('B'), TODAY), 'Northwind Analytics')
  })
  test('output sections are the four PLAN sections, in order (Summary added by the hub)', () => {
    assert.deepEqual(recipe().output.sections, SECTIONS)
  })
  test('save: work_product, tagged job-prep and the company', () => {
    const r = recipe()
    assert.equal(r.save.type, 'work_product')
    assert.deepEqual(r.save.tags, ['job-prep', '{{company_name}}'])
  })
  test('every optional input has its blank-case instruction in the body (and there are no others to cover)', () => {
    const r = recipe()
    const blankRule = { my_background: /If my background is \(not provided\)/, weaknesses: /If my gaps are \(not provided\)/ }
    assert.deepEqual(r.inputs.filter((i) => !i.required).map((i) => i.id), Object.keys(blankRule))
    for (const [id, re] of Object.entries(blankRule)) {
      assert.match(r.body, re, `no blank-case instruction for ${id}`)
      assert.ok(r.body.includes(`{{${id}}}`), `${id} never reaches the prompt`)
    }
    assert.equal(EMPTY_INPUT_TEXT, '(not provided)')
  })
  test('the body repeats the no-invention rule in its own terms: only my background and notes are facts; placeholders otherwise', () => {
    const b = recipe().body
    assert.match(b, /Use only the background above and my notes as facts about me/)
    assert.match(b, /\[your project\]/)
    assert.match(b, /\[your result\]/)
  })
  test('no personal name in the body', () => {
    const b = recipe().body
    assert.ok(!/Maria|Lopez|Paul|Waterman|Tuerto|Ana\b/.test(b), 'a personal name is in the body')
    assert.ok(!/\bI'?m [A-Z][a-z]+ [A-Z][a-z]+/.test(b), 'the body introduces the author by name')
  })
  test('index.json lists it as the third core tool, after hello-hub and company-analysis (then the Builder and Testers)', () => {
    const idx = JSON.parse(readFileSync(INDEX_FILE, 'utf8'))
    assert.deepEqual(idx, ['hello-hub.recipe.md', 'company-analysis.recipe.md', 'job-interview-prep.recipe.md',
      'tool-builder.recipe.md', 'tool-tester-write.recipe.md', 'tool-tester-grade.recipe.md'])
  })
})

describe('prompt fixtures equal what buildPrompt makes now', () => {
  for (const c of ['A', 'B']) {
    test(`case ${c}: prompt.md is exactly the hub's prompt (empty brain, web-search line, today = TODAY), with the advice rule and the current no-invention rule`, () => {
      const p = promptOf(c)
      assert.equal(build(c), p)
      const lines = p.split('\n')
      assert.ok(lines.includes(RULE), 'the current NO_INVENTION_RULE line is missing')
      assert.ok(lines.includes(ADVICE_RULE))
      assert.ok(lines.includes(WEB_SEARCH_LINE))
      assert.ok(p.includes(NO_BRAIN_TEXT))
      assert.ok(!p.includes('{{'), 'an unfilled placeholder')
    })
    test(`case ${c}: prompt-v1.md (what the first answer saw) is prompt.md with only the rule line swapped for v1`, () => {
      const v1 = promptV1Of(c)
      assert.ok(!v1.includes(RULE))
      assert.equal(promptOf(c).split('\n').map((l) => (l === RULE ? RULE_V1 : l)).join('\n'), v1)
    })
    test(`case ${c}: prompt-v2.md (what the second answer saw) is prompt.md with only the rule line swapped for v2`, () => {
      const v2 = promptV2Of(c)
      assert.ok(v2.split('\n').includes(RULE_V2))
      assert.ok(!v2.includes(RULE))
      assert.equal(promptOf(c).split('\n').map((l) => (l === RULE ? RULE_V2 : l)).join('\n'), v2)
    })
  }
  test('case A really exercised both blank optional inputs; case B really filled them', () => {
    const a = inputsOf('A'), b = inputsOf('B')
    assert.equal(a.my_background, '')
    assert.equal(a.weaknesses, '')
    assert.ok(promptOf('A').includes(`My background, in my own words:\n${EMPTY_INPUT_TEXT}`))
    assert.ok(promptOf('A').includes(`Gaps I'm worried about:\n${EMPTY_INPUT_TEXT}`))
    assert.ok(b.my_background.length > 50 && b.weaknesses.length > 5)
    assert.equal(a.job_posting, b.job_posting, 'both cases use the same posting')
  })
})

describe('the answers render', () => {
  for (const c of ['A', 'B']) {
    test(`case ${c}: no missing sections and a Summary`, () => {
      const o = parseOutput(answerOf(c), recipe())
      assert.deepEqual(o.missingSections, [])
      assert.ok(o.summary.length > 0)
    })
  }
  test('case A says what it did with the blank gaps input (the body asks it to)', () => {
    assert.match(answerOf('A'), /(gaps?|background) (is|was|were) not provided|most common gaps/i)
  })
})

// The clarified bar (PLAN "What happened"): no invented claim about the
// student's past or present — achievements, roles, results, dates, numbers —
// and example sentences use placeholders. A first-person goal is not a fact.
describe('never invent facts: the invention check on real answers', () => {
  test('case A (no background): passes, and leans on placeholders instead', () => {
    const a = answerOf('A')
    assert.deepEqual(inventedStudentFacts(a, studentText('A')), [])
    assert.ok(placeholdersIn(a).length >= 10, `only ${placeholdersIn(a).length} placeholders`)
    for (const v of [/\b23%/, /4-person team/, /\b8 weeks\b/, /by 30%/]) assert.ok(!v.test(a), `v1 invented figure ${v} reappears`)
  })
  test('case B (true background): passes; the student figures it uses are hers', () => {
    const b = answerOf('B')
    assert.deepEqual(inventedStudentFacts(b, studentText('B')), [])
    assert.match(b, /22 (→|to) 41/)
    assert.match(b, /5 events/)
    // No new employers, titles or dates attached to her.
    assert.ok(!/\b(19|20)\d\d\b/.test(b.replace(/2026|2027/g, '')), 'a year not in her background')
    assert.ok(!/\b(GPA|Dean'?s list|president|founder|captain)\b/i.test(b), 'a title or honour not in her background')
  })
  test('control: the v1 case-A answer FAILS (example bullets with made-up 23%, 4-person, 8 weeks, 30%)', () => {
    const figs = inventedStudentFacts(answerV1Of('A'), studentText('A')).flatMap((f) => f.figures)
    for (const f of ['23%', '4', '8', '30%']) assert.ok(figs.includes(f), `missed ${f}: ${JSON.stringify(figs)}`)
  })
  test('control: the v1.0 Phase 4 answer FAILS (150+, 73%, 4.5/5, 35%)', () => {
    const inputs = JSON.parse(readFileSync(new URL('../fixtures/phase-4/inputs.json', import.meta.url), 'utf8'))
    const figs = inventedStudentFacts(V10_ANSWER, Object.values(inputs).join('\n')).flatMap((f) => f.figures)
    for (const f of ['150+', '73%', '4.5/5', '35%']) assert.ok(figs.includes(f), `missed ${f}: ${JSON.stringify(figs)}`)
  })
  test('the v1 case-B answer also passed (recorded in PLAN), so B was never the problem', () => {
    assert.deepEqual(inventedStudentFacts(answerV1Of('B'), studentText('B')), [])
  })
  test('resume bullets still use placeholders under the v3 rule: both answers have them in Resume essentials', () => {
    for (const c of ['A', 'B']) {
      const resume = answerOf(c).split(/^## /m).find((s) => s.startsWith('Resume essentials'))
      assert.ok(resume, `case ${c} has no Resume essentials section`)
      const ph = placeholdersIn(resume)
      assert.ok(ph.length >= (c === 'A' ? 10 : 3), `case ${c}: only ${ph.length} placeholders in Resume essentials: ${ph.join(' ')}`)
      assert.ok(ph.some((p) => /^\[X/.test(p)), `case ${c}: no [X…]-style number placeholder in Resume essentials`)
    }
  })
  test('the v2 answers (two-sentence rule) still pass too: the checker change did not move the old bar', () => {
    for (const c of ['A', 'B']) assert.deepEqual(inventedStudentFacts(answerV2Of(c), studentText(c)), [], c)
  })
  test('case A (v3): "In the first 90 days, I\'d talk to customers" passes only as a conditional plan; as a past fact it fails', () => {
    const s = sentencesOf(answerOf('A')).find((x) => /first 90 days/.test(x))
    assert.ok(s, 'the line is gone; update this test')
    assert.match(s, /^In the first 90 days, I'd talk to customers/)
    assert.ok(CONDITIONAL_PLAN.test(s))
    assert.deepEqual(inventedStudentFacts(s, studentText('A')), [])
    const asFact = s.replace("I'd talk to customers", 'I talked to 40 customers')
    assert.notEqual(asFact, s)
    assert.deepEqual(inventedStudentFacts(asFact, studentText('A')).flatMap((f) => f.figures), ['90', '40'])
  })
  test('case B (v3): "+86%" passes only because it is exactly 22 → 41, beside both figures; a wrong percentage is flagged', () => {
    const s = sentencesOf(answerOf('B')).find((x) => /\+86%/.test(x))
    assert.ok(s, 'the line is gone; update this test')
    assert.equal(Math.round(((41 - 22) / 22) * 100), 86)
    assert.deepEqual(inventedStudentFacts(s, studentText('B')), [])
    assert.deepEqual(inventedStudentFacts(s.replace('+86%', '+90%'), studentText('B')).flatMap((f) => f.figures), ['90%'])
  })
  test('the conditional-plan exemption is narrow: "I\'d" meaning "I had", "I would have", and past accomplishments are still examined', () => {
    for (const s of ["- In the first 90 days, I'd talk to 10 customers.", '- I would interview 10 customers in my first month.', '- I’d shadow 3 support calls a week.']) {
      assert.deepEqual(inventedStudentFacts(s, ''), [], s)
    }
    for (const s of ["- I'd grown sign-ups 35%.", "- I'd increased attendance 20%.", "- I'd led 4 projects.", '- I would have run 6 events.', "- I'd talk about how I grew sign-ups 35%."]) {
      assert.equal(inventedStudentFacts(s, '').length, 1, s)
    }
  })
  test('a derived percentage counts as given only when exact and beside both of its figures', () => {
    const given = 'grew average attendance from 22 to 41 students'
    assert.deepEqual(inventedStudentFacts('- Grew attendance from 22 to 41 students (+86%).', given), [])
    assert.deepEqual(inventedStudentFacts('- Attendance went from 41 to 22 students (-46%).', given), [], 'a fall works the same way')
    for (const s of ['- Grew attendance from 22 to 41 students (+90%).', '- Grew attendance by 86%.', '- Grew attendance from 22 to 50 students (+127%).']) {
      assert.equal(inventedStudentFacts(s, given).length, 1, s)
    }
  })
  test('the v3 rule is in every prompt the hub builds, whatever the sourcing, and in both prompt.md fixtures', () => {
    for (const sourcing of [undefined, 'facts', 'advice', 'none']) {
      assert.ok(STANDARD_BLOCK({ sourcing, output: { sections: ['A'] } }).split('\n').includes(RULE), String(sourcing))
    }
    for (const c of ['A', 'B']) assert.ok(promptOf(c).split('\n').includes(RULE), c)
  })
  test('case A (v2): the "first 90 days / 10 customers" line is examined and passes only as a goal; as a past fact it fails', () => {
    const s = sentencesOf(answerV2Of('A')).find((x) => /first 90 days/.test(x))
    assert.ok(s, 'the line is gone; update this test')
    assert.match(s, /^My goal in the first 90 days is to interview at least 10 customers/)
    assert.ok(GOAL.test(s))
    assert.deepEqual(inventedStudentFacts(s, studentText('A')), [])
    const asFact = s.replace('My goal in the first 90 days is to interview at least 10 customers and understand', 'In my first 90 days I interviewed at least 10 customers and understood')
    assert.notEqual(asFact, s)
    assert.deepEqual(inventedStudentFacts(asFact, studentText('A')).flatMap((f) => f.figures), ['90', '10'])
  })
  test('the check now reads a capital "My" (it used to skip it) and a goal frame does not hide a past accomplishment', () => {
    assert.equal(inventedStudentFacts('- My team grew to 10 people.', '').length, 1)
    assert.equal(inventedStudentFacts('- Me and 3 friends ran the fair.', '').length, 1)
    assert.equal(inventedStudentFacts('- I want to build on how I grew sign-ups 35%.', '').length, 1)
    assert.equal(inventedStudentFacts('- I will aim to ship 2 features a month.', '').length, 0)
    assert.equal(inventedStudentFacts("- I'd like to talk to 5 customers a week.", '').length, 0)
  })
})
