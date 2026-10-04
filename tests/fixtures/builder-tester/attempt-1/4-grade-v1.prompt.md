You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Exam Study Planner** — turns a pasted class syllabus into a week-by-week study plan that ends with 5 practice questions on the first week's topics.

**Inputs:**
- **Syllabus** (paste your class syllabus) — required. Example: "Week 1: Intro & history. Week 2: Core theory. Week 3: Case studies. Week 4: Applications..."
- **Exam date** — not required. Example: `2026-12-10`

**Output:** The answer has exactly two sections, in this order:
1. **Study plan** — a week-by-week list of topics to cover, taken only from the pasted syllabus.
2. **Practice questions** — exactly 5 questions, all about the first week's topics only.

**Acceptance criteria:**
- A1: The answer has two sections in this order: "Study plan" then "Practice questions".
- A2: When an exam date is given, the study plan has one entry for every week between today and that date.
- A3: Every topic named in the study plan also appears in the pasted syllabus — none are invented.
- A4: The practice questions section has exactly 5 questions, and every one of them is about the first week's topics only.
- A5: When the exam date is left blank, the plan is still broken into weeks using the syllabus's own structure (its listed weeks or sessions), and the answer includes a note telling the student to add the exam date later for exact timing.

**Blank inputs:** If the exam date is left blank, the tool builds the plan around the weeks or sessions already listed in the syllabus instead of counting down to a date, ends with a general final-review week, and notes that adding the real exam date later will give exact week counts.
>>>

The test cases (written before the tool was run):
<<<
### Test 1: normal use

**Inputs to type**
- **Syllabus:** `Week 1: Supply and demand, market equilibrium. Week 2: Elasticity of demand. Week 3: Consumer choice and utility. Week 4: Production and costs. Week 5: Perfect competition. Week 6: Monopoly and pricing power. Week 7: Game theory and oligopoly. Week 8: Market failures and externalities.`
- **Exam date:** `2026-12-10`

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second, with nothing between or after them except an optional short note.
- [ ] [A2] The study plan has one entry for every week from the day you run it up to 2026-12-10. Before you check, count those weeks yourself on a calendar ([number of weeks]). No week is skipped and none is added after the exam date.
- [ ] [A3] Every topic in the study plan appears in the syllabus above, for example supply and demand, elasticity, monopoly or externalities. Topics that are not in the syllabus, such as "inflation" or "international trade", count as a fail.
- [ ] [A4] The practice questions section has exactly 5 questions. Count them.
- [ ] [A4] All 5 questions are about supply and demand or market equilibrium only. A question about elasticity or any later week is a fail.

### Test 2: edge case, with every optional input left blank

**Inputs to type**
- **Syllabus:** `Session 1: The Industrial Revolution in Britain. Session 2: Steam power and the factory system. Session 3: Urbanization and working conditions. Session 4: Labor movements and reform. Session 5: The spread of industry to Europe and the United States.`
- **Exam date:** leave blank

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second.
- [ ] [A5] The plan is still broken into weeks or sessions, and they follow the syllabus's own 5 sessions in the same order.
- [ ] [A5] The plan ends with a general final-review week.
- [ ] [A5] Somewhere in the answer there is a note telling the student to add the exam date later for exact timing.
- [ ] [A5] The answer does not make up an exam date or count down to one.
- [ ] [A3] Every topic in the plan comes from the 5 sessions above. The final-review week may say "review" but must not bring in new topics.
- [ ] [A4] There are exactly 5 practice questions, and all of them are about the Industrial Revolution in Britain (Session 1) only. A question about steam power, factories, cities or labor movements is a fail.

### Test 3: tricky but fair, a very short syllabus with an exam far away

**Inputs to type**
- **Syllabus:** `Week 1: Photosynthesis. Week 2: Cellular respiration.`
- **Exam date:** `2027-01-15`

**Expected**
- [ ] [A1] There are exactly two sections, "Study plan" first and "Practice questions" second.
- [ ] [A2] The study plan has one entry for every week from the day you run it up to 2027-01-15. Count those weeks on a calendar first ([number of weeks]). Expect many weeks, far more than 2.
- [ ] [A3] The extra weeks are filled only with photosynthesis, cellular respiration, or reviewing those two. A new biology topic that is not in the syllabus, such as "genetics", "mitosis" or "the nervous system", is a fail.
- [ ] [A4] There are exactly 5 practice questions, even though the syllabus is tiny.
- [ ] [A4] All 5 questions are about photosynthesis only. A question about cellular respiration, or one comparing the two processes, is a fail.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study plan

**Weeks of study available:** 9 weeks (October 4 – December 10, 2026)

| Week | Topics to study |
|------|-----------------|
| 1 | Supply and demand, market equilibrium |
| 2 | Elasticity of demand |
| 3 | Consumer choice and utility |
| 4 | Production and costs |
| 5 | Perfect competition |
| 6 | Monopoly and pricing power |
| 7 | Game theory and oligopoly |
| 8 | Market failures and externalities |
| 9 | Final review of all topics |

For each week, spend [X hours] on lectures or readings, then practice the topic with past papers or textbook problems. Allocate the final week for mixed review questions across all eight topics to identify weak areas before your exam.

## Practice questions

**Based on Week 1: Supply and demand, market equilibrium**

1. A market for coffee has the following characteristics: when price is $2, quantity demanded is 100 units and quantity supplied is 60 units. When price is $3, quantity demanded is 80 units and quantity supplied is 80 units. At what price is the market in equilibrium, and how many units are bought and sold?

2. Suppose the demand for concert tickets increases because a popular artist announces a tour. How will this shift affect the equilibrium price and quantity of concert tickets in that market? (Assume supply remains constant.)

