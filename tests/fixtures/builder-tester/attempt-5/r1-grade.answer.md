## Results

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Study Plan shows calendar dates | PASS | Dates column: "Oct 4–10", "Oct 11–17" … "Nov 8–12" |
| 1 | [A1] First entry covers today (2026-10-04) or its week | PASS | "Week 1 \| Oct 4–10 \| Supply and Demand" |
| 1 | [A1] Last entry is the week containing 2026-11-12; nothing after | PASS | Last row "Week 6 \| Nov 8–12 \| Perfect Competition"; no later row |
| 1 | [A1] No missing weeks (6 entries, Sunday-start) | PASS | 6 consecutive rows, Oct 4 through Nov 12, no gaps |
| 1 | [A3] Every plan topic is one of the six syllabus topics | PASS | Plan names only the six syllabus topics; no Monopoly, GDP, Game theory |
| 1 | [A3] Topics in syllabus order | PASS | Supply and Demand → Market Structures → Elasticity → Consumer Choice → Costs → Perfect Competition |
| 1 | [A4] Exactly 5 practice questions | PASS | Questions numbered 1–5 |
| 1 | [A4] All 5 questions about supply and demand only | FAIL | Q5: "Elasticity introduction: … price elasticity of demand for that good?" |
| 1 | [A5] Very last section is Summary; nothing after | PASS | "## Summary" is the final section |
| 1 | [Order] Study Plan, Practice Questions, Summary | PASS | Headings appear in that order |
| 2 | [A2] Entries labelled by week number, no calendar dates | PASS | "Week 1" … "Week 4"; no dates in table |
| 2 | [A2] Says week numbers used because no exam date given | PASS | "Since your exam date is not provided, this plan uses week numbers" |
| 2 | [A2 / Blank inputs] Never states or guesses an exam date | PASS | No date stated; only "revisit these questions throughout the semester" |
| 2 | [A3] All four topics in order; none added | PASS | Four syllabus topics in order; focus areas are sub-points, no photosynthesis/DNA replication |
| 2 | [A4] Exactly 5 practice questions | PASS | Questions numbered 1–5 |
| 2 | [A4] All 5 about cell structure and organelles only | FAIL | Q4: plant vs. animal cell "response to a hypertonic solution" is osmosis (Week 2 transport) |
| 2 | [A5] Ends with Summary section | PASS | "## Summary" is the final section |
| 3 | [A1] Calendar dates; ends with week containing 2026-10-21; 3 entries | PASS | 3 rows ending "Week of Oct 18–21 (Exam Week)" |
| 3 | [A1] First entry covers today's week; no week skipped | PASS | "Week of Oct 4–10", then Oct 11–17, Oct 18–21 |
| 3 | [A3] Every topic comes from the syllabus | PASS | BMC, Value Proposition, Customer Discovery, Lean Startup and MVPs only |
| 3 | [A3] Topics in syllabus order | PASS | BMC, Value Proposition → Customer Discovery → Lean Startup and MVPs |
| 3 | [A4] Exactly 5 practice questions | PASS | Questions numbered 1–5 |
| 3 | [A4] All 5 about business model canvas or value proposition only | FAIL | Q5: "test whether there is a real market need before building a product" = customer discovery/lean |
| 3 | [A5] Ends with Summary section | PASS | "## Summary" is the final section |

## Fixes

1. [A4, Test 1] Every practice question must stay strictly inside the first week's topic. Do not add "introduction to" questions on later topics. Here Q5 asked about elasticity, which is the Week 3 topic.
2. [A4, Test 2] Every practice question must be about the first week's topic only. Do not write questions that need a later week's concept to answer. Q4 (hypertonic solution / osmosis) depends on Week 2, membranes and transport. Q5 also leans toward Week 4 (ATP production).
3. [A4, Test 3] Every practice question must be about the first week's topics only, here the business model canvas and the value proposition. Q5 is about validating market need before building, which belongs to customer discovery and lean startup (Weeks 2–3). Add a self-check: before output, confirm that no question touches a topic from week 2 or later.

## Verdict

FIX AND RETEST — send the Fixes and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

The Exam Study Planner passed 21 of 24 checks. Dates, week counts, topic order, the blank-exam-date handling and the section order were all correct. All three failures are under A4: in every test, at least one practice question drifted from the first week's topics into a later one (elasticity, osmosis, customer discovery), so the tool needs a fix and a retest.
