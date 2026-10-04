## Test plan

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | One Study Plan entry for every week from now until the exam date | Test 1, Test 3 |
| A2 | No exam date: every syllabus topic still covered week by week, and the plan says why | Test 2 |
| A3 | Every week names only topics from the pasted syllabus | Test 1, Test 2, Test 3 |
| A4 | Exactly five practice questions, all on Week 1 topics only | Test 1, Test 2, Test 3 |
| A5 | The answer ends with a Summary section | Test 1, Test 2, Test 3 |

Section order (Study Plan, then Week 1 Practice Questions, then Summary) is checked in every test as part of A5.

## Test cases

### Test 1: normal use

**Inputs to type**
- Paste your class syllabus: `Week 1: Intro to Macroeconomics, scarcity and opportunity cost. Week 2: Supply and Demand. Week 3: Elasticity. Week 4: Market Structures. Week 5: National Income Accounting and GDP. Week 6: Inflation and Unemployment. Week 7: Fiscal Policy. Week 8: Monetary Policy and the Federal Reserve.`
- Exam date: `2026-12-15`

**Before you run it:** count the weeks from the day you run the test to 2026-12-15 and write that number down as [your week count].

**Expected**
- [ ] [A5] The headings appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [ ] [A1] The Study Plan has one entry for each of the [your week count] weeks, with no weeks skipped or doubled.
- [ ] [A1] No Study Plan entry falls after 2026-12-15.
- [ ] [A3] Every topic named in the Study Plan is one of the eight syllabus topics (or a review of them). Nothing extra appears, such as "International Trade" or "Game Theory".
- [ ] [A4] The Week 1 Practice Questions section has exactly 5 questions. Count them.
- [ ] [A4] All 5 questions are about intro to macroeconomics, scarcity or opportunity cost. None is about supply and demand or any later topic.
- [ ] [A5] Summary is the last section, with 2–3 sentences and nothing after it.

### Test 2: edge case, every optional input blank

**Inputs to type**
- Paste your class syllabus: `Week 1: Cell Structure and Function. Week 2: Cell Membranes and Transport. Week 3: Cellular Respiration. Week 4: Photosynthesis. Week 5: DNA Replication.`
- Exam date: leave blank

**Expected**
- [ ] [A5] The headings appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [ ] [A2] The Study Plan section says it was planned this way because no exam date was given.
- [ ] [A2] The answer does not make up an exam date anywhere.
- [ ] [A2] All 5 syllabus topics appear in the Study Plan, set out week by week (5 week entries).
- [ ] [A3] No topic outside the syllabus appears, such as "Genetics", "Evolution" or "Mitosis".
- [ ] [A4] Exactly 5 practice questions, all on cell structure and function only. None is about membranes, respiration, photosynthesis or DNA.
- [ ] [A5] Summary is the last section, with 2–3 sentences and nothing after it.

### Test 3: tricky case (very short, oddly formatted syllabus, far-off exam)

**Inputs to type**
- Paste your class syllabus: `wk1 - Ancient Greece; wk2 - Roman Republic`
- Exam date: `2027-02-26`

**Before you run it:** count the weeks from the day you run the test to 2027-02-26 and write that number down as [your week count]. It will be much more than 2.

**Expected**
- [ ] [A5] The headings appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [ ] [A1] The Study Plan still has one entry for each of the [your week count] weeks up to the exam. It does not stop after 2 weeks.
- [ ] [A3] The extra weeks name only Ancient Greece or the Roman Republic (for example as review). No new topic appears, such as "Roman Empire", "Byzantium" or "Egypt".
- [ ] [A3] The tool reads "wk1" and "wk2" correctly as Week 1 and Week 2. It does not swap the two topics.
- [ ] [A4] Exactly 5 practice questions, all on Ancient Greece only. None is about Rome.
- [ ] [A5] Summary is the last section, with 2–3 sentences and nothing after it.

## How to run them

1. Open your Study Plan Builder tool.
2. Run it once for Test 1. Type exactly the inputs listed under Test 1, nothing more.
3. When the answer appears, copy the whole answer, top to bottom.
4. Paste it into a document and put the label "Test 1" above it.
5. Do steps 2 to 4 again for Test 2, then for Test 3, using exactly their inputs. Label them "Test 2" and "Test 3".
6. Open a **new chat**, not the chat you used to build the tool.
7. Open "Tester 2 — grade" in that new chat.
8. Paste in, together: the Spec, these test cases (with your week counts filled in), and the three labelled answers.

## Summary

Three tests for the Study Plan Builder spec: normal use with an exam date, a blank exam date, and a very short two-week syllabus with a distant exam. Together they cover acceptance criteria A1–A5: one entry per week until the exam, no-date handling, no topics from outside the syllabus, exactly five Week 1 questions, and a closing Summary.
