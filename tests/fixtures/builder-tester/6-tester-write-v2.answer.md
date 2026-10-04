## Test plan

| Test | What it checks | Criteria covered |
|---|---|---|
| Test 1 (normal use) | A full syllabus and a real exam date. Checks the section order, one entry per week up to the exam, syllabus-only topics, and 5 questions on Week 1 only. | A1, A2, A3, A4, A5 |
| Test 2 (blank optional input) | No exam date. Checks that the plan follows the syllabus's own weeks, ends with a review week, and tells you to add your exam date. | A1, A2 (single numbering, no ranges), A3, A4, A5, Blank inputs rule |
| Test 3 (tricky: very short syllabus, far-off exam) | Only 2 sessions of topics but a 15-week plan. Checks that the extra weeks review old topics and add nothing new, that numbering stays single, and that the questions stay on Session 1. | A1, A2, A3, A4, A5 |

Every criterion (A1 to A5) is covered by at least two tests.

Note on dates: the week counts below assume you run each test on **2026-10-04**. If you run on a different day, count the calendar weeks yourself, from your run date through the week that contains the exam date (include the final partial week).

## Test cases

### Test 1: normal use

**Inputs to type**
- Paste your class syllabus:
  `Week 1: Introduction to macroeconomics and GDP. Week 2: Inflation and the price level. Week 3: Unemployment. Week 4: Aggregate demand and aggregate supply. Week 5: Fiscal policy. Week 6: Money and banking. Week 7: Monetary policy and the central bank. Week 8: International trade and exchange rates.`
- Exam date: `2026-12-10`

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order.
- [ ] [A1] Nothing appears after the "Summary" section.
- [ ] [A2] The study plan has exactly 10 entries, numbered Week 1 to Week 10 (one per calendar week from 2026-10-04 through the week containing 2026-12-10).
- [ ] [A2] No entry is a grouped range such as "Week 3–4", and no two entries share any dates.
- [ ] [A2] The last entry is the week that contains 2026-12-10.
- [ ] [A3] Every topic named in the plan is one of the 8 syllabus topics above. No outside topics (for example, no "behavioral economics").
- [ ] [A3] New topics appear in syllabus order (GDP before inflation, before unemployment, and so on).
- [ ] [A3] The 2 extra weeks (beyond the 8 topics) only review topics already listed.
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Week 1 topics (intro to macroeconomics and GDP) only.
- [ ] [A4] No question mentions or compares to inflation, unemployment, or any later week.

### Test 2: edge case, optional input left blank

**Inputs to type**
- Paste your class syllabus:
  `Week 1: Cell structure and function. Week 2: Cell membranes and transport. Week 3: Cellular respiration. Week 4: Photosynthesis. Week 5: Cell division (mitosis and meiosis).`
- Exam date: leave blank

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order, with nothing after "Summary".
- [ ] [Blank inputs] The plan follows the syllabus's own 5 weeks instead of counting to a date.
- [ ] [Blank inputs] [A3] The plan ends with a review week that covers only topics already listed (no new topics).
- [ ] [Blank inputs] Somewhere in the answer, the student is told to add their real exam date later for exact timing.
- [ ] [A2] Each week is its own numbered entry. No grouped ranges such as "Week 2–3", and no overlapping dates.
- [ ] [A3] Every topic in the plan is from the 5 syllabus lines above, in that order.
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Week 1 (cell structure and function) only. None mentions membranes, respiration, photosynthesis, cell division, or any later week.

### Test 3: tricky case, very short syllabus with a far-off exam

**Inputs to type**
- Paste your class syllabus:
  `Session 1: Porter's Five Forces. Session 2: SWOT analysis.`
- Exam date: `2027-01-15`

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order, with nothing after "Summary".
- [ ] [A2] The study plan has exactly 15 entries, numbered one by one (one per calendar week from 2026-10-04 through the week containing 2027-01-15, including the final partial week).
- [ ] [A2] No grouped ranges such as "Weeks 3–15" or "Weeks 3–14: review". Every week is listed on its own, with no overlapping dates.
- [ ] [A3] Only two topics ever appear: Porter's Five Forces and SWOT analysis. Five Forces comes first.
- [ ] [A3] The 13 or so extra weeks only repeat or review those two topics. No new strategy topics (for example, no "PESTEL", "value chain", or "Blue Ocean").
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Session 1 (Porter's Five Forces) only.
- [ ] [A4] No question mentions SWOT, Session 2, or compares Five Forces to anything from a later session.

## How to run them

1. Open the Exam Study Planner tool.
2. Run it once for **Test 1**. Type the inputs exactly as shown above (copy and paste them).
3. When the answer appears, copy the **whole** answer, top to bottom. Save it somewhere and label it "Test 1".
4. Start the tool fresh and do the same for **Test 2**. Leave the exam date empty. Copy the whole answer and label it "Test 2".
5. Do the same for **Test 3**. Copy the whole answer and label it "Test 3".
6. Open a **new chat**. Do not use the chat that built the tool.
7. Open "Tester 2 — grade" in that new chat. Paste in together:
   - the Spec,
   - these three test cases,
   - the three answers, labelled Test 1, Test 2 and Test 3.
8. Let the grader check each box.

## Summary

Three tests for the Exam Study Planner Spec: normal use (8-week macro syllabus, exam 2026-12-10, 10 weeks), a blank exam date (5-week biology syllabus ending in a review week), and a very short 2-session strategy syllabus stretched to a 15-week plan. Together they cover criteria A1 to A5: section order, one entry per calendar week with no grouped ranges, syllabus-only topics, and exactly 5 practice questions on the first week only.
