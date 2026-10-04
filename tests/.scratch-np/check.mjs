import { readFileSync } from 'node:fs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { buildPrompt } from '../../core/lib/prompt.js'
const R = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const D = 'tests/fixtures/builder-tester/'
const F = (n) => R(D + n)
const core = (id) => parseRecipe(R(`core/tools/${id}.recipe.md`)).recipe
const app = R('core/app.js')
const grab = (name) => { const i = app.indexOf('export function ' + name); let d = 0; for (let k = app.indexOf(') {', i) + 2; k < app.length; k++) { if (app[k] === '{') d++; if (app[k] === '}' && --d === 0) return app.slice(i, k + 1).replace('export ', '') } }
const { sectionText, recipesIn } = new Function('parseRecipe', `${grab('fenceMap')};${grab('isHeading')};${grab('sectionText')};${grab('recipesIn')};return { sectionText, recipesIn }`)(parseRecipe)
const TODAY = '2026-10-04'
const guide = R('WIDGET-GUIDE.md')
const req = JSON.parse(F('0-request.json'))
for (const n of [1,2,3,4,5]) {
  const r = `r${n}`
  const inputs = { ...req }
  if (n > 1) inputs.fixes = `Fixes from the Tester:\n${sectionText(F(`r${n-1}-grade.answer.md`), 'Fixes')}\n\nMy current Spec:\n${F(`r${n-1}-spec.md`).trim()}\n\nMy current recipe:\n${F(`r${n-1}-recipe.recipe.md`).trim()}`
  const bp = buildPrompt(core('tool-builder'), inputs, { today: TODAY, widgetGuide: guide })
  console.log(r, 'builder', bp === F(`${r}-builder.prompt.md`))
  const rs = recipesIn(F(`${r}-builder.answer.md`))
  console.log(r, 'recipe', rs.length, rs[0]?.text === F(`${r}-recipe.recipe.md`), 'spec', sectionText(F(`${r}-builder.answer.md`), 'Spec') + '\n' === F(`${r}-spec.md`))
  const prev = n > 1 ? sectionText(F(`r${n-1}-tests.answer.md`), 'Test cases') : ''
  const tp = buildPrompt(core('tool-tester-write'), { spec: F(`${r}-spec.md`).trim(), previous_tests: prev }, { today: TODAY })
  console.log(r, 'tests', tp === F(`${r}-tests.prompt.md`))
  const rec = parseRecipe(F(`${r}-recipe.recipe.md`)).recipe
  const cases = JSON.parse(F(`${r}-cases.json`))
  for (const k of ['1','2','3']) console.log(r, 'run', k, buildPrompt(rec, cases[k], { today: TODAY }) === F(`${r}-run-test${k}.prompt.md`))
  let results = `Ran on ${TODAY}.\n\n`
  for (const k of [1,2,3]) results += `Test ${k}:\n${F(`${r}-run-test${k}.answer.md`).trim()}\n\n`
  const gp = buildPrompt(core('tool-tester-grade'), { spec: F(`${r}-spec.md`).trim(), test_cases: sectionText(F(`${r}-tests.answer.md`), 'Test cases'), results: results.trim() }, { today: TODAY })
  console.log(r, 'grade', gp === F(`${r}-grade.prompt.md`))
  console.log(r, 'verdict', sectionText(F(`${r}-grade.answer.md`), 'Verdict'))
}
