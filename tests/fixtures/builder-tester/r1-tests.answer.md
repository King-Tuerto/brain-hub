## Test plan

These are new tests. No previous test cases were provided.

Today is 2026-10-04 (a Sunday). Every date below is counted from that day.

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | One Study Plan entry for every week from today through the exam week | Test 1, Test 3 |
| A2 | No exam date given: weeks are numbered, and the answer says why | Test 2 |
| A3 | Every topic comes from the syllabus, in the syllabus's order | Test 1, Test 2, Test 3 |
| A4 | Exactly 5 practice questions, all on first-week topics | Test 1, Test 2, Test 3 |
| A5 | The answer ends with a Summary section | Test 1, Test 2, Test 3 |

Every criterion is covered by at least one test.

## Test cases

### Test 1: normal use

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; Week 4: Consumer choice; Week 5: Costs of production; Week 6: Perfect competition`
- **Exam date:** `2026-11-12`

**Expected**
- [ ] [A1] The Study Plan shows calendar dates, not just week numbers.
- [ ] [A1] The first entry covers today (2026-10-04) or the week that contains it.
- [ ] [A1] The last entry is the week that contains 2026-11-12. No entry comes after that week.
- [ ] [A1] There are no missing weeks between the first and last entry. That means 6 entries if weeks start on Sunday 2026-10-04, or 7 if the plan uses Monday-to-Sunday weeks and counts this partial week.
- [ ] [A3] Every topic named in the plan is one of the six syllabus topics. No outside topics are added, such as "Monopoly", "GDP" or "Game theory".
- [ ] [A3] The topics appear in syllabus order: Supply and demand, Market structures, Elasticity, Consumer choice, Costs of production, Perfect competition.
- [ ] [A4] The Practice Questions section has exactly 5 questions. Count them.
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic.
- [ ] [A5] The very last section of the answer is titled Summary. Nothing else comes after it.
- [ ] [Order] The sections come in this order: Study Plan, Practice Questions, Summary.

### Test 2: edge case, optional input left blank

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Cell structure and organelles; Week 2: Cell membranes and transport; Week 3: Enzymes; Week 4: Cellular respiration`
- **Exam date:** leave blank

**Expected**
- [ ] [A2] The Study Plan entries are labelled by week number, such as Week 1 to Week 4. They have no calendar dates.
- [ ] [A2] The answer says clearly that it used week numbers because no exam date was given.
- [ ] [A2 / Blank inputs] The answer never states or guesses an exam date anywhere. That includes "assuming your exam is on …" and "probably in December".
- [ ] [A3] All four topics appear in this order: Cell structure and organelles, Cell membranes and transport, Enzymes, Cellular respiration. No topic is added that is not in the syllabus, such as photosynthesis or DNA replication.
- [ ] [A4] The Practice Questions section has exactly 5 questions.
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration.
- [ ] [A5] The answer ends with a Summary section.

### Test 3: tricky case, a long syllabus and an exam that is only a few weeks away

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Business model canvas, Value proposition; Week 2: Customer discovery; Week 3: Lean startup and MVPs; Week 4: Competitive analysis; Week 5: Pricing strategy; Week 6: Go-to-market; Week 7: Unit economics; Week 8: Fundraising basics; Week 9: Pitch decks; Week 10: Scaling and growth`
- **Exam date:** `2026-10-21`

**Expected**
- [ ] [A1] The plan shows calendar dates and ends with the week that contains 2026-10-21. It has 3 entries, or 4 if it uses Monday-to-Sunday weeks and counts this partial week. It does not run on to 10 weeks just because the syllabus has 10.
- [ ] [A1] The first entry covers today (2026-10-04) or the week that contains it, and no week is skipped.
- [ ] [A3] Every topic named comes from the syllabus. No topic is invented.
- [ ] [A3] Topics appear in syllabus order. "Business model canvas" comes before "Value proposition", which comes before "Customer discovery", and so on. A later topic never appears in an earlier week than one that comes before it in the syllabus.
- [ ] [A4] The Practice Questions section has exactly 5 questions, even though the syllabus is long.
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later.
- [ ] [A5] The answer ends with a Summary section.

## How to run them

1. Open the Exam Study Planner tool in Brain Hub.
2. Run it once for Test 1. Type exactly the inputs listed under Test 1, nothing more and nothing less.
3. When the answer appears, copy the whole answer, from the first line to the last.
4. Paste it somewhere safe, such as a blank document, under the label **Test 1**.
5. Do steps 2–4 again for **Test 2**, leaving the exam date empty, and then for **Test 3**. Start a fresh run each time.
6. Open a **new chat**. Do not use the chat that built the tool.
7. Open "Tester 2 — grade" in that new chat. Paste in, together:
   - the Spec,
   - these test cases,
   - the three answers, labelled **Test 1**, **Test 2** and **Test 3**.
8. Send it and read the grades.

## Summary

These are three pre-run tests for the Exam Study Planner, an Economics/Biology/Entrepreneurship syllabus-to-study-plan tool. Between them they check dated weeks through the exam week (A1), week numbers when there is no exam date (A2), topics kept in syllabus order (A3), exactly 5 first-week practice questions (A4) and a final Summary (A5). Test 3 is the tricky case: a 10-week syllabus with an exam on 2026-10-21, checking that the plan stops at the exam week and invents no topics.
