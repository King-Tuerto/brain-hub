// Brain Hub app: routing and screens. All logic lives in core/lib; this file
// only draws the UI and wires it to that logic.
import * as S from './lib/store.js'
import { parseRecipe } from './lib/recipe.js'
import { buildPrompt, formatBrainContext, fillShort, WEB_SEARCH_LINE } from './lib/prompt.js'
import { installSummary, PRIVACY_WARNING } from './lib/summary.js'
import { parseOutput, checkSources } from './lib/output.js'
import { createBrain, keyProblem, isSupabaseUrl } from './lib/brain.js'
import { createAI } from './lib/ai.js'
import { discoverTools, loadTools, repoFromLocation, parseRepo } from './lib/plugins.js'
import { buildSaveRow, downloadFile, resolveTags, localDate } from './lib/save.js'
import { claimsToCheck, buildCheckerPrompt, parseCheckerAnswer, scoreReport, grade } from './lib/checker.js'
import { marked } from './vendor/marked.esm.js'
import DOMPurify from './vendor/purify.es.mjs'

// AI answers are untrusted: a recipe, a web page the AI read, or a pasted answer
// can all steer them. Nothing in an answer may load anything or collect input:
// an image URL could carry brain notes to a stranger's server with no click
// (Nitpick H1). Images become plain links; the CSP in index.html backs this up.
const escAttr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
marked.use({ renderer: { image({ href, text }) { return `<a href="${escAttr(href)}">[image: ${escAttr(text || 'link')}]</a>` } } })
const PURIFY = {
  FORBID_TAGS: ['img', 'picture', 'source', 'video', 'audio', 'track', 'form', 'input', 'button', 'textarea',
    'select', 'option', 'style', 'link', 'meta', 'iframe', 'frame', 'object', 'embed', 'svg', 'math', 'base'],
  FORBID_ATTR: ['style', 'srcset', 'action', 'formaction', 'background', 'poster', 'ping'],
}
export function renderAnswer(text) {
  return DOMPurify.sanitize(marked.parse(String(text ?? ''), { async: false }), PURIFY)
}

const EXPRESS_URL = 'https://github.com/King-Tuerto/open-brain-express'
const UPGRADE_URL = `${EXPRESS_URL}/blob/main/UPGRADE.md`
const AI_APPS = {
  claude: { name: 'Claude', url: 'https://claude.ai/new' },
  chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/' },
  gemini: { name: 'Gemini', url: 'https://gemini.google.com/app' },
}

const app = document.getElementById('app')

// ---------------------------------------------------------------- helpers

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue
    if (k === 'tid') el.dataset.testid = v
    else if (k === 'class') el.className = v
    else if (k === 'text') el.textContent = v
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v)
    else if (k in el && typeof v !== 'string') el[k] = v
    else el.setAttribute(k, v === true ? '' : v)
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue
    el.append(c instanceof Node ? c : document.createTextNode(String(c)))
  }
  return el
}

function render(...nodes) {
  app.replaceChildren(...nodes)
  window.scrollTo(0, 0)
}

function note(kind, tid, ...children) {
  return h('div', { class: `note ${kind}`, tid, role: kind === 'bad' || kind === 'warn' ? 'alert' : 'status' }, ...children)
}

function saveFile(fileName, text, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = h('a', { href: url, download: fileName })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

const today = () => localDate()

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text)))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const settings = () => S.getSettings()

function bumpStat(name) {
  const s = settings()
  S.setSettings({ stats: { ...s.stats, [name]: (s.stats?.[name] ?? 0) + 1 } })
}

function brain() {
  const cfg = S.get('hub.brain', null)
  if (!cfg?.url || !cfg?.anonKey) return null
  return createBrain({ url: cfg.url, anonKey: cfg.anonKey, store: S.store })
}

function noBrainNudge() {
  return note('', 'no-brain-nudge',
    'With an Open Brain, you could save this and find it again later, and tools would use what you already know. ',
    h('a', { href: EXPRESS_URL, target: '_blank', rel: 'noopener' }, 'Build one in an hour.'))
}

// ---------------------------------------------------------------- answers: copy, sections, recipes

let guideCache = null
// The Builder's prompt carries the hub's own widget guide ({{widget_guide}}), so a
// student never has to paste it by hand.
async function widgetGuideFor(recipe) {
  if (!/\{\{\s*widget_guide\s*\}\}/.test(recipe.body)) return null
  if (guideCache) return guideCache
  try {
    const res = await fetch('WIDGET-GUIDE.md', { cache: 'no-cache' })
    if (res.ok) guideCache = await res.text()
  } catch { /* the prompt then says the guide is missing */ }
  return guideCache
}

async function copyText(text, statusEl) {
  try { await navigator.clipboard.writeText(text); statusEl.textContent = 'Copied.' }
  catch { statusEl.textContent = 'Could not copy — long-press the text and choose Copy.' }
}

