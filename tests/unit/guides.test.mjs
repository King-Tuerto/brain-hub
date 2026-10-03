// The student guides (START-HERE.md, EMPIEZA-AQUI.md) — Phase 7, Nitpick.
//
// 1. EN/ES parity BY CONTENT: the same links and code values in the same order,
//    the same sections, the same troubleshooting rows (keyed by the on-screen
//    message each row quotes). Counting markers was the Express mistake.
// 2. Every bold or quoted string in either guide is classified below as an app
//    label, a recipe label, GitHub's wording, the phone's wording, or plain
//    emphasis. App and recipe labels must exist verbatim in the code. A new bold
//    or quoted string fails until someone classifies it — so a guide can't start
//    quoting a button the app doesn't have without a test noticing.
// 3. README links both guides; every relative link and repo path resolves.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
const EN = read('START-HERE.md')
const ES = read('EMPIEZA-AQUI.md')
const APP = read('core/app.js')
const RECIPE = read('core/tools/company-analysis.recipe.md')

// Line breaks inside a paragraph are not meaningful in Markdown.
const flat = (md) => md.replace(/\n[ \t]*/g, ' ')
// The only normalisation: the app uses typographic apostrophes (I don’t), the
// guides type straight ones (I don't). A student sees the same word; we accept it.
const apos = (s) => s.replace(/[’‘]/g, "'")

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

// Buttons and links the app itself shows (core/app.js), checked verbatim.
const APP_LABELS = new Set([
  'Skip — I don\'t have a brain yet', 'Manual (copy and paste)', 'Automatic', 'Finish',
  'Run', 'Copy prompt', 'Paste answer', 'Use this answer', 'Check this answer',
  'Save to brain', 'Download', 'Add a tool', 'Sign in again', 'Settings',
])
// Built from a template in app.js: `Open ${app.name}` with app.name 'Claude'.
const APP_TEMPLATED = { 'Open Claude': () => APP.includes('`Open ${app.name}`') && APP.includes("name: 'Claude'") }
// Messages the app shows, checked as a substring of an app.js string.
const MESSAGES = new Map([
  ['Could not reach that brain', 'Could not reach that brain.'],
  ['This brain is open', 'This brain is open:'],
  ['open', 'This brain is open:'], // "if it says your brain is **open**"
  ['Your brain session ended', 'Your brain session ended.'],
  ['have no source', 'claims have no source.'],
  ['Paste answer', "'Paste answer'"],
])
// Labels that come from the Company Analysis recipe, not from app.js.
const RECIPE_LABELS = new Set(['Company Analysis', 'Company', 'Business unit for the environmental scan', 'What is this for?'])
// GitHub's own wording (checked against docs.github.com, 2026-10-03; not testable here).
const GITHUB = new Set(['Fork', 'Create fork', 'Settings', 'Pages', 'Build and deployment', 'Source',
  'Deploy from a branch', 'Branch', 'main', '/ (root)', 'Save', 'Sync fork', 'Update branch', 'Your site is live at…', '404'])
// The phone's / browser's own wording (not testable here; PILOT-CHECKLIST).
const PHONE = new Set(['Desktop site', 'Sitio de escritorio', 'Share', 'Add to Home Screen', 'Install app',
  'Add to Home screen', 'Compartir', 'Agregar a inicio', 'Instalar app', 'Agregar a la pantalla principal',
  '⋮', 'Paste', 'Pegar'])
