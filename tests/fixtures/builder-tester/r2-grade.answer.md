## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Study Plan shows calendar dates | PASS | "Week 1 \| Oct 4–10, 2026 \| Supply and Demand" |
| 1 | [A1] First entry covers today (2026-10-04) or its week | PASS | First row "Oct 4–10, 2026" |
| 1 | [A1] Last entry is the week containing 2026-11-12; nothing after | PASS | Last row "Nov 8–12, 2026 … *Exam: Nov 12*" |
| 1 | [A1] No missing weeks (6 Sunday-start entries) | PASS | 6 consecutive rows: Oct 4, 11, 18, 25, Nov 1, Nov 8 |
| 1 | [A3] Every topic is one of the six syllabus topics | PASS | Only the six syllabus topics appear; none added |
| 1 | [A3] Topics in syllabus order | PASS | Supply and Demand → Market Structures → Elasticity → Consumer Choice → Costs → Perfect Competition |
| 1 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 counted |
| 1 | [A4] All 5 about supply and demand; none mention/need a later topic | PASS | Equilibrium, supply shifts, price floor; no elasticity or market-structure wording in questions |
| 1 | [A5] Last section is Summary; nothing after | PASS | "## Summary" is final section |
| 1 | [Order] Study Plan, Practice Questions, Summary | PASS | Headings appear in that order |
| 2 | [A2] Entries labelled by week number, no dates | PASS | "Week 1 \| Cell structure and organelles" … "Week 4"; no dates |
| 2 | [A2] Says week numbers used because no exam date given | PASS | "Because no exam date was provided, this study plan uses week numbers" |
| 2 | [A2 / Blank inputs] Never states or guesses an exam date | PASS | No date or guessed exam date anywhere |
| 2 | [A3] Four topics in order, none added | PASS | Cell structure → Cell membranes → Enzymes → Cellular respiration |
| 2 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 counted |
| 2 | [A4] All 5 about cell structure; none mention later topics | FAIL | Q1 option "(a) Cell membrane"; Q2 option "(b) Attached to the cell membrane" (Week 2 topic) |
| 2 | [A5] Ends with Summary | PASS | "## Summary" is final section |
| 3 | [A1] Calendar dates, ends with week containing 2026-10-21, 3 entries | PASS | 3 rows; last "Week 3 (Oct 18–21)" |
| 3 | [A1] First entry covers today's week; no week skipped | PASS | "Week 1 (Oct 4–10)", then Oct 11–17, Oct 18–21 |
| 3 | [A3] Every topic from the syllabus | PASS | Only syllabus topics named, including the excluded-weeks note |
| 3 | [A3] Topics in syllabus order | PASS | BMC, Value proposition → Customer discovery → Lean startup and MVPs |
| 3 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 counted |
| 3 | [A4] All 5 about BMC/value proposition; none mention/need later topics | FAIL | Q5: "why would customers choose you over the competitor" to "a potential investor" — previews competitive analysis/fundraising |
| 3 | [A5] Ends with Summary | PASS | "## Summary" is final section |

## Fixes

1. [A4, Test 2] Practice Questions must not name any week 2+ topic anywhere, including in multiple-choice answer options. Remove "Cell membrane" and "Attached to the cell membrane" and use only Week 1 structures (e.g., nucleus, ribosomes, Golgi, cell wall) in questions and options.
2. [A4, Test 3] Practice Questions must not frame or depend on later-week topics. Remove competitor comparisons (Week 4, Competitive analysis) and investor/pitch scenarios (Weeks 8–9, Fundraising and Pitch decks); keep questions strictly on business model canvas blocks and value proposition.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Exam Study Planner round 2 grade: 22 of 24 checks passed; dated and week-numbered plans, topic order, question counts and Summary placement were all correct. It failed A4 in Test 2 (questions name the cell membrane, a Week 2 topic) and Test 3 (a question about competitors and investors previews later weeks), so the verdict is fix and retest.
