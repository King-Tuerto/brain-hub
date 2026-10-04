You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all based only on the first week's topics.
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan.
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
- [ ] [A4] All 5 questions are about supply and demand. None of them is about elasticity, market structures or any later topic.
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
- [ ] [A4] All 5 questions are about cell structure and organelles. None is about membranes, enzymes or respiration.
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
- [ ] [A4] All 5 questions are about the business model canvas or the value proposition, the first week's two topics. None is about customer discovery or anything later.
- [ ] [A5] The answer ends with a Summary section.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

You have six weeks from today until your exam on November 12, which aligns perfectly with your six-week syllabus. Here's your week-by-week study schedule:

| Week | Dates | Topic |
|------|-------|-------|
| Week 1 | Oct 4–10 | Supply and Demand |
| Week 2 | Oct 11–17 | Market Structures |
| Week 3 | Oct 18–24 | Elasticity |
| Week 4 | Oct 25–31 | Consumer Choice |
| Week 5 | Nov 1–7 | Costs of Production |
| Week 6 | Nov 8–12 | Perfect Competition |

**Study approach:** Dedicate each week to learning and practicing that week's topic. By the end of each week, review the previous week's material to build cumulative knowledge. During Week 6, focus on practice exams and synthesis across all topics.

## Practice Questions

Based on Week 1 (Supply and Demand), here are five practice questions:

1. **Demand shift scenario:** If consumer income increases, how would this affect the demand curve for a normal good? Explain what happens to equilibrium price and quantity.

2. **Supply and demand equilibrium:** Define market equilibrium and explain why markets tend to move toward equilibrium price. What role do shortages and surpluses play in this process?

3. **Price ceiling/floor effects:** A government imposes a price ceiling on a good below the equilibrium price. What unintended consequences could result, and which groups are helped or hurt by this policy?

4. **Determinants of supply:** Name three factors that could shift the supply curve for agricultural products and explain the direction of each shift.

5. **Elasticity introduction:** If the price of a good increases and total revenue decreases, what does this tell you about the price elasticity of demand for that good? Explain why.

## Summary

This study plan spans six weeks leading up to your November 12 exam, covering one topic per week from your syllabus in sequence. The practice questions above focus on supply and demand fundamentals, testing your understanding of equilibrium, curves, and basic policy applications. Success requires active practice: work through these questions, apply concepts to real-world examples, and review each topic before moving to the next.

Test 2:
## Study Plan

Since your exam date is not provided, this plan uses week numbers from your syllabus to ensure comprehensive coverage of all topics.

| Week | Topic | Focus Areas |
|------|-------|------------|
| **Week 1** | Cell structure and organelles | Prokaryotic vs. eukaryotic cells; major organelles (nucleus, mitochondria, endoplasmic reticulum, Golgi apparatus, lysosomes, chloroplasts); cell wall vs. cell membrane; cytoplasm |
| **Week 2** | Cell membranes and transport | Phospholipid bilayer structure; selectively permeable membranes; passive transport (diffusion, osmosis); active transport; cell membrane proteins |
| **Week 3** | Enzymes | Enzyme structure and function; catalysts; factors affecting enzyme activity (temperature, pH, substrate concentration); enzyme inhibition |
| **Week 4** | Cellular respiration | Glycolysis; Krebs cycle; electron transport chain; ATP production; aerobic vs. anaerobic respiration |

**Study strategy:** Dedicate [X] hours per week. Review lecture notes and textbook sections on each topic, then complete the practice questions provided. Create flashcards for organelle functions and enzyme types.

---

## Practice Questions

**Based on Week 1: Cell structure and organelles**

1. A cell biologist observes a cell under a microscope and notes the presence of a membrane-bound nucleus, multiple mitochondria, and rough endoplasmic reticulum with attached ribosomes. Which type of cell is this most likely to be, and why would rough endoplasmic reticulum be abundant in this cell?

2. Describe the key structural differences between a prokaryotic cell and a eukaryotic cell. What advantages might the compartmentalization of organelles provide to a eukaryotic cell?

3. The Golgi apparatus is often described as the "packaging and shipping center" of the cell. Explain what structures it receives from other organelles and what role it plays in modifying and transporting materials.

4. A plant cell and an animal cell are placed in solutions with different salt concentrations. Explain how the presence of a cell wall in the plant cell would affect its response to a hypertonic solution compared to an animal cell's response.

5. Mitochondria are sometimes called the "powerhouses" of the cell. What is the relationship between mitochondrial structure (cristae, inner and outer membranes) and its function in ATP production?

---

## Summary

This study plan covers all four weeks of your syllabus using week-based milestones since no exam date was provided, with specific focus areas for each topic to guide your preparation. The practice questions for Week 1 emphasize the structural and functional relationships between organelles and cellular processes. Plan to revisit these questions throughout the semester as you progress through later topics, since many cellular functions depend on the foundational organelle knowledge from Week 1.

Test 3:
## Study Plan

**Note:** Your exam date of 2026-10-21 falls just 17 days from today (2026-10-04), which covers approximately 3 weeks. Your syllabus provides 10 weeks of material, so you have significantly more content than time available before the exam. This plan prioritizes the first three weeks of your syllabus in the order presented. You may need to review additional material after the exam or focus on high-impact topics for your specific exam format.

| Week | Topic | Study Focus |
|------|-------|------------|
| Week of Oct 4–10 | Business Model Canvas, Value Proposition | Understand the nine building blocks of the Business Model Canvas; practice articulating clear, compelling value propositions; review case studies of successful value propositions |
| Week of Oct 11–17 | Customer Discovery | Conduct at least one mock customer interview; document customer pain points and needs; practice active listening techniques and open-ended questioning |
| Week of Oct 18–21 (Exam Week) | Lean Startup and MVPs | Review the Build-Measure-Learn feedback loop; understand MVP scope and purpose; practice case studies of lean startups; final review and exam preparation |

---

## Practice Questions

**Week 1: Business Model Canvas & Value Proposition**

1. **Define a value proposition and explain why it is critical for a startup. What are the three key elements that make a value proposition compelling, and can you provide an example of each?**

2. **Using the Business Model Canvas framework, identify and explain the nine building blocks. Which three blocks do you think are most critical to validate first when testing a new business idea, and why?**

3. **You are launching a new service targeting [your target customer segment]. Articulate your value proposition in one sentence, then explain how each component directly addresses a specific pain point or gain for your customer.**

4. **Compare two companies in the same industry (e.g., Uber vs. traditional taxis, or Netflix vs. Blockbuster). How does each company's value proposition differ? What does the Business Model Canvas reveal about why one may have succeeded more than the other?**

5. **A startup has identified a potential customer problem but hasn't yet validated that customers care. How would you use the Business Model Canvas to systematically test whether there is a real market need before building a product?**

---

## Summary

This study plan condenses your 10-week entrepreneurship course into the three weeks before your 2026-10-21 exam, focusing on Business Model Canvas, value propositions, and customer discovery—the foundational concepts for startup strategy. The five practice questions test your ability to define, apply, and compare these core frameworks, preparing you for conceptual and analytical exam questions. You'll benefit from working through real company examples and conducting mock customer interviews to reinforce hands-on application.
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