// Lines of an answer, each marked as inside a fenced code block or not. A fence
// closes only on the same character, at least as long, with nothing after it
// (CommonMark), so a ``` block inside a ~~~~ or ```` fence stays inside it.
export function fenceMap(md) {
  const lines = String(md).split(/\r?\n/)
  const out = []
  let open = null
  for (const line of lines) {
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line)
    if (!open && m) { open = { ch: m[1][0], len: m[1].length, info: m[2].trim() }; out.push({ line, fence: 'open', info: open.info }); continue }
    if (open && m && m[1][0] === open.ch && m[1].length >= open.len && !m[2].trim()) { open = null; out.push({ line, fence: 'close' }); continue }
    out.push({ line, inside: !!open })
  }
  return out
}
export function isHeading(l, name) {
  const m = /^##\s+(.+?)\s*#*\s*$/.exec(l.line)
  if (!m || l.inside || l.fence) return false
  const norm = (t) => t.replace(/[*_`]/g, '').trim().toLowerCase()
  return name == null || norm(m[1]) === norm(name)
}

// The Markdown of one ## section (heading excluded), from the raw answer.
// "## " lines inside a code block are not headings (Nitpick #3).
export function sectionText(md, name) {
  const map = fenceMap(md)
  const start = map.findIndex((l) => isHeading(l, name))
  if (start < 0) return ''
  let end = map.findIndex((l, i) => i > start && isHeading(l))
  if (end < 0) end = map.length
  return map.slice(start + 1, end).map((l) => l.line).join('\n').trim()
}

// A small Copy button after every ## heading, so a student can copy one section
// (the Builder's Spec, for the Tester) without the rest.
// What a section's Copy button copies. A section holding a recipe copies just the
// recipe file, ready to paste into plugins/ (Nitpick S1); anything else, the section.
export function sectionCopy(md, name) {
  const text = sectionText(md, name)
  const [recipe] = recipesIn(text)
  return recipe ? recipe.text : text
}

function addSectionCopyButtons(body, md) {
  body.querySelectorAll('h2').forEach((h2) => {
    const name = h2.textContent.trim()
    const status = h('span', { class: 'small muted', role: 'status' })
    h2.after(h('div', { class: 'row' },
      h('button', { class: 'ghost', tid: 'copy-section', 'data-section': name, onclick: () => copyText(sectionCopy(md, name), status) }, `Copy “${name}”`),
      status))
  })
}

// Recipes in an answer (the Builder's output): every fenced block whose text is a
// recipe, plus — if the AI followed the guide's "no fence" rule instead — an
// unfenced recipe under a "## Recipe" heading (Nitpick #4). Valid ones get an
// Install button; invalid ones are reported with their problems.
export function recipesIn(md, { withProblems = false } = {}) {
  const map = fenceMap(md)
  const blocks = []
  for (let i = 0; i < map.length; i++) {
    if (map[i].fence !== 'open') continue
    const body = []
    let j = i + 1
    for (; j < map.length && map[j].fence !== 'close'; j++) body.push(map[j].line)
    if (j < map.length) blocks.push(body.join('\n'))
    i = j
  }
  const recipeSection = sectionText(md, 'Recipe')
  if (/^---\s*$/m.test(recipeSection.split('\n')[0] ?? '')) blocks.push(recipeSection)

  const out = []
  const problems = []
  for (const raw of blocks) {
    const text = raw.replace(/^\s+/, '') + '\n'
    if (!text.startsWith('---')) continue
    const r = parseRecipe(text)
    if (r.ok) { if (!out.some((x) => x.id === r.recipe.id)) out.push({ id: r.recipe.id, name: r.recipe.name, text }) }
    else if (/^\s*recipe_format\s*:/m.test(text) && !problems.some((p) => p.join() === r.errors.join())) problems.push(r.errors)
  }
  return withProblems ? { recipes: out, problems } : out
}

// ---------------------------------------------------------------- tools

let toolsState = null

async function loadAllTools({ force = false } = {}) {
  const s = settings()
  const repo = parseRepo(s.repoOverride) ?? repoFromLocation(location)
  const found = await discoverTools({ store: S.store, repo, base: './', force })
  const loaded = await loadTools(found.tools)
  toolsState = { ...found, loaded }
  return toolsState
}

async function getTool(id) {
  if (!toolsState) await loadAllTools()
  return toolsState.loaded.find((t) => t.ok && t.recipe.id === id) ?? null
}

// ---------------------------------------------------------------- router

function route() {
  const hash = location.hash || '#/home'
  const [, name = 'home', arg] = hash.match(/^#\/([^/]*)\/?(.*)$/) ?? []
  if (!settings().setupDone && name !== 'setup') { location.replace('#/setup'); return }
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === name))
  switch (name) {
    case 'setup': return renderSetup(Number(arg) || 1)
    case 'tool': {
      let id = arg
      try { id = decodeURIComponent(arg) } catch { /* malformed link: show "not found" */ }
      return renderTool(id)
    }
    case 'add': return renderAdd()
    case 'settings': return renderSettings()
    default: return renderHome()
  }
}

window.addEventListener('hashchange', route)

// ---------------------------------------------------------------- setup

function steps(n) {
  return h('div', { class: 'steps', 'aria-hidden': 'true' }, [1, 2, 3].map((i) => h('i', { class: i <= n ? 'on' : '' })))
}

function renderSetup(step) {
  if (step === 2) return setupBrain()
  if (step === 3) return setupAI()
  const name = h('input', { type: 'text', id: 'setup-name', tid: 'setup-name', autocomplete: 'given-name', value: settings().name })
  render(h('section', { tid: 'screen-setup', class: 'card' },
    steps(1),
    h('h1', { text: 'Welcome to Brain Hub' }),
    h('p', { class: 'muted', text: 'Two quick choices and you are in. Nothing you type here leaves this browser except to services you pick.' }),
    h('label', { for: 'setup-name', text: 'What should we call you?' }),
    name,
    h('div', { class: 'row mt' },
      h('button', { class: 'primary', tid: 'setup-next', onclick: () => {
        S.setSettings({ name: name.value.trim() })
        location.hash = '#/setup/2'
      } }, 'Next')),
  ))
}

function setupBrain() {
  const prev = S.get('hub.brain', {}) ?? {}
  const url = h('input', { type: 'url', id: 'brain-url', tid: 'brain-url', placeholder: 'https://xxxx.supabase.co', value: prev.url ?? '', autocomplete: 'off' })
  const key = h('input', { type: 'text', id: 'brain-key', tid: 'brain-key', placeholder: 'sb_publishable_… or eyJ…', value: prev.anonKey ?? '', autocomplete: 'off' })
  const email = h('input', { type: 'email', id: 'brain-email', tid: 'brain-email', autocomplete: 'username' })
  const password = h('input', { type: 'password', id: 'brain-password', tid: 'brain-password', autocomplete: 'current-password' })
  const status = h('div', { tid: 'brain-status', role: 'status', 'aria-live': 'polite' })
  const refused = h('div', { tid: 'brain-refused', class: 'note bad', role: 'alert', hidden: true })
  // The form's submit event is the ONLY path into doConnect: a tap on this
  // submit button and Enter / the phone's Go key both fire it exactly once
  // (Nitpick R2, R3). `busy` stops a second submit while one is running.
  const connect = h('button', { type: 'submit', class: 'primary', tid: 'brain-connect' }, 'Connect my brain')
  let busy = false

  const say = (kind, text) => { status.replaceChildren(text ? note(kind, null, text) : '') }
  const refuse = (text) => {
    refused.replaceChildren(h('p', { text }),
      h('a', { href: UPGRADE_URL, target: '_blank', rel: 'noopener' }, 'How to upgrade your brain'))
    refused.hidden = false
  }

  async function doConnect() {
    if (busy) return
    refused.hidden = true
    const u = url.value.trim()
    const k = key.value.trim()
    const e = email.value.trim()
    const p = password.value
    password.value = ''
    if (!u || !k || !e || !p) { say('bad', 'Fill in all four boxes: brain address, public key, email and password.'); return }
    if (!isSupabaseUrl(u)) { say('bad', 'The brain address should look like https://xxxx.supabase.co. In Supabase, tap Connect at the top of your project to see its Project URL.'); return }
    if (keyProblem(k) === 'secret') {
      say('', '')
      refuse('That is a secret key. It unlocks your whole brain and must never be pasted into an app. Use the publishable (public) key instead, and if this secret key has been shared anywhere, rotate it in Supabase.')
      return
    }
    connect.disabled = true
    busy = true
    say('', 'Checking your brain is locked to you…')
    try {
      const b = createBrain({ url: u, anonKey: k, store: S.store })
      const verdict = await b.openCheck()
      if (verdict === 'unreachable') { say('bad', 'Could not reach that brain. Check the address and your internet connection.'); return }
      if (verdict === 'open') {
        say('', '')
        refuse('This brain is open: anyone who has its public key can read and change everything in it. Brain Hub will not connect until it is locked. The upgrade takes about ten minutes.')
        return
      }
      if (verdict === 'not-express') {
        say('', '')
        refuse('This brain is older than Open Brain Express, so Brain Hub cannot search it. Upgrade it first.')
        return
      }
      if (verdict !== 'locked') {
        say('', '')
        refuse('Brain Hub could not confirm this brain is locked, so it will not connect. Upgrading to the current Open Brain Express fixes this.')
        return
      }
      say('', 'Locked. Signing in…')
      const res = await b.signIn(e, p)
      if (!res.ok) { say('bad', `Sign-in failed: ${res.error}`); return }
      S.set('hub.brain', { url: u.replace(/\/+$/, ''), anonKey: k })
      say('ok', 'Connected.')
      location.hash = '#/setup/3'
    } finally {
      connect.disabled = false
      busy = false
    }
  }

  render(h('section', { tid: 'screen-setup', class: 'card' },
    steps(2),
    h('h1', { text: 'Connect your brain' }),
    h('p', { class: 'muted', text: 'Optional. With an Open Brain, tools use what you already know and can save their results.' }),
    h('button', { class: 'wide', tid: 'brain-skip', onclick: () => {
      S.remove('hub.brain'); S.remove('hub.session')
      location.hash = '#/setup/3'
    } }, 'Skip — I don’t have a brain yet'),
    h('form', { onsubmit: (ev) => { ev.preventDefault(); doConnect() } },
      h('label', { for: 'brain-url', text: 'Brain address (Project URL)' }), url,
      h('label', { for: 'brain-key', text: 'Public key (publishable / anon key)' }), key,
      h('p', { class: 'help', text: 'Never paste the service role key or any “secret” key here.' }),
      h('label', { for: 'brain-email', text: 'Email you sign in to your brain with' }), email,
      h('label', { for: 'brain-password', text: 'Password' }), password,
      h('p', { class: 'help', text: 'Your password goes only to your own brain. Brain Hub never stores it.' }),
      h('div', { class: 'row mt' }, connect),
    ),
    status, refused,
  ))
}

function setupAI() {
  const s = settings()
  let mode = s.aiMode
  let picked = [...(s.models ?? [])]
  let aiApp = s.aiApp

  const keyInput = h('input', { type: 'password', id: 'or-key', tid: 'or-key', autocomplete: 'off', placeholder: 'sk-or-…', value: S.get('hub.openrouterKey', '') ?? '' })
  const modelSelect = h('select', { id: 'model-select', tid: 'model-select', multiple: true, 'aria-describedby': 'model-help' })
  for (const id of picked) modelSelect.append(h('option', { value: id, selected: true, text: id }))
  modelSelect.addEventListener('change', () => {
    const chosen = [...modelSelect.selectedOptions].map((o) => o.value)
    picked = [...picked.filter((m) => chosen.includes(m)), ...chosen.filter((m) => !picked.includes(m))]
    order.textContent = picked.length ? `Order tried: ${picked.join(' → ')}` : ''
  })
  const order = h('p', { class: 'help', text: picked.length ? `Order tried: ${picked.join(' → ')}` : '' })
  const paid = h('input', { type: 'checkbox', id: 'paid-search', tid: 'paid-search', checked: !!s.paidSearch })
  const aiStatus = h('div', { tid: 'ai-status', role: 'status' })

  const loadModels = h('button', { tid: 'or-load-models', onclick: async () => {
    const key = keyInput.value.trim()
    if (!key) { aiStatus.replaceChildren(note('bad', null, 'Paste your OpenRouter key first.')); return }
    aiStatus.replaceChildren(note('', null, 'Loading free models…'))
    const res = await createAI({ key }).listFreeModels()
    if (!res.ok) { aiStatus.replaceChildren(note('bad', null, `Could not load models: ${res.error}`)); return }
    modelSelect.replaceChildren(...res.models.map((m) =>
      h('option', { value: m.id, selected: picked.includes(m.id), text: m.name })))
    aiStatus.replaceChildren(note('ok', null, `${res.models.length} free models. Pick two or three: if one is busy, the next is tried.`))
  } }, 'Load free models')

  const autoPanel = h('div', {},
    h('label', { for: 'or-key', text: 'OpenRouter key' }), keyInput,
    note('warn', 'or-limit-reminder',
      'Set a spending limit on this key at openrouter.ai (Settings → Keys) before you use it. Free models cost nothing, but web search and paid models do.'),
    loadModels,
    h('label', { for: 'model-select', text: 'Models, in the order to try them' }), modelSelect,
    h('p', { class: 'help', id: 'model-help', text: 'Free models are rate-limited and change often, so pick more than one.' }), order,
    h('label', { class: 'check' }, paid, 'Allow paid web search (billed by OpenRouter)'),
    note('warn', 'auto-privacy-warning', `${PRIVACY_WARNING} Tools that search your brain include those notes in the prompt.`),
  )

  const appButtons = Object.entries(AI_APPS).map(([id, a]) =>
    h('button', { class: `choice ${aiApp === id ? 'selected' : ''}`, tid: `ai-app-${id}`, onclick: (ev) => {
      aiApp = id
      appButtons.forEach((b) => b.classList.toggle('selected', b === ev.currentTarget))
    } }, a.name))
  const manualPanel = h('div', {},
    h('p', { class: 'muted', text: 'Brain Hub writes the prompt; you paste it into your AI app and paste the answer back. Uses your existing subscription, no extra cost.' }),
    h('div', { class: 'choice-grid' }, appButtons))

  const modeBtn = (id, title, sub) => h('button', { class: 'choice', tid: `ai-mode-${id}`, onclick: () => { mode = id; sync() } },
    h('strong', { text: title }), h('small', { text: sub }))
  const autoBtn = modeBtn('auto', 'Automatic', 'Brain Hub runs the AI for you with your OpenRouter key.')
  const manualBtn = modeBtn('manual', 'Manual (copy and paste)', 'Use the Claude, ChatGPT or Gemini app you already have.')
  function sync() {
    autoBtn.classList.toggle('selected', mode === 'auto')
    manualBtn.classList.toggle('selected', mode === 'manual')
    autoPanel.hidden = mode !== 'auto'
    manualPanel.hidden = mode !== 'manual'
  }

  const finish = h('button', { class: 'primary', tid: 'setup-finish', onclick: () => {
    if (mode === 'auto') {
      const key = keyInput.value.trim()
      if (!key) { aiStatus.replaceChildren(note('bad', null, 'Automatic mode needs an OpenRouter key.')); return }
      if (!picked.length) { aiStatus.replaceChildren(note('bad', null, 'Load the free models and pick at least one.')); return }
      S.set('hub.openrouterKey', key)
    }
    S.setSettings({ aiMode: mode, models: picked, paidSearch: paid.checked, aiApp, setupDone: true })
    location.hash = '#/home'
  } }, 'Finish')

  render(h('section', { tid: 'screen-setup', class: 'card' },
    steps(3),
    h('h1', { text: 'How should tools run?' }),
    h('div', { class: 'choice-grid' }, autoBtn, manualBtn),
    autoPanel, manualPanel, aiStatus,
    h('div', { class: 'row mt' }, finish),
  ))
  sync()
}

// ---------------------------------------------------------------- home

async function renderHome() {
  const s = settings()
  const b = brain()
  const tilesBox = h('div', { class: 'tiles', 'aria-live': 'polite' }, h('p', { class: 'muted', text: 'Loading tools…' }))
  const toolNotes = h('div')

  const refresh = h('button', { tid: 'refresh-tools', onclick: async () => {
    refresh.disabled = true
    try { await loadAllTools({ force: true }); drawTiles() } finally { refresh.disabled = false }
  } }, 'Refresh tools')

  function drawTiles() {
    const ok = toolsState.loaded.filter((t) => t.ok)
    const broken = toolsState.loaded.filter((t) => !t.ok)
    tilesBox.replaceChildren(...ok.map((t) =>
      h('a', { class: 'tile', href: `#/tool/${encodeURIComponent(t.recipe.id)}`, tid: 'tool-tile', 'data-tool-id': t.recipe.id },
        h('strong', { text: t.recipe.name }),
        h('span', { text: t.recipe.description }),
        t.entry.origin === 'local' ? h('span', { class: 'badge', text: 'Only in this browser' }) : null)))
    if (!ok.length) tilesBox.append(h('p', { class: 'muted', text: 'No tools found.' }))
    toolNotes.replaceChildren(...broken.map((t) =>
      note('warn', 'tool-broken', h('strong', { text: `${t.entry.fileName} has problems and was skipped:` }),
        h('ul', { class: 'errors' }, (t.errors ?? []).map((e) => h('li', { text: e }))))))
    // Say when a tool is hidden by another with the same id (Nitpick L6).
    for (const c of toolsState.conflicts ?? []) {
      const kept = c.keptOrigin === 'core' ? 'a built-in tool' : 'a tool in your plugins/ folder'
      const lost = c.origin === 'local' ? 'The tool you pasted' : `${c.fileName} in plugins/`
      toolNotes.append(note('warn', 'tool-conflict', `${lost} (id "${c.id}") is hidden because ${kept} uses the same id. Change one of the ids to see both.`))
    }
    stats.querySelector('[data-k=tools] b').textContent = String(ok.length)
  }

  const stats = h('div', { class: 'card stats', tid: 'stats' },
    h('div', { 'data-k': 'runs' }, h('b', { text: String(s.stats?.runs ?? 0) }), 'runs'),
    h('div', { 'data-k': 'saves' }, h('b', { text: String(s.stats?.saves ?? 0) }), 'saved'),
    h('div', { 'data-k': 'tools' }, h('b', { text: '…' }), 'tools'))

  const brainSection = h('div')
  if (b) {
    const profile = h('div', { class: 'card', tid: 'profile-snapshot' }, h('h2', { text: 'Your profile' }), h('p', { class: 'muted', text: 'Loading…' }))
    const recentList = h('ul', { class: 'list', tid: 'recent-list' })
    const recent = h('div', { class: 'card' }, h('h2', { text: 'Recent saved work' }), recentList)
    brainSection.append(profile, recent)
    b.profile().then((r) => {
      const body = !r.ok ? [brainError(r.error)]
        : r.items.length ? [h('ul', { class: 'list' }, r.items.map((it) =>
          h('li', {}, h('div', {}, h('strong', { text: `${it.metadata?.hub?.profile_part ?? 'profile'}: ` }), it.content))))]
          : [h('p', { class: 'muted', text: 'Nothing yet. Tools that build your profile will fill this in.' })]
      profile.replaceChildren(h('h2', { text: 'Your profile' }), ...body)
    })
    b.recent(5).then((r) => {
      if (!r.ok) { recentList.replaceWith(brainError(r.error)); return }
      if (!r.items.length) recentList.append(h('li', { class: 'muted', text: 'Nothing saved yet.' }))
      for (const item of r.items) {
        const li = h('li', { tid: 'recent-item' },
          h('div', {}, h('div', { text: item.content }),
            h('div', { class: 'small muted', text: `${item.metadata?.hub?.tool ?? ''} · ${String(item.created_at).slice(0, 10)}` })),
          h('button', { class: 'ghost', tid: 'archive-btn', 'aria-label': 'Archive', onclick: async (ev) => {
            const btn = ev.currentTarget // currentTarget is null once we await
            btn.disabled = true
            const res = await b.archive(item)
            if (res.ok) li.remove(); else btn.disabled = false
          } }, 'Archive'))
        recentList.append(li)
      }
    })
  } else {
    brainSection.append(noBrainNudge())
  }

  render(h('section', { tid: 'screen-home' },
    h('div', { class: 'row between' },
      h('h1', { tid: 'home-name', text: s.name ? `Hi, ${s.name}` : 'Welcome' }),
      h('span', { class: `badge ${b ? 'on' : ''}`, tid: 'brain-badge', text: b ? 'Brain connected' : 'No brain' })),
    stats,
    h('div', { class: 'card' },
      h('div', { class: 'row between' }, h('h2', { text: 'Tools' }), refresh),
      tilesBox, toolNotes,
      h('div', { class: 'row mt' },
        h('a', { class: 'btn', href: '#/add', tid: 'nav-add' }, 'Add a tool'),
        h('a', { class: 'btn', href: '#/settings', tid: 'nav-settings' }, 'Settings'))),
    brainSection,
  ))
  await loadAllTools()
  drawTiles()
}

