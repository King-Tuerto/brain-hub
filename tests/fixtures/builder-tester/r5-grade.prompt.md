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
- A4: Every practice question, every one of its answer options, and its answer explanation uses only a topic word that appears under Week 1 in the Study Plan; no question, option, or answer explanation uses a topic word that appears only under a later week.
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
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-11-18 on its own). Every entry label names a week or a date range.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
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
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-10-07 on its own). The Study Plan has one entry only, not a day-by-day list.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] *(changed)* If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

- Week of 2026-10-04–2026-10-10: Scarcity and opportunity cost
- Week of 2026-10-11–2026-10-17: Supply and demand
- Week of 2026-10-18–2026-10-24: Elasticity
- Week of 2026-10-25–2026-10-31: Consumer choice
- Week of 2026-11-01–2026-11-07: Production costs
- Week of 2026-11-08–2026-11-14: Monopoly
- Week of 2026-11-15–2026-11-18: Inflation and exam review

## Practice Questions

**Question 1: Which of the following best describes scarcity?**
- A) The inability to purchase goods at a given price point
- B) Limited resources relative to unlimited human wants and needs
- C) A temporary shortage caused by bad weather
- D) The absence of money in an economy

**Answer:** B. Scarcity is a fundamental economic principle meaning that resources—time, labor, land, and materials—are finite while human wants are essentially unlimited. This reality forces societies and individuals to make choices about how to allocate what is available.

---

**Question 2: You have $100 and can either buy a textbook or attend a concert. If you choose the textbook, what is your opportunity cost?**
- A) $50 (half the money)
- B) The education you gain from the textbook
- C) The experience and enjoyment of attending the concert
- D) Nothing; opportunity cost only applies to businesses

**Answer:** C. Opportunity cost is the value of the next-best alternative foregone when making a decision. By choosing the textbook, you give up the entertainment and experience you would have had at the concert. This is the true cost of your choice beyond the dollars spent.

---

**Question 3: A student with 10 hours free on Saturday can either study for an exam or work at a part-time job earning $15 per hour. If the student chooses to study, the opportunity cost is:**
- A) 10 hours of studying
- B) $150 in forgone wages
- C) The satisfaction of earning money
- D) Both B and C

**Answer:** D. The opportunity cost includes both the $150 in wages not earned (the quantifiable value) and the personal satisfaction of earning money (the non-monetary value). Opportunity cost encompasses all benefits lost by choosing one option over another.

---

**Question 4: Why must every society address the problem of scarcity?**
- A) Because governments are inefficient
- B) Because resources are finite while wants are not
- C) Because technology fails to advance quickly enough
- D) Because international trade is limited

**Answer:** B. Scarcity exists because human wants are limitless but the resources available to satisfy them are not. This fundamental imbalance forces every society—regardless of government type, technology level, or trade policy—to decide how to allocate limited resources. These decisions are at the core of all economic activity.

---

**Question 5: A business owner has $20,000 to invest and can either expand the factory or purchase new equipment. If the expansion would generate $30,000 in value and new equipment would generate $25,000 in value, what is the opportunity cost of choosing the factory expansion?**
- A) $20,000
- B) $5,000
- C) The $25,000 in value from the equipment not purchased
- D) $30,000

**Answer:** C. The opportunity cost of the factory expansion is the $25,000 in value from purchasing new equipment—the best alternative not chosen. This is how we measure whether a decision is economically sound: by comparing what we gain against what we give up.

## Summary

This study plan spans seven weeks from October 4 through mid-November, aligning each week's focus with corresponding syllabus topics and building toward a comprehensive final exam. The five practice questions focus exclusively on scarcity and opportunity cost—the foundational economic concepts from Week 1—and test both definition and application of these core principles through realistic scenarios.

Test 2:
## Study Plan

- **Week of 2026-10-04–2026-10-10:** Cell structure
- **Week of 2026-10-11–2026-10-17:** Mitosis
- **Week of 2026-10-18–2026-10-24:** Meiosis
- **Week of 2026-10-25–2026-10-31:** Genetics
- **Week of 2026-11-01–2026-11-07:** Evolution
- **Week of 2026-11-08–2026-11-14:** Ecology
- **Week of 2026-11-15–2026-11-21:** Photosynthesis
- **Week of 2026-11-22–2026-11-28:** Enzymes

No exam date was given, so this plan assumes 8 weeks.

## Practice Questions

**Question 1: Which of the following structures is responsible for protecting the cell and controlling what enters and exits?**

A) The nucleus  
B) The cell membrane  
C) The ribosome  
D) The mitochondrion  

**Answer:** B) The cell membrane

The cell membrane is a semipermeable barrier that encloses the cell and regulates the movement of substances in and out. It is composed primarily of a phospholipid bilayer with embedded proteins. The nucleus stores genetic material, ribosomes synthesize proteins, and mitochondria generate energy, but none of these structures control what enters and exits the cell.

---

**Question 2: What is the primary function of ribosomes?**

