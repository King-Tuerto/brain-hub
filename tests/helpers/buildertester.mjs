// The real Builder & Tester run (docs/builder-tester/PLAN.md "The proof").
// El Código keeps each attempt in its own folder; point DIR at the one under test.
import { readFileSync } from 'node:fs'

export const DIR = 'tests/fixtures/builder-tester/attempt-1/'
const root = new URL('../../', import.meta.url)
export const readRepo = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')
export const fx = (name) => readRepo(DIR + name)
export const fxJson = (name) => JSON.parse(fx(name))
export const GUIDE = () => readRepo('WIDGET-GUIDE.md')