// How many factual claims carry a source (WIDGET-GUIDE §8, Phase 3).
function sourceCheckNote(sc) {
  if (!sc.claims) return null
  const unv = sc.unverified ? ` ${sc.unverified} marked [unverified].` : ''
  if (!sc.unsourced.length) {
    return note('ok', 'source-check', `All ${sc.claims} factual claims have a source or are marked [unverified].${unv}`)
  }
  return note('warn', 'source-check',
    h('p', { text: `${sc.unsourced.length} of ${sc.claims} claims have no source. Check these before you rely on them:${unv}` }),
    h('ul', { tid: 'unsourced-list' }, sc.unsourced.map((c) =>
      h('li', { text: `${c.section}: ${c.text.length > 160 ? c.text.slice(0, 160) + '…' : c.text}` }))))
}

function brainError(error) {
  if (error === 'signed-out') {
    return note('warn', 'brain-signed-out', 'Your brain session ended. ', h('a', { href: '#/setup/2' }, 'Sign in again'))
  }
  return note('bad', null, `Could not reach your brain: ${error}`)
}

// ---------------------------------------------------------------- tool runner

async function renderTool(id) {
  render(h('section', { tid: 'screen-tool' }, h('p', { class: 'muted', text: 'Loading…' })))
  const tool = await getTool(id)
  if (!tool) {
    render(h('section', { tid: 'screen-tool', class: 'card' },
      h('h1', { text: 'Tool not found' }), h('a', { href: '#/home' }, 'Back to home')))
    return
  }
  const recipe = tool.recipe
  const perms = recipe.permissions ?? []

  // Tools from a repo the student pointed the hub at (not their own fork, not
  // pasted through Add tool) must be reviewed before first use (Nitpick M3/M5).
  // Acceptance is tied to the repo AND the exact recipe text, so a changed
  // recipe, or the same id from another repo, is reviewed again (Nitpick R1).
  const needsReview = tool.entry.origin === 'plugin' && !!settings().repoOverride
  const ackKey = needsReview ? `${settings().repoOverride.trim().toLowerCase()}|${await sha256(tool.text ?? '')}` : null
  const acks = S.get('hub.toolAcks', {}) ?? {}
  if (needsReview && !acks[ackKey]) {
    const sum = installSummary(recipe)
    render(h('section', { tid: 'screen-tool' },
      h('div', { class: 'card stack', tid: 'tool-review' },
        h('h1', { text: `Review “${recipe.name}” before using it` }),
        h('p', { class: 'muted', text: `This tool comes from ${settings().repoOverride}, not from your own Brain Hub. Only continue if you trust whoever wrote it. By ${sum.author}, version ${sum.version}.` }),
        h('ul', { tid: 'summary-permissions' }, sum.permissions.length
          ? sum.permissions.map((p) => h('li', { 'data-permission': p.id, text: p.text }))
          : h('li', { text: 'Build a prompt and let you download the result. Nothing else.' })),
        h('p', {}, h('strong', { text: 'Web search: ' }), sum.webSearch),
        sum.warnings.length ? note('warn', 'summary-warning', ...sum.warnings.map((w) => h('p', { text: w }))) : null,
        h('div', { class: 'row mt' },
          h('button', { class: 'primary', tid: 'tool-accept', onclick: () => {
            S.set('hub.toolAcks', { ...(S.get('hub.toolAcks', {}) ?? {}), [ackKey]: true })
            renderTool(id)
          } }, 'I trust it — continue'),
          h('a', { class: 'btn', href: '#/home' }, 'Back')))))
    return
  }
  const runKey = `hub.runs.${recipe.id}`
  let st = { inputs: {}, prompt: '', answer: '', result: null, mode: null, noWebSearch: false, ...S.get(runKey, {}) }
  const persist = () => S.set(runKey, st)
  const b = brain()

  // Form
  const fields = recipe.inputs.map((inp) => {
    const fid = `field-${inp.id}`
    const val = st.inputs[inp.id] ?? ''
    let el
    if (inp.type === 'long_text') el = h('textarea', { id: fid, tid: fid, placeholder: inp.placeholder ?? '' })
    else if (inp.type === 'choose_one') {
      el = h('select', { id: fid, tid: fid },
        h('option', { value: '', text: 'Choose…' }),
        inp.options.map((o) => h('option', { value: String(o), text: String(o) })))
    } else if (inp.type === 'number') el = h('input', { type: 'number', inputmode: 'decimal', id: fid, tid: fid, placeholder: inp.placeholder ?? '' })
    else el = h('input', { type: 'text', id: fid, tid: fid, placeholder: inp.placeholder ?? '' })
    el.value = val
    el.required = !!inp.required
    el.addEventListener('input', () => { st.inputs[inp.id] = el.value; persist() })
    el.addEventListener('change', () => { st.inputs[inp.id] = el.value; persist() })
    return { inp, el, wrap: h('div', {},
      h('label', { for: fid }, inp.label, inp.required ? '' : h('span', { class: 'muted small', text: ' (optional)' })),
      el, inp.help ? h('p', { class: 'help', text: inp.help }) : null) }
  })

  const formError = h('div', { tid: 'form-error', class: 'note bad', role: 'alert', hidden: true })
  const stage = h('div', { 'aria-live': 'polite' })
  const resultBox = h('div')

  // A fresh Run goes back to the student's chosen mode; copy-and-paste chosen
  // after an error applies to that run only (Nitpick L3).
  const runBtn = h('button', { class: 'primary', tid: 'run-btn', onclick: () => { st.mode = null; start() } }, 'Run')
  const clearBtn = h('button', { class: 'ghost', tid: 'clear-run', onclick: () => {
    S.remove(runKey)
    renderTool(id)
  } }, 'Start over')

  const effectiveMode = () => {
    if (st.mode) return st.mode
    return settings().aiMode === 'auto' && perms.includes('run_ai') ? 'auto' : 'manual'
  }

  async function gatherBrainContext() {
    if (!b || !recipe.brain_context || !perms.includes('search_brain')) return { text: null }
    const q = fillShort(recipe.brain_context.query, recipe, st.inputs, today())
    const r = await b.search(q, recipe.brain_context.limit)
    if (!r.ok) return { text: null, warning: r.error === 'signed-out' ? 'signed-out' : r.error }
    return { text: formatBrainContext(r.results) }
  }

  function readInputs() {
    for (const f of fields) st.inputs[f.inp.id] = f.el.value
    const missing = fields.filter((f) => f.inp.required && !String(f.el.value).trim()).map((f) => f.inp.label)
    persist()
    return missing
  }

  async function start({ skipSearchWarning = false } = {}) {
    formError.hidden = true
    const missing = readInputs()
    if (missing.length) {
      formError.textContent = `Please fill in: ${missing.join(', ')}`
      formError.hidden = false
      return
    }
    if (/^tool-tester-/.test(recipe.id) && Object.values(st.inputs).some((v) => /^\s*recipe_format\s*:/m.test(String(v ?? '')))) {
      formError.textContent = 'This contains the tool\u2019s recipe. The Tester must never see it: paste only the Spec (tap Copy under the Spec heading), the test cases and the answers.'
      formError.hidden = false
      return
    }
    st.result = null; st.answer = ''; st.noWebSearch = false; st.checkAnswer = null; st.checkResult = null; st.checkOpen = false
    resultBox.replaceChildren()
    const mode = effectiveMode()
    const s = settings()
    const ws = recipe.web_search

    if (mode === 'auto') {
      const key = S.get('hub.openrouterKey', '')
      if (!key || !s.models?.length) {
        return showRunError('Automatic mode is not set up yet (it needs an OpenRouter key and at least one model). Add them in Settings, or use copy-and-paste.')
      }
      if (ws === 'required' && !s.paidSearch && !skipSearchWarning) {
        stage.replaceChildren(note('warn', 'websearch-warning',
          h('p', { text: 'This tool needs current information from the web. Paid web search is off in your settings, so Automatic mode would answer from the model’s memory, which may be out of date.' }),
          h('p', { text: 'Recommended: use copy-and-paste instead. Your AI app searches the web for free.' }),
          h('div', { class: 'row' },
            h('button', { class: 'primary', tid: 'switch-to-manual', onclick: switchToManual }, 'Use copy-and-paste'),
            h('button', { tid: 'run-anyway', onclick: () => start({ skipSearchWarning: true }) }, 'Run without web search'))))
        return
      }
      const webSearch = ws !== 'none' && !!s.paidSearch
      st.noWebSearch = ws !== 'none' && !webSearch
      stage.replaceChildren(note('', 'run-status', 'Searching your brain…'))
      runBtn.disabled = true
      try {
        const ctx = await gatherBrainContext()
        const prompt = buildPrompt(recipe, st.inputs, { brainContext: ctx.text, today: today(), widgetGuide: await widgetGuideFor(recipe) })
        st.prompt = prompt; persist()
        stage.replaceChildren(note('', 'run-status', `Running on ${s.models[0]}… this can take a minute.`))
        const res = await createAI({ key }).run(prompt, { models: s.models, webSearch })
        bumpStat('runs')
        if (!res.ok) return showRunError(aiErrorText(res))
        stage.replaceChildren(note('ok', 'run-status', `Answered by ${res.model}.`), ctx.warning ? brainWarn(ctx.warning) : '')
        st.answer = res.text
        showResult(res.text)
      } finally {
        runBtn.disabled = false
      }
      return
    }

    // Manual
    stage.replaceChildren(note('', 'run-status', 'Building your prompt…'))
    const ctx = await gatherBrainContext()
    st.prompt = buildPrompt(recipe, st.inputs, {
      brainContext: ctx.text, today: today(), webSearchLine: ws === 'none' ? null : WEB_SEARCH_LINE,
      widgetGuide: await widgetGuideFor(recipe),
    })
    persist()
    bumpStat('runs')
    showManual(ctx.warning)
  }

  function brainWarn(w) {
    return w === 'signed-out' ? brainError('signed-out') : note('warn', null, `Could not search your brain (${w}), so this ran without your notes.`)
  }

  function aiErrorText(res) {
    if (res.error === 'bad-key') return 'OpenRouter did not accept your key. Check it in Settings.'
    if (res.error === 'no-credits') return 'Your OpenRouter account is out of credit for this model.'
    if (res.error === 'all-models-failed') return `Every model you picked was busy or unavailable (tried ${res.tried.join(', ')}). Free models are often rate-limited; try again in a minute, add more models in Settings, or use copy-and-paste.`
    return `OpenRouter refused the request: ${res.error}`
  }

  function showRunError(text) {
    stage.replaceChildren(note('bad', 'run-error', h('p', { text }),
      h('button', { tid: 'switch-to-manual', onclick: switchToManual }, 'Use copy-and-paste instead')))
  }

  function switchToManual() {
    st.mode = 'manual'
    persist()
    start()
  }

  function showManual(warning) {
    const app = AI_APPS[settings().aiApp] ?? AI_APPS.claude
    const promptBox = h('textarea', { tid: 'prompt-box', readonly: true, rows: 8, class: 'mono', 'aria-label': 'Your prompt' })
    promptBox.value = st.prompt
    const copyStatus = h('span', { tid: 'copy-status', role: 'status', class: 'small muted' })
    const answer = h('textarea', { tid: 'answer-box', rows: 8, 'aria-label': 'The AI’s answer', placeholder: 'Paste the AI’s full answer here' })
    answer.value = st.answer ?? ''
    answer.addEventListener('input', () => { st.answer = answer.value; persist() })
    const pasteHelp = h('p', { tid: 'paste-help', class: 'help', hidden: true,
      text: 'Your browser would not let Brain Hub read the clipboard. Long-press (or right-click) in the box above and choose Paste.' })

    stage.replaceChildren(
      h('div', { class: 'card stack' },
        h('h2', { text: '1. Copy your prompt' }),
        promptBox,
        h('div', { class: 'row' },
          h('button', { class: 'primary', tid: 'copy-prompt', onclick: async () => {
            try {
              await navigator.clipboard.writeText(st.prompt)
              copyStatus.textContent = 'Copied.'
            } catch {
              promptBox.focus(); promptBox.select()
              let ok = false
              try { ok = document.execCommand('copy') } catch { ok = false }
              copyStatus.textContent = ok ? 'Copied.' : 'Selected — now copy it (long-press → Copy).'
            }
          } }, 'Copy prompt'),
          copyStatus),
        h('h2', { text: `2. Paste it into ${app.name}` }),
        h('a', { class: 'btn', tid: 'open-ai-app', href: app.url, target: '_blank', rel: 'noopener' }, `Open ${app.name}`),
        h('h2', { text: '3. Paste the answer back' }),
        answer,
        h('div', { class: 'row' },
          h('button', { tid: 'paste-answer', onclick: async () => {
            try {
              const text = await navigator.clipboard.readText()
              if (!text) throw new Error('empty')
              answer.value = text; st.answer = text; persist()
              pasteHelp.hidden = true
            } catch {
              pasteHelp.hidden = false
              answer.focus()
            }
          } }, 'Paste answer'),
          h('button', { class: 'primary', tid: 'use-answer', onclick: () => {
            const text = answer.value.trim()
            if (!text) { pasteHelp.hidden = false; answer.focus(); return }
            st.answer = text; st.checkAnswer = null; st.checkResult = null; st.checkOpen = false; persist()
            showResult(text)
          } }, 'Use this answer')),
        pasteHelp),
      warning ? brainWarn(warning) : '',
    )
  }

  function showResult(text) {
    st.result = text
    persist()
    const parsed = parseOutput(text, recipe)
    const sc = checkSources(text, { sourcing: recipe.sourcing })
    // A fresh panel for every answer shown, so a check can never be applied to,
    // or saved with, a different answer (Nitpick Phase 5 H1).
    const checkerBox = h('div', { tid: 'checker-panel', class: 'card', hidden: true })
    const body = h('div', { class: 'result', tid: 'result' })
    body.innerHTML = renderAnswer(text)
    body.querySelectorAll('a').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer' })
    addSectionCopyButtons(body, text)
    const { recipes: builtRecipes, problems: recipeProblems } = recipesIn(text, { withProblems: true })
    const copyStatus = h('span', { class: 'small muted', role: 'status', tid: 'copy-answer-status' })

    const saveStatus = h('div', { tid: 'save-status', role: 'status' })
    const canSave = b && perms.includes('save_to_brain')
    let savePanel = null
    if (canSave) {
      const summary = h('textarea', { tid: 'save-summary', id: 'save-summary', rows: 3 })
      summary.value = parsed.summary || text.replace(/\s+/g, ' ').slice(0, 300)
      const tags = h('input', { type: 'text', tid: 'save-tags', id: 'save-tags' })
      tags.value = resolveTags(recipe, st.inputs).join(', ')
      savePanel = h('div', { tid: 'save-panel', class: 'card', hidden: true },
        h('label', { for: 'save-summary', text: 'Summary (this is what search will find)' }), summary,
        h('label', { for: 'save-tags', text: 'Tags (comma separated)' }), tags,
        h('div', { class: 'row mt' },
          h('button', { class: 'primary', tid: 'save-confirm', onclick: async (ev) => {
            const sum = summary.value.trim()
            if (!sum) { saveStatus.replaceChildren(note('bad', null, 'Add a short summary first.')); return }
            const userId = b.userId()
            if (!userId) { saveStatus.replaceChildren(brainError('signed-out')); return }
            const btn = ev.currentTarget // currentTarget is null once we await
            btn.disabled = true
            const row = buildSaveRow({
              recipe, inputs: st.inputs, report: text, summary: sum, sources: parsed.sources, userId,
              tags: [...new Set(tags.value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))],
              sourceCheck: { claims: sc.claims, sourced: sc.sourced, unverified: sc.unverified, unsourced: sc.unsourced.length },
              check: st.checkResult ?? undefined,
            })
            let res
            try { res = await b.save(row) } catch (e) { res = { ok: false, error: String(e?.message ?? e) } }
            btn.disabled = false
            if (res.ok) { bumpStat('saves'); saveStatus.replaceChildren(note('ok', null, 'Saved to your brain.')) }
            else saveStatus.replaceChildren(res.error === 'signed-out' ? brainError('signed-out') : note('bad', null, `Could not save: ${res.error}`))
          } }, 'Save'),
        ), saveStatus)
    }

    resultBox.replaceChildren(h('div', { class: 'card' },
      h('h2', { text: 'Result' }),
      st.noWebSearch ? h('p', { tid: 'no-websearch-label', class: 'badge', text: 'No web search' }) : null,
      parsed.missingSections.length ? note('warn', 'missing-sections', `Missing sections: ${parsed.missingSections.join(', ')}`) : null,
      parsed.sources.length || recipe.sourcing === 'none' ? null : note('warn', 'no-sources-warning', 'This answer has no source links, so none of its facts can be checked. Treat it with care.'),
      sourceCheckNote(sc),
      body,
      h('div', { class: 'row mt' },
        canSave ? h('button', { class: 'primary', tid: 'save-btn', onclick: () => { savePanel.hidden = false; savePanel.querySelector('textarea').focus() } }, 'Save to brain') : null,
        h('button', { tid: 'download-btn', onclick: () => {
          const f = downloadFile({ recipe, inputs: st.inputs, report: text })
          saveFile(f.fileName, f.text)
        } }, 'Download'),
        h('button', { tid: 'copy-answer', onclick: () => copyText(text, copyStatus) }, 'Copy answer'),
        builtRecipes.map((r) => h('button', { class: 'primary', tid: 'install-from-answer', 'data-tool-id': r.id, onclick: () => {
          S.set('hub.addDraft', r.text)
          location.hash = '#/add'
        } }, `Install ${r.name}`)),
        recipe.sourcing === 'none' ? null : h('button', { tid: 'check-btn', onclick: () => { st.checkOpen = true; persist(); checkerBox.hidden = false; showChecker(text, checkerBox) } }, 'Check this answer'),
        copyStatus),
      recipeProblems.length ? note('warn', 'recipe-problems',
        h('p', { text: 'This answer contains a recipe the hub cannot install yet. Paste these problems back to the Builder (in "Tester\u2019s fixes, your Spec and your recipe") and run it again:' }),
        h('ul', { class: 'errors' }, recipeProblems.flat().map((e) => h('li', { text: e })))) : null,
      savePanel,
      checkerBox,
      b ? null : noBrainNudge()))
    // Reopen the check after the student comes back from their AI app, even if
    // the phone reloaded the hub meanwhile (found in the Phase 7 guide run).
    if (st.checkOpen || st.checkAnswer != null) { checkerBox.hidden = false; showChecker(text, checkerBox) }
    resultBox.scrollIntoView?.({ block: 'start' })
  }

  // ---- The Checker (Phase 5): rubric score + fixes, with an AI citation check.

  function showChecker(text, box) {
    const { checked } = claimsToCheck(text, recipe)
    const citation = st.checkAnswer ? parseCheckerAnswer(st.checkAnswer, checked) : null
    const usable = citation && citation.verdicts.length ? citation : null
    const result = scoreReport(text, recipe, usable)
    st.checkResult = usable ? { score: result.score, outOf: result.outOf, parts: result.parts, counts: result.counts, checked: result.checked } : null
    persist()

    const head = usable
      ? `Score: ${result.score} / 100 — ${grade(result)}`
      : `Score so far: ${result.score} / ${result.outOf} — the citation check has not been run yet`
    const parts = h('p', { class: 'small muted', tid: 'checker-parts',
      text: `Sections ${result.parts.sections}/20 · Sources present ${result.parts.sources}/30 · Claims supported ${result.parts.support == null ? '–' : result.parts.support}/50`
        + (result.counts ? ` (${result.counts.SUPPORTED} supported, ${result.counts.PARTLY} partly, ${result.counts['NOT SUPPORTED']} not supported, ${result.counts.UNREACHABLE} unreachable)` : '') })
    const fixes = result.fixes.length
      ? h('ul', { tid: 'checker-fixes' }, result.fixes.map((f) => h('li', { 'data-kind': f.kind, text: f.text })))
      : h('p', { tid: 'checker-fixes', text: 'No fixes needed.' })

    const kids = [h('h2', { text: 'Check' }), h('p', { tid: 'checker-score' }, h('strong', { text: head })), parts]
    const contradicted = result.counts?.['NOT SUPPORTED'] ?? 0
    if (contradicted) {
      kids.push(note('bad', 'checker-contradicted', `${contradicted} claim${contradicted === 1 ? ' is' : 's are'} not supported by ${contradicted === 1 ? 'its own source' : 'their own sources'}. Fix or remove ${contradicted === 1 ? 'it' : 'them'} before you use or share this.`))
    }
    kids.push(fixes)
    if (citation && !citation.verdicts.length) {
      kids.push(note('bad', 'checker-error', 'Could not find a verdict table in that answer. Ask the AI to reply with only the table, then paste it again.'))
    }
    if (!usable) kids.push(...citationStep(text, checked, box))
    else kids.push(h('button', { class: 'ghost', tid: 'checker-redo', onclick: () => { st.checkAnswer = null; st.checkResult = null; persist(); showChecker(text, box) } }, 'Check again'))
    box.replaceChildren(...kids)
  }

  function citationStep(text, checked, box) {
    if (!checked.length) return [h('p', { class: 'muted', text: 'There are no sourced claims to check against their links.' })]
    const prompt = buildCheckerPrompt(checked)
    const s = settings()
    const key = S.get('hub.openrouterKey', '')
    const intro = h('p', { text: `Next, an AI with web access opens each of the ${checked.length} cited links and says whether it supports its claim.` })
    const out = [h('h3', { text: 'Check the sources' }), intro]

    if (s.aiMode === 'auto' && key && s.models?.length && s.paidSearch) {
      const status = h('div', { role: 'status' })
      out.push(h('button', { class: 'primary', tid: 'run-checker', onclick: async (ev) => {
        const btn = ev.currentTarget
        btn.disabled = true
        status.replaceChildren(note('', null, 'Checking the links… this can take a few minutes.'))
        const res = await createAI({ key }).run(prompt, { models: s.models, webSearch: true })
        btn.disabled = false
        if (!res.ok) { status.replaceChildren(note('bad', 'checker-error', aiErrorText(res))); return }
        st.checkAnswer = res.text
        showChecker(text, box)
      } }, 'Check the sources'), status,
      h('p', { class: 'help', text: 'Automatic web search finds pages by searching, which is weaker than opening each link. For a strict check, use copy-and-paste with an AI app that can browse.' }))
    } else if (s.aiMode === 'auto') {
      // Say the real reason (Nitpick L5).
      const why = !key ? 'Automatic mode has no OpenRouter key yet'
        : !s.models?.length ? 'no Automatic-mode models are chosen'
        : 'paid web search is off in your settings'
      out.push(note('warn', 'checker-needs-web', `Checking sources needs web access, and ${why}. Use your AI app instead (free):`))
    }
    const app = AI_APPS[s.aiApp] ?? AI_APPS.claude
    const promptBox = h('textarea', { tid: 'checker-prompt', readonly: true, rows: 6, class: 'mono', 'aria-label': 'Checker prompt' })
    promptBox.value = prompt
    const copied = h('span', { class: 'small muted', role: 'status' })
    const answer = h('textarea', { tid: 'checker-answer', rows: 6, 'aria-label': 'The checker’s answer', placeholder: 'Paste the AI’s verdict table here' })
    out.push(
      promptBox,
      h('div', { class: 'row' },
        h('button', { tid: 'copy-checker-prompt', onclick: async () => {
          try { await navigator.clipboard.writeText(prompt); copied.textContent = 'Copied.' }
          catch { promptBox.focus(); promptBox.select(); copied.textContent = 'Selected — now copy it.' }
        } }, 'Copy check prompt'),
        h('a', { class: 'btn', tid: 'checker-open-ai', href: app.url, target: '_blank', rel: 'noopener' }, `Open ${app.name}`),
        copied),
      answer,
      h('button', { class: 'primary', tid: 'use-checker-answer', onclick: () => {
        if (!answer.value.trim()) { answer.focus(); return }
        st.checkAnswer = answer.value
        showChecker(text, box)
      } }, 'Score it'))
    return out
  }

  render(h('section', { tid: 'screen-tool' },
    h('div', { class: 'card' },
      h('h1', { text: recipe.name }),
      h('p', { class: 'muted', text: recipe.description }),
      h('form', { onsubmit: (ev) => { ev.preventDefault(); runBtn.click() } }, fields.map((f) => f.wrap)),
      formError,
      h('div', { class: 'row mt' }, runBtn, clearBtn)),
    stage, resultBox))

  // Restore an in-progress run.
  if (st.prompt && effectiveMode() === 'manual' && !st.result) showManual()
  if (st.result) {
    if (effectiveMode() === 'manual' && st.prompt) showManual()
    showResult(st.result)
  }
}

