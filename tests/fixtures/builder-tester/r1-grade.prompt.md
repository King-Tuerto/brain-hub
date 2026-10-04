You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Syllabus Study Planner** — turns a pasted class syllabus into a week-by-week study plan leading up to the exam, plus 5 practice questions on the first week's topics.

**Inputs**
- **Class syllabus** (required) — paste the full syllabus text. Example: "Week 1: Intro & history. Week 2: Supply and demand. Week 3: Market structures. Final exam covers all weeks."
- **Exam date** (optional) — the date of the exam. Example: "2026-11-18"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, from today until the exam, each naming at least one topic taken from the syllabus.
2. **Practice Questions** — exactly 5 questions, with answers, covering only the first week's topics.
3. **Summary** (added automatically) — 2–3 sentences.

**Acceptance criteria**
- A1: The Study Plan section has exactly one entry for every week counting from today through the exam date (inclusive of the exam week).
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

You have approximately 7 weeks from today (October 4, 2026) until your final exam on November 18, 2026. This study plan maps one major topic from your syllabus to each week, giving you time to study each concept deeply and review before the exam.

| Week | Dates | Topic | Study Focus |
|------|-------|-------|------------|
| Week 1 | Oct 4–10 | Scarcity and Opportunity Cost | Understand fundamental concepts: definition of scarcity, trade-offs, and how opportunity cost shapes economic decisions |
| Week 2 | Oct 11–17 | Supply and Demand | Learn how supply and demand curves interact, market equilibrium, and factors that shift curves |
| Week 3 | Oct 18–24 | Elasticity | Study price elasticity of demand, income elasticity, and how elasticity affects business decisions |
| Week 4 | Oct 25–31 | Consumer Choice | Explore utility maximization, budget constraints, and consumer preferences |
| Week 5 | Nov 1–7 | Production Costs | Analyze fixed costs, variable costs, marginal costs, and cost structures in production |
| Week 6 | Nov 8–14 | Monopoly | Examine market structure, barriers to entry, and pricing strategies in monopolistic markets |
| Week 7 | Nov 15–18 | Inflation | Review causes of inflation, inflation's effects on the economy, and policy responses |

**Exam Preparation (Final Week):**
Reserve time during Week 7 to review all previous weeks' material and take practice exams covering all topics.

---

## Practice Questions

**Question 1:** A student must choose between working at a part-time job earning [X] dollars per hour or attending volunteer hours that provide unpaid job experience. If the student chooses to volunteer, the opportunity cost of that decision is:
- A) The money spent on transportation to the volunteer site
- B) The [X] dollars per hour that could have been earned at the job
- C) The combination of money earned plus experience gained
- D) Zero, because volunteering doesn't cost money

**Answer to Question 1:** B. The opportunity cost of choosing to volunteer is the [X] dollars per hour that could have been earned. Opportunity cost is what you give up when you make a choice—in this case, the foregone wages from the job.

---

**Question 2:** Due to scarcity, society must answer three key economic questions. Which of the following is NOT one of these fundamental questions?
- A) What goods and services should be produced?
- B) How should goods and services be produced?
- C) How much should each individual earn?
- D) For whom should goods and services be produced?

**Answer to Question 2:** C. The three fundamental questions are what to produce, how to produce it, and for whom to produce it. While "how much should each individual earn" relates to income distribution, it is not one of the three basic economic questions that stem from scarcity.

---

**Question 3:** A factory owner can use raw materials to produce either [Y] units of Product A or [Z] units of Product B. This situation directly illustrates:
- A) The law of scarcity
- B) The concept of opportunity cost
- C) Consumer preference
- D) Economic growth

**Answer to Question 3:** B. When a factory must choose between producing one product or another because resources are limited, this directly illustrates opportunity cost—the trade-off between two alternatives. Choosing Product A means giving up the opportunity to produce Product B.

---

**Question 4:** Which of the following best explains why scarcity exists?
- A) Governments impose unnecessary taxes
- B) Human wants and needs are unlimited, but productive resources are finite
- C) People are selfish and do not share resources
- D) Technology is not advanced enough

**Answer to Question 4:** B. Scarcity is a fundamental economic problem that exists because human wants and needs are unlimited, while the resources available to satisfy them are finite. This is true regardless of a nation's wealth or technology level.

---

**Question 5:** If a student's opportunity cost of studying for an economics exam is [A] hours of entertainment, this means:
- A) Economics is worth [A] hours of entertainment
- B) The student gained [A] hours of entertainment while studying
- C) The student gave up [A] hours of entertainment to study
- D) Economics and entertainment are equally valuable

**Answer to Question 5:** C. Opportunity cost represents what you give up when you choose one alternative over another. If the opportunity cost is [A] hours of entertainment, it means the student sacrificed [A] hours of entertainment in order to study for the exam.

---

## Summary

This seven-week study plan aligns with your syllabus topics and exam date, guiding you from foundational concepts (scarcity and opportunity cost) through increasingly complex market structures, culminating in macroeconomic inflation. Master Week 1's concepts of scarcity and opportunity cost, as these foundational ideas underpin all subsequent economic reasoning throughout the course.

Test 2:
## Study Plan

Since no exam date was provided, this plan covers 8 weeks from today (2026-10-04) through the final exam.

