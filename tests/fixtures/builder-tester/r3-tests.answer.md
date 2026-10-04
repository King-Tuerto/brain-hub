## Test plan

**Changes from last time:**
- **A4 was changed in the Spec.** It now also forbids later topics in **multiple-choice answer options**, and forbids a question being **framed** around a later topic, for example a comparison to it or a scenario that assumes it. So the second [A4] check in each of Test 1, Test 2 and Test 3 now also checks answer options and framing. Each of those checks has one extra example of the new rule. The rest of each check is the same as before.
- Nothing else changed. All other checks are copied word for word, because A1, A2, A3, A5 and the Blank inputs rule are the same as last time.

**Coverage:**

| Criterion | Test 1 | Test 2 | Test 3 |
|---|---|---|---|
| A1: one entry per week from today through the exam week | Yes | | Yes |
| A2: week numbers and a stated reason when there is no exam date | | Yes | |
| A3: topics come only from the syllabus, in syllabus order | Yes | Yes | Yes |
| A4: exactly 5 questions, first-week topics only, no later topic in options or framing | Yes | Yes | Yes |
| A5: ends with Summary | Yes | Yes | Yes |
| Blank inputs: no invented exam date | | Yes | |

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
2. Run it once for Test 1. Type exactly the inputs listed under Test 1. Copy the whole answer.
3. Run it again for Test 2, with exactly those inputs. Leave the exam date blank. Copy the whole answer.
4. Run it again for Test 3, with exactly those inputs. Copy the whole answer.
5. Open a **new chat** for grading. Do not use the chat that built the tool.
6. In that new chat, open "Tester 2 — grade". Paste in this Spec, these test cases, and all three answers together. Label the answers Test 1, Test 2 and Test 3.

## Summary

Retest plan for the Exam Study Planner after the Spec tightened A4 so that no practice question, answer option or question framing may involve a week 2 or later topic. The three tests are the same as last time, except that each test's A4 check now also covers answer options and framing. They still check dated weeks through the exam, week numbers when no exam date is given, syllabus order, exactly 5 first-week questions and a closing Summary.
