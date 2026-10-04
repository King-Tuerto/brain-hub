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

Your exam on 2026-11-12 is [X] weeks away. Your syllabus contains exactly six weeks of material, and your exam falls during Week 6, so your study plan covers all assigned topics:

| Week | Dates | Topic |
|------|-------|-------|
| Week 1 | Oct 4–10 | Supply and demand |
| Week 2 | Oct 11–17 | Market structures |
| Week 3 | Oct 18–24 | Elasticity |
| Week 4 | Oct 25–31 | Consumer choice |
| Week 5 | Nov 1–7 | Costs of production |
| Week 6 | Nov 8–14 | Perfect competition |

Your exam is scheduled for 2026-11-12, which falls within Week 6. Focus on mastering supply and demand fundamentals this week before building to the more complex topics in subsequent weeks.

## Practice Questions

**Question 1:** According to the [law of demand](https://www.investopedia.com/terms/l/lawofdemand.asp), what is the relationship between the price of a good and the quantity consumers are willing to buy?

A) As price increases, the quantity demanded increases  
B) As price increases, the quantity demanded decreases  
C) Price has no effect on the quantity demanded  
D) Quantity demanded depends only on the availability of similar products

**Correct answer: B.** The law of demand establishes an inverse relationship: when price rises, quantity demanded falls, and when price falls, quantity demanded rises.

---

**Question 2:** Which of the following would cause an increase in the overall demand for coffee (shifting the entire demand curve to the right)?

A) A decrease in the price of coffee  
B) An increase in the price of tea, a substitute beverage  
C) A decrease in consumer incomes  
D) A decrease in the number of coffee drinkers

**Correct answer: B.** When the price of a substitute good (tea) increases, consumers shift their purchases toward the now-relatively-cheaper coffee, increasing demand for coffee. The other options either move along the demand curve (A) or decrease demand (C, D).

---

**Question 3:** Market equilibrium occurs at the point where:

A) Quantity demanded equals quantity supplied at a particular price  
B) The price reaches its maximum possible level  
C) All consumers who want the good can purchase it  
D) Supply is significantly greater than demand

**Correct answer: A.** [Market equilibrium](https://www.investopedia.com/terms/m/market-equilibrium.asp) is defined as the price and quantity at which the amount consumers wish to buy exactly equals the amount producers wish to sell, leaving no shortage or surplus.

---

**Question 4:** If the cost of raw materials used to produce bread increases, what would happen to the market supply of bread at each price level?

A) The supply of bread would increase  
B) The supply of bread would decrease  
C) The supply of bread would remain unchanged  
D) Demand for bread would decrease

**Correct answer: B.** An increase in input costs reduces the profitability of production at each price level, causing producers to supply less. This shifts the supply curve to the left (a decrease in supply).

---

**Question 5:** When the quantity of a good that consumers want to buy exceeds the quantity that producers are willing to sell at the current price, economists call this situation a:

A) Surplus  
B) Shortage  
C) Equilibrium  
D) Price floor

**Correct answer: B.** A [shortage](https://www.investopedia.com/terms/s/shortage.asp) occurs when quantity demanded is greater than quantity supplied. The opposite situation—when quantity supplied exceeds quantity demanded—is called a surplus.

## Summary

Your study plan spans six weeks leading up to your exam on 2026-11-12, with Week 1 focusing on supply and demand fundamentals. The five practice questions above test core concepts from Week 1 only—the law of demand, factors that shift demand curves, market equilibrium, how input costs affect supply, and the definitions of shortages. Master these topics before moving to market structures in Week 2.

Test 2:
## Study Plan

Since no exam date was provided, this plan uses week numbers to cover all weeks in your syllabus:

- **Week 1**: Cell structure and organelles
- **Week 2**: Cell membranes and transport
- **Week 3**: Enzymes
- **Week 4**: Cellular respiration

**Note:** Week numbers are used in this plan because you did not provide an exam date. Adjust the timeline based on when your exam is actually scheduled.

## Practice Questions

**Question 1: Which organelle contains multiple internal membrane systems called cristae?**

a) Rough endoplasmic reticulum  
b) Lysosome  
c) Mitochondrion  
d) Golgi apparatus  

**Correct answer:** c) Mitochondrion

---

**Question 2: What is the primary role of ribosomes in a cell?**

