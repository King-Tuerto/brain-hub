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

| Week | Dates | Topic | Focus |
|------|-------|-------|-------|
| Week 1 | Oct 4–11 | Supply and demand | Fundamental concepts of supply, demand, equilibrium, and price mechanisms |
| Week 2 | Oct 11–18 | Market structures | Competitive and non-competitive market types |
| Week 3 | Oct 18–25 | Elasticity | Price elasticity of supply and demand, and cross-price elasticity |
| Week 4 | Oct 25–Nov 1 | Consumer choice | Utility, preferences, and budget constraints |
| Week 5 | Nov 1–8 | Costs of production | Fixed costs, variable costs, and marginal cost analysis |
| Week 6 | Nov 8–12 | Perfect competition | Firm and industry behavior under perfect competition |

Your exam is scheduled for November 12, 2026. This plan covers all six weeks from your syllabus, with your final week ending on your exam date.

---

## Practice Questions

**Question 1:** If the price of coffee increases while the price of tea remains constant, and assuming no change in consumer preferences, what would you expect to happen to the quantity of tea demanded?

A) The quantity of tea demanded would increase.  
B) The quantity of tea demanded would decrease.  
C) The quantity of tea demanded would remain unchanged.  
D) The effect on tea demand cannot be determined without knowing the supply curve for tea.

---

**Question 2:** A new agricultural technology allows farmers to grow tomatoes with fewer resources. Assuming demand for tomatoes does not change, what would happen to the equilibrium price and quantity of tomatoes?

A) Price would increase; quantity would increase.  
B) Price would decrease; quantity would increase.  
C) Price would increase; quantity would decrease.  
D) Price would decrease; quantity would decrease.

---

**Question 3:** Which of the following would cause a movement along a demand curve rather than a shift of the entire demand curve?

A) Consumer income increases.  
B) Consumer preferences shift toward the product.  
C) The price of the product decreases.  
D) The number of consumers in the market increases.

---

**Question 4:** At a price of $10 per unit, the quantity demanded equals 500 units and the quantity supplied equals 200 units. Which of the following is true?

A) The market is in equilibrium, so no change will occur.  
B) A shortage exists, and the price will tend to rise.  
C) A surplus exists, and the price will tend to fall.  
D) The demand curve has shifted to the left.

---

**Question 5:** An increase in the price of steel (a key input for manufacturing) would most directly cause which of the following?

A) The demand curve for steel to shift left.  
B) A movement up and to the left along the supply curve for steel-based products.  
C) The supply curve for steel-based products to shift left.  
D) An increase in consumer demand for steel-based products.

---

## Summary

These five questions test core supply-and-demand concepts: substitute goods, supply shifts from technology, demand curve movements, market equilibrium with surplus/shortage, and input cost effects on supply. Each question and answer option is confined to Week 1 topics and does not reference market structures, elasticity measures, consumer preferences beyond simple substitution, production costs, or market types—all of which appear in later weeks.

Test 2:
## Study Plan

| Week | Topics | Status |
|------|--------|--------|
| Week 1 | Cell structure and organelles | Current |
| Week 2 | Cell membranes and transport | Upcoming |
| Week 3 | Enzymes | Upcoming |
| Week 4 | Cellular respiration | Upcoming |

**Note:** Week numbers are used instead of a specific exam date because no exam date was provided. This plan covers all four weeks listed in your syllabus in order.

## Practice Questions

**Question 1:** Which organelle is the primary site of protein synthesis in eukaryotic cells?
- A) Mitochondrion
- B) Ribosome
- C) Golgi apparatus
- D) Nucleus

**Question 2:** A cell biologist observes two types of cells under a microscope. One cell contains a nucleus enclosed within a nuclear membrane, while the other cell has no such membrane-bound nucleus. The cell lacking a nucleus membrane is most likely:
- A) A eukaryotic cell
- B) A prokaryotic cell
- C) A plant cell
- D) A fungal cell

