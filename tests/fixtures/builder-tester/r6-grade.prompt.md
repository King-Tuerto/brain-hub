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

| Week | Dates | Topic |
|------|-------|-------|
| Week 1 | 2026-10-04–2026-10-10 | Scarcity and opportunity cost |
| Week 2 | 2026-10-11–2026-10-17 | Supply and demand |
| Week 3 | 2026-10-18–2026-10-24 | Elasticity |
| Week 4 | 2026-10-25–2026-10-31 | Consumer choice |
| Week 5 | 2026-11-01–2026-11-07 | Production costs |
| Week 6 | 2026-11-08–2026-11-14 | Monopoly |
| Week 7 | 2026-11-15–2026-11-21 | Inflation and final exam review |

---

## Practice Questions

**Question 1:** A farmer has 100 acres of land. If she plants wheat on all 100 acres, she can produce 5,000 bushels per year. If she instead plants corn on all 100 acres, she can produce 3,000 bushels per year. What is the opportunity cost of producing 1 bushel of wheat?

A) 0.6 bushels of corn
B) 3,000 bushels of corn
C) 5,000 bushels of wheat
D) 100 acres

**Answer:** A) 0.6 bushels of corn

To produce 5,000 bushels of wheat, the farmer must give up 3,000 bushels of corn. Therefore, for each bushel of wheat produced, she sacrifices 3,000 ÷ 5,000 = 0.6 bushels of corn. The opportunity cost is what you give up to get something else.

---

**Question 2:** A musician can either work 8 hours at a job paying $20 per hour or spend 8 hours writing songs. The musician chooses to write songs. What is the opportunity cost of this decision?

A) 8 hours of free time
B) $160 in foregone wages
C) The songs written
D) Both A and C

**Answer:** B) $160 in foregone wages

The opportunity cost is the value of the next best alternative given up. By choosing to write songs, the musician gives up $160 (8 hours × $20/hour) in wages. While writing songs does consume 8 hours of free time, the economic opportunity cost is measured in monetary terms—what the musician could have earned instead.

---

**Question 3:** A student has 3 hours before an exam. She can either study for 3 hours (which would increase her score by 8 points) or work a part-time job for 3 hours (earning $45). If she chooses to study, which of the following represents her opportunity cost?

A) 8 points gained on the exam
B) $45 in foregone earnings
C) 3 hours of her time
D) The knowledge she gains from studying

**Answer:** B) $45 in foregone earnings

Opportunity cost is specifically the value of the best alternative you give up. By studying instead of working, the student forgoes $45 in earnings. The points gained (A) and knowledge acquired (D) are benefits of studying, not the cost. While the time (C) is involved, the opportunity cost is measured by the monetary value of the next best use of that time.

---

**Question 4:** An economy can produce either 100 cars or 300 bicycles with its available resources. If the economy currently produces 50 cars, how many bicycles can it produce?

A) 0 bicycles
B) 75 bicycles
C) 150 bicycles
D) 300 bicycles

**Answer:** C) 150 bicycles

Since the economy can produce 100 cars OR 300 bicycles, each car represents giving up 3 bicycles (300 ÷ 100 = 3 bicycles per car). If the economy produces 50 cars, it gives up 50 × 3 = 150 bicycles. The remaining resources allow for 150 bicycles. This reflects the trade-off principle inherent in scarcity.

---

**Question 5:** A restaurant owner must decide how to use a 500-square-foot space. She can either open a small dining area (earning $2,000 monthly profit) or operate a takeout-only kitchen (earning $3,000 monthly profit). If she chooses the dining area, what is her opportunity cost per year?

A) $2,000
B) $12,000
C) $24,000
D) $36,000

**Answer:** D) $36,000

By choosing the dining area, the owner foregoes $3,000 per month in profits from the takeout-only kitchen. Over 12 months, this amounts to $3,000 × 12 = $36,000. Opportunity cost measures the annual value of the alternative she chose not to pursue.

---

## Summary

This week focuses on the foundational economic concepts of scarcity and opportunity cost, which explain why all economic decisions involve trade-offs. Mastering these principles is essential for understanding all subsequent topics in economics, from how markets function to how individuals make choices.

Test 2:
## Study Plan

No exam date was given, so this plan assumes 8 weeks.

- **Week of 2026-10-04–2026-10-10:** Cell structure
- **Week of 2026-10-11–2026-10-17:** Mitosis
- **Week of 2026-10-18–2026-10-24:** Meiosis
- **Week of 2026-10-25–2026-10-31:** Genetics
- **Week of 2026-11-01–2026-11-07:** Evolution
- **Week of 2026-11-08–2026-11-14:** Ecology
- **Week of 2026-11-15–2026-11-21:** Photosynthesis
- **Week of 2026-11-22–2026-11-28:** Enzymes

## Practice Questions

**Question 1:** Which organelle is the primary site of ATP production in a eukaryotic cell?
A) Nucleus
B) Mitochondrion
C) Golgi apparatus
D) Ribosome

