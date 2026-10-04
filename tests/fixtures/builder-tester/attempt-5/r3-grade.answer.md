## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Study Plan shows calendar dates | PASS | "Week 1 \| Oct 4–11" … "Week 6 \| Nov 8–12" |
| 1 | [A1] First entry covers today (2026-10-04) | PASS | "Week 1 \| Oct 4–11" |
| 1 | [A1] Last entry is the week containing 2026-11-12; nothing after | PASS | Last row "Week 6 \| Nov 8–12"; no later row |
| 1 | [A1] No missing weeks; 6 entries (Sunday weeks) | PASS | 6 contiguous rows Oct 4 → Nov 12 (ranges overlap by a day, none skipped) |
| 1 | [A3] Every topic is one of the six syllabus topics | PASS | Topic column lists only the six syllabus topics; no Monopoly/GDP/Game theory |
| 1 | [A3] Topics in syllabus order | PASS | Supply and demand → Market structures → Elasticity → Consumer choice → Costs → Perfect competition |
| 1 | [A4] Exactly 5 questions | PASS | "Question 1" through "Question 5" counted |
| 1 | [A4] All 5 about supply and demand; nothing from later weeks | PASS | Substitutes, supply shift, movement vs shift, shortage, input price; no "elastic"/monopoly |
| 1 | [A5] Very last section is Summary | PASS | "## Summary" is final heading, nothing after |
| 1 | [Order] Study Plan, Practice Questions, Summary | PASS | Headings appear in that order |
| 2 | [A2] Entries labelled by week number, no dates | PASS | "Week 1 \| Cell structure and organelles \| Current" — no dates |
| 2 | [A2] Says it used week numbers because no exam date | PASS | "Week numbers are used … because no exam date was provided." |
| 2 | [A2 / Blank inputs] Never states or guesses an exam date | PASS | No exam date stated or assumed anywhere |
| 2 | [A3] Four topics in order, none added | PASS | Cell structure → Membranes and transport → Enzymes → Cellular respiration |
| 2 | [A4] Exactly 5 questions | PASS | "Question 1" through "Question 5" counted |
| 2 | [A4] All 5 about cell structure/organelles; no later topic | PASS | Ribosome, prokaryote/eukaryote, double-membrane organelle, rough/smooth ER, chloroplast; no transport/ATP/enzymes |
| 2 | [A5] Ends with Summary | PASS | "## Summary" is final heading |
| 3 | [A1] Calendar dates; ends with week containing 2026-10-21; 3 entries | PASS | Oct 4–10, Oct 11–17, "Exam week … Oct 18–21" — 3 entries |
| 3 | [A1] First entry covers today; no week skipped | PASS | "Week 1 … Oct 4–10", then Oct 11–17, Oct 18–21 |
| 3 | [A3] Every topic from the syllabus; none invented | PASS | BMC, Value proposition, Customer discovery; third row is "Review", not a new subject |
| 3 | [A3] Topics in syllabus order | PASS | "Business model canvas, Value proposition" → "Customer discovery" |
| 3 | [A4] Exactly 5 questions | PASS | "Question 1" through "Question 5" counted |
| 3 | [A4] All 5 about BMC/value proposition; no option mentions a later topic | FAIL | Q2 options: "Who are the company's competitors?", "How much will the product cost?" |
| 3 | [A5] Ends with Summary | PASS | "## Summary" is final heading |

## Fixes

1. [A4, Test 3] Practice question answer options, including the wrong ones, must not mention later-week topics. In Test 3, Question 2's options named competitors (Week 4: Competitive analysis), product cost (Week 5: Pricing strategy) and marketing channels (Week 6: Go-to-market). Before you output the questions, check every answer option against the list of week 2+ topics and rewrite any option that touches one. Build the wrong options from first-week material only.

## Verdict

FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Round 3 grading of the Exam Study Planner: 23 of 24 checks passed. Dates, week counts, blank-date handling, topic order and question counts were all correct. The one failure was Test 3's A4: Question 2's wrong answer options mentioned competitors, pricing and marketing channels, which are later-week topics. Verdict: fix and retest.
