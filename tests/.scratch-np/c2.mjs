import { appHelpers, fx } from '../helpers/buildertester.mjs'
import { parseRecipe } from '../../core/lib/recipe.js'
const { sectionText } = await appHelpers()
const s = sectionText(fx('r5-builder.answer.md'), 'Recipe')
console.log(JSON.stringify(s.slice(0, 40)), '...', JSON.stringify(s.slice(-60)))
const r = parseRecipe(s, { fileName: 'syllabus-study-planner.recipe.md' })
console.log(r.ok, r.errors)
