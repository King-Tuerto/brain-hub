## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Study Plan shows calendar dates | PASS | "Week 1 \| Oct 4–10 \| Supply and demand" |
| 1 | [A1] First entry covers today (2026-10-04) | PASS | First row "Oct 4–10" |
| 1 | [A1] Last entry is the week containing 2026-11-12; nothing after | PASS | Last row "Nov 8–14 \| Perfect competition"; no later rows |
| 1 | [A1] No missing weeks; 6 entries (Sunday weeks) | PASS | Six consecutive Sunday-start rows, Oct 4 through Nov 14 |
| 1 | [A3] Every topic is one of the six syllabus topics | PASS | Only the six syllabus topics appear in the table |
| 1 | [A3] Topics in syllabus order | PASS | Supply and demand → Market structures → … → Perfect competition |
| 1 | [A4] Exactly 5 questions | PASS | Questions 1–5 counted |
| 1 | [A4] All 5 about supply and demand; no later topic mentioned, framed or required | PASS | Law of demand, demand shifts, equilibrium, input-cost supply shift, shortage; no "elastic", no market types |
| 1 | [A5] Very last section is Summary; nothing after | PASS | "## Summary" is the final section |
| 1 | [Order] Study Plan, Practice Questions, Summary | PASS | Headings appear in that order |
| 2 | [A2] Entries labelled by week number, no dates | PASS | "**Week 1**: Cell structure and organelles" … "**Week 4**" |
| 2 | [A2] Says it used week numbers because no exam date was given | PASS | "Since no exam date was provided, this plan uses week numbers" |
| 2 | [A2 / Blank inputs] Never states or guesses an exam date | PASS | Only "Adjust the timeline based on when your exam is actually scheduled" |
| 2 | [A3] Four topics in order, none added | PASS | Cell structure → Cell membranes and transport → Enzymes → Cellular respiration |
| 2 | [A4] Exactly 5 questions | PASS | Questions 1–5 counted |
| 2 | [A4] All about cell structure; no option mentions a later topic | FAIL | Q3 option a: "Eukaryotic cells lack a cell membrane" names the Week 2 topic |
| 2 | [A5] Ends with Summary | PASS | "## Summary" is the final section |
| 3 | [A1] Calendar dates, ends with week containing 2026-10-21, 3 entries, not 10 | PASS | "Oct 4–10", "Oct 11–17", "Oct 18–21"; three entries |
| 3 | [A1] First entry covers today; no week skipped | PASS | "Week of October 4–10", then consecutive weeks |
| 3 | [A3] Every topic from the syllabus; none invented | PASS | Canvas, Value Proposition, Customer Discovery, Lean Startup & MVPs only |
| 3 | [A3] Topics in syllabus order | PASS | Canvas & Value Proposition → Customer Discovery → Lean Startup & MVPs |
| 3 | [A4] Exactly 5 questions | PASS | Questions 1–5 counted |
| 3 | [A4] All about canvas / value proposition; no later topic mentioned or framed | PASS | All five ask about Canvas blocks or value proposition definition |
| 3 | [A5] Ends with Summary | PASS | "## Summary" is the final section |

## Fixes

1. [A4, Test 2] Practice questions and every answer option, including wrong options, must not name any Week 2 or later topic. A distractor like "Eukaryotic cells lack a cell membrane" names the Week 2 topic "Cell membranes", so swap it for a distractor that uses only first-week structures, such as organelles that are not membranes.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Exam Study Planner grading, round 4: 23 of 24 checks passed. The only failure was Test 2 A4, where a wrong-answer option in Question 3 named "cell membrane", which is the Week 2 topic. Test 1 also left an unfilled "[X] weeks away" in its Study Plan; no test case checks for this, so it was not scored as a failure.
