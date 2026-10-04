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
- A4: Every practice question, every one of its answer options, and its answer explanation uses only a topic word that appears under Week 1 in the Study Plan; no question, option, or answer explanation uses a topic word that appears only under a later week, including any other form of that word (for example, if "production" is a later week's topic word, "produce", "produces", "produced" and "producing" are also not allowed).
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
- [A4] *(changed)* Write down which of these topics appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. For every topic from that list that does NOT appear in the first week entry, none of its words below may appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation):
  - supply: supply, supplies, supplied, supplying, supplier, suppliers
  - demand: demand, demands, demanded, demanding
  - elasticity: elasticity, elasticities, elastic, inelastic
  - consumer choice: consumer, consumers, consume, consumes, consumed, consuming, consumption
  - production: production, produce, produces, produced, producing, producer, producers, productive, productivity
  - monopoly: monopoly, monopolies, monopolist, monopolists, monopolistic, monopolize, monopolized
  - inflation: inflation, inflate, inflates, inflated, inflating, inflationary
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
- [A4] *(changed)* Write down which of these topics appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. For every topic from that list that does NOT appear in the first week entry, none of its words below may appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation):
  - mitosis: mitosis, mitoses, mitotic
  - meiosis: meiosis, meioses, meiotic
  - genetics: genetics, genetic, genetically, geneticist, geneticists
  - evolution: evolution, evolutionary, evolve, evolves, evolved, evolving
  - ecology: ecology, ecological, ecologically, ecologist, ecologists
  - photosynthesis: photosynthesis, photosynthetic, photosynthesize, photosynthesizes, photosynthesized, photosynthesizing
  - enzyme: enzyme, enzymes, enzymatic
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
- [A4] *(changed)* If the word "respiration" does NOT appear in the Study Plan's week entry, then none of these words appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation): respiration, respirations, respiratory, respire, respires, respired, respiring.
- [A6] The Summary section has 2 or 3 sentences.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

- Week of 2026-10-04–2026-10-10: Scarcity and Opportunity Cost
- Week of 2026-10-11–2026-10-17: Supply and Demand
- Week of 2026-10-18–2026-10-24: Elasticity
- Week of 2026-10-25–2026-10-31: Consumer Choice
- Week of 2026-11-01–2026-11-07: Production Costs
- Week of 2026-11-08–2026-11-14: Monopoly
- Week of 2026-11-15–2026-11-21: Inflation (Final exam on 2026-11-18)

## Practice Questions

**Question 1:** A farmer has 100 acres of land. She can use it to grow wheat or raise cattle. If she chooses to grow wheat, she gives up the opportunity to raise cattle. Based on this scenario, what is the opportunity cost of choosing to grow wheat?

A) The land itself
B) The cattle she could have raised instead
C) The total profit from growing wheat
D) The tools needed to farm

**Answer:** B) The cattle she could have raised instead. Opportunity cost is what you give up when making a choice. If the farmer chooses to grow wheat, she sacrifices the chance to raise cattle on that land. This is the best alternative she forgoes.

---

**Question 2:** A student has 4 hours on a Saturday morning. She can either work at her part-time job for $15 per hour or study for an upcoming exam. What best represents the opportunity cost of working?

A) The $60 she earns
B) The study time she gives up
C) The difficulty of the exam
D) The transportation cost to work

**Answer:** B) The study time she gives up. When she chooses to work, the opportunity cost is not the money she makes, but rather the exam preparation time she forgoes. Opportunity cost is always measured in terms of the next best alternative use of resources.

---

**Question 3:** A company must decide whether to build a new factory or expand an existing one. They have enough resources for only one project. This decision illustrates which economic concept?

A) Efficiency
B) Technology
C) Scarcity
D) Profit

**Answer:** C) Scarcity. The company faces scarcity because their resources are limited and they cannot pursue both options. Scarcity is the fundamental economic problem that there are not enough resources to satisfy all wants and needs, which forces difficult choices and trade-offs.

---

