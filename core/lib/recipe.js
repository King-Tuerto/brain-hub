// Parse and validate a recipe (WIDGET-GUIDE.md, recipe format v1).
// Collects every error rather than stopping at the first, so a student's AI
// can fix them all in one pass.
import { load, CORE_SCHEMA } from '../vendor/js-yaml.mjs'

export const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g
const HTML_RE = /<\s*\/?\s*[a-zA-Z][^>]*>|javascript:/i

export const PERMISSIONS = ['search_brain', 'save_to_brain', 'run_ai']
export const WEB_SEARCH = ['required', 'helpful', 'none']
export const INPUT_TYPES = ['text', 'long_text', 'choose_one', 'number']
export const SAVE_TYPES = ['work_product', 'personal_note', 'job_history', 'profile']
export const PROFILE_PARTS = ['skills', 'experience', 'job-history', 'education', 'goals']

export const SOURCING = ['facts', 'advice', 'none']
const TOP_FIELDS = ['recipe_format', 'id', 'name', 'description', 'version', 'author',
  'permissions', 'web_search', 'sourcing', 'inputs', 'brain_context', 'output', 'save']
const REQUIRED = ['recipe_format', 'id', 'name', 'description', 'version', 'author',
  'permissions', 'web_search', 'inputs', 'output']
const INPUT_FIELDS = ['id', 'label', 'type', 'required', 'options', 'help', 'placeholder']
const MAX_BYTES = 20 * 1024

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const isStr = (v) => typeof v === 'string' && v.trim() !== ''

function splitFrontMatter(text) {
  // Leading blank lines are forgiven: AIs often add one when asked for "only the file".
  const lines = text.replace(/^﻿/, '').replace(/^\s*\n/, '').split(/\r?\n/)
  if (lines[0].trim() !== '---') return null
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (end === -1) return null
  return { yaml: lines.slice(1, end).join('\n'), body: lines.slice(end + 1).join('\n').trim() }
}

// Every "{{" must open a well-formed placeholder. Returns [names], pushing errors for bad ones.
function placeholdersIn(str, where, errors) {
  const names = []
  let i = str.indexOf('{{')
  while (i !== -1) {
    PLACEHOLDER_RE.lastIndex = i
    const m = PLACEHOLDER_RE.exec(str)
    if (m && m.index === i) {
      names.push(m[1])
      i = str.indexOf('{{', i + m[0].length)
    } else {
      errors.push(`${where} has a malformed placeholder near "${str.slice(i, i + 20)}"`)
      i = str.indexOf('{{', i + 2)
    }
  }
  return names
}

