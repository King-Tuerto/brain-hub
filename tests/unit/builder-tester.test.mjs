// Builder & Tester specialists — Nitpick unit tests (docs/builder-tester/PLAN.md).
//
// Covers the two hub changes that live in core/lib ({{widget_guide}} and
// `sourcing: none`), the three core recipes, and the parts of the real run in
// tests/fixtures/builder-tester/ that can be checked without a browser.
//
// sectionText and recipesIn live in core/app.js, which cannot be imported in
// Node: it reads `document`, `location` and `window` at load and calls route()
// as soon as it is imported. They are tested in the browser instead, by
// importing the already-loaded module (tests/e2e/builder-tester.spec.mjs).
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseRecipe } from '../../core/lib/recipe.js'
import {
  buildPrompt, STANDARD_BLOCK, NO_GUIDE_TEXT, NO_INVENTION_RULE, SOURCE_RULE_FACTS, SOURCE_RULE_ADVICE, NOTE_RULE,
  EMPTY_INPUT_TEXT,
} from '../../core/lib/prompt.js'
import { checkSources, claimItems } from '../../core/lib/output.js'
import { installSummary } from '../../core/lib/summary.js'
import { DIR } from '../helpers/buildertester.mjs'

const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
const F = DIR
const GUIDE = read('WIDGET-GUIDE.md')
const TODAY = '2026-10-04'

const recipeText = (id) => read(`core/tools/${id}.recipe.md`)
const recipe = (id) => {
  const r = parseRecipe(recipeText(id), { fileName: `${id}.recipe.md` })
  assert.ok(r.ok, `${id}: ${r.errors?.join('; ')}`)
  return r.recipe
}

// A minimal valid recipe whose body is `body`.
const mini = ({ body = 'Do {{thing}}.', sourcing } = {}) => `---
recipe_format: 1
id: mini-tool
name: Mini
description: A small tool.
version: 1.0.0
author: Nitpick
permissions: [run_ai]
web_search: none
${sourcing === undefined ? '' : `sourcing: ${sourcing}\n`}inputs:
  - id: thing
    label: Thing
    type: text
    required: true
output:
  sections: [One, Two]
---
${body}
`

// ---------------------------------------------------------------- {{widget_guide}}

