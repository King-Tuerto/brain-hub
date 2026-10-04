## Test plan

No changes: the tests are the same as last time.

Coverage of each acceptance criterion:

- **A1** (one entry per week from today through the exam week): Test 1, Test 3
- **A2** (week numbers when the exam date is blank, and says why): Test 2
- **A3** (every topic from the syllabus, in syllabus order): Test 1, Test 2, Test 3
- **A4** (exactly 5 questions, first-week topics only, nothing from week 2 or later in questions, options, framing or required knowledge): Test 1, Test 2, Test 3
- **A5** (ends with a Summary section): Test 1, Test 2, Test 3
- **Blank inputs** (no invented exam date): Test 2
- **Section order** (Study Plan, Practice Questions, Summary): Test 1

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
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic. No question or answer option mentions or previews a later topic, including as an "introduction to" it. No question is framed around a later topic, such as a comparison to it or a scenario that assumes it, and no question needs knowledge of a later topic to answer. For example, no question asks how "elastic" demand is, no answer option says "elastic", and no question is set in a monopoly or a perfectly competitive market.
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
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration. No question or answer option mentions or previews those later topics, including as an "introduction to" them. No question is framed around them, such as a comparison to them or a scenario that assumes them, and none needs knowledge of them to answer. For example, no question asks what the mitochondria do in cellular respiration, or how things cross the cell membrane, and no answer option says "produces ATP through respiration" or "makes enzymes".
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
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later. No question or answer option mentions or previews a later topic, including as an "introduction to" it. No question is framed around a later topic, such as a comparison to it or a scenario that assumes it, and none needs knowledge of one to answer. For example, no question asks you to test a value proposition with customer interviews, build an MVP or set a price, no answer option says "run customer interviews" or "check competitors", and no question is set in a startup that is pitching investors.
- [ ] [A5] The answer ends with a Summary section.

## How to run them

1. Open the Exam Study Planner tool.
2. Run it once for Test 1. Type exactly the inputs listed under Test 1, leaving nothing out and adding nothing.
3. Copy the tool's whole answer, from the first line to the last, and keep it somewhere labelled "Test 1".
4. Do the same for Test 2 and Test 3, each as a separate run with exactly its own inputs. Label the answers "Test 2" and "Test 3".
5. Open a **new chat**. Do not use the chat that built the tool.
6. Open "Tester 2 — grade" in that new chat and paste in, together: the Spec, these test cases, and the three answers labelled Test 1, Test 2 and Test 3.

## Summary

Retest of the Exam Study Planner (syllabus to weekly study plan plus 5 first-week practice questions), with no changes: the three tests from last time are kept word for word as a fixed bar. They check dated weeks through the exam week, week numbers when the exam date is blank, syllabus-only topics in order, exactly 5 questions limited to week-1 topics with no later-topic framing, and a closing Summary.
