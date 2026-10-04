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
import { DIR, TODAY, ROUNDS, LAST, BUILT_ID, BUILT_NAME, round, fixesFor, resultsFor, appHelpers, asBuiltToday } from '../helpers/buildertester.mjs'

const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
const F = DIR
const GUIDE = read('WIDGET-GUIDE.md')

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
    for (const f of ['r1-builder.answer.md', 'r1-tests.answer.md', 'r1-run-test1.answer.md', 'r5-grade.answer.md']) {
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
    test('the fixes box takes the Tester’s fixes, the current Spec and the current recipe (final run, round 2)', () => {
      assert.equal(r().inputs.find((i) => i.id === 'fixes').label, "Tester's fixes, your Spec and your recipe")
      assert.match(r().body, /they contain the Tester's fixes, the current Spec and the current recipe/)
    })
    test('the fixes box’s help names all three things to paste, like its label', () => {
      assert.match(r().inputs.find((i) => i.id === 'fixes').help, /Fixes.*Spec.*recipe/)
    })
    test('on a revision the new Spec starts as a word-for-word copy of the current one', () => {
      assert.match(r().body, /Write the new Spec by copying the current Spec word for word, then change only what a fix requires\./)
    })
    test('objective criteria: decidable without a judgment call, every requirement covered, no "only about" criteria', () => {
      const b = r().body
      assert.match(b, /decide without a judgment call: by counting, by comparing dates, or by looking for exact words/)
      assert.match(b, /Every requirement in the student's idea must be covered by at least one criterion; checks of layout alone are not enough/)
      assert.match(b, /Never write a criterion like "only about topic X" or "nothing related to Y"; say which words must or must not appear instead/)
    })
    test('front matter: a plain author, never square brackets in a value (attempt-2 was uninstallable)', () => {
      assert.match(r().body, /set author to: Brain Hub student/)
      assert.match(r().body, /never put square brackets in any front-matter value/)
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
    test('inputs: the Spec (required) and the previous test cases (optional) — there is no recipe input', () => {
      assert.deepEqual(r().inputs.map((i) => [i.id, i.required, i.type]), [['spec', true, 'long_text'], ['previous_tests', false, 'long_text']])
      assert.match(r().inputs[0].label, /Spec only/)
      assert.doesNotMatch(r().body, /\{\{\s*(recipe|widget_guide|fixes)\s*\}\}/)
      assert.match(r().body, /<<<\n\{\{previous_tests\}\}\n>>>/)
    })
    test('a retest copies every previous test word for word, unless a criterion it checks changed', () => {
      const b = r().body
      assert.match(b, /If the previous test cases are \(not provided\), write new tests now/)
      assert.ok(b.includes(EMPTY_INPUT_TEXT), 'the body keys off the hub’s own empty-input text')
      assert.match(b, /copy every previous test exactly, word for word, unless a criterion it checks was changed or removed in the Spec above/)
      assert.match(b, /add a check only for a criterion that is new/)
      assert.match(b, /Start the Test plan with a list of every change you made and why, or "No changes: the tests are the same as last time\."/)
    })
    test('with previous tests left blank, the prompt says (not provided) for them — a first run', () => {
      const p = buildPrompt(r(), { spec: 'S' }, { today: TODAY })
      assert.ok(p.includes(`Previous test cases:\n<<<\n${EMPTY_INPUT_TEXT}\n>>>`), p)
    })
    test('objective checks: no judgment calls; "about" criteria become word lists', () => {
      const b = r().body
      assert.match(b, /Every check must be decidable without a judgment call: count something, compare a date, or look for exact words/)
      assert.match(b, /When a criterion is about what something is about, turn it into words: list the exact words that must not appear/)
      assert.match(b, /Two careful people must always agree on the result/)
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
      assert.ok(guard < b.indexOf('{{previous_tests}}'), '…and before the pasted previous tests')
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
    test('grades each check exactly as worded, no wider (attempt-5 stuck on judgment calls)', () => {
      const b = r().body
      assert.match(b, /against the Spec and the test cases exactly as written/)
      assert.match(b, /Grade each check exactly as its words say, no wider: if a check lists words that must not appear, it fails only if one of those words appears, in any form: plural, -ing, -ed, or a related form such as "genetic" for "genetics"\. Quote the form you found\./)
    })
    test('word forms count (round 5 passed with "genetic" when "genetics" was banned): Tester 1 says so in its checks, Tester 2 grades so', () => {
      assert.match(recipe('tool-tester-write').body, /say that every form of a listed word counts: plural, -ing, -ed, and related forms such as "genetic" for "genetics"/)
      assert.match(r().body, /in any form: plural, -ing, -ed, or a related form/)
    })
    test('one fix per FAIL, naming criterion and test; verdict PASS only if everything passed', () => {
      const b = r().body
      assert.match(b, /one numbered fix for each FAIL, written as an instruction to the Builder/)
      assert.match(b, /Name the criterion and the test/)
      assert.match(b, /"PASS — install it" only if every check passed/)
      assert.match(b, /Otherwise "FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again\."/)
    })
  })
})

// ---------------------------------------------------------------- the real run (r1 … rN)

// docs/builder-tester/PLAN.md "The final run": syllabus-study-planner, FIX AND RETEST
// in rounds 1–4, PASS in round 5 (v1.0.4); round 6 re-tests v1.0.4 under the
// narrowed no-invention rule and the word-form-aware Testers (FIX), round 7 is
// v1.0.5 (PASS). Every prompt must be what the hub itself builds, so the run
// proves the shipped recipes, not hand-made prompts. Prompts from rounds run
// before a hub change may differ from today's only in the SUPERSEDED lines.
const { sectionText, recipesIn } = await appHelpers()

describe('real run: the Builder → Tester loop, every round', () => {
  const RECIPE_SYNTAX = /recipe_format|permissions:|web_search:|sourcing:|^output:\s*$|\{\{|^---$/m
  const REQUEST = JSON.parse(read(DIR + '0-request.json'))
  // The pasted text between the hub's <<< >>> markers (the guard text itself names "recipe_format:").
  const pasted = (p) => [...p.matchAll(/<<<\n([\s\S]*?)\n>>>/g)].map((m) => m[1])
  const criteria = (spec) => Object.fromEntries([...spec.matchAll(/^- (A\d+): (.*)$/gm)].map((m) => [m[1], m[2]]))
  const changedCriteria = (n) => Object.entries(criteria(round(n).spec)).filter(([c, t]) => criteria(round(n - 1).spec)[c] !== t).map(([c]) => c)
  const checks = (testsAnswer) => sectionText(testsAnswer, 'Test cases').split('\n').filter((l) => /^- \[(A\d+|Order)\]/.test(l))
  const tagOf = (line) => /^- \[(A\d+|Order)\]/.exec(line)[1]
  const verdict = (n) => sectionText(round(n).gradeAnswer, 'Verdict')
  // Same bytes as today's hub, allowing only the superseded lines; returns which were used.
  const sameAsHub = (fixture, built, what) => {
    const { text, used } = asBuiltToday(fixture)
    assert.equal(text, built, what)
    return used
  }
  const usedByRound = {}
  const note = (n, used) => { usedByRound[n] = [...new Set([...(usedByRound[n] ?? []), ...used])] }

  test('the rounds are r1 … rN with no gaps, and N ≥ 7', () => {
    assert.deepEqual(ROUNDS, Array.from({ length: LAST }, (_, i) => i + 1))
    assert.ok(LAST >= 7)
  })

  for (const n of ROUNDS) {
    describe(`round ${n}`, () => {
      const R = round(n)
      if (R.builder) {
        test('the Builder prompt is what the hub builds (round 2+: with the Fixes, Spec and recipe of the round before)', () => {
          const inputs = { ...REQUEST }
          if (n > 1) inputs.fixes = fixesFor(n, sectionText(round(n - 1).gradeAnswer, 'Fixes'))
          note(n, sameAsHub(R.builderPrompt, buildPrompt(recipe('tool-builder'), inputs, { today: TODAY, widgetGuide: GUIDE }), 'Builder prompt'))
          if (n > 1) {
            assert.ok(R.builderPrompt.includes(`My current Spec:\n${round(n - 1).spec.trim()}`), 'the Spec was sent back')
            assert.ok(R.builderPrompt.includes(round(n - 1).recipe.trim()), 'the recipe was sent back')
          }
        })
        test('the answer has Steps, Spec, Recipe, Summary; one recipe, found by recipesIn, that is this round’s recipe', () => {
          const a = R.builderAnswer
          assert.deepEqual(a.split('\n').filter((l) => /^## /.test(l)), ['## Steps', '## Spec', '## Recipe', '## Summary'])
          assert.match(a, new RegExp(`^\`?${BUILT_ID}\\.recipe\\.md\`?$`, 'm'), 'the file name, on its own line')
          const found = recipesIn(a)
          assert.equal(found.length, 1)
          assert.equal(found[0].text, R.recipe)
          assert.equal(R.spec, sectionText(a, 'Spec') + '\n', 'the Spec is the answer’s Spec section')
        })
        if (n > 1) {
          test('Steps end by saying whether the Spec changed', () => {
            assert.match(sectionText(R.builderAnswer, 'Steps'), /Spec changed: (yes|no)/i)
          })
        }
      } else {
        test('no Builder this round: the same recipe and Spec are re-tested unchanged', () => {
          assert.ok(n > 1)
          assert.equal(R.recipe, round(n - 1).recipe)
          assert.equal(R.spec, round(n - 1).spec)
        })
      }
      test('the recipe validates under its own name, with a plain author and sourcing none', () => {
        const v = parseRecipe(R.recipe, { fileName: `${BUILT_ID}.recipe.md` })
        assert.ok(v.ok, v.errors?.join('; '))
        assert.equal(v.recipe.id, BUILT_ID)
        assert.equal(v.recipe.name, BUILT_NAME)
        assert.equal(v.recipe.author, 'Brain Hub student')
        assert.equal(v.recipe.sourcing, 'none')
      })
      test('the Spec has no recipe syntax, lists Summary and has a blank-inputs rule', () => {
        assert.doesNotMatch(R.spec, RECIPE_SYNTAX)
        assert.match(R.spec, /^- A1: /m)
        assert.match(R.spec, /Blank inputs/)
        assert.match(R.spec, /Summary/, 'Summary is listed (attempt-1)')
      })
      test('Tester 1’s prompt is the hub’s, from the Spec (and the previous Test cases), and holds no recipe', () => {
        const previous_tests = n > 1 ? sectionText(round(n - 1).testsAnswer, 'Test cases') : ''
        note(n, sameAsHub(R.testsPrompt, buildPrompt(recipe('tool-tester-write'), { spec: R.spec.trim(), previous_tests }, { today: TODAY }), 'Tester 1 prompt'))
        for (const text of pasted(R.testsPrompt)) assert.doesNotMatch(text, RECIPE_SYNTAX)
        assert.doesNotMatch(R.testsPrompt, /```recipe|sections: \[|\{\{syllabus\}\}/)
        if (n === 1) assert.ok(R.testsPrompt.includes(`<<<\n${EMPTY_INPUT_TEXT}\n>>>`), 'round 1 has no previous tests')
      })
      test('Tester 1 wrote three tests and covered every criterion in the Spec', () => {
        for (const k of [1, 2, 3]) assert.match(R.testsAnswer, new RegExp(`^### Test ${k}`, 'm'))
        const covered = new Set(checks(R.testsAnswer).map(tagOf))
        for (const c of Object.keys(criteria(R.spec))) assert.ok(covered.has(c), `${c} has no check`)
      })
      test('the three run prompts are the built recipe run with the test inputs', () => {
        const built = parseRecipe(R.recipe, { fileName: `${BUILT_ID}.recipe.md` }).recipe
        for (const k of ['1', '2', '3']) note(n, sameAsHub(R.runPrompt(k), buildPrompt(built, R.cases[k], { today: TODAY }), `test ${k} prompt`))
        assert.equal(R.cases['2'].exam_date, '', 'Test 2 leaves the optional input blank')
      })
      test('the grade prompt is the hub’s, and contains no recipe anywhere', () => {
        const p = R.gradePrompt
        note(n, sameAsHub(p, buildPrompt(recipe('tool-tester-grade'), { spec: R.spec.trim(), test_cases: sectionText(R.testsAnswer, 'Test cases'), results: resultsFor(n) }, { today: TODAY }), 'grade prompt'))
        // The tool's answers may use "---" rules, so look for what only a recipe has.
        assert.doesNotMatch(p, /recipe_format|```recipe|^permissions:|^inputs:|^web_search:|^sourcing:|\{\{/m)
      })
      test('the grade: one PASS/FAIL row per check; PASS has no FAIL and no fixes; FIX has one fix per FAIL naming criterion and test', () => {
        const g = R.gradeAnswer
        assert.deepEqual(g.split('\n').filter((l) => /^## /.test(l)), ['## Results', '## Fixes', '## Verdict', '## Summary'])
        const rows = sectionText(g, 'Results').split('\n').filter((l) => /^\| \d \|/.test(l))
        const fails = rows.filter((l) => /\| FAIL \|/.test(l))
        assert.equal(rows.filter((l) => /\| (PASS|FAIL) \|/.test(l)).length, rows.length, 'every row is PASS or FAIL')
        assert.equal(rows.length, checks(R.testsAnswer).length, 'one row per check')
        if (verdict(n).startsWith('PASS')) {
          assert.equal(verdict(n), 'PASS — install it')
          assert.equal(fails.length, 0)
          assert.equal(sectionText(g, 'Fixes'), 'No fixes needed.')
        } else {
          assert.equal(verdict(n), 'FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.')
          assert.ok(fails.length > 0)
          const fixes = sectionText(g, 'Fixes').split('\n').filter((l) => /^\d+\. /.test(l))
          assert.equal(fixes.length, fails.length, 'one fix per FAIL')
          for (const f of fixes) assert.match(f, /^\d+\. \[A\d+, Test \d\]/, f)
        }
      })
    })
  }

  // Between rounds: the bar stays fixed.
  for (const n of ROUNDS.slice(1)) {
    test(`round ${n - 1} → ${n}: the Spec changed only in the criteria the Steps say changed`, () => {
      const before = round(n - 1).spec.split('\n')
      const after = round(n).spec.split('\n')
      const added = after.filter((l) => !before.includes(l))
      const removed = before.filter((l) => !after.includes(l))
      assert.deepEqual(Object.keys(criteria(round(n).spec)), Object.keys(criteria(round(n - 1).spec)), 'no criterion renumbered, added or dropped')
      const steps = round(n).builder ? sectionText(round(n).builderAnswer, 'Steps') : 'Spec changed: no'
      if (/Spec changed: no/i.test(steps)) {
        assert.deepEqual([added, removed], [[], []], 'no Spec change claimed, so the Spec must be identical')
        return
      }
      assert.match(steps, /Spec changed: yes/i)
      const changed = changedCriteria(n)
      assert.ok(changed.length > 0, 'Steps say the Spec changed, but no criterion did')
      for (const c of changed) assert.match(steps, new RegExp(`\\b${c}\\b`), `${c} changed but the Steps do not name it`)
      // Every changed line is a changed criterion, or the Output description that same fix touched.
      for (const l of added) assert.ok(changed.some((c) => l.startsWith(`- ${c}: `)) || /^\d+\. \*\*/.test(l), `unexplained Spec change: ${l}`)
      assert.equal(added.length, removed.length, 'lines were changed, not added or removed')
    })
    test(`round ${n - 1} → ${n}: Tester 1 kept every check word for word, except checks of a changed criterion`, () => {
      const changed = changedCriteria(n)
      const prev = checks(round(n - 1).testsAnswer)
      const now = checks(round(n).testsAnswer)
      const rewritten = prev.filter((l) => !now.includes(l))
      for (const l of rewritten) assert.ok(changed.includes(tagOf(l)), `check rewritten although ${tagOf(l)} did not change: ${l}`)
      // A rewritten or added check is marked, so the student can see what moved.
      for (const l of now.filter((x) => !prev.includes(x))) assert.match(l, /\*\((new|changed)\)\*/, l)
      if (now.length === prev.length && !rewritten.length) {
        assert.match(sectionText(round(n).testsAnswer, 'Test plan'), /No changes: the tests are the same as last time\./)
      }
      assert.deepEqual(round(n).cases, round(n - 1).cases, 'the same test inputs every round')
    })
  }

  test('the verdicts and versions match PLAN: FIX×4, PASS (1.0.4), FIX under the new rules, PASS (1.0.5)', () => {
    assert.deepEqual(ROUNDS.map((n) => (verdict(n).startsWith('PASS') ? 'PASS' : 'FIX')), ['FIX', 'FIX', 'FIX', 'FIX', 'PASS', 'FIX', 'PASS'])
    assert.deepEqual(ROUNDS.map((n) => /^version: (.*)$/m.exec(round(n).recipe)[1]), ['1.0.0', '1.0.1', '1.0.2', '1.0.3', '1.0.4', '1.0.4', '1.0.5'])
    // The version goes up by one patch exactly when the Builder ran.
    for (const n of ROUNDS.slice(1)) {
      const [a, b] = [n - 1, n].map((k) => Number(/^version: 1\.0\.(\d+)$/m.exec(round(k).recipe)[1]))
      assert.equal(b - a, round(n).builder ? 1 : 0, `round ${n}`)
    }
    assert.equal(verdict(LAST), 'PASS — install it', 'the loop ends on PASS')
  })

  test('the final round was run entirely with today’s hub: no superseded line in any of its prompts', () => {
    // Filled by the byte-for-byte tests above (they run first, in file order).
    assert.ok(usedByRound[LAST], 'the per-round prompt tests did not run')
    assert.deepEqual(usedByRound[LAST], [])
    // Round 6, the regression round: everything on today's hub except its Tester 1
    // prompt, built with an unshipped draft of the rule (it only writes tests).
    assert.deepEqual(usedByRound[LAST - 1], ['NO_INVENTION_RULE v3 draft'])
    assert.equal(asBuiltToday(round(LAST - 1).testsPrompt).used.join(), 'NO_INVENTION_RULE v3 draft')
    for (const k of ['1', '2', '3']) assert.deepEqual(asBuiltToday(round(LAST - 1).runPrompt(k)).used, [], 'the tool itself ran under the shipped rule')
    for (const n of ROUNDS) if (n !== LAST - 1) assert.ok(!usedByRound[n].includes('NO_INVENTION_RULE v3 draft'), `round ${n}`)
    for (const n of [1, 2, 3, 4, 5]) assert.ok(usedByRound[n].includes('NO_INVENTION_RULE v2'), `round ${n} ran before the rule was narrowed`)
  })

  test('under the narrowed rule, practice questions use concrete made-up numbers, never [X] placeholders', () => {
    const questions = (n, k) => sectionText(round(n).runAnswer(k), 'Practice Questions')
    // Control: round 1 (old rule) wrote "[X] dollars" into a made-up question.
    assert.match(questions(1, '1'), /\[X\] dollars/)
    for (const n of [LAST - 1, LAST]) {
      for (const k of ['1', '2', '3']) {
        const q = questions(n, k)
        assert.ok(q.length > 200, `round ${n} test ${k}: no Practice Questions`)
        assert.doesNotMatch(q.replace(/\[[^\]]*\]\(https?:[^)]*\)/g, ''), /\[[^\]]+\]/, `round ${n} test ${k}: a [placeholder] in a practice question`)
      }
      // The ECON test asks about opportunity cost: its questions carry real figures, not just "Question 1…5".
      const figures = questions(n, '1').replace(/\*\*Question \d+:?\*\*|Question \d+/g, '').match(/\$?\d[\d,.]*/g) ?? []
      assert.ok(figures.length >= 2, `round ${n} test 1: only ${figures.length} figures in the practice questions`)
    }
  })
})
