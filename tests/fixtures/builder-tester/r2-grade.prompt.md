You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all about topics from the first week only. No question may mention, preview, or require understanding of any topic from week 2 or later — not even as an "introduction to" a later topic or as background needed to answer.
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan only, with no question mentioning or depending on any topic from week 2 or later.
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
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic. No question mentions or previews a later topic, including as an "introduction to" it, and no question needs knowledge of a later topic to answer. For example, no question asks how "elastic" demand is.
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
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration. No question mentions or previews those later topics, including as an "introduction to" them, and none needs knowledge of them to answer. For example, no question asks what the mitochondria do in cellular respiration, or how things cross the cell membrane.
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
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later. No question mentions or previews a later topic, including as an "introduction to" it, and none needs knowledge of one to answer. For example, no question asks you to test a value proposition with customer interviews, build an MVP or set a price.
- [ ] [A5] The answer ends with a Summary section.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

| Week | Dates | Topic | Status |
|------|-------|-------|--------|
| Week 1 | Oct 4–10, 2026 | Supply and Demand | Starting now |
| Week 2 | Oct 11–17, 2026 | Market Structures | |
| Week 3 | Oct 18–24, 2026 | Elasticity | |
| Week 4 | Oct 25–31, 2026 | Consumer Choice | |
| Week 5 | Nov 1–7, 2026 | Costs of Production | |
| Week 6 | Nov 8–12, 2026 | Perfect Competition | *Exam: Nov 12* |

Your syllabus covers 6 weeks of material, which aligns perfectly with your exam date of November 12, 2026. Study each week's topic in order, and plan to review all material in the final week before your exam.

## Practice Questions

**Question 1:** A coffee shop observes that when it raises the price of espresso from $3 to $4 per cup, the quantity sold per day decreases from 150 cups to 120 cups. Explain what principle of supply and demand does this illustrate, and identify which curve (supply or demand) is relevant to this scenario.

**Question 2:** In the market for smartphones, suppose the equilibrium price is $500 and the equilibrium quantity is 100,000 units per month. If the price suddenly falls to $400, explain whether the market is in equilibrium, and describe what will happen to the quantity demanded and the quantity supplied.

**Question 3:** A farmer can produce either wheat or corn on their land. This year, the price of corn increases significantly, but the price of wheat stays the same. How would this price change affect the supply of wheat in the market, and why?

**Question 4:** A winter storm destroys a significant portion of the nation's orange crop. Using supply and demand concepts, explain what would happen to the equilibrium price and quantity of oranges in the market.

**Question 5:** The government imposes a price floor on milk at $4 per gallon, but the equilibrium price (without government intervention) is $3 per gallon. Explain whether this price floor creates a shortage or a surplus, and describe how suppliers and consumers might respond.

**Question Verification Against Week 1 Topics:**

- **Question 1:** ✓ Uses only supply and demand curves and basic market observation (Week 1 concept)
- **Question 2:** ✓ Tests equilibrium price and quantity, and the relationship between price and quantity demanded/supplied (Week 1 concepts)
- **Question 3:** ✓ Tests opportunity cost and shifts in supply curves due to price of alternative products (Week 1 concepts)
- **Question 4:** ✓ Tests how supply shocks affect equilibrium (Week 1 concepts)
- **Question 5:** ✓ Tests government price controls and resulting shortages/surpluses (Week 1 concepts)

All five questions are answerable using only Week 1 supply and demand material. None require concepts from elasticity (Week 3), consumer choice (Week 4), production costs (Week 5), or market structures (Week 2).

## Summary

This study plan maps all six weeks of your syllabus to the exam date of November 12, 2026, with supply and demand as your starting focus this week. The five practice questions test your understanding of fundamental supply and demand concepts—equilibrium, price movement, supply shifts, and government price controls—without requiring knowledge of material from Week 2 or beyond.

Test 2:
## Study Plan

Because no exam date was provided, this study plan uses week numbers to cover all four weeks from your syllabus:

