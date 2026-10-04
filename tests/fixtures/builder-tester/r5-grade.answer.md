## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Study Plan shows calendar dates | PASS | "Week 1 \| Oct 4–10" through "Nov 8–14" |
| 1 | [A1] First entry covers today (2026-10-04) | PASS | "Week 1 \| Oct 4–10 \| Supply and demand" |
| 1 | [A1] Last entry is week containing 2026-11-12, nothing after | PASS | "Week 6 \| Nov 8–14 (Exam: Nov 12)" is the last row |
| 1 | [A1] No missing weeks; 6 entries (Sunday weeks) | PASS | Six consecutive Sun–Sat rows, Oct 4 to Nov 14 |
| 1 | [A3] Every topic is one of the six syllabus topics | PASS | Only the six syllabus topics appear; no outside topics |
| 1 | [A3] Topics in syllabus order | PASS | Supply and demand, Market structures, Elasticity, Consumer choice, Costs, Perfect competition |
| 1 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 |
| 1 | [A4] All 5 about supply and demand; none framed around a later topic | FAIL | Q1: "In a competitive market for coffee" — framed in a market structure (Weeks 2/6) |
| 1 | [A5] Last section is Summary, nothing after | PASS | "## Summary" is final section |
| 1 | [Order] Study Plan, Practice Questions, Summary | PASS | Headings appear in that order |
| 2 | [A2] Entries labelled by week number, no dates | PASS | "Week 1 \| Cell structure and organelles"; no dates |
| 2 | [A2] Says week numbers used because no exam date | PASS | "Since no exam date was provided, this study plan uses week numbers" |
| 2 | [A2 / Blank inputs] Never states or guesses an exam date | PASS | No date or guess anywhere in the answer |
| 2 | [A3] Four topics in order, none added | PASS | Cell structure, Cell membranes and transport, Enzymes, Cellular respiration |
| 2 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 |
| 2 | [A4] All about cell structure/organelles; no later topics | PASS | Nucleus, chloroplast, prokaryote vs eukaryote, Golgi, nuclear envelope; no respiration/enzymes/transport across membrane |
| 2 | [A5] Ends with Summary | PASS | "## Summary" is final section |
| 3 | [A1] Calendar dates, ends with week containing 10-21, 3 entries | PASS | "Week 1 (Oct 4–10)", "Week 2 (Oct 11–17)", "Week 3/Exam Week (Oct 18–21)" |
| 3 | [A1] First entry covers today, no week skipped | PASS | "Week 1 (Oct 4–10)"; consecutive weeks |
| 3 | [A3] Every topic from syllabus, none invented | PASS | BMC, Value proposition, Customer discovery, Lean startup and MVPs |
| 3 | [A3] Topics in syllabus order | PASS | BMC, Value proposition, then Customer discovery, then Lean startup |
| 3 | [A4] Exactly 5 questions | PASS | Question 1 through Question 5 |
| 3 | [A4] All about BMC / value proposition; no later topics | PASS | Questions cover canvas blocks (segments, channels) and value proposition only |
| 3 | [A5] Ends with Summary | PASS | "## Summary" is final section |

## Fixes

1. [A4, Test 1] Practice questions must not be set in, or framed around, any market structure (e.g. "competitive market", "monopoly", "perfectly competitive market"). Use a plain market setting such as "the market for coffee" so the question depends on supply and demand only.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Graded the Exam Study Planner on three tests (dated plan, blank exam date, short exam window with a long syllabus): 23 of 24 checks passed. The single failure is Test 1, A4: Question 1 is framed "In a competitive market," which draws on the later Market structures / Perfect competition topics. Verdict: fix and retest.
