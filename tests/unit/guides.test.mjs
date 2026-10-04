// The student guides (START-HERE.md, EMPIEZA-AQUI.md) — Phase 7, Nitpick.
//
// 1. EN/ES parity BY CONTENT: the same links and code values in the same order,
//    the same sections, the same troubleshooting rows (keyed by the on-screen
//    message each row quotes). Counting markers was the Express mistake.
// 2. Every bold or quoted string in either guide is classified below as an app
//    label, a recipe label, GitHub's or Supabase's wording, the phone's
//    wording, or plain emphasis. App and recipe labels must exist verbatim in the code. A new bold
//    or quoted string fails until someone classifies it — so a guide can't start
//    quoting a button the app doesn't have without a test noticing.
// 3. README links both guides; every relative link and repo path resolves.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { parseRecipe } from '../../core/lib/recipe.js'
import { scoreReport } from '../../core/lib/checker.js'

const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
const EN = read('START-HERE.md')
const ES = read('EMPIEZA-AQUI.md')
const APP = read('core/app.js')
const RECIPE = read('core/tools/company-analysis.recipe.md')
const COMPANY = parseRecipe(RECIPE, { fileName: 'company-analysis.recipe.md' }).recipe

// Line breaks inside a paragraph are not meaningful in Markdown.
const flat = (md) => md.replace(/\n[ \t]*/g, ' ')

const links = (md) => [...flat(md).matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1])
const codes = (md) => [...flat(md).matchAll(/`([^`]+)`/g)].map((m) => m[1])
const bolds = (md) => [...flat(md).matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1])
const quotes = (md) => [...flat(md).matchAll(/"([^"]+)"/g)].map((m) => m[1])
const sections = (md) => md.split('\n').filter((l) => /^## /.test(l))
const steps = (md) => sections(md).map((l) => (/(Step|Paso) (\d+)/.exec(l) ?? [])[2] ?? null)
const troubleRows = (md) => {
  const lines = md.split('\n')
  const start = lines.findLastIndex((l) => /^## /.test(l))
  return lines.slice(start).filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1) // drop header
}

// What the other guide is called, and the placeholder for the student's name.
const sameLink = (u) => (u === 'START-HERE.md' || u === 'EMPIEZA-AQUI.md' ? 'OTHER-GUIDE' : u)
const sameCode = (c) => c.replace(/TU-USUARIO/g, 'YOUR-USERNAME')

test('EN and ES have the same links, in the same order', () => {
  assert.deepEqual(links(ES).map(sameLink), links(EN).map(sameLink))
  assert.equal(links(EN)[0], 'EMPIEZA-AQUI.md', 'START-HERE points at the Spanish guide first')
  assert.equal(links(ES)[0], 'START-HERE.md', 'EMPIEZA-AQUI points at the English guide first')
})

test('EN and ES have the same code values, in the same order', () => {
  assert.deepEqual(codes(ES).map(sameCode), codes(EN))
})

test('EN and ES have the same sections, with the same step numbers in order', () => {
  assert.equal(sections(ES).length, sections(EN).length)
  assert.deepEqual(steps(ES), steps(EN))
  assert.deepEqual(steps(EN).filter(Boolean), ['1', '2', '3', '4', '5', '6'])
})

test('EN and ES troubleshooting tables have the same rows, for the same on-screen messages', () => {
  const en = troubleRows(EN); const es = troubleRows(ES)
  assert.equal(es.length, en.length)
  assert.ok(en.length >= 6)
  // Each row's first cell quotes what the student sees; the quote is English in both.
  const key = (row) => (/"([^"]+)"/.exec(row.split('|')[1]) ?? [])[1] ?? '(none)'
  assert.deepEqual(es.map(key), en.map(key))
})

test('EN and ES quote the same on-screen messages, in the same order', () => {
  // ES example questions and the "add a source link" request are translated
  // prose, so compare only quotes that are English UI text in both.
  const ui = (md) => quotes(md).filter((q) => MESSAGES.has(q) || GITHUB.has(q))
  assert.deepEqual(ui(ES), ui(EN))
})

// ---- Classification of every bold / quoted string ---------------------------

// Buttons and links the app itself shows (core/app.js), checked VERBATIM —
// including the typographic apostrophe in "I don’t" (Phase 7 G6).
const APP_LABELS = new Set([
  'Next', 'Skip — I don’t have a brain yet', 'Connect my brain', 'Manual (copy and paste)', 'Automatic', 'Finish',
  'Run', 'Copy prompt', 'Paste answer', 'Use this answer', 'Check this answer', 'Copy check prompt', 'Score it',
  'Save to brain', 'Save', 'Download', 'Add a tool', 'Check recipe', 'Install', 'Copy answer', 'Refresh tools', 'Sign in again', 'Settings',
])
// Built from templates in app.js.
const APP_TEMPLATED = {
  // `Open ${app.name}` with app.name 'Claude'.
  'Open Claude': () => APP.includes('`Open ${app.name}`') && APP.includes("name: 'Claude'"),
  // `Score so far: ${result.score} / ${result.outOf} — …`. The guide quotes it with
  // "…" for the score, so what must hold is the fixed text around it and that,
  // before the citation check, outOf really is 50 (sections 20 + sources 30).
  // `Copy “${name}”`, the per-section copy button: the guides say "under the Spec heading, tap **Copy**".
  'Copy': () => APP.includes('`Copy “${name}”`') && APP.includes("tid: 'copy-section'"),
  'Score so far: … / 50': () => APP.includes('`Score so far: ${result.score} / ${result.outOf}') &&
    scoreReport('## Company snapshot\n- A fact. [1](https://example.com)\n', COMPANY, null).outOf === 50,
}
// Messages the app shows, checked as a substring of an app.js string.
const MESSAGES = new Map([
  ['Could not reach that brain', 'Could not reach that brain.'],
  ['This brain is open', 'This brain is open:'],
  ['open', 'This brain is open:'], // "if it says your brain is **open**"
  ['Your brain session ended', 'Your brain session ended.'],
  ['have no source', 'claims have no source.'],
  ['Paste answer', "'Paste answer'"],
  ['not supported', ' not supported by '], // the checker's contradicted-claims warning
])
// Labels that come from the Company Analysis recipe, not from app.js.
const RECIPE_LABELS = new Set(['Company Analysis', 'Company', 'Business unit for the environmental scan', 'What is this for?'])
// "Build your own tool": the names and section headings of the three core
// Builder/Tester recipes, checked against those recipes below.
const BUILDER = {
  'tool-builder': { name: 'Builder — make a tool', sections: ['Steps', 'Spec', 'Recipe'] },
  'tool-tester-write': { name: 'Tester 1 — write the tests', sections: [] },
  'tool-tester-grade': { name: 'Tester 2 — grade the results', sections: ['Fixes'] },
}
const BUILDER_LABELS = new Set(Object.values(BUILDER).flatMap((b) => [b.name, ...b.sections]))
// GitHub's own wording (checked against docs.github.com, 2026-10-03; not testable here).
const GITHUB = new Set(['Fork', 'Create fork', 'Settings', 'Pages', 'Build and deployment', 'Source',
  'Deploy from a branch', 'Branch', 'main', '/ (root)', 'Save', 'Sync fork', 'Update branch', 'Your site is live at…', '404',
  'Add file', 'Create new file', 'Commit changes', 'Actions'])