export function parseRecipe(text, { fileName } = {}) {
  const errors = []
  if (typeof text !== 'string' || !text.trim()) return { ok: false, errors: ['The recipe is empty'] }

  if (new TextEncoder().encode(text).length >= MAX_BYTES) errors.push('The recipe must be under 20 KB')
  if (HTML_RE.test(text)) errors.push('The recipe must not contain HTML tags or javascript: links')

  const parts = splitFrontMatter(text)
  if (!parts) {
    errors.push('The recipe must start with a line "---", then the front matter, then another "---"')
    return { ok: false, errors }
  }

  let fm
  try {
    fm = load(parts.yaml, { schema: CORE_SCHEMA })
  } catch (e) {
    errors.push(`The front matter is not valid YAML: ${String(e.message || e).split('\n')[0]}`)
    return { ok: false, errors }
  }
  if (!isObj(fm)) {
    errors.push('The front matter must be a set of "field: value" lines')
    return { ok: false, errors }
  }

  for (const k of Object.keys(fm)) if (!TOP_FIELDS.includes(k)) errors.push(`${k} is not a recipe field`)
  for (const k of REQUIRED) if (fm[k] === undefined || fm[k] === null) errors.push(`${k} is required`)

  if (fm.recipe_format != null && fm.recipe_format !== 1) errors.push('recipe_format must be 1')

  if (fm.id != null && (typeof fm.id !== 'string' || !/^[a-z][a-z0-9-]{2,39}$/.test(fm.id))) {
    errors.push('id must be 3–40 lowercase letters, digits and dashes, starting with a letter')
  }
  if (fileName != null && typeof fm.id === 'string' && fileName !== `${fm.id}.recipe.md`) {
    errors.push(`id "${fm.id}" must match the file name (expected ${fm.id}.recipe.md, got ${fileName})`)
  }
  if (fm.name != null && (!isStr(fm.name) || fm.name.length > 40)) errors.push('name must be text, 40 characters or fewer')
  if (fm.description != null && (!isStr(fm.description) || fm.description.length > 160)) {
    errors.push('description must be one sentence, 160 characters or fewer')
  }
  if (fm.version != null && (typeof fm.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(fm.version))) {
    errors.push('version must look like 1.0.0')
  }
  if (fm.author != null && !isStr(fm.author)) errors.push('author must be text')

  // permissions
  let perms = []
  if (fm.permissions != null) {
    if (!Array.isArray(fm.permissions)) {
      errors.push(`permissions must be a list drawn from ${PERMISSIONS.join(', ')}`)
    } else {
      perms = fm.permissions
      for (const p of perms) if (!PERMISSIONS.includes(p)) errors.push(`permissions: "${p}" is not one of ${PERMISSIONS.join(', ')}`)
      if (new Set(perms).size !== perms.length) errors.push('permissions must not repeat')
    }
  }

  if (fm.web_search != null && !WEB_SEARCH.includes(fm.web_search)) {
    errors.push(`web_search must be one of ${WEB_SEARCH.join(', ')}`)
  }
  if (fm.sourcing !== undefined && !SOURCING.includes(fm.sourcing)) {
    errors.push(`sourcing must be one of ${SOURCING.join(', ')} (or left out, which means facts)`)
  }

  // inputs
  const inputIds = []
  if (fm.inputs != null) {
    if (!Array.isArray(fm.inputs) || fm.inputs.length < 1 || fm.inputs.length > 8) {
      errors.push('inputs must be a list of 1 to 8 fields')
    }
    if (Array.isArray(fm.inputs)) {
      fm.inputs.forEach((inp, i) => {
        const at = `inputs[${i}]`
        if (!isObj(inp)) { errors.push(`${at} must be a field with id, label, type and required`); return }
        for (const k of Object.keys(inp)) if (!INPUT_FIELDS.includes(k)) errors.push(`${at}.${k} is not an input field`)
        if (typeof inp.id !== 'string' || !/^[a-z0-9_]+$/.test(inp.id)) {
          errors.push(`${at}.id must be lowercase letters, digits and underscores`)
        } else if (inputIds.includes(inp.id)) {
          errors.push(`${at}.id "${inp.id}" is used twice`)
        } else {
          inputIds.push(inp.id)
        }
        if (!isStr(inp.label)) errors.push(`${at}.label is required`)
        if (!INPUT_TYPES.includes(inp.type)) errors.push(`${at}.type must be one of ${INPUT_TYPES.join(', ')}`)
        if (typeof inp.required !== 'boolean') errors.push(`${at}.required must be true or false`)
        if (inp.type === 'choose_one') {
          if (!Array.isArray(inp.options) || inp.options.length < 2 || inp.options.length > 12 ||
              !inp.options.every((o) => isStr(o) || typeof o === 'number')) {
            errors.push(`${at}.options must be a list of 2 to 12 choices`)
          }
        } else if (inp.options !== undefined) {
          errors.push(`${at}.options is only allowed when type is choose_one`)
        }
        if (inp.help !== undefined && typeof inp.help !== 'string') errors.push(`${at}.help must be text`)
        if (inp.placeholder !== undefined && typeof inp.placeholder !== 'string') errors.push(`${at}.placeholder must be text`)
      })
    }
  }

  // widget_guide: the hub's own WIDGET-GUIDE.md, for tools that build tools (Builder).
  const valid = new Set([...inputIds, 'brain_context', 'today', 'widget_guide'])
  const checkNames = (names, where) => {
    for (const n of names) if (!valid.has(n)) errors.push(`${where} uses {{${n}}}, which is not an input id, brain_context, today or widget_guide`)
  }

  // brain_context
  let brainContext
  if (fm.brain_context != null) {
    const bc = fm.brain_context
    if (!isObj(bc)) {
      errors.push('brain_context must have a query (and optionally a limit)')
    } else {
      for (const k of Object.keys(bc)) if (!['query', 'limit'].includes(k)) errors.push(`brain_context.${k} is not allowed`)
      if (!isStr(bc.query)) errors.push('brain_context.query is required')
      else checkNames(placeholdersIn(bc.query, 'brain_context.query', errors), 'brain_context.query')
      const limit = bc.limit ?? 5
      if (!Number.isInteger(limit) || limit < 1 || limit > 10) errors.push('brain_context.limit must be a whole number from 1 to 10')
      brainContext = { query: bc.query, limit }
    }
    if (!perms.includes('search_brain')) errors.push('brain_context needs the search_brain permission')
  }

  // output
  if (fm.output != null) {
    const o = fm.output
    if (!isObj(o) || !Array.isArray(o.sections) || o.sections.length < 2 || o.sections.length > 10 ||
        !o.sections.every(isStr)) {
      errors.push('output.sections must be a list of 2 to 10 section names')
    }
    if (isObj(o)) for (const k of Object.keys(o)) if (k !== 'sections') errors.push(`output.${k} is not allowed`)
  }

  // save
  if (fm.save != null) {
    const s = fm.save
    if (!isObj(s)) {
      errors.push('save must have a type and tags')
    } else {
      for (const k of Object.keys(s)) if (!['type', 'tags', 'profile_part'].includes(k)) errors.push(`save.${k} is not allowed`)
      if (!SAVE_TYPES.includes(s.type)) errors.push(`save.type must be one of ${SAVE_TYPES.join(', ')}`)
      if (s.type === 'profile') {
        if (!PROFILE_PARTS.includes(s.profile_part)) errors.push(`save.profile_part must be one of ${PROFILE_PARTS.join(', ')}`)
      } else if (s.profile_part !== undefined) {
        errors.push('save.profile_part is only allowed when save.type is profile')
      }
      if (!Array.isArray(s.tags) || s.tags.length < 1 || s.tags.length > 5 || !s.tags.every(isStr)) {
        errors.push('save.tags must be a list of 1 to 5 tags')
      } else {
        s.tags.forEach((t) => checkNames(placeholdersIn(t, 'save.tags', errors), 'save.tags'))
      }
    }
    if (!perms.includes('save_to_brain')) errors.push('save needs the save_to_brain permission')
  }

  // body
  if (!parts.body) errors.push('The prompt template (after the second ---) is empty')
  else checkNames(placeholdersIn(parts.body, 'The prompt template', errors), 'The prompt template')

  if (errors.length) return { ok: false, errors: [...new Set(errors)] }

  const recipe = { ...fm, body: parts.body, fileName }
  if (brainContext) recipe.brain_context = brainContext
  return { ok: true, recipe }
}
