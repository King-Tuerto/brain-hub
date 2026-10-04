## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [Order] Study Plan, Practice Questions, Summary in order | PASS | "## Study Plan" … "## Practice Questions" … "## Summary" in that order |
| 1 | [A1] Exactly 7 week entries, last contains 2026-11-18 | PASS | Table rows Week 1 "Oct 4–10" through Week 7 "Nov 15–18": 7 rows |
| 1 | [A1] No "8 weeks assumed" line; "no exam date" absent | PASS | Neither phrase appears; text says "until your final exam on November 18, 2026" |
| 1 | [A5] Each of 7 entries has a listed topic word | PASS | Scarcity, Supply and Demand, Elasticity, Consumer Choice, Production Costs, Monopoly, Inflation |
| 1 | [A3] Exactly 5 questions | PASS | "Question 1" through "Question 5": 5 |
| 1 | [A3] Each question has an answer shown | PASS | "Answer to Question 1: B" … "Answer to Question 5: C" |
| 1 | [A4] Later-week words absent from Practice Questions | PASS | Week 1 entry has none of the listed words; none appear in questions ("produce/produced" is not "production") |
| 1 | [A6] Summary has 2–3 sentences | PASS | 2 sentences: "This seven-week study plan…inflation." "Master Week 1's…course." |
| 2 | [Order] Study Plan, Practice Questions, Summary in order | PASS | "## Study Plan" … "## Practice Questions" … "## Summary" in that order |
| 2 | [A2] Exactly 8 week entries | PASS | Table rows Week 1 "Oct 4–10" through Week 8 "Nov 22–28": 8 rows |
| 2 | [A2] One line has "8 weeks" and "exam date" | PASS | "Since no exam date was provided, this plan covers 8 weeks from today" |
| 2 | [A2] No date presented as the exam date | PASS | Only placeholder used: "Nov 29–[your exam date]"; 2026-10-04 is given as today |
| 2 | [A5] Each of 8 entries has a listed topic word | PASS | Cell structure, Mitosis, Meiosis, Genetics, Evolution, Ecology, Photosynthesis, Enzymes |
| 2 | [A3] Exactly 5 questions, each with answer | PASS | "Question 1"–"Question 5", each followed by "**Answer:**" |
| 2 | [A4] Later-week words absent from Practice Questions | PASS | Week 1 entry has none of the listed words; none appear ("genetic material" in Q4 is not "genetics") |
| 2 | [A6] Summary has 2–3 sentences | PASS | 3 sentences ending "…enzymes." "…cellular structures." "…foundational concepts." ("vs." ends no sentence) |
| 3 | [Order] Study Plan, Practice Questions, Summary in order | PASS | "## Study Plan" … "## Practice Questions" … "## Summary" in that order |
| 3 | [A1] Exactly 1 week entry | FAIL | Two dated blocks, no week entry: "October 4–6 (Days Before Exam)" and "October 7 (Exam Day)" |
| 3 | [A1] "8 weeks"/"eight weeks" absent | PASS | Neither phrase appears; text says "just 3 days away" |
| 3 | [A5] Week entry contains "photosynthesis" or "respiration" | PASS | "October 4–6 (Days Before Exam): Photosynthesis" |
| 3 | [A3] Exactly 5 questions, each with answer | PASS | "Question 1"–"Question 5", each followed by "**Answer:**" |
| 3 | [A4] "respiration" absent from Practice Questions | PASS | "respiration" not in Study Plan and nowhere in Questions 1–5 or answers |
| 3 | [A6] Summary has 2–3 sentences | PASS | 2 sentences: "With only three days…light energy." "These practice questions…Week 1 content." |

## Fixes

1. [A1, Test 3] When the exam falls in the current week, the Study Plan must still be one entry per week: output exactly one week entry (e.g. "Week 1: Oct 4–10") naming the syllabus topic, instead of splitting it into day-by-day blocks and a separate "Exam Day" block.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Syllabus Study Planner round 1 grade: 22 of 23 checks passed, with the only failure being A1 in Test 3, where an exam three days away produced day-by-day blocks instead of exactly one week entry. Tests 1 (exam date 2026-11-18, 7 weeks) and 2 (blank exam date, 8 weeks assumed) passed every check. Verdict: fix and retest.
