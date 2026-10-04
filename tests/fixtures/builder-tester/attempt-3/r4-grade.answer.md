## Results

Calendar check (run date 2026-10-04): to 2026-12-15 is 27 + 30 + 15 = 72 days, ÷ 7 = 10.3, so 10 weeks. To 2026-10-24 is 20 days, ÷ 7 = 2.86, so 2 weeks. Both match the test cases.

| Test | Check | Result | Evidence |
|------|-------|--------|----------|
| 1 | [A1] Exactly 10 entries | PASS | Table rows Week 1 through Week 10 |
| 1 | [A1] In order, first entry is the current week | PASS | "the exam is 10 weeks away from today (October 4, 2026)"; Week 1 = cell structure |
| 1 | [A2] Every entry names a syllabus topic | PASS | All ten rows are syllabus topics; Week 10 merges transcription, translation, gene regulation |
| 1 | [A2] No grading, office hours or late-work entry | PASS | No administrative rows in the table |
| 1 | [A3] Transport is a later week; no Week 1 question on diffusion, osmosis, transport or pore traffic | PASS | Week 2 = membrane transport; questions ask only structure and location |
| 1 | [A4] Organelle questions ask only shape, parts or location | PASS | e.g. "Describe the structural components of a ribosome and how it is organized" |
| 1 | [A6] Exactly 5 questions, no admin, no bracket tags | PASS | Five structural questions; no tags |
| 1 | Headings in order: Study Plan, Week 1 Practice Questions, Summary | PASS | All three headings, in that order |
| 2 | [A5] States that with no exam date the plan covers every topic week by week | PASS | "Since your exam date was not provided, this study plan is organized directly from the syllabus by week" |
| 2 | [A5] Every syllabus study topic appears | PASS | Cell structure, membrane transport, respiration, photosynthesis, cell division all listed |
| 2 | [A5] Organized week by week; respiration and photosynthesis both appear | PASS | "Week 3–4: Respiration and photosynthesis" |
| 2 | [A2] No lab safety quiz, late-work or office hours entry | PASS | "Administrative items such as the lab safety quiz... are excluded" |
| 2 | [A3] Later week covers transport; no question on transport or pore traffic | PASS | Q2 asks only what pores are and which membrane holds them |
| 2 | [A4] Organelle questions ask only shape, parts or location | PASS | Thylakoid stacks, vacuole location and size; no function questions |
| 2 | [A6] Exactly 5 questions, none on the quiz, no bracket tags | FAIL | Practice Questions section contains "standard introductory cell biology curriculum [unverified]" |
| 2 | Does not invent an exam date | PASS | No exam date stated anywhere |
| 3 | [A1] Exactly 2 entries, not 3, not 4 | PASS | Two bullets: Week 1 and Week 2; "20 days ÷ 7 = 2.857, rounded down" |
| 3 | [A1] Entries in order from this week: cell structure, then membrane transport | FAIL | Week 2 is "Oct 11–24" (two weeks) and adds respiration and photosynthesis |
| 3 | [A2] Neither entry is the quiz, grading or office hours | PASS | No administrative items in either entry |
| 3 | [A3] No question on how pores control entry or exit, or membrane passage | PASS | Q2 asks pores' "physical structure and how they are arranged" |
| 3 | [A4] Organelle questions ask only shape, parts or location | PASS | Mitochondrion shape, rough ER appearance, smooth ER location |
| 3 | [A6] Exactly 5 questions, none on the quiz, no bracket tags | PASS | Five structural questions; no tags |
| 3 | Respiration and photosynthesis do not appear as Study Plan entries | FAIL | Week 2 lists "cellular respiration, photosynthesis" |

## Fixes

1. [A6, Test 2] Never put a bracket tag such as [unverified] anywhere in the Week 1 Practice Questions section, including notes above the questions. Drop the "standard curriculum" note or reword it without a tag.
2. [A1, Test 3] Each Study Plan entry is exactly one calendar week (Week 2 = Oct 11–17, not Oct 11–24). When the window is shorter than the syllabus, follow the syllabus weeks in order and stop at the last whole week. Do not stretch the final entry to reach the exam date.
3. [A1, Test 3] Leave out syllabus topics that fall after the last whole week before the exam. Do not cram them into the final entry. In Test 3, respiration and photosynthesis must not appear in the Study Plan.

## Verdict

FIX AND RETEST — send the Fixes and your current recipe to the Builder, install the new version, then run all three tests again.

## Summary

Round 4 grading of the Study Plan Builder: 20 of 23 checks passed and 3 failed. Test 2 left an [unverified] tag in the practice-questions section. In Test 3 the tool crammed respiration and photosynthesis into a two-week "Week 2" instead of dropping topics after the exam window. Week counting, admin filtering and structure-only organelle questions all passed.