// ---------------------------------------------------------------- add tool

function renderAdd() {
  const paste = h('textarea', { tid: 'recipe-paste', id: 'recipe-paste', rows: 12, class: 'mono', placeholder: '---\nrecipe_format: 1\nid: my-tool\n…' })
  // Arriving from "Install …" on a Builder answer: the recipe is already filled in.
  const draft = S.get('hub.addDraft', null)
  if (typeof draft === 'string') { paste.value = draft; S.remove('hub.addDraft') }
  const out = h('div', { 'aria-live': 'polite' })

  const check = h('button', { class: 'primary', tid: 'recipe-check', onclick: async () => {
    const res = parseRecipe(paste.value)
    if (!res.ok) {
      out.replaceChildren(h('div', { class: 'card' }, h('h2', { text: 'This recipe has problems' }),
        h('ul', { class: 'errors', tid: 'recipe-errors' }, res.errors.map((e) => h('li', { text: e }))),
        h('p', { class: 'help', text: 'Paste these back into the AI that wrote the recipe and ask it to fix them.' })))
      return
    }
    const r = res.recipe
    if (!toolsState) await loadAllTools()
    const clash = toolsState.loaded.find((t) => t.ok && t.recipe.id === r.id && t.entry.origin !== 'local')
    if (clash) {
      out.replaceChildren(h('div', { class: 'card' },
        h('ul', { class: 'errors', tid: 'recipe-errors' },
          h('li', { text: `A ${clash.entry.origin === 'core' ? 'built-in' : 'plugins/'} tool already uses the id "${r.id}". Change the id and try again.` }))))
      return
    }
    const sum = installSummary(r)
    out.replaceChildren(h('div', { class: 'card stack', tid: 'install-summary' },
      h('h2', { text: sum.name }),
      h('p', { text: sum.description }),
      h('p', { class: 'small muted', text: `Version ${sum.version} · by ${sum.author}` }),
      h('h3', { text: 'What this tool can do' }),
      h('ul', { tid: 'summary-permissions' }, sum.permissions.length
        ? sum.permissions.map((p) => h('li', { 'data-permission': p.id, text: p.text }))
        : h('li', { text: 'Build a prompt and let you download the result. Nothing else.' })),
      h('p', {}, h('strong', { text: 'Brain search: ' }),
        h('span', { tid: 'summary-query', class: 'mono', text: sum.query ?? 'none — this tool never reads your brain' })),
      h('p', {}, h('strong', { text: 'Web search: ' }), h('span', { tid: 'summary-websearch', text: sum.webSearch })),
      h('p', {}, h('strong', { text: 'Sources: ' }), h('span', { tid: 'summary-sourcing', text: sum.sourcing })),
      sum.warnings.length ? note('warn', 'summary-warning', ...sum.warnings.map((w) => h('p', { text: w }))) : null,
      h('button', { class: 'primary', tid: 'install-btn', onclick: () => {
        const local = (S.get('hub.localTools', []) ?? []).filter((t) => t.id !== r.id)
        local.push({ id: r.id, text: paste.value, installedAt: new Date().toISOString() })
        S.set('hub.localTools', local)
        toolsState = null
        const fileName = `${r.id}.recipe.md`
        out.replaceChildren(note('ok', 'installed-notice',
          h('p', { text: `Installed. “${r.name}” is on your home screen now, but only in this browser.` }),
          h('p', { text: `To keep it everywhere, download the file and put it in the plugins/ folder of your Brain Hub on GitHub. The hub finds it there on its own.` }),
          h('div', { class: 'row' },
            h('button', { tid: 'download-recipe', onclick: () => saveFile(fileName, paste.value) }, `Download ${fileName}`),
            h('a', { class: 'btn', href: `#/tool/${encodeURIComponent(r.id)}` }, 'Open it'))))
      } }, 'Install')))
  } }, 'Check recipe')

  render(h('section', { tid: 'screen-add' },
    h('div', { class: 'card' },
      h('h1', { text: 'Add a tool' }),
      h('p', { class: 'muted' }, 'Ask any AI for a tool, pasting in ',
        h('a', { href: 'WIDGET-GUIDE.md', target: '_blank', rel: 'noopener' }, 'WIDGET-GUIDE.md'),
        '. Then paste its recipe here.'),
      h('label', { for: 'recipe-paste', text: 'Recipe' }), paste,
      h('div', { class: 'row mt' }, check)),
    out))
}

