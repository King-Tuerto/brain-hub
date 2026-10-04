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

**Week 1 (Oct 4–10):** Scarcity and Opportunity Cost
- Understand the fundamental economic problem: resources are limited while human wants are unlimited
- Learn how to identify and calculate opportunity costs in decision-making scenarios

**Week 2 (Oct 11–17):** Supply and Demand
- Analyze how markets work through the interaction of seller intentions and buyer intentions
- Explore how these forces determine prices and quantities in markets

**Week 3 (Oct 18–24):** Elasticity
- Learn to measure the responsiveness of quantities to price changes
- Study applications of elasticity in different market conditions

**Week 4 (Oct 25–31):** Consumer Choice
- Understand how individuals make purchasing decisions based on preferences and budgets
- Study utility maximization and budget constraints

**Week 5 (Nov 1–7):** Production Costs
- Analyze how firms determine production levels based on cost structures
- Learn about fixed costs, variable costs, and marginal costs

**Week 6 (Nov 8–14):** Monopoly
- Examine market structures with one dominant firm
- Understand barriers to entry and pricing power

**Week 7 (Nov 15–21):** Inflation and Final Exam Review
- Study price levels and their economic impacts
- Review all seven topics from Weeks 1–6 in preparation for the comprehensive final exam on November 18

## Practice Questions

**Question 1:** If you spend [X] hours studying instead of working at a part-time job that pays $[Y] per hour, what is the opportunity cost of your study time?

A) Your total number of study hours
B) The wages you gave up by not working
C) The value of your textbooks
D) The time you spent commuting

**Answer 1:** B) The wages you gave up by not working. Opportunity cost is the value of the next-best alternative you sacrifice when making a choice.

---

**Question 2:** A musician must decide whether to perform at a concert or work a catering job. If the concert pays $500 and the catering job pays $300, what is the opportunity cost of performing at the concert?

A) $500
B) $300
C) $800
D) $0 (since both are voluntary choices)

**Answer 2:** B) $300. This is the value of the alternative forgone. The concert pays more, but the musician gives up the $300 catering opportunity to perform instead.

---

**Question 3:** Which of the following best explains why scarcity creates the need for economic decision-making?

A) People are naturally lazy
B) Resources are unlimited but people want more
C) Resources are limited while wants are unlimited
D) Governments force people to make choices

**Answer 3:** C) Resources are limited while wants are unlimited. This fundamental mismatch forces every person and society to decide how to allocate scarce resources.

---

**Question 4:** A student can use one evening either to study for a final exam or to attend a concert. The student values the concert at [X] hours of future free time. This trade-off illustrates:

A) How scarcity forces choices between alternatives
B) How free markets solve problems
C) How wages are determined
D) How technology reduces costs

**Answer 4:** A) How scarcity forces choices between alternatives. The student cannot do both due to time scarcity and must give up one alternative to gain the other.

---

**Question 5:** A farmer owns one acre of land. If she plants wheat, she forgoes the income from planting corn. If she plants corn, she forgoes the income from planting wheat. What economic concept does this dilemma represent?

A) Economic growth
B) Opportunity cost and scarcity
C) Market integration
D) Comparative advantage

**Answer 5:** B) Opportunity cost and scarcity. The farmer faces scarcity (one acre to use for one crop only) and must weigh the opportunity cost of each choice.

## Summary

This 7-week study plan covers all ECON 101 topics from October 4 through the final exam on November 18, 2026. The practice questions focus exclusively on foundational concepts of scarcity and opportunity cost, the first week's material, ensuring mastery of economic decision-making principles before advancing to market forces and more complex economic structures.

Test 2:
# BIO 110 Study Plan

## Study Plan

No exam date was given, so this plan assumes 8 weeks.

| Week | Date Range | Topic |
|------|-----------|-------|
| Week 1 | Oct 4–10 | Cell structure |
| Week 2 | Oct 11–17 | Mitosis |
| Week 3 | Oct 18–24 | Meiosis |
| Week 4 | Oct 25–31 | Genetics |
| Week 5 | Nov 1–7 | Evolution |
| Week 6 | Nov 8–14 | Ecology |
| Week 7 | Nov 15–21 | Photosynthesis |
| Week 8 | Nov 22–28 | Enzymes |

## Practice Questions

**Question 1:** Which of the following structures is found in both animal and plant cells?
- A) Cell wall
- B) Chloroplast
- C) Ribosome
- D) Vacuole

**Answer:** C) Ribosome. Both animal and plant cells contain ribosomes for protein synthesis. Cell walls are found only in plant cells, chloroplasts are only in plant cells, and large vacuoles are primarily in plant cells.

---