// Supabase's dashboard wording (checked against supabase.com/docs, 2026-10-03:
// the project's Connect dialog shows the Project URL; not testable here).
// "Connect" is Supabase's button, NOT the hub's "Connect my brain".
const SUPABASE = new Set(['Connect', 'Project URL'])
// The phone's / browser's own wording (not testable here; PILOT-CHECKLIST).
const PHONE = new Set(['Desktop site', 'Sitio de escritorio', 'Share', 'Add to Home Screen', 'Install app',
  'Add to Home screen', 'Compartir', 'Agregar a pantalla de inicio', 'Instalar app', 'Agregar a la pantalla principal',
  '⋮', 'Paste', 'Pegar'])
// The guides' own emphasis and lead-ins: not something on a screen.
const EMPHASIS = new Set([
  // EN
  'Time: about 15 minutes.', 'Stuck? Ask your AI, not the person who sent you this.', 'A free GitHub account.',
  'An AI app you already use:', 'Optional: an Open Brain.', 'not', 'your copy', 'iPhone (Safari):', 'Android (Chrome):',
  'iPhone:', 'in the home-screen app', 'Your name.', 'Your brain.', 'No Open Brain?', 'Have one?', 'public',
  'Never paste your secret key', 'How tools should run.', 'Manual is free:', 'Your keys and password stay on your phone.',
  'Company:', 'Business unit for the environmental scan:', 'paste', 'copy the whole answer', 'source check',
  'Want to be sure?', "It isn't your final score yet.", 'Keep it:', "That's it. You've done a sourced company analysis.",
  'Never edit the `core/` folder.', 'Keep it on every device:', 'pauses after a week without use',
  'builds', 'tests', '1. Build it (Builder).', '2. Write the tests (Tester 1)', '3. Run the tests.', '4. Grade (Tester 2).',
  '5. Fix and retest until it passes.', 'Use a new chat in your AI app',
  // These two quote Tester 2's verdicts; the test below checks the recipe really says them.
  'If it says FIX AND RETEST:', 'When it says PASS:', 'copy its new Spec and run Tester 1 again',
  // ES
  'Tiempo: unos 15 minutos.', 'La app está en inglés.', 'tal como aparecen en pantalla',
  '¿Te atoras? Pregúntale a tu IA, no a la persona que te mandó esto.', 'Una cuenta gratuita de GitHub.',
  'Una app de IA que ya uses:', 'Opcional: un Open Brain.', 'No', 'tu copia', 'dentro de esa app', 'Tu nombre.',
  'Tu brain (cerebro).', '¿No tienes Open Brain?', '¿Tienes uno?', 'pública', 'Nunca pegues tu clave secreta',
  'Cómo correr las herramientas.', 'Manual es gratis:', 'Tus claves y tu contraseña se quedan en tu teléfono.',
  'pega', 'copia la respuesta completa', 'revisión de fuentes', '¿Quieres asegurarte?', 'Todavía no es tu calificación final.',
  'Para guardarlo:', 'Listo. Hiciste un análisis de empresa con fuentes.', 'Nunca edites la carpeta `core/`.',
  'Tenla en todos tus dispositivos:', 'se pausa después de una semana sin uso',
  'construye', 'prueba', '1. Constrúyela (Builder).', '2. Escribe las pruebas (Tester 1)', '3. Corre las pruebas.',
  '4. Califica (Tester 2).', '5. Corrige y vuelve a probar hasta que pase.', 'Usa un chat nuevo en tu app de IA',
  'Si dice FIX AND RETEST', 'Cuando diga PASS', 'copia su Spec nuevo y corre otra vez Tester 1',
  // Translated example questions / requests to the AI (prose, not UI).
  "I'm on step 2 and I don't see a Pages option. Here's a screenshot.", "What does 'fork' mean? Is it safe?",
  "The hub says 'Could not reach that brain'. What do I do?", 'add a source link to every fact, or mark it [unverified]',
  'Estoy en el paso 2 y no veo la opción Pages. Aquí va una captura.', "¿Qué significa 'fork'? ¿Es seguro?",
  "El hub dice 'Could not reach that brain'. ¿Qué hago?", 'agrega un enlace de fuente a cada dato, o márcalo [unverified]',
])
const isLinkOrCode = (s) => /^\[.*\]\(.*\)$/.test(s) || /^`[^`]+`$/.test(s)
const classified = (s) => isLinkOrCode(s) || APP_LABELS.has(s) || s in APP_TEMPLATED || MESSAGES.has(s) ||
  RECIPE_LABELS.has(s) || BUILDER_LABELS.has(s) || GITHUB.has(s) || SUPABASE.has(s) || PHONE.has(s) || EMPHASIS.has(s)
const quotedAnywhere = () => new Set([...bolds(EN), ...bolds(ES), ...quotes(EN), ...quotes(ES)])

for (const [name, md] of [['START-HERE.md', EN], ['EMPIEZA-AQUI.md', ES]]) {
  test(`${name}: every bold or quoted string is classified (app, recipe, GitHub, Supabase, phone, or emphasis)`, () => {
    const unknown = [...new Set([...bolds(md), ...quotes(md)])].filter((s) => !classified(s))
    assert.deepEqual(unknown, [], 'classify these in tests/unit/guides.test.mjs, and if they are app labels make sure the app has them')
  })
}

test('the classification lists hold nothing stale (every entry is still quoted by a guide)', () => {
  const q = quotedAnywhere()
  const all = [...APP_LABELS, ...Object.keys(APP_TEMPLATED), ...MESSAGES.keys(), ...RECIPE_LABELS, ...BUILDER_LABELS, ...GITHUB, ...SUPABASE, ...PHONE, ...EMPHASIS]
  assert.deepEqual(all.filter((s) => !q.has(s)), [])
})

test('every app button the guides quote exists verbatim in core/app.js', () => {
  for (const label of APP_LABELS) {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(APP, new RegExp(`['\`]${esc}['\`]`), `app.js has no string literal "${label}"`)
  }
  for (const [label, ok] of Object.entries(APP_TEMPLATED)) assert.ok(ok(), `app.js cannot produce "${label}"`)
})