**Question 4:** Tom spends his evening either playing video games or reading a book. If he chooses to play video games for 2 hours, his opportunity cost is:

A) The enjoyment he gets from video games
B) The 2 hours he could have spent reading
C) His electricity bill
D) None of the above

**Answer:** B) The 2 hours he could have spent reading. Opportunity cost focuses on the next best alternative use of time or resources that is given up. Here, if Tom chooses to play video games, he forgoes the alternative of reading a book.

---

**Question 5:** An architect decides to start her own firm instead of working as a design consultant earning $60,000 per year. Which of the following best represents her opportunity cost?

A) The rent for office space
B) The $60,000 salary she forgoes
C) The software and equipment she needs to buy
D) Her professional education and credentials

**Answer:** B) The $60,000 salary she forgoes. Although she will have other costs like rent and equipment, the opportunity cost specifically refers to the income from her best alternative—working as a design consultant. This is the economic benefit she sacrifices to start her own firm.

## Summary

This 7-week study plan takes you from today (October 4, 2026) through your ECON 101 final exam on November 18, 2026, covering each major topic sequentially. The five practice questions focus exclusively on scarcity and opportunity cost from Week 1, helping you master foundational concepts before moving to later material. Work through these scenarios carefully to build a clear understanding of how opportunity cost represents the value of the best alternative you give up when making an economic decision.

Test 2:
## Study Plan

No exam date was given, so this plan assumes 8 weeks.

- **Week of 2026-10-04–2026-10-10**: Cell structure
- **Week of 2026-10-11–2026-10-17**: Mitosis
- **Week of 2026-10-18–2026-10-24**: Meiosis
- **Week of 2026-10-25–2026-10-31**: Genetics
- **Week of 2026-11-01–2026-11-07**: Evolution
- **Week of 2026-11-08–2026-11-14**: Ecology
- **Week of 2026-11-15–2026-11-21**: Photosynthesis
- **Week of 2026-11-22–2026-11-28**: Enzymes

## Practice Questions

**Question 1: About the nucleus**

The nucleus of a eukaryotic cell contains the cell's DNA. In eukaryotes, DNA is combined with proteins called histones. What is one major function of the nucleus?

a) To store the cell's DNA
b) To create ATP
c) To digest foreign materials
d) To provide the cell's shape

**Answer:** a) To store the cell's DNA. The nucleus is the membrane-bound organelle that houses DNA, serving as the control center of the cell and regulating cellular activities.

---

**Question 2: About the cell membrane**

The cell membrane is a selectively permeable barrier that controls what enters and exits the cell. The cell membrane is primarily composed of:

a) Proteins and cholesterol only
b) A phospholipid bilayer with embedded proteins
c) Cellulose and peptides
d) Starch and lipids

**Answer:** b) A phospholipid bilayer with embedded proteins. This structure allows the cell membrane to regulate the passage of substances and perform various cellular functions including recognition and communication with other cells.

---

**Question 3: About mitochondria**

Mitochondria are often called the "powerhouse" of the cell because they produce energy in the form of ATP. This organelle has two membranes and contains its own ribosomes and DNA. What distinguishes mitochondria from most other organelles?

a) It has its own DNA and ribosomes
b) It is found only in plant cells
c) It produces starch molecules
d) It absorbs light energy

**Answer:** a) It has its own DNA and ribosomes. Mitochondria are unique among organelles in containing their own DNA and ribosomes, suggesting their origin from ancient organisms. This allows them to produce ATP to fuel cellular activities.

---

**Question 4: About lysosomes**

Lysosomes are membrane-bound organelles found in animal cells that contain digestive proteins. What is the primary function of lysosomes?

a) To store water and nutrients
b) To break down and recycle cellular waste materials
c) To produce proteins
d) To store calcium

**Answer:** b) To break down and recycle cellular waste materials. Lysosomes function as the cell's "waste disposal system" by containing hydrolytic proteins and acids that break down waste materials, old organelles, and other cellular debris.

---