**Question 2:** The nucleus of a cell contains:
- A) Proteins only
- B) DNA and proteins
- C) Lipids and carbohydrates
- D) Water and salt ions

**Answer:** B) DNA and proteins. The nucleus contains DNA (which carries genetic information) and proteins called histones that package and regulate the DNA. The other options do not accurately describe the nucleus's primary contents.

---

**Question 3:** Which organelle is responsible for producing energy in the form of ATP?
- A) Ribosome
- B) Lysosome
- C) Mitochondrion
- D) Centrosome

**Answer:** C) Mitochondrion. The mitochondrion is the powerhouse of the cell, producing ATP through cellular respiration. Ribosomes make proteins, lysosomes break down waste, and centrosomes help organize the cytoskeleton.

---

**Question 4:** The semipermeable membrane that surrounds the cell and controls what enters and exits is called:
- A) The cell wall
- B) The cytoplasm
- C) The plasma membrane
- D) The nuclear envelope

**Answer:** C) The plasma membrane. The plasma membrane is selectively permeable and regulates the movement of substances into and out of the cell. The cell wall provides structure (in plants), the cytoplasm is the gel-like substance inside the cell, and the nuclear envelope surrounds the nucleus.

---

**Question 5:** Which of the following is a function of the endoplasmic reticulum?
- A) Breaking down pathogens
- B) Synthesizing lipids and proteins
- C) Storing glucose
- D) Producing ATP

**Answer:** B) Synthesizing lipids and proteins. The rough endoplasmic reticulum (with ribosomes) synthesizes proteins, while the smooth endoplasmic reticulum synthesizes lipids. Lysosomes break down pathogens, chloroplasts store glucose, and mitochondria produce ATP.

---

## Summary

This study plan breaks down your BIO 110 course into eight manageable weekly topics, starting with the fundamental concept of cell structure and progressing through cellular processes, heredity, and ecology. Master the anatomy and function of cellular components this week, as they form the foundation for understanding how cells divide, reproduce, and respond to their environment throughout the rest of the semester.

Test 3:
# Study Plan for Biology Exam

## Study Plan

| Week | Dates | Topics |
|------|-------|--------|
| 1 | October 4–6 | Photosynthesis |
| 1 | October 7 (Exam Day) | Photosynthesis (exam) |

**Study Strategy:**
- **October 4–5:** Focus on light-dependent and light-independent reactions of photosynthesis. Review chlorophyll, thylakoids, and the Calvin cycle.
- **October 6:** Review key terminology, diagram structures, and complete practice problems. Ensure you can explain the role of water and CO₂ in the process.
- **October 7:** Take the exam.

---

## Practice Questions

**Question 1:** What is the primary function of chlorophyll in the light-dependent reactions?
- A) To break down glucose into usable energy
- B) To absorb light energy and initiate electron excitation
- C) To transport oxygen out of the plant
- D) To synthesize new glucose molecules

**Answer:** B. Chlorophyll absorbs photons, exciting electrons that drive the process.

---

**Question 2:** Which of the following is a product of the light-dependent reactions?
- A) Glucose and carbon dioxide
- B) Oxygen, ATP, and NADPH
- C) Water and chlorophyll
- D) Starch and ethanol

**Answer:** B. The light-dependent reactions in the thylakoids produce ATP, NADPH, and oxygen as a byproduct.

---

**Question 3:** The Calvin cycle occurs in which part of the chloroplast?
- A) The thylakoid membrane
- B) The stroma
- C) The outer membrane only
- D) The granum

**Answer:** B. The Calvin cycle (light-independent reactions) takes place in the stroma, using ATP and NADPH from the light reactions.

---

**Question 4:** What raw materials does a plant need for photosynthesis to occur?
- A) Glucose and nitrogen
- B) Sunlight, water, and carbon dioxide
- C) Chlorophyll and soil minerals only
- D) Oxygen and ATP

**Answer:** B. Photosynthesis requires light energy, water (from roots), and carbon dioxide (from air) to produce glucose.

---

**Question 5:** In the light-independent reactions, carbon dioxide is converted into glucose through a series of steps. What is this process called?
- A) Photolysis
- B) The Calvin cycle
- C) Chemosynthesis
- D) Fermentation

**Answer:** B. The Calvin cycle is the set of enzymatic reactions that fix CO₂ into three-carbon compounds and eventually glucose.

---

## Summary

This study plan prepares you for an exam on photosynthesis by October 7, 2026, focusing on light-dependent and light-independent reactions, the role of chlorophyll, and the production of glucose and oxygen. The practice questions test your understanding of photosynthesis mechanisms, structures, and essential concepts through a mix of definition, function, and process-based prompts.
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