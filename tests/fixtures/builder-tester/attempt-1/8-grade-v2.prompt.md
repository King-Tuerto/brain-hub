You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Exam Study Planner** — turns a pasted class syllabus into a week-by-week study plan up to the exam, ending in 5 practice questions on the first week's topics.

**Inputs**
- Paste your class syllabus — required. Example: "Week 1: Intro to macro... Week 2: Supply and demand..."
- Exam date — optional. Example: `2026-12-10`.

**Output** — the answer has exactly three sections, in this order:
1. **Study plan** — one numbered entry per calendar week (Week 1, Week 2, …) from the run date through the week containing the exam date, including a final partial week if there is one. No grouped ranges (no "Week 3–4") and no overlapping dates. Each week lists only topics that appear in the pasted syllabus, in the order the syllabus gives them. If the syllabus has fewer topics than there are weeks, the extra weeks review syllabus topics already listed rather than introduce new ones.
2. **Practice questions** — exactly 5 questions, all about the first week's (or first session's) topics only. None of them compares the first week to, or mentions, any later week or session.
3. **Summary** — a short closing section the tool always adds automatically; it is not something the answer's own instructions ask for, and nothing follows it.

**Acceptance criteria**
- A1: The answer contains only the sections "Study plan", "Practice questions", and the hub's automatic "Summary" — in that order, with nothing after "Summary" and no other heading anywhere.
- A2: The study plan has exactly one entry per calendar week from the run date through the week containing the exam date, including the final partial week, numbered singly with no grouped ranges and no overlapping dates (e.g. 2026-10-04 to 2026-12-10 is 10 weeks; 2026-10-04 to 2027-01-15 is 15 weeks).
- A3: Every topic named under a week appears in the pasted syllabus; where the syllabus is shorter than the plan, the extra weeks only repeat or review syllabus topics, never new ones.
- A4: All 5 practice questions concern only the first week's (or first session's) topics, with no comparison to or mention of a later week or session.
- A5: There are exactly 5 practice questions, no more and no fewer.

**Blank inputs**
- If the exam date is left blank, the plan is built around the weeks or sessions already listed in the syllabus instead of counting to a date, ends with a review week covering syllabus topics already listed (no new topics), and tells the student to add their real exam date later for exact timing.
>>>

The test cases (written before the tool was run):
<<<
### Test 1: normal use

**Inputs to type**
- Paste your class syllabus:
  `Week 1: Introduction to macroeconomics and GDP. Week 2: Inflation and the price level. Week 3: Unemployment. Week 4: Aggregate demand and aggregate supply. Week 5: Fiscal policy. Week 6: Money and banking. Week 7: Monetary policy and the central bank. Week 8: International trade and exchange rates.`
- Exam date: `2026-12-10`

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order.
- [ ] [A1] Nothing appears after the "Summary" section.
- [ ] [A2] The study plan has exactly 10 entries, numbered Week 1 to Week 10 (one per calendar week from 2026-10-04 through the week containing 2026-12-10).
- [ ] [A2] No entry is a grouped range such as "Week 3–4", and no two entries share any dates.
- [ ] [A2] The last entry is the week that contains 2026-12-10.
- [ ] [A3] Every topic named in the plan is one of the 8 syllabus topics above. No outside topics (for example, no "behavioral economics").
- [ ] [A3] New topics appear in syllabus order (GDP before inflation, before unemployment, and so on).
- [ ] [A3] The 2 extra weeks (beyond the 8 topics) only review topics already listed.
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Week 1 topics (intro to macroeconomics and GDP) only.
- [ ] [A4] No question mentions or compares to inflation, unemployment, or any later week.

### Test 2: edge case, optional input left blank

**Inputs to type**
- Paste your class syllabus:
  `Week 1: Cell structure and function. Week 2: Cell membranes and transport. Week 3: Cellular respiration. Week 4: Photosynthesis. Week 5: Cell division (mitosis and meiosis).`