// The guides' own emphasis and lead-ins: not something on a screen.
const EMPHASIS = new Set([
  // EN
  'Time: about 15 minutes.', 'Stuck? Ask your AI, not the person who sent you this.', 'A free GitHub account.',
  'An AI app you already use:', 'Optional: an Open Brain.', 'not', 'your copy', 'iPhone (Safari):', 'Android (Chrome):',
  'iPhone:', 'in the home-screen app', 'Your name.', 'Your brain.', 'No Open Brain?', 'Have one?', 'public',
  'Never paste your secret key', 'How tools should run.', 'Manual is free:', 'Your keys and password stay on your phone.',
  'Company:', 'Business unit for the environmental scan:', 'paste', 'copy the whole answer', 'source check',
  'Want to be sure?', 'Keep it:', "That's it. You've done a sourced company analysis.", 'Never edit the `core/` folder.',
  // ES
  'Tiempo: unos 15 minutos.', 'La app está en inglés.', 'tal como aparecen en pantalla',
  '¿Te atoras? Pregúntale a tu IA, no a la persona que te mandó esto.', 'Una cuenta gratuita de GitHub.',
  'Una app de IA que ya uses:', 'Opcional: un Open Brain.', 'No', 'tu copia', 'dentro de esa app', 'Tu nombre.',
  'Tu brain (cerebro).', '¿No tienes Open Brain?', '¿Tienes uno?', 'pública', 'Nunca pegues tu llave secreta',
  'Cómo correr las herramientas.', 'Manual es gratis:', 'Tus llaves y tu contraseña se quedan en tu teléfono.',
  'pega', 'copia la respuesta completa', 'revisión de fuentes', '¿Quieres estar seguro?', 'Para guardarlo:',
  'Listo. Hiciste un análisis de empresa con fuentes.', 'Nunca edites la carpeta `core/`.',
  // Translated example questions / requests to the AI (prose, not UI).
  "I'm on step 3 and I don't see a Pages option. Here's a screenshot.", "What does 'fork' mean? Is it safe?",
  "The hub says 'Could not reach that brain'. What do I do?", 'add a source link to every fact, or mark it [unverified]',
  'Estoy en el paso 3 y no veo la opción Pages. Aquí va una captura.', "¿Qué significa 'fork'? ¿Es seguro?",
  "El hub dice 'Could not reach that brain'. ¿Qué hago?", 'agrega un enlace de fuente a cada dato, o márcalo [unverified]',
])
const isLinkOrCode = (s) => /^\[.*\]\(.*\)$/.test(s) || /^`[^`]+`$/.test(s)
const classified = (s) => isLinkOrCode(s) || APP_LABELS.has(s) || s in APP_TEMPLATED || MESSAGES.has(s) ||
  RECIPE_LABELS.has(s) || GITHUB.has(s) || PHONE.has(s) || EMPHASIS.has(s)

for (const [name, md] of [['START-HERE.md', EN], ['EMPIEZA-AQUI.md', ES]]) {
  test(`${name}: every bold or quoted string is classified (app, recipe, GitHub, phone, or emphasis)`, () => {
    const unknown = [...new Set([...bolds(md), ...quotes(md)])].filter((s) => !classified(s))
    assert.deepEqual(unknown, [], 'classify these in tests/unit/guides.test.mjs, and if they are app labels make sure the app has them')
  })
}

test('every app button the guides quote exists verbatim in core/app.js', () => {
  const quoted = new Set([...bolds(EN), ...bolds(ES), ...quotes(EN), ...quotes(ES)])
  for (const label of APP_LABELS) {
    assert.ok(quoted.has(label), `"${label}" is listed as quoted but neither guide quotes it; remove it from the list`)
    const esc = apos(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(apos(APP), new RegExp(`['\`]${esc}['\`]`), `app.js has no string literal "${label}"`)
  }
  for (const [label, ok] of Object.entries(APP_TEMPLATED)) assert.ok(ok(), `app.js cannot produce "${label}"`)
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
  const KNOWN_UNGLOSSED = new Set(['Automatic']) // Nitpick Phase 7 finding N7 — remove once glossed
  const f = flat(ES)
  for (const label of [...APP_LABELS, ...Object.keys(APP_TEMPLATED), ...RECIPE_LABELS]) {
    if (KNOWN_UNGLOSSED.has(label)) continue
    const at = f.indexOf(`**${label}**`)
    if (at < 0) continue
    const after = f.slice(at + label.length + 4, at + label.length + 8)
    assert.match(after, /^:? ?\(/, `ES first use of **${label}** has no (gloss): "...${f.slice(at, at + label.length + 30)}"`)
  }
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