**Question 5: About the endoplasmic reticulum**

The endoplasmic reticulum (ER) exists in two forms: rough ER (with ribosomes) and smooth ER (without ribosomes). Ribosomes are the sites where proteins are assembled. Which of the following is a main function of the rough endoplasmic reticulum?

a) To store and break down fatty acids
b) To synthesize lipids for the cell membrane
c) To produce proteins for secretion or use in the cell
d) To regulate the cell's water balance

**Answer:** c) To produce proteins for secretion or use in the cell. Ribosomes attached to the rough endoplasmic reticulum translate messenger RNA to build proteins that either remain in the cell or are exported to other locations, making rough ER essential for protein synthesis.

## Summary

This study plan distributes BIO 110's eight topics across eight weeks, with cell structure as the foundation in the first week. The five practice questions focus on cell structure concepts including the nucleus, cell membrane, mitochondria, lysosomes, and endoplasmic reticulum, preparing you to build on these fundamentals in subsequent weeks. Regular review of cellular components and their functions will support your understanding of the more complex topics to come.

Test 3:
## Study Plan

- Week of 2026-10-04–2026-10-10: Photosynthesis

## Practice Questions

**Question 1:** In photosynthesis, what is the primary pigment that absorbs light energy in plant cells?
- A) Chlorophyll
- B) Carotenoid
- C) Xanthophyll
- D) Anthocyanin

**Answer:** A) Chlorophyll. Chlorophyll is the main pigment responsible for capturing light energy and is what gives plants their green color. This energy is then used to drive the light-dependent reactions.

---

**Question 2:** During the light-dependent reactions of photosynthesis, which of the following is produced?
- A) Glucose
- B) ATP and NADPH
- C) Carbon dioxide
- D) Starch

**Answer:** B) ATP and NADPH. The light-dependent reactions occur in the thylakoid membranes and use light energy to produce ATP and NADPH, which are energy carriers needed for the next stage of photosynthesis.

---

**Question 3:** The Calvin cycle (light-independent reactions) requires which substance as an input?
- A) Water
- B) Oxygen
- C) Carbon dioxide and ATP
- D) Chlorophyll

**Answer:** C) Carbon dioxide and ATP. The Calvin cycle uses carbon dioxide from the atmosphere and ATP (along with NADPH) produced by the light-dependent reactions to build glucose molecules. It does not directly require light or water.

---

**Question 4:** Where in a plant cell does photosynthesis primarily occur?
- A) Mitochondria
- B) Chloroplasts
- C) Nucleus
- D) Ribosome

**Answer:** B) Chloroplasts. Photosynthesis takes place in the chloroplasts, which contain the thylakoids (for light-dependent reactions) and the stroma (for the Calvin cycle). This is where all the molecular machinery for photosynthesis is located.

---

**Question 5:** What is the overall equation for photosynthesis?
- A) C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy
- B) 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
- C) C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂
- D) 6O₂ + glucose → carbon dioxide + water

**Answer:** B) 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This equation shows that photosynthesis uses carbon dioxide and water in the presence of light energy to produce glucose and oxygen. This is the reverse of the combustion of glucose and represents the fundamental chemical process of photosynthesis.

## Summary

This one-week study plan focuses on photosynthesis in preparation for your exam on 2026-10-07. The five practice questions cover the major topics in photosynthesis: photosynthetic pigments, the light-dependent reactions, the Calvin cycle, the chloroplast as the site of photosynthesis, and the overall photosynthetic equation.
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
Never invent facts about me (numbers, achievements, dates, names), and never present made-up facts as real. Where a real detail of mine is needed and you do not have it, write a placeholder like [your number]. This includes example sentences I might copy as my own, such as sample resume bullets or answers: put a placeholder like [X%] in place of every number in them. Practice questions, worked examples and exercises are different: they are hypothetical, so give them concrete made-up numbers, not placeholders, even when they are written to "you"; say they are hypothetical if that is not obvious.
End with "## Summary": 2–3 sentences someone could search for later.