- Exam date: leave blank

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order, with nothing after "Summary".
- [ ] [Blank inputs] The plan follows the syllabus's own 5 weeks instead of counting to a date.
- [ ] [Blank inputs] [A3] The plan ends with a review week that covers only topics already listed (no new topics).
- [ ] [Blank inputs] Somewhere in the answer, the student is told to add their real exam date later for exact timing.
- [ ] [A2] Each week is its own numbered entry. No grouped ranges such as "Week 2–3", and no overlapping dates.
- [ ] [A3] Every topic in the plan is from the 5 syllabus lines above, in that order.
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Week 1 (cell structure and function) only. None mentions membranes, respiration, photosynthesis, cell division, or any later week.

### Test 3: tricky case, very short syllabus with a far-off exam

**Inputs to type**
- Paste your class syllabus:
  `Session 1: Porter's Five Forces. Session 2: SWOT analysis.`
- Exam date: `2027-01-15`

**Expected**
- [ ] [A1] The only headings are "Study plan", then "Practice questions", then "Summary", in that order, with nothing after "Summary".
- [ ] [A2] The study plan has exactly 15 entries, numbered one by one (one per calendar week from 2026-10-04 through the week containing 2027-01-15, including the final partial week).
- [ ] [A2] No grouped ranges such as "Weeks 3–15" or "Weeks 3–14: review". Every week is listed on its own, with no overlapping dates.
- [ ] [A3] Only two topics ever appear: Porter's Five Forces and SWOT analysis. Five Forces comes first.
- [ ] [A3] The 13 or so extra weeks only repeat or review those two topics. No new strategy topics (for example, no "PESTEL", "value chain", or "Blue Ocean").
- [ ] [A5] There are exactly 5 practice questions.
- [ ] [A4] All 5 questions are about Session 1 (Porter's Five Forces) only.
- [ ] [A4] No question mentions SWOT, Session 2, or compares Five Forces to anything from a later session.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study plan

**Week 1 (Oct 4–10):** Introduction to macroeconomics and GDP

**Week 2 (Oct 11–17):** Inflation and the price level

**Week 3 (Oct 18–24):** Unemployment

**Week 4 (Oct 25–31):** Aggregate demand and aggregate supply

**Week 5 (Nov 1–7):** Fiscal policy

**Week 6 (Nov 8–14):** Money and banking

**Week 7 (Nov 15–21):** Monetary policy and the central bank

**Week 8 (Nov 22–28):** International trade and exchange rates

**Week 9 (Nov 29–Dec 5):** Review — Introduction to macroeconomics and GDP, Inflation and the price level, Unemployment, Aggregate demand and aggregate supply, Fiscal policy

**Week 10 (Dec 6–12):** Review — Money and banking, Monetary policy and the central bank, International trade and exchange rates

## Practice questions

1. Define macroeconomics [unverified] and explain how it differs from microeconomics [unverified].

2. What are the three approaches to calculating GDP [unverified], and how does each one measure the total economic output of a country?

3. Explain the difference between nominal GDP and real GDP [unverified], and why economists prefer real GDP when comparing economic growth across time periods.

4. Name at least three components that are included in GDP using the expenditure approach [unverified].

5. Why is GDP considered an incomplete measure of a nation's well-being [unverified], and what factors does it fail to capture?

## Summary

This 10-week study plan covers all eight macroeconomics topics from your syllabus, with two final review weeks before your December 10 exam. The first week focuses on foundational concepts in macroeconomics and GDP measurement; the practice questions check your understanding of basic definitions, calculation methods, and limitations of GDP as an economic indicator.

Test 2:
## Study plan

Week 1: Cell structure and function
Week 2: Cell membranes and transport
Week 3: Cellular respiration
Week 4: Photosynthesis
Week 5: Cell division (mitosis and meiosis)
Week 6: Review (all topics above)

Note: Add your real exam date for exact timing and schedule adjustments.

## Practice questions

Based on Week 1 (Cell structure and function) only:

1. What are the major components of a eukaryotic cell, and what is the primary function of each? Describe at least 4 organelles.
2. What is the difference between prokaryotic and eukaryotic cells, and provide one example of each?
3. Describe the structure of the cell membrane and explain how its composition relates to its primary functions.
4. What is the nucleus, and what specific role does it play in cellular function?
5. How does cell size relate to the surface-area-to-volume ratio, and why is this ratio important for cell function?

## Summary

This is a 6-week study plan covering cell biology topics from your syllabus: cell structure and function, cell membranes and transport, cellular respiration, photosynthesis, and cell division, with a final review week. The five practice questions focus on foundational concepts from Week 1 to help you prepare for the first unit. Add your actual exam date when you have it so you can adjust your pacing across these six weeks.

Test 3:
## Study plan

**Week 1 (Oct 4–10, 2026):** Porter's Five Forces

**Week 2 (Oct 11–17, 2026):** Porter's Five Forces

**Week 3 (Oct 18–24, 2026):** SWOT analysis

**Week 4 (Oct 25–31, 2026):** SWOT analysis

**Week 5 (Nov 1–7, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 6 (Nov 8–14, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 7 (Nov 15–21, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 8 (Nov 22–28, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 9 (Nov 29–Dec 5, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 10 (Dec 6–12, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 11 (Dec 13–19, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 12 (Dec 20–26, 2026):** Porter's Five Forces and SWOT analysis (review)

**Week 13 (Dec 27–Jan 2, 2027):** Porter's Five Forces and SWOT analysis (review)

**Week 14 (Jan 3–9, 2027):** Porter's Five Forces and SWOT analysis (review)

**Week 15 (Jan 10–16, 2027):** Porter's Five Forces and SWOT analysis (final review)

## Practice questions

1. According to [Porter, M. E. (1979). How competitive forces shape strategy. Harvard Business Review, 57(2), 137–145](https://hbr.org/1979/03/how-competitive-forces-shape-strategy), what are the five competitive forces that shape an industry's profitability?

2. Explain what is meant by "threat of new entrants" in Porter's Five Forces framework. What factors might increase or decrease this threat in a given industry?

3. Describe the difference between the "bargaining power of suppliers" and the "bargaining power of buyers" in Porter's model. How might each force differently affect a company's margins?

4. In Porter's Five Forces analysis, how do substitute products represent a competitive threat? Give an example of two industries where substitutes significantly impact competition.

5. Consider a software company entering the cloud computing market. Which of Porter's Five Forces would likely pose the greatest challenge to a new entrant in this industry, and why?

## Summary

This 15-week study plan covers two core strategic analysis frameworks: Porter's Five Forces over the first four weeks, followed by SWOT analysis, with the remaining ten weeks dedicated to comprehensive review of both topics before your exam on January 15, 2027. The practice questions above test your foundational understanding of Porter's Five Forces through definition, conceptual application, and comparative analysis.
>>>

Results: a table with columns Test | Check | Result | Evidence. One row per expected check in every test. Result is PASS or FAIL. Evidence is a short quote or description from that answer (under 20 words), or "missing". If an answer for a test is missing, every check in that test is FAIL with evidence "answer missing".

Fixes: one numbered fix for each FAIL, written as an instruction to the Builder, e.g. "1. [A2, Test 2] When the exam date is blank, the plan must ask for it instead of inventing one." Name the criterion and the test. If nothing failed, write "No fixes needed."

Verdict: one line. "PASS — install it" only if every check passed. Otherwise "FIX AND RETEST — send the Fixes and your current recipe to the Builder, install the new version, then run all three tests again."

---
Format your answer in Markdown with these sections, in this order, each as a "## " heading:
- Results
- Fixes
- Verdict
- Summary
Never invent facts about me (numbers, achievements, dates, names). Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them.
End with "## Summary": 2–3 sentences someone could search for later.