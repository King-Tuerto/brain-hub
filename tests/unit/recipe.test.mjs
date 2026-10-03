// PLAN core/lib/recipe.js; WIDGET-GUIDE §2–§9.
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseRecipe, PLACEHOLDER_RE } from '../../core/lib/recipe.js'
import { NETWORKING_PREP, variant, split } from './_fixtures.mjs'

const FILE = 'networking-prep.recipe.md'

function ok(text, opts = { fileName: FILE }) {
  const r = parseRecipe(text, opts)
  assert.equal(r.ok, true, `expected ok, got errors: ${JSON.stringify(r.errors)}`)
  return r.recipe
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Expect failure, with at least one error naming `field`.
function bad(text, field, opts = {}) {
  let r
  assert.doesNotThrow(() => { r = parseRecipe(text, opts) }, 'parseRecipe must never throw')
  assert.equal(r.ok, false, `expected errors mentioning ${field}`)
  assert.ok(Array.isArray(r.errors) && r.errors.length > 0)
  for (const e of r.errors) assert.equal(typeof e, 'string')
  if (field) {
    const re = field instanceof RegExp ? field : new RegExp(esc(field))
    assert.ok(r.errors.some((e) => re.test(e)), `no error mentions ${field}: ${JSON.stringify(r.errors)}`)
  }
  return r.errors
}

describe('valid recipe (WIDGET-GUIDE §10)', () => {
  test('parses with fields, body and fileName', () => {
    const r = ok(NETWORKING_PREP)
    assert.equal(r.recipe_format, 1)
    assert.equal(r.id, 'networking-prep')
    assert.equal(r.name, 'Networking Prep')
    assert.equal(r.version, '1.0.0', 'CORE_SCHEMA keeps 1.0.0 a string')
    assert.equal(r.author, 'Paul Waterman')
    assert.deepEqual(r.permissions, ['search_brain', 'save_to_brain', 'run_ai'])
    assert.equal(r.web_search, 'required')
    assert.equal(r.inputs.length, 3)
    assert.equal(r.inputs[1].required, false)
    assert.deepEqual(r.inputs[2].options, ['Find a job', 'Find a mentor', 'Learn an industry', 'Meet founders'])
    assert.deepEqual(r.brain_context, { query: '{{event_name}} contacts goals', limit: 5 })
    assert.deepEqual(r.output.sections, ['Who to meet', 'My 30-second introduction', 'Questions to ask', 'Follow-up plan'])
    assert.deepEqual(r.save, { type: 'work_product', tags: ['networking', '{{event_name}}'] })
    assert.equal(r.fileName, FILE)
    assert.equal(r.body, split(NETWORKING_PREP).body.trim())
    assert.ok(r.body.startsWith("I'm a university student"))
  })

  test('fileName is optional; recipe.fileName is then undefined', () => {
    const r = ok(NETWORKING_PREP, {})
    assert.equal(r.fileName, undefined)
    assert.equal(parseRecipe(NETWORKING_PREP).ok, true)
  })

  test('CRLF line endings (a Windows-saved file) parse the same', () => {
    const r = ok(NETWORKING_PREP.replace(/\n/g, '\r\n'))
    assert.equal(r.id, 'networking-prep')
    assert.equal(r.inputs.length, 3)
  })

  test('brain_context.limit defaults to 5', () => {
    const r = ok(variant((fm) => { fm.brain_context = { query: '{{event_name}}' } }))
    assert.equal(r.brain_context.limit, 5)
  })

  test('recipe with no brain_context, no save, only run_ai is valid', () => {
    const r = ok(variant((fm) => {
      fm.permissions = ['run_ai']; fm.brain_context = undefined; fm.save = undefined
    }, 'Event {{event_name}} {{goal}} {{event_details}} on {{today}}.'))
    assert.equal(r.brain_context, undefined)
  })

  for (const w of ['required', 'helpful', 'none']) {
    test(`web_search: ${w} accepted`, () => {
      assert.equal(ok(variant((fm) => { fm.web_search = w })).web_search, w)
    })
  }

  test('placeholders may have inner spaces: {{ event_name }}', () => {
    ok(variant(() => {}, 'Go to {{ event_name }} on {{ today }}. {{brain_context}}'))
  })

  test('profile save with each profile_part is valid', () => {
    for (const part of ['skills', 'experience', 'job-history', 'education', 'goals']) {
      ok(variant((fm) => { fm.save = { type: 'profile', profile_part: part, tags: ['me'] } }))
    }
  })

  test('every save.type is valid', () => {
    for (const t of ['work_product', 'personal_note', 'job_history']) ok(variant((fm) => { fm.save.type = t }))
  })

  test('limits at their edges are valid', () => {
    ok(variant((fm) => { fm.name = 'N'.repeat(40) }))
    ok(variant((fm) => { fm.description = 'd'.repeat(160) }))
    ok(variant((fm) => { fm.id = 'abc' }), { fileName: 'abc.recipe.md' })
    const id40 = 'a' + 'b'.repeat(38) + '9'
    ok(variant((fm) => { fm.id = id40 }), { fileName: `${id40}.recipe.md` })
    ok(variant((fm) => { fm.inputs = [fm.inputs[0]] }, '{{event_name}} {{today}}'))
    ok(variant((fm) => { for (let i = fm.inputs.length; i < 8; i++) fm.inputs.push({ id: `x${i}`, label: 'X', type: 'number', required: false }) }))
    ok(variant((fm) => { fm.output.sections = ['A', 'B'] }))
    ok(variant((fm) => { fm.output.sections = Array.from({ length: 10 }, (_, i) => `S${i}`) }))
    ok(variant((fm) => { fm.save.tags = ['a'] }))
    ok(variant((fm) => { fm.save.tags = ['a', 'b', 'c', 'd', 'e'] }))
    ok(variant((fm) => { fm.inputs[2].options = ['a', 'b'] }))
    ok(variant((fm) => { fm.inputs[2].options = Array.from({ length: 12 }, (_, i) => `o${i}`) }))
    ok(variant((fm) => { fm.brain_context.limit = 10 }))
    ok(variant((fm) => { fm.brain_context.limit = 1 }))
    ok(variant((fm) => { fm.version = '2.10.3' }))
  })

  test('maths in the body is not mistaken for HTML (3 < 5 and 7 > 2)', () => {
    ok(variant(() => {}, 'If 3 < 5 and 7 > 2, plan {{event_name}} {{today}}.'))
  })
})

describe('structure', () => {
  // PLAN amended after review: blank lines and whitespace before the opening --- are forgiven.
  test('leading blank lines and whitespace before --- are forgiven', () => {
    assert.equal(ok('\n' + NETWORKING_PREP).id, 'networking-prep')
    assert.equal(ok('\n\n   \n' + NETWORKING_PREP).id, 'networking-prep')
    assert.equal(ok('  \r\n' + NETWORKING_PREP.replace(/\n/g, '\r\n')).id, 'networking-prep')
  })
  test('any other text before --- is an error', () => {
    bad('hello\n' + NETWORKING_PREP)
    bad('Here is your recipe:\n\n' + NETWORKING_PREP)
    bad('```\n' + NETWORKING_PREP + '```\n')
  })
  test('missing closing ---', () => bad('---\nid: abc\nname: x\n'))
  test('empty text', () => bad(''))
  test('YAML syntax error is reported, not thrown', () => bad('---\nid: [unclosed\n---\nbody'))
  test('front matter that is not a mapping', () => bad('---\n- a\n- b\n---\nbody'))
  test('custom YAML types are rejected (CORE_SCHEMA)', () => {
    bad('---\nrecipe_format: 1\nid: !!js/function "function(){}"\n---\nbody')
  })
  test('unknown front-matter field is an error naming it', () => {
    bad(variant((fm) => { fm.colour = 'blue' }), 'colour')
  })
})

describe('required fields (§3)', () => {
  for (const f of ['recipe_format', 'id', 'name', 'description', 'version', 'author', 'permissions', 'web_search', 'inputs', 'output']) {
    test(`missing ${f}`, () => bad(variant((fm) => { fm[f] = undefined }), f))
  }
  test('recipe_format must be the number 1', () => {
    bad(variant((fm) => { fm.recipe_format = 2 }), 'recipe_format')
    bad(variant((fm) => { fm.recipe_format = '1' }), 'recipe_format')
  })
  test('empty author', () => bad(variant((fm) => { fm.author = '' }), 'author'))
})

describe('id and fileName (§3, §9.2)', () => {
  for (const id of ['ab', 'Networking', '1abc', 'a_b_c', '-abc', 'a'.repeat(41), 'net prep']) {
    test(`invalid id ${JSON.stringify(id)}`, () => bad(variant((fm) => { fm.id = id }), 'id'))
  }
  test('fileName must equal `${id}.recipe.md`', () => {
    bad(NETWORKING_PREP, null, { fileName: 'other.recipe.md' })
    bad(NETWORKING_PREP, null, { fileName: 'networking-prep.md' })
    bad(NETWORKING_PREP, null, { fileName: 'Networking-Prep.recipe.md' })
  })
})

describe('lengths and version', () => {
  test('name over 40', () => bad(variant((fm) => { fm.name = 'N'.repeat(41) }), 'name'))
  test('description over 160', () => bad(variant((fm) => { fm.description = 'd'.repeat(161) }), 'description'))
  for (const v of ['1.0', 'v1.0.0', '1.0.0-beta', '1', '1.0.0.0']) {
    test(`version ${v}`, () => bad(variant((fm) => { fm.version = v }), 'version'))
  }
})

describe('permissions (§6) and web_search (§6a)', () => {
  test('unknown permission', () => bad(variant((fm) => { fm.permissions = ['search_brain', 'save_to_brain', 'delete_brain'] }), 'permissions'))
  test('permissions not a list', () => bad(variant((fm) => { fm.permissions = 'run_ai' }), 'permissions'))
  test('brain_context requires search_brain', () => {
    bad(variant((fm) => { fm.permissions = ['save_to_brain', 'run_ai'] }), 'brain_context')
  })
  test('save requires save_to_brain', () => {
    bad(variant((fm) => { fm.permissions = ['search_brain', 'run_ai'] }), 'save')
  })
  for (const w of ['sometimes', 'yes', '', true]) {
    test(`web_search ${JSON.stringify(w)} rejected`, () => bad(variant((fm) => { fm.web_search = w }), 'web_search'))
  }
})

describe('inputs (§4)', () => {
  test('zero inputs', () => bad(variant((fm) => { fm.inputs = [] }, 'Hi {{today}}'), 'inputs'))
  test('nine inputs', () => bad(variant((fm) => {
    for (let i = fm.inputs.length; i < 9; i++) fm.inputs.push({ id: `x${i}`, label: 'X', type: 'text', required: false })
  }), 'inputs'))
  test('the PLAN example error, exact wording', () => {
    const errs = bad(variant((fm) => { fm.inputs[1].type = 'date' }), 'inputs[1].type')
    assert.ok(errs.includes('inputs[1].type must be one of text, long_text, choose_one, number'), JSON.stringify(errs))
  })
  for (const id of ['Event', 'event-name', '', 'ev ent']) {
    test(`invalid input id ${JSON.stringify(id)}`, () => bad(variant((fm) => { fm.inputs[0].id = id }, 'x {{today}}'), 'inputs[0].id'))
  }
  test('duplicate input ids', () => bad(variant((fm) => { fm.inputs[1].id = 'event_name' }, 'x {{event_name}} {{goal}}'), /inputs\[1\]\.id|duplicate|unique/i))
  test('missing label', () => bad(variant((fm) => { delete fm.inputs[0].label }), 'inputs[0].label'))
  test('missing required (it has no default)', () => bad(variant((fm) => { delete fm.inputs[0].required }), 'inputs[0].required'))
  test('required must be boolean (yes is a string under CORE_SCHEMA)', () => {
    bad(variant((fm) => { fm.inputs[0].required = 'yes' }), 'inputs[0].required')
  })
  test('choose_one needs options', () => bad(variant((fm) => { delete fm.inputs[2].options }), 'inputs[2].options'))
  test('options: 1 is too few, 13 too many', () => {
    bad(variant((fm) => { fm.inputs[2].options = ['only'] }), 'inputs[2].options')
    bad(variant((fm) => { fm.inputs[2].options = Array.from({ length: 13 }, (_, i) => `o${i}`) }), 'inputs[2].options')
  })
  test('options on a non-choose_one input is an error (strict reading of "only for choose_one")', () => {
    bad(variant((fm) => { fm.inputs[0].options = ['a', 'b'] }), 'inputs[0].options')
  })
  test('unknown key inside an input is an error', () => {
    bad(variant((fm) => { fm.inputs[0].default = 'x' }), /inputs\[0\]/)
  })
})

describe('brain_context (§5)', () => {
  for (const l of [0, 11, 2.5, '5']) {
    test(`limit ${JSON.stringify(l)}`, () => bad(variant((fm) => { fm.brain_context.limit = l }), 'brain_context.limit'))
  }
  test('missing query', () => bad(variant((fm) => { fm.brain_context = { limit: 3 } }), 'brain_context.query'))
})

describe('output (§3)', () => {
  test('1 section', () => bad(variant((fm) => { fm.output.sections = ['One'] }), 'output.sections'))
  test('11 sections', () => bad(variant((fm) => { fm.output.sections = Array.from({ length: 11 }, (_, i) => `S${i}`) }), 'output.sections'))
  test('sections missing', () => bad(variant((fm) => { fm.output = {} }), 'output.sections'))
})

describe('save (§7)', () => {
  test('bad type', () => bad(variant((fm) => { fm.save.type = 'diary' }), 'save.type'))
  test('profile without profile_part', () => bad(variant((fm) => { fm.save = { type: 'profile', tags: ['me'] } }), 'profile_part'))
  test('bad profile_part', () => bad(variant((fm) => { fm.save = { type: 'profile', profile_part: 'hobbies', tags: ['me'] } }), 'profile_part'))
  test('profile_part on a non-profile type is an error (strict)', () => {
    bad(variant((fm) => { fm.save.profile_part = 'skills' }), 'profile_part')
  })
  test('0 tags / 6 tags', () => {
    bad(variant((fm) => { fm.save.tags = [] }), 'save.tags')
    bad(variant((fm) => { fm.save.tags = ['a', 'b', 'c', 'd', 'e', 'f'] }), 'save.tags')
  })
})

describe('placeholders (§8, §9.3)', () => {
  test('PLACEHOLDER_RE is exported exactly', () => {
    assert.ok(PLACEHOLDER_RE instanceof RegExp)
    assert.equal(PLACEHOLDER_RE.source, String.raw`\{\{\s*([a-zA-Z0-9_]+)\s*\}\}`)
    assert.ok(PLACEHOLDER_RE.flags.includes('g'))
  })
  test('unknown placeholder in body names it', () => bad(variant(() => {}, 'Hi {{nobody}} {{today}}'), 'nobody'))
  test('unknown placeholder in brain_context.query names it', () => {
    bad(variant((fm) => { fm.brain_context.query = '{{company}} goals' }), 'company')
  })
  test('unknown placeholder in save.tags names it', () => {
    bad(variant((fm) => { fm.save.tags = ['x', '{{company}}'] }), 'company')
  })
  test('a {{ that is not a valid placeholder is an error', () => {
    bad(variant(() => {}, 'Hi {{event-name}}'))
    bad(variant(() => {}, 'Hi {{ event_name'))
    bad(variant(() => {}, 'Hi {{}}'))
  })
  test('placeholders in save.tags may be today or input ids', () => {
    ok(variant((fm) => { fm.save.tags = ['{{today}}', '{{goal}}'] }))
  })
})

describe('HTML and javascript: (§1, §9.5)', () => {
  const cases = {
    'script tag in body': () => variant(() => {}, '<script>alert(1)</script> {{event_name}}'),
    'iframe in help': () => variant((fm) => { fm.inputs[1].help = 'see <iframe src=x>' }),
    'bold tag in description': () => variant((fm) => { fm.description = 'Get <b>ready</b>.' }),
    'closing tag with spaces': () => variant(() => {}, 'x < / div > {{today}}'),
    'javascript: in body': () => variant(() => {}, '[click](javascript:alert(1)) {{today}}'),
    'JavaScript: mixed case in a tag': () => variant((fm) => { fm.save.tags = ['JavaScript:void(0)'] }),
    'img tag in an option': () => variant((fm) => { fm.inputs[2].options[0] = '<img src=x onerror=alert(1)>' }),
  }
  for (const [name, make] of Object.entries(cases)) test(name, () => bad(make()))
})

describe('size (§9.6)', () => {
  test('a 25 KB file is rejected', () => bad(variant(() => {}, '{{today}} ' + 'x'.repeat(25 * 1024))))
  test('a 15 KB file is accepted', () => ok(variant(() => {}, '{{today}} ' + 'x'.repeat(15 * 1024))))
})

describe('all errors are collected', () => {
  test('five independent problems → an error for each', () => {
    const errs = bad(variant((fm) => {
      fm.recipe_format = 2
      fm.web_search = 'maybe'
      fm.inputs[1].type = 'date'
      fm.name = 'N'.repeat(41)
    }, 'Hi {{ghost}} {{today}}'))
    for (const f of ['recipe_format', 'web_search', 'inputs[1].type', 'name', 'ghost']) {
      assert.ok(errs.some((e) => e.includes(f)), `missing error for ${f}: ${JSON.stringify(errs)}`)
    }
    assert.ok(errs.length >= 5)
  })
})
