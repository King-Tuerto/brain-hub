You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Study Plan Builder** — turns a pasted class syllabus into a week-by-week study plan plus five practice questions on the first week's topics.

**Inputs**
- Paste your class syllabus (required). Example: "Week 1: Cell structure. Week 2: Membrane permeability. Week 3–4: Respiration and photosynthesis..."
- Exam date (optional). Example: "2026-12-15"

**Output** (sections, in order):
1. **Study Plan** — one entry per week, each naming the topics to study that week, built only from topics that appear in the pasted syllabus.
2. **Week 1 Practice Questions** — exactly five questions, based only on the first week's topics as listed in the Study Plan.
3. **Summary** (added automatically by the hub) — 2–3 sentences.

**Acceptance criteria**
- A1: When an exam date is given, the Study Plan has exactly one entry for every whole week counted from the run date to the exam date (whole days between the two dates, divided by 7, rounded down) — for example, a run on 2026-10-04 with an exam on 2027-02-26 gives 20 entries, not 19.
- A2: Every topic named anywhere in the Study Plan appears in the pasted syllabus; no outside topics are introduced.
- A3: When the exam date is left blank, the Study Plan instead covers every topic in the syllabus, organized week by week, and the answer states that no exam date was given yet.
- A4: Every one of the five Week 1 Practice Questions tests only a topic assigned to Week 1 in the Study Plan; none tests a topic assigned to a later week, even when that later topic overlaps with a Week 1 topic (e.g. a Week 1 question must not stray into membrane permeability if that's a Week 2 topic, or into respiration/photosynthesis if those are Weeks 3–4 topics).
- A5: The Week 1 Practice Questions section contains exactly five questions, no more and no fewer.
- A6: The Study Plan presents weeks in order, starting from the current week.

**Blank inputs**
- Exam date left blank: build the Study Plan from the syllabus alone, covering every syllabus topic organized week by week, and state in the answer that this was done because no exam date was given.
>>>

The test cases (written before the tool was run):
<<<
### Test 1 — normal use

**Inputs to type**
- Paste your class syllabus: `Week 1: Cell structure and organelles. Week 2: Membrane permeability and transport. Week 3: Cellular respiration. Week 4: Photosynthesis. Week 5: DNA replication. Week 6: Protein synthesis.`
- Exam date: `2026-11-15`

**Expected**
- [ ] [A1] The Study Plan has exactly **6** entries (42 days ÷ 7 = 6, if run on 2026-10-04) — not 5, not 7.
- [ ] [A2] Every topic in the Study Plan is one of: cell structure/organelles, membrane permeability/transport, cellular respiration, photosynthesis, DNA replication, protein synthesis. Nothing else (e.g. no mitosis, genetics, ecology).
- [ ] [A6] Weeks are listed in order (Week 1, Week 2, …), and the first entry is the current week.
- [ ] [A5] The Week 1 Practice Questions section has exactly 5 questions — count them.
- [ ] [A4] All 5 questions are about cell structure/organelles (or whatever the Study Plan put in Week 1). None asks about membrane transport, respiration or photosynthesis — even a question on mitochondria must be about the organelle, not about how respiration works.
- [ ] Sections appear in order: Study Plan, Week 1 Practice Questions, Summary.

### Test 2 — edge case: every optional input blank

**Inputs to type**
- Paste your class syllabus: `Week 1: Supply and demand. Week 2: Elasticity. Week 3: Consumer choice. Week 4: Costs of production. Week 5: Perfect competition.`
- Exam date: leave blank

**Expected**
- [ ] [A3] The answer clearly says no exam date was given (any wording), and that the plan was built from the syllabus alone.
- [ ] [A3] All 5 syllabus topics appear somewhere in the Study Plan — none dropped. Tick each: supply and demand, elasticity, consumer choice, costs of production, perfect competition.
- [ ] [A2] No topic appears that is not in the syllabus (e.g. no monopoly, game theory, macroeconomics).
- [ ] [A6] Weeks are in order, starting with the current week / Week 1.
- [ ] [A5] Exactly 5 Week 1 Practice Questions.
- [ ] [A4] All 5 questions are about supply and demand only. None asks about elasticity (a close neighbour — watch for words like "elastic", "percentage change in quantity" or "price sensitivity").
- [ ] The tool does not stop to ask for an exam date; it still produces a full answer.

### Test 3 — tricky: messy, out-of-order syllabus and a very close exam

**Inputs to type**
- Paste your class syllabus: `BIO 101 — Fall. Office hours Tues. Grading: 40% exams, 60% labs. Week 3–4: Respiration and photosynthesis. Week 1: Cell structure. Week 5: Review. Week 2: Membrane permeability. Lab safety quiz due before Week 1 lab. Late work policy: see Canvas.`
- Exam date: `2026-10-20`

**Expected**
- [ ] [A1] The Study Plan has exactly **2** entries (16 days ÷ 7 = 2.28, rounded down = 2, if run on 2026-10-04) — not 3, and not one entry per syllabus week.
- [ ] [A2] The Study Plan only uses topics from the syllabus (cell structure, membrane permeability, respiration, photosynthesis, review). Admin text is not treated as a study topic: no "grading", "office hours", "late work policy" or "lab safety" as a week's topic.
- [ ] [A6] The 2 entries are in time order and start with the current week, even though the syllabus listed Week 3–4 first.
- [ ] [A6] Cell structure is in the first entry (the syllabus's Week 1), not respiration/photosynthesis just because they were pasted first.
- [ ] [A5] Exactly 5 Week 1 Practice Questions.
- [ ] [A4] All 5 questions test only the topics the Study Plan put in its first week. None strays into a topic the plan put in a later week (e.g. if membrane permeability is in week 2, no question on the cell membrane letting things through; no questions on respiration or photosynthesis unless the plan put them in week 1).
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

| Week | Study Period | Topics |
|------|--------------|--------|
| 1 | Oct 4–10 | Cell structure and organelles |
| 2 | Oct 11–17 | Membrane permeability and transport |
| 3 | Oct 18–24 | Cellular respiration |
| 4 | Oct 25–31 | Photosynthesis |
| 5 | Nov 1–7 | DNA replication |
| 6 | Nov 8–14 | Protein synthesis |

**Note:** This study plan spans exactly 6 weeks (42 days) from today (2026-10-04) to the exam date (2026-11-15), matching the 6 weeks provided in the syllabus.

## Week 1 Practice Questions

1. The mitochondrion is responsible for [unverified] energy production in the form of ATP. Name two structural features of mitochondria that support this function and explain how each contributes to ATP synthesis.

2. Plant cells contain chloroplasts while animal cells do not. Describe the key structural characteristics of a chloroplast and explain why this organelle is essential for photosynthesis. (Note: Do not discuss photosynthesis details—focus only on structure.)

3. The nucleus contains the cell's genetic material and is bounded by the nuclear envelope. Explain how the structure of the nuclear envelope enables communication between the nucleus and the cytoplasm.

4. The endoplasmic reticulum exists in two forms: rough ER (studded with ribosomes) and smooth ER (without ribosomes). Compare the structure of these two forms and explain what structural difference accounts for their different functions.

5. Lysosomes contain digestive enzymes and are found primarily in animal cells. What structural adaptation of lysosomes allows them to contain these powerful enzymes without damaging the rest of the cell?

## Summary

This study plan divides the [your syllabus] into a 6-week preparation schedule leading up to your exam on 2026-11-15. Week 1 focuses exclusively on cell structure and organelles; the five practice questions test understanding of organelle structure and function without overlap into transport, respiration, or photosynthesis—topics reserved for later weeks.

Test 2:
## Study Plan

Since no exam date was provided, the study plan follows the syllabus week by week:

- **Week 1:** Supply and Demand
- **Week 2:** Elasticity
- **Week 3:** Consumer Choice
- **Week 4:** Costs of Production
- **Week 5:** Perfect Competition

This plan covers all topics from your syllabus in the order they appear.

## Week 1 Practice Questions

Note: The following questions cover supply and demand topics exclusive to Week 1. Elasticity (Week 2), consumer choice analysis (Week 3), production costs (Week 4), and market structures (Week 5) are reserved for their respective weeks.

**Question 1:** Suppose a technological advance allows wheat farmers to produce more wheat with the same amount of land and labor. Draw or describe how this affects the market for wheat. Which curve shifts, in which direction, and what happens to equilibrium price and quantity?

**Question 2:** The price of coffee rises sharply. Explain what might cause this price increase using supply and demand analysis. What would cause a shift in the demand curve for coffee versus a movement along the demand curve?

**Question 3:** A government announces it will ban the import of a particular good. Using supply and demand, explain how this policy affects the equilibrium price and quantity of that good in the domestic market.

**Question 4:** At a farmers' market, apples are selling for $2 per pound and 50 pounds are sold. An economist observes that at $3 per pound, vendors would be willing to supply 80 pounds, but consumers would only want 30 pounds. Identify whether this represents a shortage or surplus, and explain what pressure this puts on price.

**Question 5:** Two goods are complements (they are often consumed together, like peanut butter and jelly). If the price of peanut butter falls, what happens to the demand for jelly, and how does this affect the equilibrium in the jelly market?

## Summary

Since your exam date was not provided, this study plan covers all five weeks of your syllabus sequentially: Supply and Demand, Elasticity, Consumer Choice, Costs of Production, and Perfect Competition. The five practice questions for Week 1 focus exclusively on foundational supply and demand concepts—equilibrium, shifts versus movements along curves, market pressures, and how one market's changes affect related markets—without overlapping into elasticity or later topics.

Test 3:
## Study Plan

| Week | Study Period | Topics |
|------|--------------|--------|
| Week 1 | Oct 4–10 | Cell structure; Lab safety quiz |
| Week 2 | Oct 11–20 | Membrane permeability |

*Note: From today (2026-10-04) to the exam date (2026-10-20) is 16 days, which equals 2 full weeks. This study plan covers each week's assigned topics from the syllabus.*

## Week 1 Practice Questions

**Question 1:** Describe the major structural components of a eukaryotic cell and explain the primary function of each organelle.

**Question 2:** What is the role of the cell membrane in protecting the cell, and what is its basic structural composition?

**Question 3:** A microscope slide shows an unknown cell type. What observable features would allow you to determine whether it is a prokaryotic or eukaryotic cell?

**Question 4:** Explain why the nucleus is considered the "control center" of the cell. What role does it play in directing cellular activity?

**Question 5:** Before performing a Week 1 lab procedure, what are the three most important items covered in a standard lab safety quiz, and why is each one critical?

## Summary

This study plan covers BIO 101 for the 2-week period leading to your exam on 2026-10-20. Week 1 focuses on cell structure and the required lab safety quiz, while Week 2 addresses membrane permeability—the subsequent topic in your syllabus. The five practice questions are designed to test foundational understanding of cellular anatomy and lab safety protocols before you advance to more complex topics.
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