You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Syllabus Study Planner** — turns a pasted class syllabus into a week-by-week study plan leading up to the exam, plus 5 practice questions on the first week's topics.

**Inputs**
- **Class syllabus** (required) — paste the full syllabus text. Example: "Week 1: Intro & history. Week 2: Supply and demand. Week 3: Market structures. Final exam covers all weeks."
- **Exam date** (optional) — the date of the exam. Example: "2026-11-18"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, from today until the exam, each naming at least one topic taken from the syllabus. If the exam date falls within a week, that week still gets exactly one entry (never split into day-by-day blocks or a separate Exam Day entry).
2. **Practice Questions** — exactly 5 questions, with answers, covering only the first week's topics.
3. **Summary** (added automatically) — 2–3 sentences.

**Acceptance criteria**
- A1: The Study Plan section has exactly one entry for every week counting from today through the exam date (inclusive of the exam week), with exactly one entry for the week containing the exam date — never split into day-by-day blocks or a separate Exam Day entry.
- A2: If no exam date was given, the Study Plan section covers exactly 8 weeks, and one line states that 8 weeks was assumed because no exam date was given.
- A3: The Practice Questions section contains exactly 5 questions.
- A4: Every practice question and every one of its answer options uses only a topic word that appears under Week 1 in the Study Plan; no question or option uses a topic word that appears only under a later week.
- A5: Every week listed in the Study Plan names at least one topic taken from the pasted syllabus.
- A6: The Summary section is 2–3 sentences.

**Blank inputs** — if the exam date is left blank, the plan covers 8 weeks instead of counting to an exam date, and the Study Plan section says this was assumed.
>>>

The test cases (written before the tool was run):
<<<
### Test 1: normal use

**Inputs to type**
- **Class syllabus:** `ECON 101. Week 1: Scarcity and opportunity cost. Week 2: Supply and demand. Week 3: Elasticity. Week 4: Consumer choice. Week 5: Production costs. Week 6: Monopoly. Week 7: Inflation. Final exam covers all weeks.`
- **Exam date:** `2026-11-18`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 7 week entries (blocks starting 2026-10-04, 10-11, 10-18, 10-25, 11-01, 11-08 and 11-15; the last one contains 2026-11-18). Count them: 7, not 6 and not 8.
- [A1] No line in the answer says 8 weeks was assumed, and the words "no exam date" do not appear.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences. Count sentences by the full stops, question marks or exclamation marks that end them.

### Test 2: edge case, optional input left blank

**Inputs to type**
- **Class syllabus:** `BIO 110. Week 1: Cell structure. Week 2: Mitosis. Week 3: Meiosis. Week 4: Genetics. Week 5: Evolution. Week 6: Ecology. Week 7: Photosynthesis. Week 8: Enzymes. Final exam covers all weeks.`
- **Exam date:** leave blank

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A2] The Study Plan section has exactly 8 week entries. Count them: 8.
- [A2] One line in the answer contains both "8 weeks" (or "eight weeks") and the words "exam date".
- [A2] No exam date (no date in YYYY-MM-DD or written-out form) is presented as the exam date.
- [A5] Each of the 8 week entries contains at least one of these words: cell, mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzymes (any capitalisation; singular or plural counts).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options or answers; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

**Study Period:** October 4, 2026 – November 18, 2026 (7 weeks)

- **Week 1 (Oct 4–10):** Scarcity and opportunity cost
- **Week 2 (Oct 11–17):** Supply and demand
- **Week 3 (Oct 18–24):** Elasticity
- **Week 4 (Oct 25–31):** Consumer choice
- **Week 5 (Nov 1–7):** Production costs
- **Week 6 (Nov 8–14):** Monopoly
- **Week 7 (Nov 15–18):** Inflation (final exam on Nov 18)

## Practice Questions

**Question 1:** If a country has [X] units of labor and can produce either [Y] cars or [Z] tons of wheat per year, what is the opportunity cost of producing one additional car in terms of wheat?

*Answer:* The opportunity cost is the amount of wheat that must be given up. If total wheat production is [Z] and total car production is [Y], the opportunity cost of one car is [Z]/[Y] tons of wheat.

**Question 2:** Which of the following best illustrates the concept of scarcity?
- A) A store running out of a popular item during a sale
- B) The fact that every society must choose what goods to produce with limited resources
- C) A person deciding not to buy an expensive item
- D) A shortage caused by a natural disaster

*Answer:* B. Scarcity is the fundamental economic problem that all societies face: resources are limited but wants are unlimited, so choices must be made about production and allocation.

**Question 3:** A student decides to spend Saturday afternoon studying for ECON 101 instead of working a part-time job that pays [amount] per hour for [hours]. What is the opportunity cost of studying?

*Answer:* The opportunity cost is [amount × hours], the wages the student forgoes by choosing to study instead of work.

**Question 4:** True or False: Opportunity cost exists only in situations where a person or society faces a monetary constraint.

*Answer:* False. Opportunity cost applies whenever a choice must be made between alternatives, regardless of money. It reflects the value of the next-best alternative foregone.

**Question 5:** If you have a limited amount of time this week and must choose between attending a lecture, going to the gym, or working on a project, this situation demonstrates:
- A) Inefficiency
- B) Scarcity
- C) Market failure
- D) Diminishing returns

*Answer:* B. Scarcity. Your time is a limited resource, and you cannot do all three activities, so you must make a choice about which alternative to pursue.

## Summary

This 7-week study plan aligns with your ECON 101 syllabus and takes you through all seven course topics before your final exam on November 18, 2026. The practice questions focus on scarcity and opportunity cost, foundational concepts that appear throughout economics.

Test 2:
## Study Plan

