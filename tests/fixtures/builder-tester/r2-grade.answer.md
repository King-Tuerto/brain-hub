## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear as "## Study Plan", "## Practice Questions", "## Summary" |
| 1 | [A1] Exactly 7 week entries, last contains 2026-11-18 | PASS | Week 1 (Oct 4–10) through "Week 7 (Nov 15–18)": 7 entries |
| 1 | [A1] No "8 weeks assumed" line; "no exam date" absent | PASS | Neither phrase appears; plan states "(7 weeks)" |
| 1 | [A5] Each of 7 entries has a listed syllabus word | PASS | Scarcity…, Supply and demand, Elasticity, Consumer choice, Production costs, Monopoly, Inflation |
| 1 | [A3] Exactly 5 questions | PASS | Question 1 to Question 5 |
| 1 | [A3] Each question has an answer shown | PASS | Each has an "*Answer:*" line |
| 1 | [A4] Later-week words absent from Practice Questions | FAIL | Week 1 has none of the list; Q1 answer: "total wheat production is [Z]"; Q2 answer: "about production and allocation" |
| 1 | [A6] Summary is 2 or 3 sentences | PASS | 2 sentences, ending "November 18, 2026." and "throughout economics." |
| 2 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear in that order |
| 2 | [A2] Exactly 8 week entries | PASS | Table rows Week 1 (Oct 4) to Week 8 (Nov 22): 8 |
| 2 | [A2] One line has "8 weeks"/"eight weeks" and "exam date" | FAIL | Line says "no exam date was provided, I'm assuming an 8-week plan"; "8 weeks" never appears |
| 2 | [A2] No date presented as the exam date | PASS | Only start dates shown; no exam date stated |
| 2 | [A5] Each of 8 entries has a listed syllabus word | PASS | Cell Structure, Mitosis, Meiosis, Genetics, Evolution, Ecology, Photosynthesis, Enzymes |
| 2 | [A3] Exactly 5 questions, each with an answer | PASS | Question 1–5, each with "Answer N:" |
| 2 | [A4] Later-week words absent from Practice Questions | PASS | Week 1 "Cell Structure" has none of the list; none appear in questions/options/answers |
| 2 | [A6] Summary is 2 or 3 sentences | PASS | 3 sentences |
| 3 | [Order] Study Plan, Practice Questions, Summary in order | PASS | Headings appear in that order |
| 3 | [A1] Exactly 1 week entry | PASS | Single row "Week 1 (Oct 4–7) \| Photosynthesis" |
| 3 | [A1] "8 weeks" and "eight weeks" absent | PASS | Neither phrase appears |
| 3 | [A5] Entry contains "photosynthesis" or "respiration" | PASS | "Photosynthesis" |
| 3 | [A3] Exactly 5 questions, each with an answer | PASS | Question 1–5, each followed by "Answer:" |
| 3 | [A4] "respiration" absent from Practice Questions | PASS | Week entry lacks "respiration"; it appears nowhere in questions or answers |
| 3 | [A6] Summary is 2 or 3 sentences | PASS | 2 sentences, ending "carbon fixation." and "glucose synthesis." |

## Fixes

1. [A4, Test 1] Practice questions, options and answers must not use any topic word that belongs to a later week. "Production" is Week 5's topic, so do not write "production" (e.g. "wheat production", "production and allocation") when the first week is Scarcity and opportunity cost. Before finishing, check every question, option and answer against the later weeks' topic words and reword any that match.
2. [A2, Test 2] When the exam date is blank, include one line that says, in these words, "8 weeks" and "exam date", e.g. "No exam date was given, so this plan assumes 8 weeks." Do not write it as "8-week".

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Syllabus Study Planner round 2 grading: 21 of 23 checks passed; it failed A4 in Test 1 (Week 5 topic word "production" used in practice answers) and A2 in Test 2 (wrote "8-week" instead of "8 weeks"). Week counts, section order, summaries and the exam-this-week case all passed, though Test 3 wrongly called October 7, 2026 a Tuesday (it is a Wednesday), which no check covered. Verdict: fix and retest.
