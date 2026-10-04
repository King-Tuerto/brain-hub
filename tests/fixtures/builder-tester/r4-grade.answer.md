## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear as "## Study Plan", "## Practice Questions", "## Summary" in that order |
| 1 | [A1] Exactly 7 week entries, last contains 2026-11-18 | PASS | 7 table rows, Week 1 to Week 7; last "2026-11-15–2026-11-21" |
| 1 | [A1] No "8 weeks assumed" line; "no exam date" absent | PASS | Neither phrase appears; Summary says "covers seven weeks" |
| 1 | [A1] No "Exam Day" entry; no single-day labels | PASS | Every label is "Week N" with a date range, e.g. "Week 7 \| 2026-11-15–2026-11-21" |
| 1 | [A5] Each of 7 entries has a listed syllabus word | PASS | Scarcity…, Supply and demand, Elasticity, Consumer choice, Production costs, Monopoly, Inflation |
| 1 | [A3] Exactly 5 questions | PASS | "Question 1" through "Question 5" |
| 1 | [A3] Each question has an answer shown | PASS | Each has "**Answer:**" (B, B, A, C, C) |
| 1 | [A4] Listed words absent from Week 1 entry must not appear in Practice Questions | FAIL | Week 1 entry has none of the list; Q3 answer: "forgoing the production of motorcycles" |
| 1 | [A6] Summary has 2 or 3 sentences | PASS | 2 sentences, each ending in a full stop |
| 2 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear in that order |
| 2 | [A2] Exactly 8 week entries | PASS | 8 table rows, Week 1 to Week 8 |
| 2 | [A2] One line has "8 weeks" and "exam date" | PASS | "No exam date was given, so this plan assumes 8 weeks." |
| 2 | [A2] No date presented as the exam date | PASS | Only week date ranges shown; no exam date stated |
| 2 | [A5] Each of 8 entries has a listed syllabus word | PASS | Cell structure, Mitosis, Meiosis, Genetics, Evolution, Ecology, Photosynthesis, Enzymes |
| 2 | [A3] Exactly 5 questions, each with an answer | PASS | Questions 1–5, each with "**Answer:**" |
| 2 | [A4] Listed words absent from Week 1 entry must not appear in Practice Questions | PASS | Week 1 "Cell structure" has none; none appear in questions (Q3 uses "genetic", not "genetics") |
| 2 | [A6] Summary has 2 or 3 sentences | PASS | 2 sentences |
| 3 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear in that order |
| 3 | [A1] Exactly 1 week entry | PASS | Single entry: "Week of 2026-10-04–2026-10-10: Photosynthesis" |
| 3 | [A1] "8 weeks" / "eight weeks" absent | PASS | Neither phrase appears; Summary says "one-week study plan" |
| 3 | [A1] No "Exam Day" entry; no single-day labels; not day-by-day | PASS | One entry labelled with a date range, no day blocks |
| 3 | [A5] Entry contains "photosynthesis" or "respiration" | PASS | "Photosynthesis" |
| 3 | [A3] Exactly 5 questions, each with an answer | PASS | Questions 1–5, each with "**Answer:**" |
| 3 | [A4] "respiration" absent from entry, so absent from Practice Questions | PASS | Entry lacks "respiration"; word appears nowhere in the questions, options or answers |
| 3 | [A6] Summary has 2 or 3 sentences | PASS | 3 sentences |

## Fixes

1. [A4, Test 1] The practice questions, their options and their answer explanations must use only Week 1 topic words. Do not use words that belong to later weeks' topics (here "production", which is Week 5's "Production costs"). Check the answer explanations as strictly as the questions and options.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

The Syllabus Study Planner passed 24 of 25 checks in round 4: week counts, the 8-week assumption line, single-entry exam weeks and summaries were all correct. It failed one check, A4 in Test 1, because a practice answer used "production", a Week 5 topic word, so it needs one fix and a retest.
