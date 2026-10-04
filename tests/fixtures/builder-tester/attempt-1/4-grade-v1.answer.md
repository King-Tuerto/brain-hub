## Results

Run date 2026-10-04 (a Sunday). Calendar count, weeks starting Sunday:
- Test 1: 2026-10-04 to 2026-12-10 is 67 days. That is 9 full weeks plus Dec 6–10, so **10 weeks**.
- Test 3: 2026-10-04 to 2027-01-15 is 103 days. That is 14 full weeks plus Jan 10–15, so **15 weeks**.

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Exactly two sections, Study plan then Practice questions, nothing after but a short note | FAIL | A third "## Summary" section follows Practice questions |
| 1 | [A2] One entry per week up to 2026-12-10 (10 weeks) | FAIL | "9 weeks (October 4 – December 10, 2026)"; the week of Dec 6–10 is missing |
| 1 | [A3] Every topic appears in the syllabus | PASS | Weeks 1–8 match the syllabus word for word; Week 9 is "Final review of all topics" |
| 1 | [A4] Exactly 5 questions | PASS | Questions numbered 1–5 |
| 1 | [A4] All 5 about supply and demand / market equilibrium only | PASS | Equilibrium price, demand and supply shifts, price ceiling shortage, complements |
| 2 | [A1] Exactly two sections, Study plan then Practice questions | FAIL | A third "## Summary" section follows Practice questions |
| 2 | [A5] Broken into weeks following the 5 sessions in order | PASS | Weeks 1–5 match Sessions 1–5 in order |
| 2 | [A5] Ends with a general final-review week | PASS | "Week 6: Final review – Review all five sessions" |
| 2 | [A5] Note to add exam date later | PASS | "Add your real exam date here for exact timing once you have it" |
| 2 | [A5] No made-up exam date or countdown | PASS | No date or countdown appears |
| 2 | [A3] Every topic comes from the 5 sessions | FAIL | Adds "Global trade and economic impacts" and "Capital investment and business organization", which are not in the syllabus |
| 2 | [A4] Exactly 5 questions, all about Session 1 only | FAIL | Q5 compares Britain with "other European nations and the United States", which is Session 5 |
| 3 | [A1] Exactly two sections, Study plan then Practice questions | FAIL | A third "## Summary" section follows Practice questions |
| 3 | [A2] One entry per week up to 2027-01-15 (15 weeks) | FAIL | Stops at "Week 14"; pairs weeks ("Week 3–4"); Weeks 1 and 2 overlap on Oct 11 |
| 3 | [A3] Extra weeks only photosynthesis, respiration, or review | FAIL | Adds "Role of both processes in energy flow in ecosystems", an ecology topic not in the syllabus |
| 3 | [A4] Exactly 5 questions | PASS | Questions numbered 1–5 |
| 3 | [A4] All 5 about photosynthesis only | PASS | Equation, light/Calvin reactions, pigments, thylakoid/stroma, CO2 and rate |

## Fixes

1. [A1, Test 1] Output only the two sections "Study plan" and "Practice questions". Do not add a "Summary" section or any other heading after them.
2. [A2, Test 1] Count every calendar week from the run date up to the exam date, including the final partial week, and give each one its own entry. 2026-10-04 to 2026-12-10 is 10 weeks, not 9.
3. [A1, Test 2] Do not add a "Summary" section. End the answer after "Practice questions" (an optional one-line note is allowed).
4. [A3, Test 2] Under each week, list only topics named in the syllabus. Do not add sub-topics that the syllabus never mentions, such as global trade or capital investment.
5. [A4, Test 2] Every practice question must be about Week/Session 1 only. Do not compare it with later sessions; for example, no Britain versus Europe/US question.
6. [A1, Test 3] Do not add a "Summary" section after "Practice questions".
7. [A2, Test 3] Give one entry per calendar week, numbered singly, with no grouped ranges like "Week 3–4" and no overlapping dates, through the week containing the exam. 2026-10-04 to 2027-01-15 is 15 weeks.
8. [A3, Test 3] When the syllabus is shorter than the time available, fill the extra weeks only with the syllabus topics or review of them. Do not add new topics such as energy flow in ecosystems.

## Verdict

FIX AND RETEST — send the Fixes and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Exam Study Planner v1 grading on 2026-10-04: 9 of 17 checks passed. It failed A1 in all three tests because it adds an extra Summary section, and it failed A2 on week counts (9 instead of 10, and 14 instead of 15). It also failed A3 and A4 because it brought in topics that are not in the syllabus and asked a Session 5 comparison question in Test 2.
