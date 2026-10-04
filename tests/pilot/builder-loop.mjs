// Builds each prompt in the Builder → Tester loop with the hub's own code, the
// way a student's taps would, so a real AI can answer it. Not part of npm test.
//
//   node tests/pilot/builder-loop.mjs <dir> builder <round> [--from-grade <file> --recipe <file>]
//   node tests/pilot/builder-loop.mjs <dir> extract <round>          (recipe + Spec from Builder answer)
//   node tests/pilot/builder-loop.mjs <dir> tests <round> <spec-file>  (Tester 1 prompt)
//   node tests/pilot/builder-loop.mjs <dir> runs <round> <recipe-file> <inputs.json>  (one prompt per test)
//   node tests/pilot/builder-loop.mjs <dir> grade <round> <spec-file> <tests-answer> <run-prefix>
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseRecipe } from '../../core/lib/recipe.js'
import { buildPrompt } from '../../core/lib/prompt.js'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const TODAY = process.env.LOOP_TODAY || '2026-10-04'
const [dirArg, cmd, round, ...rest] = process.argv.slice(2)
const dir = resolve(dirArg)
const opt = (n) => { const i = rest.indexOf(`--${n}`); return i >= 0 ? rest[i + 1] : null }
const read = (p) => readFile(resolve(dir, p), 'utf8')
const core = async (id) => parseRecipe(await readFile(resolve(ROOT, `core/tools/${id}.recipe.md`), 'utf8')).recipe

// The two pure helpers the result card uses, taken from core/app.js itself.
const appSrc = await readFile(resolve(ROOT, 'core/app.js'), 'utf8')
const grab = (name) => {
  const i = appSrc.indexOf('export function ' + name)
  let d = 0
  // The body starts at the first "{" after the closing ")" of the parameter list
  // (parameters may contain "{ … }" defaults).
  for (let k = appSrc.indexOf(') {', i) + 2; k < appSrc.length; k++) {
    if (appSrc[k] === '{') d++
    if (appSrc[k] === '}' && --d === 0) return appSrc.slice(i, k + 1).replace('export ', '')
  }
}
const { sectionText, recipesIn } = new Function('parseRecipe', `${grab('fenceMap')};${grab('isHeading')};${grab('sectionText')};${grab('recipesIn')};return { sectionText, recipesIn }`)(parseRecipe)

if (cmd === 'builder') {
  const inputs = JSON.parse(await read('0-request.json'))
  if (opt('from-grade')) {
    inputs.fixes = `Fixes from the Tester:\n${sectionText(await read(opt('from-grade')), 'Fixes')}\n\nMy current recipe:\n${(await read(opt('recipe'))).trim()}`
  }
  const guide = await readFile(resolve(ROOT, 'WIDGET-GUIDE.md'), 'utf8')
  await writeFile(resolve(dir, `${round}-builder.prompt.md`), buildPrompt(await core('tool-builder'), inputs, { today: TODAY, widgetGuide: guide }))
  console.log(`${round}-builder.prompt.md`)
}

if (cmd === 'extract') {
  const a = await read(`${round}-builder.answer.md`)
  const rs = recipesIn(a)
  if (rs.length !== 1) throw new Error(`expected 1 recipe in the answer, found ${rs.length}`)
  const v = parseRecipe(rs[0].text, { fileName: `${rs[0].id}.recipe.md` })
  if (!v.ok) throw new Error('recipe invalid: ' + v.errors.join('; '))
  await writeFile(resolve(dir, `${round}-recipe.recipe.md`), rs[0].text)
  await writeFile(resolve(dir, `${round}-spec.md`), sectionText(a, 'Spec') + '\n')
  const steps = sectionText(a, 'Steps')
  console.log(`${rs[0].id} ${rs[0].text.match(/version: (.*)/)[1]} valid; ${(steps.match(/Spec changed: (yes|no)/i) || ['', 'not stated'])[1]}`)
}

if (cmd === 'tests') {
  const spec = (await read(rest[0])).trim()
  await writeFile(resolve(dir, `${round}-tests.prompt.md`), buildPrompt(await core('tool-tester-write'), { spec }, { today: TODAY }))
  console.log(`${round}-tests.prompt.md`)
}

if (cmd === 'runs') {
  const r = parseRecipe(await read(rest[0])).recipe
  const cases = JSON.parse(await read(rest[1]))
  for (const [n, inputs] of Object.entries(cases)) {
    await writeFile(resolve(dir, `${round}-run-test${n}.prompt.md`), buildPrompt(r, inputs, { today: TODAY }))
  }
  console.log(`${Object.keys(cases).length} run prompts`)
}

if (cmd === 'grade') {
  const spec = (await read(rest[0])).trim()
  const tests = sectionText(await read(rest[1]), 'Test cases')
  let results = `Ran on ${TODAY}.\n\n`
  for (const n of [1, 2, 3]) results += `Test ${n}:\n${(await read(`${rest[2]}${n}.answer.md`)).trim()}\n\n`
  const p = buildPrompt(await core('tool-tester-grade'), { spec, test_cases: tests, results: results.trim() }, { today: TODAY })
  if (p.includes('recipe_format: 1')) throw new Error('a recipe leaked into the grading prompt')
  await writeFile(resolve(dir, `${round}-grade.prompt.md`), p)
  console.log(`${round}-grade.prompt.md`)
}