a) Storing genetic information  
b) Protein synthesis  
c) Breaking down cellular waste  
d) Packaging and modifying proteins  

**Correct answer:** b) Protein synthesis

---

**Question 3: Which of the following is a characteristic difference between prokaryotic and eukaryotic cells?**

a) Eukaryotic cells lack a cell membrane  
b) Prokaryotic cells do not have a nucleus  
c) Prokaryotic cells contain mitochondria  
d) Eukaryotic cells have no ribosomes  

**Correct answer:** b) Prokaryotic cells do not have a nucleus

---

**Question 4: The "rough" appearance of rough endoplasmic reticulum is due to the presence of which structures?**

a) Mitochondria  
b) Golgi apparatus  
c) Ribosomes  
d) Lysosomes  

**Correct answer:** c) Ribosomes

---

**Question 5: Which of the following is typically found inside the nucleus of a eukaryotic cell?**

a) Ribosomes and mitochondria  
b) DNA and the nucleolus  
c) Golgi apparatus and vesicles  
d) Lysosomes and endoplasmic reticulum  

**Correct answer:** b) DNA and the nucleolus

---

**Verification Note:** All five questions and every answer option (including incorrect options) are based exclusively on Week 1 topics (cell structure and organelles). No question, stem, or answer option references, previews, or requires knowledge of Week 2 or later topics.

## Summary

This study plan covers all four weeks of your syllabus using week numbers. The five practice questions focus on core Week 1 concepts—organelle structures, prokaryotic and eukaryotic cell differences, and the functions of key organelles—without requiring knowledge of transport, enzymes, or cellular respiration from later weeks.

Test 3:
## Study Plan

Based on your exam date of October 21, 2026, you have approximately 17 days to prepare. Your syllabus covers 10 weeks of material, but you have time for only the first 2–3 weeks before your exam.

**Week of October 4–10: Business Model Canvas & Value Proposition**
- Study the nine components of the Business Model Canvas: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, and cost structure
- Understand what constitutes a strong value proposition
- Practice applying the canvas to example businesses

**Week of October 11–17: Customer Discovery**
- Learn customer discovery approaches
- Connect customer segments to value propositions

**Week of October 18–21: Lean Startup & MVPs (partial coverage)**
- Introduction to lean startup principles
- Minimum viable product (MVP) fundamentals

**Important note:** Your syllabus contains 10 weeks of content, but the time between now and your exam is only about 2.4 weeks. You will need to prioritize Week 1 (Business Model Canvas and Value Proposition) as your primary exam focus.

## Practice Questions

**Question 1:** The Business Model Canvas consists of nine key components. Which of the following is NOT one of these nine blocks?
- A) Key Resources
- B) Revenue Streams
- C) Brand Identity
- D) Customer Relationships

**Correct answer:** C) Brand Identity

---

**Question 2:** Which statement best describes a value proposition?
- A) A clear description of the benefits and value your product or service provides to customers
- B) A comprehensive description of all the features included in your product
- C) The different revenue streams your business will generate
- D) A comprehensive list of all the strategic partners your company will work with

**Correct answer:** A) A clear description of the benefits and value your product or service provides to customers

---

**Question 3:** The Business Model Canvas's "Customer Segments" block refers to:
- A) The specific groups of people or organizations your business aims to serve
- B) The revenue streams associated with each type of customer
- C) The channels through which you will reach different customers
- D) The customer relationships you will build with each group

**Correct answer:** A) The specific groups of people or organizations your business aims to serve

---

**Question 4:** Which Business Model Canvas component describes the different methods through which your business reaches and delivers its products or services to customers?
- A) Channels
- B) Customer Relationships
- C) Key Partnerships
- D) Revenue Streams

**Correct answer:** A) Channels

---

**Question 5:** A business model's "Cost Structure" block should include:
- A) The total amount you will spend to operate your business
- B) The key resources you will need to acquire
- C) The channels you will use to distribute your products
- D) The value proposition you offer to customers

**Correct answer:** A) The total amount you will spend to operate your business

## Summary

These five practice questions test your understanding of the Business Model Canvas's nine components and the definition of a value proposition—the core topics of your first week. All questions and answer options are grounded in Week 1 material only, allowing you to assess mastery before moving to Week 2 (Customer Discovery) and beyond.
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