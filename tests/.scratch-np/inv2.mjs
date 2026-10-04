import { inventedStudentFacts as f } from '../helpers/phase5.mjs'
const B = 'grew average attendance from 22 to 41 students.'
for (const s of ['- In the first 90 days, I\'d talk to customers.', '- I would interview 10 customers in my first month.', "- I'd grown sign-ups 35%.", "- I'd increased attendance 20%.", "- I'd led 4 projects.", "- I would have run 6 events.",
  '- Grew attendance from 22 to 41 students (+86%).', '- Grew attendance from 22 to 41 students (+90%).', '- Grew attendance by 86%.', '- Grew attendance from 22 to 41 (86%).', '- Grew attendance 22 to 50 students (+127%).'])
  console.log(JSON.stringify(f(s, B).flatMap(x=>x.figures)), s)
