## Test plan

**Changes from last time:**
- **A4 practice-question check, in Tests 1, 2 and 3 (one line each).** The Spec now says no practice question may *mention*, *preview* or *depend on* a week-2-or-later topic. That includes using it as an "introduction to" a later topic or as background needed to answer. The old check only asked whether a question was *about* a later topic. A question can be about week 1 and still name or rely on a later topic, so the old check would have let that through. Each of those lines now checks for that too. The other wording of that line stays the same.
- No other changes. A1, A2, A3 and A5 and the section order read the same as before, so every other check is copied word for word. No new criterion was added, so no new check was added.

**Coverage:**

| Criterion | Covered by |
|---|---|
| A1: one entry per week from today through the exam week | Test 1, Test 3 |
| A2: week numbers and an explanation when the exam date is blank | Test 2 |
| A3: topics come only from the syllabus, in syllabus order | Test 1, Test 2, Test 3 |
| A4: exactly 5 questions, first-week topics only, no mention of or dependence on later topics | Test 1, Test 2, Test 3 |
| A5: the answer ends with a Summary section | Test 1, Test 2, Test 3 |
| Blank inputs: no invented exam date | Test 2 |

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
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic. No question mentions or previews a later topic, including as an "introduction to" it, and no question needs knowledge of a later topic to answer. For example, no question asks how "elastic" demand is.
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
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration. No question mentions or previews those later topics, including as an "introduction to" them, and none needs knowledge of them to answer. For example, no question asks what the mitochondria do in cellular respiration, or how things cross the cell membrane.
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
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later. No question mentions or previews a later topic, including as an "introduction to" it, and none needs knowledge of one to answer. For example, no question asks you to test a value proposition with customer interviews, build an MVP or set a price.
- [ ] [A5] The answer ends with a Summary section.

## How to run them

1. Open the Exam Study Planner tool.
2. Run it once for **Test 1**. Type exactly the inputs listed under Test 1, nothing more and nothing less. Copy the whole answer.
3. Start the tool fresh and run it once for **Test 2**. Paste the syllabus and leave the Exam date box empty. Copy the whole answer.
4. Start the tool fresh and run it once for **Test 3** with exactly the Test 3 inputs. Copy the whole answer.
5. Open a **new chat**. Do not use the chat that built the tool.
6. Open "Tester 2 — grade" there. Paste in this Spec, these three test cases, and the three answers, labelled **Test 1**, **Test 2** and **Test 3**.
7. Let it grade each checklist item.

## Summary

These are the retest cases for the Exam Study Planner, kept the same as last time except for the A4 practice-question check. That check now also fails any question that mentions, previews or depends on a week-2-or-later topic. The tests cover the dated plan through the exam week, the week-numbered plan when no exam date is given, topics kept in syllabus order, exactly 5 first-week questions, and the closing Summary.
