// Phase 3 shared fixtures: the Deere real-run files and synthetic answers.
// Used by unit tests and by tests/e2e/phase3-company.spec.mjs.
import { readFileSync, existsSync } from 'node:fs'

const DIR = new URL('../fixtures/real-run/deere/', import.meta.url)
export const RECIPE_FILE = new URL('../../core/tools/company-analysis.recipe.md', import.meta.url)
export const INDEX_FILE = new URL('../../core/tools/index.json', import.meta.url)
export const ANSWER_FILE = new URL('answer.md', DIR)

export const INPUTS = JSON.parse(readFileSync(new URL('inputs.json', DIR), 'utf8'))
export const PROMPT = readFileSync(new URL('prompt.md', DIR), 'utf8')
export const recipeText = () => readFileSync(RECIPE_FILE, 'utf8')

// The real answer is written by a separate research agent. Until it lands,
// every test that needs it fails with this message, never silently skips.
export function readAnswer() {
  if (!existsSync(ANSWER_FILE)) {
    throw new Error('answer.md missing: tests/fixtures/real-run/deere/answer.md has not been written yet (Phase 3 PLAN §4)')
  }
  return readFileSync(ANSWER_FILE, 'utf8')
}

// The company-analysis sections from PLAN §1, in order (the hub adds Summary).
export const SECTIONS = [
  'Company snapshot', 'Business units', 'Industries and main competitors', 'Environmental scan',
  'Research summary', 'Suggested further research', 'Limits of this analysis',
]

const L = (p) => `https://example.com/deere/${p}`

// A complete, fully sourced synthetic answer: every section, 0 unsourced.
export const GOOD_SUMMARY = 'Deere & Company (NYSE: DE) leads farm machinery and is a strong number three in construction equipment. Construction & Forestry faces housing-cycle and tariff risk.'
export const GOOD_ANSWER = `# Deere & Company (NYSE: DE)

## Company snapshot
- Deere is headquartered in Moline, Illinois [10-K](${L('10k')}).
- Revenue was about $51bn in fiscal 2024 [10-K](${L('10k')}).

## Business units
Deere reports these segments:
- Production & Precision Agriculture [10-K](${L('seg')})
- Construction & Forestry [10-K](${L('seg')})

## Industries and main competitors
| Competitor | Strength | Weakness |
|---|---|---|
| Caterpillar | Dealer network [CAT](${L('cat')}) | Smaller forestry line [CAT](${L('cat2')}) |

## Environmental scan
### Political
- Steel tariffs raise input costs [Reuters](${L('tariffs')}).

## Research summary
- C&F is cyclical [Analysis](${L('cyclical')}).

## Suggested further research
- How exposed is C&F to housing starts?
- What is the dealer inventory trend?

## Limits of this analysis
- Segment margins for forestry alone are not disclosed [unverified].

## Summary
${GOOD_SUMMARY}
`

// A deliberately weak answer: right sections, several unsourced claims.
export const WEAK_ANSWER = `## Company snapshot
- Deere is headquartered in Moline, Illinois [10-K](${L('10k')}).
- Deere employs about 75,000 people.

## Business units
- Construction & Forestry sells excavators and loaders.

## Industries and main competitors
| Competitor | Strength |
|---|---|
| Caterpillar | Biggest dealer network |

## Environmental scan
- Interest rates are high, which hurts housing.

## Research summary
- C&F is cyclical [Analysis](${L('cyclical')}).

## Suggested further research
- How exposed is C&F to housing starts?

## Limits of this analysis
- Forestry margins are not disclosed [unverified].

## Summary
Weak answer used to prove the source check warns.
`
export const WEAK_UNSOURCED = [
  { section: 'Company snapshot', text: 'Deere employs about 75,000 people.' },
  { section: 'Business units', text: 'Construction & Forestry sells excavators and loaders.' },
  { section: 'Industries and main competitors', text: '| Caterpillar | Biggest dealer network |' },
  { section: 'Environmental scan', text: 'Interest rates are high, which hurts housing.' },
]

// PLAN §2a: an answer that relies on every revised rule — labels, nested items
// inheriting their top-level item's source, a continuation paragraph,
// [unverified …] with extra words, and Note: lines. 0 unsourced under §2a.
export const RULES_SUMMARY = 'Deere & Company (NYSE: DE) is growing Construction & Forestry while large agriculture shrinks.'
export const RULES_ANSWER = `## Company snapshot
- Deere is headquartered in Moline, Illinois.
  [10-K](${L('10k')})

## Business units
Note: revenue shares are my own arithmetic from reported segment sales.

- **Construction & Forestry (CF):** this unit sells four kinds of equipment:
  - construction machines: excavators and dozers
  - forestry machines such as harvesters

  It sells to contractors through dealers. [10-K](${L('seg')})

## Industries and main competitors
**1. Construction equipment**

- **Caterpillar**
  - Strength: bigger scale [CAT](${L('cat')})
  - Weakness: lower growth [CAT](${L('cat2')})
- **CNH Industrial**
  - Strength: second full-line maker [unverified – not checked against a 2026 source]

## Environmental scan
*Political*
- Tariffs raise costs [Reuters](${L('tariffs')})

## Research summary
- C&F is cyclical [Analysis](${L('cyclical')}).

## Suggested further research
- How exposed is C&F to housing starts?

## Limits of this analysis
- **Note:** fiscal 2026 is not finished; full-year numbers are guidance.
- note: competitor quarters do not line up with Deere's.

## Summary
${RULES_SUMMARY}
`
