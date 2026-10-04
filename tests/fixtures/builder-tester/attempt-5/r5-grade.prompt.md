You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all about topics from the first week only. No question, including its answer options, may mention, preview, or require understanding of any topic from week 2 or later — not even as an "introduction to" a later topic, as background needed to answer, or as the scenario or framing the question is built around (for example, a comparison to a later topic, or a situation that assumes it).
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan only, with no question — including any multiple-choice answer options — mentioning, framing, or depending on any topic from week 2 or later.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not invent or guess one. It builds the plan using week numbers instead of dates and tells the student it did so because no exam date was given.
>>>

The test cases (written before the tool was run):
<<<
### Test 1: normal use

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; Week 4: Consumer choice; Week 5: Costs of production; Week 6: Perfect competition`
- **Exam date:** `2026-11-12`

**Expected**
- [ ] [A1] The Study Plan shows calendar dates, not just week numbers.
- [ ] [A1] The first entry covers today (2026-10-04) or the week that contains it.
- [ ] [A1] The last entry is the week that contains 2026-11-12. No entry comes after that week.
- [ ] [A1] There are no missing weeks between the first and last entry. That means 6 entries if weeks start on Sunday 2026-10-04, or 7 if the plan uses Monday-to-Sunday weeks and counts this partial week.
- [ ] [A3] Every topic named in the plan is one of the six syllabus topics. No outside topics are added, such as "Monopoly", "GDP" or "Game theory".
- [ ] [A3] The topics appear in syllabus order: Supply and demand, Market structures, Elasticity, Consumer choice, Costs of production, Perfect competition.
- [ ] [A4] The Practice Questions section has exactly 5 questions. Count them.
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic. No question or answer option mentions or previews a later topic, including as an "introduction to" it. No question is framed around a later topic, such as a comparison to it or a scenario that assumes it, and no question needs knowledge of a later topic to answer. For example, no question asks how "elastic" demand is, no answer option says "elastic", and no question is set in a monopoly or a perfectly competitive market.
- [ ] [A5] The very last section of the answer is titled Summary. Nothing else comes after it.
- [ ] [Order] The sections come in this order: Study Plan, Practice Questions, Summary.

### Test 2: edge case, optional input left blank

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Cell structure and organelles; Week 2: Cell membranes and transport; Week 3: Enzymes; Week 4: Cellular respiration`
- **Exam date:** leave blank

**Expected**
- [ ] [A2] The Study Plan entries are labelled by week number, such as Week 1 to Week 4. They have no calendar dates.
- [ ] [A2] The answer says clearly that it used week numbers because no exam date was given.
- [ ] [A2 / Blank inputs] The answer never states or guesses an exam date anywhere. That includes "assuming your exam is on …" and "probably in December".
- [ ] [A3] All four topics appear in this order: Cell structure and organelles, Cell membranes and transport, Enzymes, Cellular respiration. No topic is added that is not in the syllabus, such as photosynthesis or DNA replication.
- [ ] [A4] The Practice Questions section has exactly 5 questions.
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration. No question or answer option mentions or previews those later topics, including as an "introduction to" them. No question is framed around them, such as a comparison to them or a scenario that assumes them, and none needs knowledge of them to answer. For example, no question asks what the mitochondria do in cellular respiration, or how things cross the cell membrane, and no answer option says "produces ATP through respiration" or "makes enzymes".
- [ ] [A5] The answer ends with a Summary section.

### Test 3: tricky case, a long syllabus and an exam that is only a few weeks away

**Inputs to type**
- **Paste your class syllabus:** `Week 1: Business model canvas, Value proposition; Week 2: Customer discovery; Week 3: Lean startup and MVPs; Week 4: Competitive analysis; Week 5: Pricing strategy; Week 6: Go-to-market; Week 7: Unit economics; Week 8: Fundraising basics; Week 9: Pitch decks; Week 10: Scaling and growth`
- **Exam date:** `2026-10-21`