Since no exam date was provided, I'm assuming an 8-week plan from today (October 4, 2026).

| Week | Start Date | Topic |
|------|-----------|-------|
| Week 1 | Oct 4 | Cell Structure |
| Week 2 | Oct 11 | Mitosis |
| Week 3 | Oct 18 | Meiosis |
| Week 4 | Oct 25 | Genetics |
| Week 5 | Nov 1 | Evolution |
| Week 6 | Nov 8 | Ecology |
| Week 7 | Nov 15 | Photosynthesis |
| Week 8 | Nov 22 | Enzymes |

## Practice Questions

**Question 1:** What is the primary function of the cell membrane?
A. To store energy for the cell
B. To control what enters and leaves the cell
C. To produce proteins
D. To break down waste materials

**Answer 1:** B. To control what enters and leaves the cell. The cell membrane is a semi-permeable barrier that regulates the passage of substances in and out of the cell.

---

**Question 2:** Which organelle is responsible for producing energy in the form of ATP?
A. The nucleus
B. The ribosome
C. The mitochondrion
D. The endoplasmic reticulum

**Answer 2:** C. The mitochondrion. Mitochondria are known as the "powerhouse of the cell" because they produce ATP through cellular respiration.

---

**Question 3:** What is the main component of the cell wall in plant cells?
A. Protein
B. Lipids
C. Cellulose
D. Chlorophyll

**Answer 3:** C. Cellulose. The cell wall provides structural support to plant cells and is composed primarily of cellulose fibers.

---

**Question 4:** Which of the following is true about prokaryotic cells?
A. They contain a membrane-bound nucleus
B. They lack organelles
C. They are only found in animals
D. They contain mitochondria

**Answer 4:** B. They lack organelles. Prokaryotic cells (bacteria and archaea) do not have membrane-bound organelles or a nucleus, unlike eukaryotic cells.

---

**Question 5:** What is the name of the network of membrane-bound sacs in the cell that synthesizes and packages proteins?
A. The Golgi apparatus
B. The endoplasmic reticulum
C. The cytoskeleton
D. The lysosome

**Answer 5:** B. The endoplasmic reticulum. The rough endoplasmic reticulum, studded with ribosomes, is responsible for synthesizing proteins, which are then processed and packaged by the Golgi apparatus.

---

## Summary

This 8-week study plan covers BIO 110 from October 4 through late November, building progressively from cell structure through enzyme function. The practice questions focus exclusively on Week 1 topics (cell structure, organelles, cell membranes) to help you master the foundational concepts before advancing to cellular processes. Use these questions to assess your understanding of cells before moving to mitosis in Week 2.

Test 3:
## Study Plan

| Week | Topics |
|------|--------|
| Week 1 (Oct 4–7) | Photosynthesis |

Your exam is scheduled for Tuesday, October 7th, which falls within Week 1. Focus your preparation on photosynthesis and its key mechanisms during these remaining days before the exam.

## Practice Questions

**Question 1: What are the two main stages of photosynthesis, and in which cellular structure does each occur?**

Answer: The two main stages are the light-dependent reactions (occurring in the thylakoid membranes) and the light-independent reactions or Calvin Cycle (occurring in the stroma). The light-dependent reactions capture light energy and produce ATP and NADPH, while the Calvin Cycle uses these products to synthesize glucose.

**Question 2: During the light-dependent reactions, what is the role of chlorophyll?**

Answer: Chlorophyll absorbs light energy, which excites electrons to a higher energy state. This energy is used to split water molecules, release oxygen, and transfer electrons through an electron transport chain that produces ATP and NADPH.

**Question 3: What is the primary function of the Calvin Cycle?**

Answer: The Calvin Cycle uses the ATP and NADPH produced by the light-dependent reactions to fix carbon dioxide from the atmosphere and convert it into glucose, a simple sugar that the plant can use for energy and growth.

**Question 4: Why is water essential to photosynthesis?**

Answer: Water serves as the electron donor in the light-dependent reactions. When water molecules are split (photolysis), they release electrons that enter the electron transport chain, oxygen as a byproduct, and hydrogen ions that contribute to ATP synthesis.

**Question 5: How is photosynthesis an example of an anabolic (building-up) reaction?**

Answer: Photosynthesis takes simple molecules (water and carbon dioxide) and uses light energy to build them into complex, high-energy molecules like glucose. This stores chemical energy in the bonds of glucose, contrasting with catabolic reactions that break down molecules to release energy.

## Summary

Prepare for your October 7th exam by mastering photosynthesis: the light-dependent reactions in the thylakoid, the Calvin Cycle in the stroma, and how chlorophyll and water drive energy capture and carbon fixation. Focus on understanding the flow of electrons, ATP/NADPH production, and glucose synthesis.
>>>

Results: a table with columns Test | Check | Result | Evidence. One row per expected check in every test. Result is PASS or FAIL. Grade each check exactly as its words say, no wider: if a check lists words that must not appear, it fails only if one of those words appears. Evidence is a short quote or description from that answer (under 20 words), or "missing". If an answer for a test is missing, every check in that test is FAIL with evidence "answer missing".

Fixes: one numbered fix for each FAIL, written as an instruction to the Builder, e.g. "1. [A2, Test 2] When the exam date is blank, the plan must ask for it instead of inventing one." Name the criterion and the test. If nothing failed, write "No fixes needed."

Verdict: one line. "PASS — install it" only if every check passed. Otherwise "FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again."

---
Format your answer in Markdown with these sections, in this order, each as a "## " heading:
- Results
- Fixes
- Verdict
- Summary
Never invent facts about me (numbers, achievements, dates, names). Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them.
End with "## Summary": 2–3 sentences someone could search for later.