**Question 3:** Which of the following is a double-membrane organelle found in eukaryotic cells?
- A) Ribosome
- B) Centriole
- C) Mitochondrion
- D) Nucleolus

**Question 4:** Rough endoplasmic reticulum (Rough ER) differs structurally from smooth endoplasmic reticulum (Smooth ER) because:
- A) Rough ER contains attached ribosomes
- B) Rough ER is only found in plant cells
- C) Smooth ER contains DNA
- D) Rough ER is surrounded by a double membrane

**Question 5:** Which organelle would you expect to find in a typical plant cell but not in a typical animal cell?
- A) Mitochondrion
- B) Nucleus
- C) Chloroplast
- D) Ribosome

## Summary

This study plan covers four weeks of cell biology, starting with cell structure and organelles (Week 1), and the practice questions focus solely on Week 1 concepts including organelle identification, prokaryotic versus eukaryotic cell structures, and the structural characteristics that distinguish different cell types. All five questions have been verified to remain within Week 1 topics without referencing cell membranes, transport, enzymes, or respiration.

Test 3:
## Study Plan

| Week | Topics | Study Period |
|------|--------|--------------|
| Week 1 | Business model canvas, Value proposition | Oct 4–10 |
| Week 2 | Customer discovery | Oct 11–17 |
| Exam week | Review (exam: Oct 21) | Oct 18–21 |

**Note:** Your exam is in 17 days. Your syllabus covers 10 weeks of material, so your course covers material that extends beyond your exam date. This study plan covers the material through the week your exam occurs.

---

## Practice Questions

**Question 1:** Which of the following best describes the primary purpose of a business model canvas?
- A) To provide a visual, one-page representation of how a business creates, delivers, and captures value
- B) To list all the features and specifications of a product
- C) To outline the legal structure of a company
- D) To detail the financial statements and balance sheets

**Question 2:** A value proposition should primarily answer which of the following questions?
- A) How much will the product cost?
- B) What problem does the product solve, and why is that solution valuable to the customer?
- C) Who are the company's competitors?
- D) What marketing channels will be used to reach customers?

**Question 3:** The Business Model Canvas is divided into nine building blocks. Which of the following is NOT one of those nine blocks?
- A) Key Partners
- B) Revenue Streams
- C) Manufacturing Timeline
- D) Customer Relationships

**Question 4:** A strong value proposition should be:
- A) As lengthy and detailed as possible
- B) Written from the company's perspective about what it wants to sell
- C) Clear, specific, and focused on the customer benefit or problem solved
- D) Generic enough to appeal to all possible customers

**Question 5:** The Business Model Canvas's "Key Activities" block refers to:
- A) The target customer segments for the business
- B) The most important activities the company must perform to deliver its value proposition
- C) The marketing and advertising activities the company will undertake
- D) The financial projections for each quarter

---

### Question Verification Against Week 1 Topics

✓ **Question 1** — Tests understanding of the Business Model Canvas definition and purpose (Week 1 core topic). All answer options address Week 1 concepts only.

✓ **Question 2** — Tests understanding of value proposition core definition (Week 1 core topic). All answer options remain within Week 1.

✓ **Question 3** — Tests knowledge of the nine building blocks within the Business Model Canvas (Week 1 core topic). Answer option C (Manufacturing Timeline) is not a block; the actual blocks are Customer Segments, Value Propositions, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, and Cost Structure. All options use Week 1 vocabulary.

✓ **Question 4** — Tests characteristics of an effective value proposition (Week 1 core topic). All answer options remain within value proposition fundamentals.

✓ **Question 5** — Tests knowledge of Business Model Canvas terminology, specifically "Key Activities" (Week 1 core topic). All answer options use only Week 1 concepts.

---

## Summary

This study plan allocates 7 days for Week 1 topics (Business Model Canvas and Value Proposition) before your exam on October 21, followed by a week covering Customer Discovery, then review days. The five practice questions test foundational understanding of the business model canvas framework and value proposition development—core Week 1 competencies that lay the groundwork for later weeks' material.
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