**Expected**
- [ ] [A1] The plan shows calendar dates and ends with the week that contains 2026-10-21. It has 3 entries, or 4 if it uses Monday-to-Sunday weeks and counts this partial week. It does not run on to 10 weeks just because the syllabus has 10.
- [ ] [A1] The first entry covers today (2026-10-04) or the week that contains it, and no week is skipped.
- [ ] [A3] Every topic named comes from the syllabus. No topic is invented.
- [ ] [A3] Topics appear in syllabus order. "Business model canvas" comes before "Value proposition", which comes before "Customer discovery", and so on. A later topic never appears in an earlier week than one that comes before it in the syllabus.
- [ ] [A4] The Practice Questions section has exactly 5 questions, even though the syllabus is long.
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later. No question or answer option mentions or previews a later topic, including as an "introduction to" it. No question is framed around a later topic, such as a comparison to it or a scenario that assumes it, and none needs knowledge of one to answer. For example, no question asks you to test a value proposition with customer interviews, build an MVP or set a price, no answer option says "run customer interviews" or "check competitors", and no question is set in a startup that is pitching investors.
- [ ] [A5] The answer ends with a Summary section.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

| Week | Study Period | Topic |
|------|--------------|-------|
| Week 1 | Oct 4–10 | Supply and demand |
| Week 2 | Oct 11–17 | Market structures |
| Week 3 | Oct 18–24 | Elasticity |
| Week 4 | Oct 25–31 | Consumer choice |
| Week 5 | Nov 1–7 | Costs of production |
| Week 6 | Nov 8–14 (Exam: Nov 12) | Perfect competition |

Your exam on November 12 falls within Week 6, and your syllabus covers exactly 6 weeks, providing one week for each topic before the exam.

## Practice Questions

**Question 1:** In a competitive market for coffee, the price of coffee beans (a key input in coffee production) increases. Assuming demand for coffee remains constant, what happens to the market equilibrium?

A) Both the equilibrium price and quantity of coffee decrease  
B) Both the equilibrium price and quantity of coffee increase  
C) The equilibrium price increases and the equilibrium quantity decreases  
D) The equilibrium price decreases and the equilibrium quantity increases

**Question 2:** A summer heat wave causes consumers to dramatically increase their purchases of bottled water at every price level. Which of the following best describes what happens in the bottled water market?

A) Demand increases, causing the equilibrium price to fall  
B) Demand increases, causing the equilibrium price to rise and equilibrium quantity to rise  
C) Supply increases, causing both equilibrium price and quantity to rise  
D) Supply decreases, causing equilibrium price to rise

**Question 3:** At the current market price of $5 per gallon, a gas station has 500 gallons of gasoline it wants to sell, but consumers only want to buy 300 gallons. What is this situation called, and what would you expect to happen to price?

A) A shortage; the price should increase  
B) A shortage; the price should decrease  
C) A surplus; the price should increase  
D) A surplus; the price should decrease

**Question 4:** Suppose a frost destroys much of the orange crop in Florida, but consumer preferences for orange juice do not change. What is the most likely result in the orange juice market?

A) A decrease in demand, leading to lower prices  
B) An increase in supply, leading to higher prices  
C) A decrease in supply, leading to higher prices  
D) An increase in demand, leading to lower prices

**Question 5:** At a price of $20 per ticket, a concert venue would be willing to sell 2,000 seats, but customers only want to buy 1,500 seats at that price. If the price falls to $15 per ticket, customers want to buy 2,000 seats. This scenario illustrates which fundamental economic principle?

A) The law of supply: lower prices lead sellers to supply less  
B) The law of demand: lower prices lead buyers to purchase more  
C) The law of supply: lower prices lead sellers to supply more  
D) Price floor effects on market behavior

## Summary

Your study plan spans 6 weeks, aligning your syllabus topics with your November 12 exam date. The 5 practice questions test core Week 1 concepts—the law of supply, the law of demand, market equilibrium, and the roles of shifts in supply and demand—using realistic scenarios grounded entirely within supply-and-demand analysis.

Test 2:
## Study Plan

Since no exam date was provided, this study plan uses week numbers based on your syllabus.

| Week | Topics |
|------|--------|
| Week 1 | Cell structure and organelles |
| Week 2 | Cell membranes and transport |
| Week 3 | Enzymes |
| Week 4 | Cellular respiration |

**Note:** Week numbers are used because your exam date was not specified.

## Practice Questions

**Question 1:** In eukaryotic cells, which membrane-bound organelle contains the cell's DNA?

a) Nucleus  
b) Mitochondria  
c) Chloroplast  
d) Ribosome  