| Week | Topics |
|------|--------|
| Week 1 | Cell structure and organelles |
| Week 2 | Cell membranes and transport |
| Week 3 | Enzymes |
| Week 4 | Cellular respiration |

You should spend roughly equal time on each week's material, dedicating time to reading, practice problems, and active recall of key concepts before moving to the next topic.

## Practice Questions

**Question 1:** Which of the following is a characteristic of eukaryotic cells but NOT prokaryotic cells?
- (a) Cell membrane
- (b) Ribosomes
- (c) Nucleus
- (d) Cytoplasm

**Question 2:** The mitochondria is an organelle found in eukaryotic cells. Which of the following best describes its location within the cell?
- (a) Within the nucleus
- (b) Attached to the cell membrane
- (c) Floating freely in the cytoplasm
- (d) Part of the cell wall

**Question 3:** What is the primary function of ribosomes in a cell?
- (a) Storing genetic material
- (b) Synthesizing proteins
- (c) Breaking down waste
- (d) Controlling cell division

**Question 4:** Name three organelles found in eukaryotic cells and briefly describe the primary role or location of each one.

**Question 5:** How do prokaryotic cells differ from eukaryotic cells in terms of internal organization? Name at least two key structural differences.

---

**Verification Check:** Each of the five questions above has been reviewed against Week 1's topics (Cell structure and organelles). All five questions are answerable using only Week 1 material and do not require or preview concepts from Week 2 (Cell membranes and transport), Week 3 (Enzymes), or Week 4 (Cellular respiration).

## Summary

These five practice questions focus on fundamental concepts from Week 1: distinguishing prokaryotic and eukaryotic cell types, identifying key organelles, understanding their basic roles, and describing cell structures. They are designed to build your foundational understanding before advancing to more complex topics like membrane structure and cellular processes in later weeks.

Test 3:
## Study Plan

Your exam is 2026-10-21, which is 17 days from today. This spans three weeks of your syllabus before the exam date. Note that your syllabus contains 10 weeks of material, but only the first three weeks fit into your study window.

| Study Period | Topics |
|---|---|
| **Week 1 (Oct 4–10)** | Business model canvas, Value proposition |
| **Week 2 (Oct 11–17)** | Customer discovery |
| **Week 3 (Oct 18–21)** | Lean startup and MVPs |

**Note:** Weeks 4–10 of your syllabus (Competitive analysis, Pricing strategy, Go-to-market, Unit economics, Fundraising basics, Pitch decks, Scaling and growth) fall after your exam date and are not included in this plan.

---

## Practice Questions

**Question 1:** You are launching an online coaching service. Your business model canvas shows that your key partners are established life coaches who lack technical skills, your key resources are the software platform and payment processing infrastructure, and your revenue stream comes from taking a 20% commission on each session booked. What is the primary purpose of including these specific elements in your business model canvas, and what does each element help you communicate to stakeholders?

**Question 2:** A co-founder argues that your software startup's value proposition should be "We build great technology." Explain why this is not an effective value proposition, and what would make it stronger instead.

**Question 3:** Your coffee subscription business has identified three different customer segments: busy professionals, students on a budget, and coffee enthusiasts who want rare single-origin beans. Should you use one value proposition for all three segments or develop different ones for each? Explain your reasoning.

**Question 4:** Look at the business model canvas as a system. Describe how a change to one block (such as your key partners) might require or influence changes to at least two other blocks on the canvas.

**Question 5:** You are presenting your value proposition to a potential investor. She says, "This sounds nice, but why would customers choose you over the competitor across the street?" Write a clear, concise answer that explains a strong value proposition and why it matters to investors and customers alike.

---

## Summary

This study plan covers the three weeks between today (2026-10-04) and your exam date (2026-10-21), focusing on business model canvas and value proposition from Week 1. The five practice questions test your understanding of the business model canvas structure, the difference between weak and strong value propositions, and how these foundational concepts work together in a business context.
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