test('the app and both guides send students to the same place for the Project URL (Supabase → Connect)', () => {
  // N1: the old "Project Settings → API" menu no longer exists; the app's own
  // address message must not drift back to it, or disagree with the guides.
  assert.match(APP, /In Supabase, tap Connect at the top of your project to see its Project URL\./)
  assert.doesNotMatch(APP, /Project Settings → API/)
  for (const md of [EN, ES]) {
    assert.match(flat(md), /\*\*Connect\*\*.{0,80}\*\*Project URL\*\*/)
    assert.doesNotMatch(md, /Project Settings/)
  }
})

test('every app message the guides quote exists in core/app.js', () => {
  for (const [label, inApp] of MESSAGES) assert.ok(APP.includes(inApp), `app.js does not say "${inApp}" (quoted as "${label}")`)
})

test('every recipe label the guides quote exists in the Company Analysis recipe', () => {
  assert.match(RECIPE, /^name: Company Analysis$/m)
  for (const label of ['Company', 'Business unit for the environmental scan', 'What is this for?']) {
    assert.match(RECIPE, new RegExp(`^\\s+label: ${label.replace(/[?]/g, '\\?')}$`, 'm'), `recipe has no input labelled "${label}"`)
  }
  assert.match(RECIPE, /options: \[Class assignment,/, 'the guide says "pick one"; the recipe must offer choices')
})

test('the Spanish guide glosses each app label the first time it uses it', () => {
  // Rule from PLAN.md: English label exactly as on screen, Spanish gloss in brackets the first time.
  // Labels GitHub also uses (Save, Settings) first appear in the GitHub steps, so they are skipped.
  const f = flat(ES)
  for (const label of [...APP_LABELS, ...Object.keys(APP_TEMPLATED), ...RECIPE_LABELS, ...BUILDER_LABELS]) {
    if (GITHUB.has(label)) continue
    const at = f.indexOf(`**${label}**`)
    if (at < 0) continue
    const after = f.slice(at + label.length + 4, at + label.length + 8)
    assert.match(after, /^:? ?\(/, `ES first use of **${label}** has no (gloss): "...${f.slice(at, at + label.length + 30)}"`)
  }
})

test('every Builder/Tester label the guides quote is a real core tool name or output section', () => {
  for (const [id, { name, sections }] of Object.entries(BUILDER)) {
    const r = parseRecipe(read(`core/tools/${id}.recipe.md`), { fileName: `${id}.recipe.md` })
    assert.ok(r.ok, `${id} does not validate: ${r.errors}`)
    assert.equal(r.recipe.name, name)
    for (const s of sections) assert.ok(r.recipe.output.sections.includes(s), `${id} has no "${s}" section`)
  }
  const grade = read('core/tools/tool-tester-grade.recipe.md')
  assert.match(grade, /"FIX AND RETEST/, 'the guides quote the FIX AND RETEST verdict')
  assert.match(grade, /"PASS — install it"/, 'the guides quote the PASS verdict')
})

test('both guides tell the student to copy the Spec only, and to grade in a new chat', () => {
  assert.match(flat(EN), /Copy the Spec only, never the recipe/)
  assert.match(flat(ES), /Copia solo el Spec, nunca la receta/)
  assert.match(flat(EN), /\*\*Use a new chat in your AI app\*\*, not the one that built the tool/)
  assert.match(flat(ES), /\*\*Usa un chat nuevo en tu app de IA\*\*, no el que construyó la herramienta/)
})

test('both guides say: after every fix, copy the new Spec and run Tester 1 again before retesting', () => {
  assert.match(flat(EN), /\*\*copy its new Spec and run Tester 1 again\*\*, every time, even if the Builder says the Spec didn't change/)
  assert.match(flat(ES), /\*\*copia su Spec nuevo y corre otra vez Tester 1\*\*, siempre, aunque el Builder diga que el Spec no cambió/)
})

// ---- Links and paths --------------------------------------------------------

test('README links both guides', () => {
  const readme = read('README.md')
  assert.match(readme, /\]\(START-HERE\.md\)/)
  assert.match(readme, /\]\(EMPIEZA-AQUI\.md\)/)
})

test('every relative link in the guides resolves to a file in the repo', () => {
  for (const md of [EN, ES]) {
    for (const href of links(md).filter((u) => !/^(https?:|mailto:|#)/.test(u))) {
      assert.ok(existsSync(new URL(href.split('#')[0], root)), `broken link: ${href}`)
    }
  }
})

test('every repo path the guides name in code (core/, plugins/) exists', () => {
  for (const md of [EN, ES]) {
    for (const c of codes(md).filter((x) => /^[a-z-]+\/$|^[A-Z-]+\.md$/.test(x))) {
      assert.ok(existsSync(new URL(c, root)), `the guide names ${c} but the repo has no such path`)
    }
  }
})

test('the guides point students at the real repo and keep its name', () => {
  for (const md of [EN, ES]) {
    assert.ok(links(md).includes('https://github.com/King-Tuerto/brain-hub'))
    assert.ok(codes(md).includes('brain-hub'))
    // Step 2's address must match what repoFromLocation() reads (owner.github.io/<repo>/).
    assert.ok(codes(md).some((c) => /^https:\/\/(YOUR-USERNAME|TU-USUARIO)\.github\.io\/brain-hub\/$/.test(c)))
  }
})
