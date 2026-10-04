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
- Week of 2026-11-15–2026-11-21: Inflation (final exam on 2026-11-18)

## Practice Questions

**Question 1: Which of the following best describes opportunity cost?**

A) The total amount of money spent on a good  
B) The value of the next best alternative given up when making a choice  
C) The availability of resources in an economy  
D) The difference between income and expenses

**Answer: B**

Opportunity cost represents the value of the next best alternative foregone when making a choice. In economics, every decision involves giving up something else. Understanding opportunity cost helps us recognize that the true cost of any choice includes not just what we spend, but what we could have done instead.

---

**Question 2: You have [X] hours free this weekend. You can either work at a job paying [Y] per hour, volunteer at a charity, or study for an exam. If you choose to work for half that time, your opportunity cost is:**

A) The total earnings from working  
B) The hours you could have spent volunteering or studying instead  
C) The combined value of all three activities  
D) Zero, because you made an active choice

**Answer: B**

When you choose to work, you give up alternative uses of those hours. You could have volunteered or studied instead. The opportunity cost is not just the money you earn, but what you gave up—the other activities you could have pursued. This shows that every choice has a cost beyond just monetary expenses.

---

**Question 3: Why do all societies face the problem of scarcity?**

A) Governments don't manage resources well  
B) People are too greedy and want too much  
C) Resources are limited while human wants are essentially unlimited  
D) Technology hasn't advanced enough

**Answer: C**

Scarcity is the fundamental economic problem that all societies face because resources like land, labor, and raw materials are finite and limited, while human wants and needs are boundless. This mismatch between limited resources and unlimited wants means society must make choices about what to produce and how to allocate resources. Scarcity is universal, regardless of a country's wealth or technological level.

---

**Question 4: A farmer can use one parcel of land to grow either wheat or corn. If the farmer chooses to grow wheat, the opportunity cost is:**

A) The cost of seeds and materials needed to grow wheat  
B) The corn that could have been grown on that parcel instead  
C) The total amount of wheat that will be produced  
D) The resources required for the wheat harvest

**Answer: B**

Opportunity cost is what we give up by choosing one option over another. By choosing to grow wheat, the farmer foregoes the opportunity to grow corn on that same land. The cost is not measured in money spent on inputs (answer A) or total production (answer C), but in terms of the best alternative use of the resource—in this case, the corn crop that could have been grown.

---

**Question 5: Which scenario best illustrates the problem of scarcity?**

A) A store having an oversupply of items  
B) Everyone having access to unlimited free resources  
C) A town having only one hospital for all its residents  
D) Resources becoming more plentiful over time

**Answer: C**

Scarcity means limited resources relative to wants and needs. A town having only one hospital for many residents illustrates this perfectly: the resource (hospital capacity and services) is limited relative to the population's medical needs. This forces difficult choices about who receives treatment and when. The other options represent situations of abundance rather than scarcity.

## Summary

This study plan spans seven weeks from today (October 4, 2026) through the exam date (November 18, 2026), beginning with scarcity and opportunity cost—the foundational concepts that underpin all economic thinking. The five practice questions focus exclusively on these Week 1 topics, helping you build a solid understanding of how limited resources force choices and what those choices cost us in terms of foregone alternatives.

Test 2:
## Study Plan

| Week | Dates | Topic |
|------|-------|-------|
| Week 1 | 2026-10-04–2026-10-10 | Cell structure |
| Week 2 | 2026-10-11–2026-10-17 | Mitosis |
| Week 3 | 2026-10-18–2026-10-24 | Meiosis |
| Week 4 | 2026-10-25–2026-10-31 | Genetics |
| Week 5 | 2026-11-01–2026-11-07 | Evolution |
| Week 6 | 2026-11-08–2026-11-14 | Ecology |
| Week 7 | 2026-11-15–2026-11-21 | Photosynthesis |
| Week 8 | 2026-11-22–2026-11-28 | Enzymes |

No exam date was given, so this plan assumes 8 weeks.

## Practice Questions

**Question 1:** Which of the following is a membrane-bound organelle found primarily in plant cells that stores water, nutrients, and waste products?
- A) Ribosome
- B) Vacuole
- C) Golgi apparatus
- D) Rough endoplasmic reticulum

**Answer:** B) Vacuole. Plant cells contain large central vacuoles that occupy up to 90% of the cell volume and help maintain turgor pressure, which gives the plant structural support. Animal cells have smaller, more numerous vacuoles by comparison.

---

**Question 2:** The structure responsible for producing ATP through cellular respiration is called the:
- A) Nucleus
- B) Lysosome
- C) Mitochondrion
- D) Nucleolus

**Answer:** C) Mitochondrion. Mitochondria are often called the "powerhouses" of the cell because they convert nutrients into usable energy in the form of ATP (adenosine triphosphate) during aerobic respiration.

---

**Question 3:** Which of the following statements about the cell membrane is true?
- A) It is rigid and made primarily of protein
- B) It is a selectively permeable barrier composed of a phospholipid bilayer with embedded proteins
- C) It prevents all substances from entering the cell
- D) It is found only in animal cells

**Answer:** B) It is a selectively permeable barrier composed of a phospholipid bilayer with embedded proteins. The cell membrane controls which substances enter and exit the cell through its unique structure, allowing some molecules to pass while blocking others based on size, charge, and the cell's needs.

---