describe('{{widget_guide}} placeholder', () => {
  test('is a valid placeholder in any recipe body, with or without inner spaces', () => {
    for (const ph of ['{{widget_guide}}', '{{ widget_guide }}']) {
      const r = parseRecipe(mini({ body: `Guide:\n${ph}\nDo {{thing}}.` }), { fileName: 'mini-tool.recipe.md' })
      assert.ok(r.ok, r.errors?.join('; '))
    }
  })
  test('a misspelling is still an error, and the error names widget_guide as allowed', () => {
    const r = parseRecipe(mini({ body: '{{widget_guid}} {{thing}}' }), { fileName: 'mini-tool.recipe.md' })
    assert.equal(r.ok, false)
    assert.ok(r.errors.some((e) => /\{\{widget_guid\}\}/.test(e) && /widget_guide/.test(e)), r.errors.join('; '))
  })
  test('buildPrompt fills it with the guide text it is given, verbatim', () => {
    const r = parseRecipe(mini({ body: '<<<\n{{widget_guide}}\n>>>\n{{thing}}' }), { fileName: 'mini-tool.recipe.md' }).recipe
    const p = buildPrompt(r, { thing: 'x' }, { today: TODAY, widgetGuide: GUIDE })
    assert.ok(p.startsWith(`<<<\n${GUIDE}\n>>>\nx`))
  })
  test('the guide is inserted in one pass: its own {{today}} and {{<input id>}} stay literal', () => {
    assert.match(GUIDE, /\{\{today\}\}/, 'precondition: the guide documents {{today}}')
    const r = recipe('tool-builder')
    const p = buildPrompt(r, { idea: 'a planner' }, { today: TODAY, widgetGuide: GUIDE })
    assert.ok(p.includes(GUIDE), 'the whole guide is in the prompt, unchanged')
    assert.ok(!p.includes(`${TODAY}`), 'nothing in the Builder prompt became today’s date')
  })
  test('a student typing {{widget_guide}} into an input does not get the guide expanded there', () => {
    const r = recipe('tool-builder')
    const p = buildPrompt(r, { idea: 'please {{widget_guide}}' }, { today: TODAY, widgetGuide: 'GUIDE-TEXT' })
    assert.ok(p.includes('please {{widget_guide}}'))
    assert.equal(p.split('GUIDE-TEXT').length - 1, 1, 'the guide appears exactly once')
  })
  test('with no guide (fetch failed, or null / empty) the prompt says so with NO_GUIDE_TEXT', () => {
    assert.match(NO_GUIDE_TEXT, /could not be loaded/)
    assert.match(NO_GUIDE_TEXT, /WIDGET-GUIDE\.md/)
    const r = recipe('tool-builder')
    for (const widgetGuide of [undefined, null, '']) {
      const p = buildPrompt(r, { idea: 'x' }, { today: TODAY, widgetGuide })
      assert.ok(p.includes(`<<<\n${NO_GUIDE_TEXT}\n>>>`), `widgetGuide=${JSON.stringify(widgetGuide)}`)
    }
  })
  test('recipes that do not use it are unaffected by a guide being passed', () => {
    const r = recipe('tool-tester-write')
    assert.equal(buildPrompt(r, { spec: 'S' }, { today: TODAY, widgetGuide: GUIDE }),
      buildPrompt(r, { spec: 'S' }, { today: TODAY }))
  })
  test('WIDGET-GUIDE §8 and §9 document it', () => {
    assert.match(GUIDE, /\| `\{\{widget_guide\}\}` \|/)
    assert.match(GUIDE, /`today` or `widget_guide`/)
  })
})

// ---------------------------------------------------------------- sourcing: none