// ---------------------------------------------------------------- settings

function renderSettings() {
  const s = settings()
  const b = brain()
  const status = !b ? 'No brain connected.'
    : b.isSignedIn() ? `Connected as ${b.email() ?? 'you'}.` : 'Brain saved, but signed out.'

  const msg = h('div', { role: 'status' })
  const flash = (text, kind = 'ok') => msg.replaceChildren(note(kind, null, text))

  const mode = h('select', { tid: 'settings-ai-mode', id: 'settings-ai-mode' },
    h('option', { value: 'auto', text: 'Automatic (OpenRouter)' }),
    h('option', { value: 'manual', text: 'Manual (copy and paste)' }))
  mode.value = s.aiMode
  mode.addEventListener('change', () => { S.setSettings({ aiMode: mode.value }); flash('AI mode saved.') })

  const paid = h('input', { type: 'checkbox', tid: 'settings-paid-search', id: 'settings-paid-search', checked: !!s.paidSearch })
  paid.addEventListener('change', () => { S.setSettings({ paidSearch: paid.checked }); flash('Saved.') })

  const models = h('input', { type: 'text', tid: 'settings-models', id: 'settings-models', value: (s.models ?? []).join(', ') })
  models.addEventListener('change', () => {
    S.setSettings({ models: models.value.split(',').map((m) => m.trim()).filter(Boolean) })
    flash('Models saved.')
  })

  const key = h('input', { type: 'password', tid: 'settings-or-key', id: 'settings-or-key', autocomplete: 'off',
    placeholder: S.get('hub.openrouterKey', '') ? 'Saved — paste a new key to replace it' : 'sk-or-…' })
  key.addEventListener('change', () => { if (key.value.trim()) { S.set('hub.openrouterKey', key.value.trim()); key.value = ''; flash('Key saved.') } })

  const appSel = h('select', { tid: 'settings-ai-app', id: 'settings-ai-app' },
    Object.entries(AI_APPS).map(([id, a]) => h('option', { value: id, text: a.name })))
  appSel.value = s.aiApp
  appSel.addEventListener('change', () => { S.setSettings({ aiApp: appSel.value }); flash('Saved.') })

  const repo = h('input', { type: 'text', tid: 'settings-repo-override', id: 'settings-repo-override', placeholder: 'your-github-name/brain-hub', value: s.repoOverride ?? '' })
  repo.addEventListener('change', () => {
    const v = repo.value.trim()
    if (v && !parseRepo(v)) { flash('That should look like owner/repo.', 'bad'); return }
    S.setSettings({ repoOverride: v || null })
    S.remove('hub.pluginCache')
    toolsState = null
    flash('Saved. Tools will reload from that repo.')
  })

  render(h('section', { tid: 'screen-settings' },
    h('h1', { text: 'Settings' }),
    msg,
    h('div', { class: 'card' },
      h('h2', { text: 'Brain' }),
      h('p', { tid: 'settings-brain-status', text: status }),
      h('div', { class: 'row' },
        b && b.isSignedIn() ? h('button', { tid: 'settings-signout', onclick: async (ev) => {
          ev.currentTarget.disabled = true
          await b.signOut()
          renderSettings()
        } }, 'Sign out') : null,
        h('a', { class: 'btn', tid: 'settings-reconnect', href: '#/setup/2' }, b ? 'Reconnect' : 'Connect a brain'))),
    h('div', { class: 'card' },
      h('h2', { text: 'AI' }),
      h('label', { for: 'settings-ai-mode', text: 'Mode' }), mode,
      h('label', { for: 'settings-or-key', text: 'OpenRouter key' }), key,
      h('label', { for: 'settings-models', text: 'Models, in order (comma separated)' }), models,
      h('label', { class: 'check' }, paid, 'Allow paid web search (billed by OpenRouter)'),
      h('label', { for: 'settings-ai-app', text: 'AI app for copy-and-paste' }), appSel),
    h('div', { class: 'card' },
      h('h2', { text: 'Your tools on GitHub' }),
      h('label', { for: 'settings-repo-override', text: 'Read plugins/ from this repo' }), repo,
      h('p', { class: 'help', text: 'Leave blank on GitHub Pages: the hub works it out from the address.' })),
    h('div', { class: 'card' },
      h('h2', { text: 'Your data' }),
      h('div', { class: 'row' },
        h('button', { tid: 'settings-export', onclick: () => {
          // Settings only: never the key or session, and never saved runs, which hold brain notes (Nitpick M2).
          const out = {}
          for (const k of ['hub.settings', 'hub.brain', 'hub.localTools']) { const v = S.get(k); if (v != null) out[k] = v }
          saveFile('brain-hub-settings.json', JSON.stringify(out, null, 2), 'application/json')
        } }, 'Export settings'),
        h('button', { class: 'danger', tid: 'settings-reset', onclick: () => {
          if (!confirm('Remove all Brain Hub settings, keys and tools from this browser? Your brain is not touched.')) return
          for (const k of S.keys('hub.')) S.remove(k)
          toolsState = null
          location.hash = '#/setup'
        } }, 'Reset this browser')),
      h('p', { class: 'help', text: 'Export leaves out your OpenRouter key and brain sign-in.' })),
  ))
}

route()