**Question 4:** What is the primary function of ribosomes in a cell?
- A) Breaking down waste materials
- B) Synthesizing proteins according to instructions from nucleic acids
- C) Storing genetic information
- D) Regulating cell division

**Answer:** B) Synthesizing proteins according to instructions from nucleic acids. Ribosomes read messenger RNA and assemble amino acids into functional proteins that are essential for all cellular processes.

---

**Question 5:** The control center of a eukaryotic cell, which contains the organism's genetic material, is the:
- A) Cytoplasm
- B) Ribosome
- C) Nucleus
- D) Centrosome

**Answer:** C) Nucleus. The nucleus is a membrane-bound organelle that houses the cell's chromosomes and DNA. It controls cellular activities by regulating gene expression and is absent in prokaryotic cells.

## Summary

This 8-week study plan spans from October 4 to November 28, 2026, covering all topics in BIO 110 with equal weight given to each concept. The practice questions focus exclusively on cellular components and their functions, providing a foundation for understanding more complex biological processes covered in subsequent weeks.

Test 3:
## Study Plan

| Week | Topics |
|------|--------|
| Week of 2026-10-04–2026-10-07 | Photosynthesis |

## Practice Questions

**Question 1:** Which two main stages make up the process by which plants convert light energy into chemical energy?
- A) Glycolysis and fermentation
- B) The light-dependent reactions and the light-independent reactions
- C) Oxidation and reduction
- D) Carbon fixation and decomposition

**Answer:** B) The light-dependent reactions and the light-independent reactions  
The process that uses sunlight to produce glucose in plants occurs in two main stages. The light-dependent reactions take place in the thylakoid membranes and capture energy from sunlight to produce ATP and NADPH. The light-independent reactions (Calvin cycle) use this energy in the stroma to convert carbon dioxide into glucose.

---

**Question 2:** Which pigment is primarily responsible for absorbing light energy in plants?
- A) Xanthophyll
- B) Carotene
- C) Chlorophyll
- D) Anthocyanin

**Answer:** C) Chlorophyll  
Chlorophyll is the main photosynthetic pigment found in plant chloroplasts. It absorbs light most efficiently in the blue and red wavelengths of the electromagnetic spectrum. The other pigments listed are accessory pigments that help capture light but do not play the primary role.

---

**Question 3:** What is the primary purpose of the Calvin cycle in plants?
- A) To break down glucose for energy
- B) To convert carbon dioxide and water into glucose using ATP and NADPH
- C) To produce oxygen as a byproduct
- D) To absorb sunlight directly

**Answer:** B) To convert carbon dioxide and water into glucose using ATP and NADPH  
The Calvin cycle, also called the light-independent reactions, uses the energy carriers (ATP and NADPH) produced by the light-dependent reactions to fix carbon dioxide into three-carbon compounds, ultimately producing glucose. This occurs in the stroma of the chloroplast.

---

**Question 4:** Where in the plant cell do the light-dependent reactions occur?
- A) The stroma
- B) The mitochondrial matrix
- C) The thylakoid membranes
- D) The cytoplasm

**Answer:** C) The thylakoid membranes  
The light-dependent reactions take place within the thylakoid membranes, which are stacked structures called grana found inside chloroplasts. These membranes contain the photosynthetic pigments and electron transport chains necessary to capture light energy and convert it into chemical energy in the form of ATP and NADPH.

---

**Question 5:** What is the overall equation for the process by which plants produce glucose from light and carbon dioxide?
- A) C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy
- B) 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
- C) C₆H₁₂O₆ + O₂ → CO₂ + H₂O
- D) CO₂ + H₂O → CH₄ + O₂

**Answer:** B) 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂  
This is the overall equation showing that carbon dioxide and water, in the presence of light energy, are converted into glucose and oxygen. This equation represents the complete process where reactants are transformed into products through the coordinated action of the light-dependent and light-independent reaction stages.

## Summary

This study plan covers photosynthesis, the process by which plants convert light energy into chemical energy stored in glucose, from today through your October 7 exam. The five practice questions focus on key concepts including the two main stages of the process, the role of chlorophyll and other pigments, the function of the Calvin cycle, the location of light-dependent reactions within the thylakoid membranes, and the overall chemical equation for the process.
>>>

Results: a table with columns Test | Check | Result | Evidence. One row per expected check in every test. Result is PASS or FAIL. Grade each check exactly as its words say, no wider: if a check lists words that must not appear, it fails only if one of those words appears, in any form: plural, -ing, -ed, or a related form such as "genetic" for "genetics". Quote the form you found. Evidence is a short quote or description from that answer (under 20 words), or "missing". If an answer for a test is missing, every check in that test is FAIL with evidence "answer missing".

Fixes: one numbered fix for each FAIL, written as an instruction to the Builder, e.g. "1. [A2, Test 2] When the exam date is blank, the plan must ask for it instead of inventing one." Name the criterion and the test. If nothing failed, write "No fixes needed."

Verdict: one line. "PASS — install it" only if every check passed. Otherwise "FIX AND RETEST — send the Fixes, the Spec and your current recipe to the Builder, install the new version, then run all three tests again."

---
Format your answer in Markdown with these sections, in this order, each as a "## " heading:
- Results
- Fixes
- Verdict
- Summary
Never invent facts about me (numbers, achievements, dates, names), and never present made-up facts as real. Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy as my own, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them. Made-up numbers are fine in clearly hypothetical practice questions, worked examples or exercises; say they are hypothetical if that is not obvious.
End with "## Summary": 2–3 sentences someone could search for later.