| Week | Dates | Primary Topic | Focus |
|------|-------|---------------|-------|
| Week 1 | Oct 4–10 | Cell structure | Prokaryotic vs. eukaryotic cells, organelles, cell membrane |
| Week 2 | Oct 11–17 | Mitosis | Phases of mitosis, cytokinesis, checkpoint control |
| Week 3 | Oct 18–24 | Meiosis | Reduction division, crossing over, gamete formation |
| Week 4 | Oct 25–31 | Genetics | Mendelian inheritance, alleles, phenotype vs. genotype |
| Week 5 | Nov 1–7 | Evolution | Natural selection, adaptation, speciation |
| Week 6 | Nov 8–14 | Ecology | Organisms, populations, communities, ecosystems |
| Week 7 | Nov 15–21 | Photosynthesis | Light-dependent and light-independent reactions, chloroplasts |
| Week 8 | Nov 22–28 | Enzymes | Catalysis, enzyme specificity, factors affecting reaction rates |

**Exam Prep:** Use Nov 29–[your exam date] to review all topics and complete cumulative practice tests.

---

## Practice Questions

**Question 1:** Which of the following structures is responsible for producing energy in a typical eukaryotic cell?
- A) The nucleus
- B) The mitochondrion
- C) The cell wall
- D) The vacuole

**Answer:** B) The mitochondrion. Mitochondria are the powerhouses of the cell, converting nutrients into ATP through cellular respiration.

---

**Question 2:** What is the primary function of the cell membrane?
- A) To store genetic material
- B) To break down waste products
- C) To regulate what enters and exits the cell
- D) To provide rigid structural support

**Answer:** C) To regulate what enters and exits the cell. The cell membrane (plasma membrane) is selectively permeable and controls the transport of substances through its phospholipid bilayer.

---

**Question 3:** Which organelle contains ribosomes and is involved in protein synthesis?
- A) The endoplasmic reticulum
- B) The Golgi apparatus
- C) The lysosome
- D) The peroxisome

**Answer:** A) The endoplasmic reticulum. The rough endoplasmic reticulum (rough ER) is studded with ribosomes and is responsible for synthesizing proteins.

---

**Question 4:** In a prokaryotic cell, genetic material is located in which region?
- A) Inside a membrane-bound nucleus
- B) In the nucleoid region, not enclosed by a membrane
- C) Within the cell wall only
- D) Distributed throughout the cytoplasm equally

**Answer:** B) In the nucleoid region, not enclosed by a membrane. Prokaryotic cells lack a true nucleus; their DNA is found in a region called the nucleoid.

---

**Question 5:** What is the primary component of the cell wall in plant cells?
- A) Protein
- B) Phospholipid
- C) Cellulose
- D) Cholesterol

**Answer:** C) Cellulose. Plant cell walls are composed primarily of cellulose, a polysaccharide that provides structural support and rigidity.

---

## Summary

This 8-week study plan maps your entire BIO 110 syllabus with one primary topic assigned to each week, progressing from cell structure through enzymes. The five practice questions focus exclusively on Week 1 concepts (cell structure, organelles, and the cell membrane), testing your understanding of prokaryotic vs. eukaryotic cells and key cellular structures. Review these questions before moving to Week 2 to ensure mastery of foundational concepts.

Test 3:
## Study Plan

Since your exam is on 2026-10-07 (just 3 days away), here's a focused study plan:

**October 4–6 (Days Before Exam):** Photosynthesis
- **October 4:** Learn photosynthesis basics—definition, key inputs (light, water, carbon dioxide), and main outputs
- **October 5:** Deep dive into light-dependent reactions, including the role of chlorophyll and electron transport in the thylakoid membrane
- **October 6:** Study light-independent reactions (Calvin cycle), trace the conversion of carbon dioxide to glucose, and do comprehensive review

**October 7 (Exam Day):** Final review and exam

## Practice Questions

**Question 1:** In photosynthesis, light energy is captured by a green pigment. What is this pigment called, and where in the cell is it located?
- A) Hemoglobin, found in the cell membrane
- B) Chlorophyll, found in the chloroplast
- C) Carotenoid, found in the nucleus
- D) Melanin, found in the mitochondria

**Answer:** B) Chlorophyll, found in the chloroplast

---

**Question 2:** Which of the following best describes the purpose of the light-dependent reactions in photosynthesis?
- A) To produce glucose directly from carbon dioxide
- B) To capture light energy and convert it into ATP and NADPH
- C) To absorb all wavelengths of light equally
- D) To release carbon dioxide into the atmosphere

**Answer:** B) To capture light energy and convert it into ATP and NADPH

---

**Question 3:** The Calvin cycle is part of photosynthesis and does NOT require light to function. What is the primary input for the Calvin cycle?
- A) Glucose and oxygen
- B) Carbon dioxide and water
- C) Carbon dioxide and ATP (from light reactions)
- D) Only oxygen and light

**Answer:** C) Carbon dioxide and ATP (from light reactions)

---

**Question 4:** Where do the light-dependent reactions of photosynthesis occur within the chloroplast?
- A) In the stroma
- B) In the thylakoid membrane
- C) In the cell wall
- D) In the vacuole

**Answer:** B) In the thylakoid membrane

---

**Question 5:** What is the overall equation for photosynthesis, showing inputs and outputs?
- A) Glucose + oxygen → carbon dioxide + water + light energy
- B) Light energy + water + carbon dioxide → glucose + oxygen + water
- C) Carbon dioxide + water + light energy → glucose + oxygen
- D) Glucose → carbon dioxide + oxygen + light

**Answer:** C) Carbon dioxide + water + light energy → glucose + oxygen

## Summary
With only three days until your exam, focus exclusively on photosynthesis: light-dependent reactions in the thylakoid membrane, the Calvin cycle in the stroma, and how chlorophyll captures light energy. These practice questions test your understanding of photosynthesis mechanisms, location within the chloroplast, and the overall chemical equation—everything you need to master Week 1 content.
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