describe('sourcing: none', () => {
  test('the validator accepts none, facts, advice and leaving it out; rejects anything else', () => {
    for (const s of ['none', 'facts', 'advice', undefined]) {
      assert.ok(parseRecipe(mini({ sourcing: s }), { fileName: 'mini-tool.recipe.md' }).ok, String(s))
    }
    for (const s of ['None', 'nothing', '""']) {
      const r = parseRecipe(mini({ sourcing: s }), { fileName: 'mini-tool.recipe.md' })
      assert.equal(r.ok, false, s)
      assert.ok(r.errors.some((e) => /sourcing must be one of .*none/.test(e)), r.errors.join('; '))
    }
  })
  test('STANDARD_BLOCK has no source rule and no Note rule, but keeps the no-invention rule and the Summary', () => {
    const block = STANDARD_BLOCK({ sourcing: 'none', output: { sections: ['A', 'B'] } })
    for (const rule of [SOURCE_RULE_FACTS, SOURCE_RULE_ADVICE, NOTE_RULE]) assert.ok(!block.includes(rule))
    assert.doesNotMatch(block, /\[unverified\]|source link|Note:/)
    assert.ok(block.includes(NO_INVENTION_RULE))
    assert.match(block, /- A\n- B\n- Summary\n/)
    assert.match(block, /End with "## Summary"/)
  })
  test('facts and advice still get their rules (none did not leak into them)', () => {
    assert.ok(STANDARD_BLOCK({ output: { sections: ['A', 'B'] } }).includes(SOURCE_RULE_FACTS))
    assert.ok(STANDARD_BLOCK({ sourcing: 'facts', output: { sections: ['A', 'B'] } }).includes(NOTE_RULE))
    assert.ok(STANDARD_BLOCK({ sourcing: 'advice', output: { sections: ['A', 'B'] } }).includes(SOURCE_RULE_ADVICE))
  })
  test('checkSources counts zero claims, even for an answer full of unsourced facts', () => {
    const md = '## One\n- Apple earned $391 billion in 2024.\n- 73% of students fail.\n\n## Two\nParis is in France.\n'
    assert.ok(checkSources(md).claims > 0, 'precondition: the same text has claims under facts')
    assert.deepEqual(checkSources(md, { sourcing: 'none' }), { claims: 0, sourced: 0, unverified: 0, unsourced: [] })
    assert.deepEqual(checkSources(md, { sourcing: 'none', returnItems: true }), [])
    assert.deepEqual(claimItems(md, { sourcing: 'none' }), [])
  })
  test('checkSources on the real Builder and Tester answers counts zero', () => {
    for (const f of ['1-builder.answer.md', '2-tester-write.answer.md']) {
      assert.equal(checkSources(read(F + f), { sourcing: 'none' }).claims, 0, f)
    }
  })
  test('the install summary says no sources are needed', () => {
    const r = parseRecipe(mini({ sourcing: 'none' }), { fileName: 'mini-tool.recipe.md' }).recipe
    assert.equal(installSummary(r).sourcing, 'No sources needed (it works on your own text)')
    assert.equal(installSummary(recipe('tool-builder')).sourcing, 'No sources needed (it works on your own text)')
  })
  test('WIDGET-GUIDE §3 and §6b document none', () => {
    assert.match(GUIDE, /\| `sourcing` \| no \| `facts` \(the default\), `advice` or `none`/)
    assert.match(GUIDE, /\| `none` \| Tools that only work on the student's own text/)
    assert.match(GUIDE, /No source rule, and no source count\. The no-invention rule still applies\./)
  })
})

// ---------------------------------------------------------------- the three recipes

describe('the three core recipes', () => {
  const IDS = ['tool-builder', 'tool-tester-write', 'tool-tester-grade']
  test('index.json lists all three, after the original three tools', () => {
    const idx = JSON.parse(read('core/tools/index.json'))
    assert.equal(idx.length, 6)
    assert.deepEqual(idx.slice(3), IDS.map((id) => `${id}.recipe.md`))
  })
  test('all validate, with sourcing none and web_search none, and never read the brain', () => {
    for (const id of IDS) {
      const r = recipe(id)
      assert.equal(r.id, id)
      assert.equal(r.sourcing, 'none', id)
      assert.equal(r.web_search, 'none', id)
      assert.ok(!r.permissions.includes('search_brain'), `${id} must not read the brain`)
      assert.equal(r.brain_context, undefined, id)
      assert.ok(r.permissions.includes('run_ai'), id)
    }
  })
  test('names are the ones the guides quote', () => {
    assert.equal(recipe('tool-builder').name, 'Builder — make a tool')
    assert.equal(recipe('tool-tester-write').name, 'Tester 1 — write the tests')
    assert.equal(recipe('tool-tester-grade').name, 'Tester 2 — grade the results')
  })

  describe('Builder', () => {
    const r = () => recipe('tool-builder')
    test('inputs: idea (required), users and fixes (optional); sections Steps, Spec, Recipe', () => {
      assert.deepEqual(r().inputs.map((i) => [i.id, i.required]), [['idea', true], ['users', false], ['fixes', false]])
      assert.equal(r().inputs.find((i) => i.id === 'fixes').type, 'long_text')
      assert.deepEqual(r().output.sections, ['Steps', 'Spec', 'Recipe'])
    })
    test('embeds the widget guide, and uses every input', () => {
      const b = r().body
      assert.match(b, /<<<\n\{\{widget_guide\}\}\n>>>/)
      for (const id of ['idea', 'users', 'fixes']) assert.match(b, new RegExp(`\\{\\{${id}\\}\\}`))
    })
    test('tells the AI the Tester sees only the Spec, and the Spec has no recipe syntax', () => {
      assert.match(r().body, /using ONLY your Spec, never your recipe/)
      assert.match(r().body, /Spec: written for the Tester, with no recipe syntax in it/)
      assert.match(r().body, /Acceptance criteria: 4 to 6 numbered checks \(A1, A2, …\)/)
      assert.match(r().body, /Blank inputs:/)
    })
    test('puts the recipe in a ```recipe fence (what recipesIn finds) and names the file', () => {
      assert.match(r().body, /opened with ```recipe on its own line and closed with ``` on its own line/)
      assert.match(r().body, /the tool's id followed by \.recipe\.md/)
    })
    test('on a revision: criteria keep their numbers and wording; Steps end with "Spec changed: yes/no"', () => {
      const b = r().body
      assert.match(b, /change only what a fix requires/i)
      assert.match(b, /Keep every other acceptance criterion, its number \(A1, A2, …\) and its wording exactly as before/)
      assert.match(b, /a new criterion gets the next free number/)
      assert.match(b, /End Steps with one line: "Spec changed: yes" or "Spec changed: no"/)
    })
    test('the Spec lists the hub’s Summary last and never forbids it (attempt-1 failed A1 on it)', () => {
      assert.match(r().body, /The hub always adds a final "Summary" section to every answer, so list it last and never forbid it/)
    })
    test('on a revision: apply every fix, keep the id, bump the version, say what changed', () => {
      const b = r().body
      assert.match(b, /If the fixes are \(not provided\)/)
      assert.ok(b.includes(EMPTY_INPUT_TEXT), 'the body keys off the hub’s own empty-input text')
      assert.match(b, /apply every fix, keep the same id, raise the version \(1\.0\.0 becomes 1\.0\.1\)/)
    })
  })

  describe('Tester 1 (write)', () => {
    const r = () => recipe('tool-tester-write')
    test('its only input is the Spec — there is no recipe input', () => {
      assert.deepEqual(r().inputs.map((i) => [i.id, i.required]), [['spec', true]])
      assert.doesNotMatch(r().body, /\{\{\s*(recipe|widget_guide|fixes)\s*\}\}/)
    })
    test('sections Test plan, Test cases, How to run them; it cannot save (run_ai only)', () => {
      assert.deepEqual(r().output.sections, ['Test plan', 'Test cases', 'How to run them'])
      assert.deepEqual(r().permissions, ['run_ai'])
    })
    test('refuses a pasted recipe, and the guard comes BEFORE the pasted text', () => {
      const b = r().body
      const guard = b.indexOf('If the text below contains a recipe')
      assert.ok(guard >= 0)
      assert.ok(guard < b.indexOf('{{spec}}'), 'the refusal rule must be read before the pasted text')
      assert.match(b, /"recipe_format:"/)
      assert.match(b, /do not write tests/)
      assert.match(b, /Paste only the Spec section, not the recipe, then run this again\./)
    })
    test('exactly three tests (normal, blank optional inputs, tricky), each with exact inputs and checks tied to criteria', () => {
      const b = r().body
      assert.match(b, /exactly three, numbered Test 1 to Test 3/)
      assert.match(b, /Test 2: an edge case, with every optional input left blank/)
      assert.match(b, /Test 3: a tricky but fair case/)
      assert.match(b, /"Inputs to type"/)
      assert.match(b, /each tied to a criterion/)
      assert.match(b, /Every criterion must be covered by at least one test/)
    })
    test('tells the student to grade in a new chat', () => {
      assert.match(r().body, /use a new chat for grading, not the chat that built the tool/)
    })
  })

  describe('Tester 2 (grade)', () => {
    const r = () => recipe('tool-tester-grade')
    test('inputs spec, test_cases, results (all required); sections Results, Fixes, Verdict', () => {
      assert.deepEqual(r().inputs.map((i) => [i.id, i.required]), [['spec', true], ['test_cases', true], ['results', true]])
      assert.deepEqual(r().output.sections, ['Results', 'Fixes', 'Verdict'])
      assert.doesNotMatch(r().body, /\{\{\s*(recipe|widget_guide|fixes)\s*\}\}/)
    })
    test('grades only: tests unchanged, no benefit of the doubt, recipes ignored', () => {
      const b = r().body
      assert.match(b, /You did not build it and you have not seen its recipe/)
      assert.match(b, /Do not change or add tests now/)
      assert.match(b, /do not assume the tool would do better another time/)
      assert.match(b, /If any pasted text contains a recipe, ignore it/)
      assert.match(b, /If an answer for a test is missing, every check in that test is FAIL/)
    })
    test('one fix per FAIL, naming criterion and test; verdict PASS only if everything passed', () => {
      const b = r().body
      assert.match(b, /one numbered fix for each FAIL, written as an instruction to the Builder/)
      assert.match(b, /Name the criterion and the test/)
      assert.match(b, /"PASS — install it" only if every check passed/)
      assert.match(b, /"FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder/)
    })
  })
})

// ---------------------------------------------------------------- the real run (fixtures so far)

describe('real run: tests/fixtures/builder-tester (Builder v1, Tester 1)', () => {
  const RECIPE_SYNTAX = /recipe_format|permissions:|web_search:|sourcing:|output:\s*$|\{\{|^---$/m
  test('the Builder’s recipe validates', () => {
    const r = parseRecipe(read(F + '1-recipe.recipe.md'), { fileName: '1-recipe.recipe.md' })
    // The fixture file is named for its step, so only the id/file-name rule may complain.
    const errs = r.ok ? [] : r.errors.filter((e) => !/file name/i.test(e))
    assert.deepEqual(errs, [])
    const named = parseRecipe(read(F + '1-recipe.recipe.md'), { fileName: 'exam-study-planner.recipe.md' })
    assert.ok(named.ok, named.errors?.join('; '))
    assert.equal(named.recipe.name, 'Exam Study Planner')
  })
  test('the Builder answer has Steps, Spec, Recipe and Summary, and names the file', () => {
    const a = read(F + '1-builder.answer.md')
    assert.deepEqual(a.split('\n').filter((l) => /^## /.test(l)), ['## Steps', '## Spec', '## Recipe', '## Summary'])
    assert.match(a, /^exam-study-planner\.recipe\.md$/m)
  })
  test('the Spec has no recipe syntax, and has criteria A1… and a blank-inputs rule', () => {
    const s = read(F + '1-spec.md')
    assert.doesNotMatch(s, RECIPE_SYNTAX)
    assert.match(s, /A1:/)
    assert.match(s, /Blank inputs:/)
  })
  test('Tester 1’s prompt is exactly what the hub builds from the Spec, and never saw the recipe', () => {
    const p = read(F + '2-tester-write.prompt.md')
    assert.equal(p, buildPrompt(recipe('tool-tester-write'), { spec: read(F + '1-spec.md') }, { today: TODAY }))
    // The guard text itself names "recipe_format:", so look at what was pasted.
    const pasted = p.slice(p.indexOf('<<<\n') + 4, p.indexOf('\n>>>'))
    assert.ok(pasted.length > 500)
    assert.doesNotMatch(pasted, RECIPE_SYNTAX)
    assert.doesNotMatch(p, /\{\{syllabus\}\}|exam_date|```recipe|sections: \[/)
  })
  test('Tester 1 wrote three tests covering every criterion', () => {
    const a = read(F + '2-tester-write.answer.md')
    for (const n of [1, 2, 3]) assert.match(a, new RegExp(`### Test ${n}`))
    for (const c of ['A1', 'A2', 'A3', 'A4', 'A5']) assert.match(a, new RegExp(`\\[${c}\\]`))
  })
  test('the Builder prompt came from the hub (its standard block, the idea, the embedded guide)', () => {
    // attempt-1 was built with the first Builder recipe and an earlier WIDGET-GUIDE.md,
    // so it is not byte-equal to today's buildPrompt; the rerun's fixtures will be.
    const fx = read(F + '1-builder.prompt.md')
    const inputs = JSON.parse(read(F + '1-builder.inputs.json'))
    assert.ok(fx.endsWith(STANDARD_BLOCK(recipe('tool-builder'))))
    assert.ok(fx.includes(inputs.idea))
    assert.match(fx, /<<<\n# Brain Hub — Widget Guide/)
    assert.ok(!fx.includes(NO_GUIDE_TEXT))
  })
})