**Correct answer:** a) Nucleus

---

**Question 2:** Which of the following is found in plant cells but NOT typically found in animal cells?

a) Mitochondria  
b) Nucleus  
c) Chloroplast  
d) Ribosome  

**Correct answer:** c) Chloroplast

---

**Question 3:** Prokaryotic cells differ from eukaryotic cells in that prokaryotic cells:

a) Contain a true nucleus  
b) Lack membrane-bound organelles  
c) Contain chloroplasts  
d) Are always larger than eukaryotic cells  

**Correct answer:** b) Lack membrane-bound organelles

---

**Question 4:** Which organelle is primarily responsible for packaging and transporting proteins in eukaryotic cells?

a) Endoplasmic reticulum  
b) Golgi apparatus  
c) Lysosome  
d) Nucleus  

**Correct answer:** b) Golgi apparatus

---

**Question 5:** The double-membrane structure that surrounds the nucleus is called:

a) The cell wall  
b) The cytoplasm  
c) The nuclear envelope  
d) The mitochondrial membrane  

**Correct answer:** c) The nuclear envelope

---

## Summary

This study plan covers all four weeks of your syllabus using week numbers because no exam date was provided. The five practice questions focus exclusively on Week 1 topics (cell structure and organelles), testing your understanding of organelle identification, their distribution across cell types, and basic structural features of the cell.

Test 3:
## Study Plan

Your exam date (2026-10-21) is 17 days away. Your syllabus includes 10 weeks of content, but your exam window covers only **approximately 3 weeks** of material before the exam date. Your study plan should prioritize the following timeline:

| Period | Topics |
|--------|--------|
| **Week 1 (Oct 4–10)** | Business model canvas, Value proposition |
| **Week 2 (Oct 11–17)** | Customer discovery |
| **Week 3/Exam Week (Oct 18–21)** | Lean startup and MVPs — *exam on Oct 21* |

**Note:** Your full syllabus contains 10 weeks of topics, but only 3 weeks fit between today and your exam date. Focus your preparation on these three weeks and plan additional study time for Weeks 4–10 if the exam scope expands or if you have finals after this exam.

---

## Practice Questions

**Question 1:** The Business Model Canvas is a strategic framework that organizes business logic into distinct building blocks. How many building blocks comprise the complete Business Model Canvas?

A) 7  
B) **9** ✓  
C) 11  
D) 6

**Question 2:** In the Business Model Canvas, which building block specifically identifies and describes the different groups of people or organizations that the company intends to serve?

A) Value Proposition  
B) **Customer Segments** ✓  
C) Channels  
D) Revenue Streams

**Question 3:** A company's value proposition should be built around which of the following?

A) Maximizing the company's total available revenue streams  
B) **Articulating the unique benefits and solutions the company offers to its target customers** ✓  
C) Listing the key resources and assets the company currently owns  
D) Describing the internal organizational structure

**Question 4:** In the Business Model Canvas, the "Channels" building block primarily describes:

A) The types of customers the company serves  
B) **The methods and routes through which the company reaches and communicates with its customers** ✓  
C) The agreements and partnerships with external organizations  
D) The profit margins and financial returns the company generates

**Question 5:** Which of the following characteristics is most essential to an effective value proposition?

A) It applies equally to all possible customer groups without any modifications  
B) It focuses primarily on the company's internal processes and operations  
C) **It clearly and compellingly explains the value and specific benefits the business delivers** ✓  
D) It incorporates the company's complete cost structure and financial projections

---

## Summary

This study plan covers your exam window of 17 days (Oct 4–21, 2026), prioritizing the first three weeks of your 10-week syllabus: Business Model Canvas and Value Proposition (Week 1), followed by Customer Discovery (Week 2) and Lean Startup/MVPs (Week 3). The five practice questions test your foundational knowledge of the Business Model Canvas framework—including its nine building blocks, customer segmentation, value proposition design, channels, and revenue streams—using only concepts from Week 1 material.
>>>

Results: a table with columns Test | Check | Result | Evidence. One row per expected check in every test. Result is PASS or FAIL. Evidence is a short quote or description from that answer (under 20 words), or "missing". If an answer for a test is missing, every check in that test is FAIL with evidence "answer missing".

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