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
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-11-18 on its own). Every entry label names a week or a date range.
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
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-10-07 on its own). The Study Plan has one entry only, not a day-by-day list.
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

| Week | Dates | Topic |
|------|-------|-------|
| Week 1 | 2026-10-04–2026-10-10 | Scarcity and opportunity cost |
| Week 2 | 2026-10-11–2026-10-17 | Supply and demand |
| Week 3 | 2026-10-18–2026-10-24 | Elasticity |
| Week 4 | 2026-10-25–2026-10-31 | Consumer choice |
| Week 5 | 2026-11-01–2026-11-07 | Production costs |
| Week 6 | 2026-11-08–2026-11-14 | Monopoly |
| Week 7 | 2026-11-15–2026-11-21 | Inflation |

## Practice Questions

**Question 1:** Scarcity exists because:
- A) Prices are too high for most people
- B) Human wants are unlimited but resources are limited
- C) Governments restrict access to goods
- D) Technology has not advanced enough

**Answer:** B. By definition, scarcity refers to the situation where unlimited human wants exceed the available resources needed to satisfy them.

---

**Question 2:** If you choose to spend 3 hours studying for your economics exam, the relevant example of what you give up would be:
- A) Your textbook
- B) The [example activity you could do instead]
- C) Your tuition costs
- D) Your grade in other classes

**Answer:** B. This represents the alternative use of your time—the next best option you sacrifice by choosing to study.

---

**Question 3:** Which of the following best illustrates the concept of trade-offs?
- A) A company decides to produce more bicycles instead of motorcycles with the same resources
- B) A store marks down prices before closing
- C) A worker earns [X]% more than last year
- D) A factory hires additional employees

**Answer:** A. Trade-offs show how choosing one option means giving up another—in this case, producing bicycles means forgoing the production of motorcycles.

---

**Question 4:** An individual has $[amount] and can either buy a used laptop or take a weekend trip. The trip cost is the:
- A) Economic price of the laptop
- B) Financial burden of both choices
- C) Opportunity cost of buying the laptop
- D) Value of scarcity

**Answer:** C. The opportunity cost of a decision is what you must sacrifice—in this case, the trip is what you give up to buy the laptop.

---

**Question 5:** Scarcity applies to:
- A) Only poor countries
- B) Only natural resources
- C) All societies and all types of resources
- D) Only manufactured goods

**Answer:** C. Scarcity is a universal economic problem affecting all societies regardless of wealth level, and it applies to all resources—time, money, labor, and materials.

## Summary

This study plan covers seven weeks from October 4 through November 21, 2026, with the comprehensive exam on November 18 falling within the final week's economics unit on inflation. The five practice questions focus exclusively on scarcity and opportunity cost concepts, establishing foundational economic principles before advancing to market mechanics.

Test 2:
## Study Plan

No exam date was given, so this plan assumes 8 weeks.

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

## Practice Questions

**Question 1:** What is the primary function of the cell membrane?

A) To store energy for the cell  
B) To regulate what enters and exits the cell  
C) To produce proteins for the cell  
D) To provide structural support to the cytoplasm

**Answer:** B) To regulate what enters and exits the cell

---

**Question 2:** Which organelle is responsible for producing ATP (energy) in animal cells?

A) The nucleus  
B) The ribosome  
C) The mitochondrion  
D) The nucleolus

**Answer:** C) The mitochondrion

---

**Question 3:** What is the primary component of a cell's genetic material?

A) Lipids  
B) DNA  
C) Carbohydrates  
D) Proteins

**Answer:** B) DNA

---

**Question 4:** How do prokaryotic cells differ from eukaryotic cells?

A) Prokaryotic cells have a nucleus; eukaryotic cells do not  
B) Eukaryotic cells are smaller than prokaryotic cells  
C) Prokaryotic cells lack a nucleus and membrane-bound organelles  
D) Prokaryotic cells have more organelles than eukaryotic cells

**Answer:** C) Prokaryotic cells lack a nucleus and membrane-bound organelles

---

**Question 5:** What is the role of ribosomes in the cell?

A) Breaking down waste materials  
B) Synthesizing proteins  
C) Storing calcium ions  
D) Transporting lipids across membranes

**Answer:** B) Synthesizing proteins

## Summary

This study plan breaks down BIO 110 into eight weeks aligned with your syllabus topics, starting October 4. The practice questions focus on cell structure concepts from Week 1, including cell membrane function, ATP production, genetic material, cell types, and protein synthesis—giving you a foundation to test your understanding before moving into mitosis and beyond.

Test 3:
## Study Plan

**Week of 2026-10-04–2026-10-10:** Photosynthesis

## Practice Questions

**Question 1:** Which organelle is responsible for carrying out photosynthesis in plant cells?
- A) Mitochondria
- B) Ribosome
- C) Chloroplast
- D) Nucleus

**Answer:** C) Chloroplast

---

**Question 2:** What is the primary function of photosynthesis?
- A) To break down glucose for energy
- B) To convert light energy into chemical energy stored in glucose
- C) To produce oxygen only
- D) To absorb heat from the sun

**Answer:** B) To convert light energy into chemical energy stored in glucose

---

**Question 3:** Which pigment is the primary light-absorbing molecule in photosynthesis?
- A) Carotenoid
- B) Xanthophyll
- C) Chlorophyll
- D) Anthocyanin

**Answer:** C) Chlorophyll

---

**Question 4:** What gas do plants take in from the atmosphere during photosynthesis?
- A) Nitrogen
- B) Oxygen
- C) Carbon dioxide
- D) Hydrogen

**Answer:** C) Carbon dioxide

---

**Question 5:** The photosynthetic process can be summarized by which basic equation?
- A) Water + glucose → carbon dioxide + light
- B) Carbon dioxide + water + light energy → glucose + oxygen
- C) Oxygen + glucose → carbon dioxide + water
- D) Nitrogen + light → proteins + oxygen

**Answer:** B) Carbon dioxide + water + light energy → glucose + oxygen

## Summary

This one-week study plan focuses on photosynthesis, the core topic covered before your October 7th exam. Master the location of photosynthesis in chloroplasts, the role of chlorophyll in capturing light energy, and the basic equation showing how plants convert carbon dioxide and water into glucose and oxygen. The five practice questions test your understanding of these foundational concepts.
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