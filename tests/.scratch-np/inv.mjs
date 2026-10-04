import { inventedStudentFacts, placeholdersIn } from '../helpers/phase5.mjs'
import { answerOf, studentText } from '../helpers/jobprep.mjs'
for (const c of ['A','B']) { console.log(c, JSON.stringify(inventedStudentFacts(answerOf(c), studentText(c)), null, 1), placeholdersIn(answerOf(c)).length) }