**Answer:** B) Mitochondrion. The mitochondrion is known as the powerhouse of the cell because it generates ATP, a molecule that provides energy for cellular functions.

---

**Question 2:** What is the primary structural difference between prokaryotic and eukaryotic cells?
A) Prokaryotic cells have a nucleus; eukaryotic cells do not
B) Eukaryotic cells have a nucleus; prokaryotic cells do not
C) Prokaryotic cells are larger than eukaryotic cells
D) Eukaryotic cells do not have a cell membrane

**Answer:** B) Eukaryotic cells have a nucleus; prokaryotic cells do not. This is the key distinction between these two cell types. Eukaryotic cells also contain membrane-bound organelles, while prokaryotic cells lack these structures.

---

**Question 3:** Which structure controls what enters and exits the cell?
A) Nucleus
B) Mitochondrion
C) Cell membrane
D) Cell wall

**Answer:** C) Cell membrane. The cell membrane, also called the plasma membrane, is a selectively permeable barrier that regulates the movement of substances in and out of the cell.

---

**Question 4:** What is the primary function of the nucleus in a eukaryotic cell?
A) To break down waste materials
B) To produce energy for the cell
C) To control cellular activities and direct cell functions
D) To synthesize proteins

**Answer:** C) To control cellular activities and direct cell functions. The nucleus is the control center of the cell and regulates the activities necessary to maintain life.

---

**Question 5:** Which organelle is responsible for synthesizing proteins?
A) Ribosome
B) Golgi apparatus
C) Mitochondrion
D) Endoplasmic reticulum

**Answer:** A) Ribosome. Ribosomes are the cellular structures where protein synthesis occurs. They read instructions and assemble proteins from amino acids.

## Summary

This eight-week study plan covers the complete BIO 110 syllabus, beginning with cell structure and progressing through cellular division, inheritance, evolution, ecology, and cellular processes. The practice questions focus on foundational cell structure concepts—organelles, cell types, and basic cellular functions—to build a strong foundation before moving into more complex topics in subsequent weeks.

Test 3:
## Study Plan

Week of 2026-10-04–2026-10-07: Photosynthesis

## Practice Questions

**Question 1:** Which of the following is the primary pigment responsible for capturing light energy in plant cells?
A) Hemoglobin
B) Chlorophyll
C) Melanin
D) Carotene

**Answer:** B) Chlorophyll. Chlorophyll is the main photosynthetic pigment in plant leaves that absorbs light energy. The other options are found in different organisms—hemoglobin in blood, melanin in animal skin, and carotene in some plants and animals—but chlorophyll is the primary light-capturing molecule for photosynthesis.

**Question 2:** What is the primary source of the oxygen gas released by plants during photosynthesis?
A) The breakdown of carbon dioxide molecules
B) The splitting of water molecules in the thylakoids
C) The decomposition of soil nutrients
D) The absorption of oxygen from the air

**Answer:** B) The splitting of water molecules in the thylakoids. During the light-dependent reactions of photosynthesis, water molecules (H₂O) are split apart, releasing oxygen gas (O₂) as a byproduct. This is why plants produce oxygen that becomes available to the atmosphere.

**Question 3:** The light-independent reactions of photosynthesis, in which carbon dioxide is converted into glucose, are also known as:
A) The Calvin cycle
B) The phosphorus cycle
C) The nitrogen fixation pathway
D) The osmotic gradient cycle

**Answer:** A) The Calvin cycle. The Calvin cycle is the series of reactions that occur in the stroma of the chloroplast, where carbon dioxide is fixed and converted into sugars. These reactions do not require light energy directly, which is why they are called "light-independent."

**Question 4:** In which part of the chloroplast do the light-dependent reactions of photosynthesis occur?
A) The stroma
B) The vacuole
C) The thylakoid membranes
D) The cell wall

**Answer:** C) The thylakoid membranes. The thylakoids are stacked structures called grana within the chloroplast where light-dependent reactions take place. Here, chlorophyll captures light energy and water molecules are split. The stroma is where the light-independent reactions (Calvin cycle) occur.

**Question 5:** Through which structures do plants primarily absorb carbon dioxide from the atmosphere?
A) The root hairs
B) The stomates (stomata)
C) The xylem vessels
D) The bark

**Answer:** B) The stomates (stomata). Stomates are tiny pores found mainly on the underside of plant leaves through which carbon dioxide enters and water vapor exits. Plants absorb water through root hairs in the soil, and stomates are the primary entry points for the carbon dioxide needed for photosynthesis.

## Summary

This study plan covers the essential processes and structures of photosynthesis during a three-day preparation period leading up to the exam. Photosynthesis is the process by which plants capture light energy and convert it into chemical energy stored in glucose, involving pigment systems, light-dependent reactions in the thylakoids, water splitting, and the Calvin cycle in the stroma. Mastering the roles of chlorophyll, the fate of water and carbon dioxide during these reactions, and the locations where each stage occurs will provide a strong foundation for exam success.
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