A) Energy production  
B) Protein synthesis  
C) Waste storage  
D) Genetic regulation  

**Answer:** B) Protein synthesis

Ribosomes are the cellular machines that translate messenger RNA into proteins by linking amino acids in the correct sequence. While the nucleus regulates genes, mitochondria produce energy, and lysosomes store waste, only ribosomes are specifically responsible for building proteins.

---

**Question 3: Which organelle is often called the "powerhouse of the cell"?**

A) The Golgi apparatus  
B) The endoplasmic reticulum  
C) The mitochondrion  
D) The chloroplast  

**Answer:** C) The mitochondrion

Mitochondria generate adenosine triphosphate (ATP) through cellular respiration, providing the energy that powers cellular functions. The Golgi apparatus modifies and packages proteins, the endoplasmic reticulum synthesizes proteins and lipids, and chloroplasts are found only in plant cells. This nickname reflects the critical energy role mitochondria play.

---

**Question 4: What distinguishes a prokaryotic cell from a eukaryotic cell?**

A) Prokaryotic cells have a nucleus; eukaryotic cells do not  
B) Eukaryotic cells have a nucleus; prokaryotic cells do not  
C) Both cell types contain the same organelles  
D) Prokaryotic cells are always larger  

**Answer:** B) Eukaryotic cells have a nucleus; prokaryotic cells do not

Eukaryotic cells are characterized by a membrane-bound nucleus that contains their DNA, as well as other membrane-bound organelles. Prokaryotic cells (such as bacteria) lack both a nucleus and other organelles. The absence of a nucleus is the defining feature that separates prokaryotes from eukaryotes, not size or identical structures.

---

**Question 5: In plant cells, what is the function of the cell wall?**

A) To transport water throughout the cell  
B) To provide structural support and rigidity  
C) To produce energy for the cell  
D) To break down waste products  

**Answer:** B) To provide structural support and rigidity

The cell wall is a rigid outer layer that surrounds plant cell membranes and provides mechanical support, protection, and shape to the cell. It is composed of cellulose and other materials. Animal cells lack cell walls. Vacuoles transport water, mitochondria produce energy, and lysosomes break down waste, but the cell wall's primary role is structural.

## Summary

This 8-week study plan covers all topics in BIO 110 from today (2026-10-04) through the final material, with Week 1 focused on cell structure—the foundation for understanding how organisms function at the microscopic level. The practice questions test core concepts of cellular anatomy and function, preparing you for more complex topics like how cells divide and how organisms pass traits to offspring.

Test 3:
## Study Plan

- Week of 2026-10-04–2026-10-10: Photosynthesis

## Practice Questions

**1. What is the primary function of photosynthesis in plants?**
   - a) To create a form of chemical energy from sunlight
   - b) To convert sunlight, water, and carbon dioxide into glucose and oxygen
   - c) To transport nutrients throughout the plant
   - d) To store water molecules in leaf cells

   **Answer: b)** Photosynthesis is the process by which plants use sunlight to convert water and carbon dioxide into glucose (a sugar) and oxygen. This process is fundamental to how plants capture energy from the sun and convert it into a form they can use for growth and survival.

**2. Which structure in plant cells is responsible for carrying out photosynthesis?**
   - a) Mitochondria
   - b) Nucleus
   - c) Chloroplast
   - d) Ribosome

   **Answer: c)** Chloroplasts are the organelles where photosynthesis takes place. They contain chlorophyll, the green pigment that captures light energy and drives the chemical reactions of photosynthesis.

**3. In the light-dependent reactions of photosynthesis, what molecules are produced to power the light-independent reactions?**
   - a) Glucose and fructose
   - b) ATP and NADPH
   - c) Water and oxygen
   - d) Carbon dioxide and chlorophyll

   **Answer: b)** The light-dependent reactions produce ATP and NADPH, which store the energy captured from sunlight. These molecules provide the chemical energy and electrons needed for the light-independent reactions (Calvin cycle) to synthesize glucose.

**4. What is the primary role of chlorophyll in photosynthesis?**
   - a) To store energy as glucose molecules
   - b) To absorb light energy from the sun
   - c) To transport water through the plant
   - d) To synthesize proteins for the cell

   **Answer: b)** Chlorophyll is the green pigment in chloroplasts that absorbs light energy from the sun. This absorbed energy excites electrons, which then drives the entire photosynthetic process.

**5. Which gas is released as a byproduct during the light-dependent reactions of photosynthesis?**
   - a) Carbon dioxide
   - b) Nitrogen gas
   - c) Oxygen
   - d) Methane

   **Answer: c)** Oxygen is released during the light-dependent reactions when water molecules are split. The hydrogen ions and electrons are used to generate ATP and NADPH, while the oxygen is released into the atmosphere.

## Summary

Your exam on 2026-10-07 focuses entirely on photosynthesis. Review the light-dependent and light-independent reactions, the structures and pigments involved (particularly chloroplasts and chlorophyll), and how plants convert solar energy into chemical energy stored in glucose.
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