3. A drought reduces the supply of wheat significantly while demand stays constant. Using supply and demand analysis, predict whether equilibrium price will rise or fall, and explain your reasoning.

4. In a market at equilibrium, the government imposes a price ceiling below the equilibrium price. What will happen to quantity demanded and quantity supplied, and will a shortage or surplus result?

5. Two goods are complements (e.g., hot dogs and hot dog buns). If the price of hot dog buns rises, what happens to the equilibrium price and quantity of hot dogs? Explain using supply and demand shifts.

## Summary

This study plan divides your 9 weeks of preparation into eight weeks covering each syllabus topic sequentially, followed by a final review week. Focus Week 1 on mastering the core concepts of supply, demand, and equilibrium before moving to more complex topics. Practice problems and past exams are essential for applying these principles to real-world scenarios.

Test 2:
## Study plan

**Week 1: The Industrial Revolution in Britain**
- Definition and timeline of the Industrial Revolution in Britain
- Geographic and economic conditions that enabled industrialization in Britain
- Key technological innovations and inventors of the period
- The transition from agrarian to industrial economy

**Week 2: Steam power and the factory system**
- Development of steam engine technology and its applications
- The factory system and mass production methods
- Working conditions in early factories
- Capital investment and business organization in manufacturing

**Week 3: Urbanization and working conditions**
- Urban growth and population migration patterns
- Living conditions in industrial cities
- Child labor and women in factories
- Social problems created by rapid urbanization

**Week 4: Labor movements and reform**
- Early labor organizations and trade unions
- Workers' movements for better conditions and pay
- Government regulations and labor reforms
- Key figures in labor reform movements

**Week 5: The spread of industry to Europe and the United States**
- Industrialization timeline in continental Europe
- Industrialization in the United States
- Differences in how industrialization spread across regions
- Global trade and economic impacts

**Week 6: Final review**
- Review all five sessions
- Practice full-length questions covering all topics
- Identify any weak areas and focus additional study there
- Note: Add your real exam date here for exact timing once you have it

---

## Practice questions

1. According to [historical sources](https://www.britannica.com/technology/Industrial-Revolution), what geographic advantages did Britain have that contributed to being the first nation to industrialize during the Industrial Revolution?

2. Describe the major social and economic changes that occurred in Britain as it transitioned from an agrarian society to an industrial one during the 18th and early 19th centuries.

3. [Unverified] Name three key technological innovations developed during the British Industrial Revolution and explain how each one contributed to increased manufacturing capacity.

4. What role did available capital and financial systems play in enabling British industrialization during this period?

5. How did the Industrial Revolution in Britain differ from industrialization that later occurred in other European nations and the United States?

---

## Summary

This six-week study plan guides you through the Industrial Revolution starting with Britain's early industrialization, then progressing through key topics—steam power, urbanization, labor movements—and concluding with how industrialization spread globally. Each week builds on previous concepts, with a final week reserved for comprehensive review and integration of all material. Add your exam date to the Week 6 section for precise timing.

Test 3:
## Study plan

**Week 1 (Oct 4–11):** Photosynthesis
- Overview and definition of photosynthesis
- Light-dependent reactions (thylakoid processes)
- Light-independent reactions (Calvin cycle)
- Photosynthetic pigments and the role of chlorophyll

**Week 2 (Oct 11–18):** Cellular respiration
- Overview and definition of cellular respiration
- Glycolysis
- Citric acid cycle (Krebs cycle)
- Electron transport chain and oxidative phosphorylation

**Week 3–4:** Deep dive into photosynthesis
- Detailed mechanisms of the light reactions
- Structure and function of the chloroplast
- Factors affecting photosynthetic rate

**Week 5–6:** Deep dive into cellular respiration
- Detailed mechanisms of each stage
- Energy yield (ATP production)
- Anaerobic respiration and fermentation

**Week 7–8:** Integration and comparisons
- Relationship between photosynthesis and cellular respiration
- How glucose produced in photosynthesis is used in respiration
- Role of both processes in energy flow in ecosystems

**Week 9–10:** Practice and applications
- Worked examples and calculations
- Real-world applications of both processes
- Problem-solving strategies

**Week 11–12:** Comprehensive review
- Review all photosynthesis topics
- Review all cellular respiration topics
- Identify areas needing additional focus

**Week 13:** Final integrated review
- Complete practice exam or comprehensive review session

**Week 14:** Last-minute review before exam (Jan 15, 2027)

## Practice questions

1. Define photosynthesis and identify its primary inputs (reactants) and outputs (products). What is the overall equation for photosynthesis, and where does each input come from?

2. Explain the difference between the light-dependent reactions and the light-independent reactions (Calvin cycle) of photosynthesis. Where do each of these processes occur within the chloroplast?

3. Describe the role of chlorophyll and accessory pigments in capturing light energy during photosynthesis. Why do plants appear green if chlorophyll is essential for photosynthesis?

4. Compare and contrast the structure and function of the thylakoid membrane and the stroma in relation to the two stages of photosynthesis.

5. How would a decrease in carbon dioxide concentration affect the rate of photosynthesis? Explain your answer using the Calvin cycle.

## Summary

This study plan spans 14 weeks from October 4, 2026, to your exam on January 15, 2027, covering two core topics: photosynthesis and cellular respiration. The plan begins with foundational concepts in weeks 1–2, progresses to deeper exploration in weeks 3–6, and concludes with integration, practice, and comprehensive review before your exam. The five practice questions focus exclusively on photosynthesis fundamentals to help you prepare for the first week of material.
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