## Test plan

| Test | What it checks | Criteria covered |
|---|---|---|
| Test 1: normal use | An ordinary weekly syllabus with an exam date | A1, A2, A3, A4 |
| Test 2: edge case, exam date blank | The plan follows the syllabus's own weeks, ends with a general final-review week, and includes a note to add the exam date | A1, A3, A4, A5 |
| Test 3: tricky case, very short syllabus, distant exam | Only two topics have to fill many weeks, so the tool may be tempted to invent topics | A1, A2, A3, A4 |

Every criterion is covered: A1 by Tests 1–3, A2 by Tests 1 and 3, A3 by Tests 1–3, A4 by Tests 1–3, A5 by Test 2.

## Test cases

### Test 1: normal use

**Inputs to type**
- **Syllabus:** `Week 1: Supply and demand, market equilibrium. Week 2: Elasticity of demand. Week 3: Consumer choice and utility. Week 4: Production and costs. Week 5: Perfect competition. Week 6: Monopoly and pricing power. Week 7: Game theory and oligopoly. Week 8: Market failures and externalities.`
- **Exam date:** `2026-12-10`

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second, with nothing between or after them except an optional short note.
- [ ] [A2] The study plan has one entry for every week from the day you run it up to 2026-12-10. Before you check, count those weeks yourself on a calendar ([number of weeks]). No week is skipped and none is added after the exam date.
- [ ] [A3] Every topic in the study plan appears in the syllabus above, for example supply and demand, elasticity, monopoly or externalities. Topics that are not in the syllabus, such as "inflation" or "international trade", count as a fail.
- [ ] [A4] The practice questions section has exactly 5 questions. Count them.
- [ ] [A4] All 5 questions are about supply and demand or market equilibrium only. A question about elasticity or any later week is a fail.

### Test 2: edge case, with every optional input left blank

**Inputs to type**
- **Syllabus:** `Session 1: The Industrial Revolution in Britain. Session 2: Steam power and the factory system. Session 3: Urbanization and working conditions. Session 4: Labor movements and reform. Session 5: The spread of industry to Europe and the United States.`
- **Exam date:** leave blank

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second.
- [ ] [A5] The plan is still broken into weeks or sessions, and they follow the syllabus's own 5 sessions in the same order.
- [ ] [A5] The plan ends with a general final-review week.
- [ ] [A5] Somewhere in the answer there is a note telling the student to add the exam date later for exact timing.
- [ ] [A5] The answer does not make up an exam date or count down to one.
- [ ] [A3] Every topic in the plan comes from the 5 sessions above. The final-review week may say "review" but must not bring in new topics.
- [ ] [A4] There are exactly 5 practice questions, and all of them are about the Industrial Revolution in Britain (Session 1) only. A question about steam power, factories, cities or labor movements is a fail.

### Test 3: tricky but fair, a very short syllabus with an exam far away

**Inputs to type**
- **Syllabus:** `Week 1: Photosynthesis. Week 2: Cellular respiration.`
- **Exam date:** `2027-01-15`

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second.
- [ ] [A2] The study plan has one entry for every week from the day you run it up to 2027-01-15. Count those weeks on a calendar first ([number of weeks]). Expect many weeks, far more than 2.
- [ ] [A3] The extra weeks are filled only with photosynthesis, cellular respiration, or reviewing those two. A new biology topic that is not in the syllabus, such as "genetics", "mitosis" or "the nervous system", is a fail.
- [ ] [A4] There are exactly 5 practice questions, even though the syllabus is tiny.
- [ ] [A4] All 5 questions are about photosynthesis only. A question about cellular respiration, or one comparing the two processes, is a fail.

## How to run them

1. Open the Exam Study Planner tool.
2. Run it once for Test 1. Type exactly the inputs listed under Test 1, then copy the whole answer.
3. Run it again for Test 2 with exactly the Test 2 inputs. Leave the exam date blank. Copy the whole answer.
4. Run it a third time for Test 3 with exactly the Test 3 inputs, and copy the whole answer.
5. Before grading, write down the date you ran the tests. The grader needs it to count the weeks for Tests 1 and 3.
6. Open a **new chat**. Do not use the chat that built the tool.
7. Paste into "Tester 2 — grade", all together:
   - the Spec,
   - these test cases,
   - the three answers, labelled **Test 1**, **Test 2** and **Test 3**,
   - the date you ran them.

## Summary

These are the Tester test cases for the Exam Study Planner, written from its Spec before the tool was run. Test 1 covers normal use with an exam date, Test 2 leaves the exam date blank, and Test 3 pairs a very short syllabus with an exam far away. Together they check the two-section order, one plan entry per week, that no topics are invented, the 5 first-week-only practice questions, and the note asking for the exam date when it is blank.
