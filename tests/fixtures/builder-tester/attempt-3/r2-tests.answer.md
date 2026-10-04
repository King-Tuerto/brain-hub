## Test plan

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | With an exam date, exactly one Study Plan entry per whole week from run date to exam date (days ÷ 7, rounded down) | Test 1, Test 3 |
| A2 | Every Study Plan topic comes from the pasted syllabus | Test 1, Test 2, Test 3 |
| A3 | With no exam date, every syllabus topic is covered week by week, and the answer says no exam date was given | Test 2 |
| A4 | Each Week 1 question tests only Week 1 topics, never an overlapping later-week topic | Test 1, Test 2, Test 3 |
| A5 | Exactly five Week 1 Practice Questions | Test 1, Test 2, Test 3 |
| A6 | Weeks in order, starting from the current week | Test 1, Test 2, Test 3 |

**Before you start:** A1 depends on the day you run the tool. The expected counts below assume you run every test on **2026-10-04**. If you run on another day, recount: whole days from [your run date] to the exam date, divide by 7, round down. Write that number in place of the one given.

## Test cases

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

## How to run them

1. Open the Study Plan Builder tool in Brain Hub.
2. Run it once for **Test 1**: type exactly the inputs listed above (copy-paste them). Copy the whole answer it gives you.
3. Start the tool fresh and run it once for **Test 2** with exactly those inputs (leave Exam date empty). Copy the whole answer.
4. Start the tool fresh and run it once for **Test 3** with exactly those inputs. Copy the whole answer.
5. If you did not run on 2026-10-04, recount the A1 numbers for Tests 1 and 3 (days to the exam ÷ 7, rounded down) and fix them in the test cases before grading.
6. Open a **new chat** — not the chat that built the tool.
7. Paste "Tester 2 — grade" into it, then paste this Spec, these test cases, and the three answers, labelled **Test 1**, **Test 2** and **Test 3**.

## Summary

Three tests for the Study Plan Builder: a normal 6-week biology syllabus with an exam date, a blank-exam-date economics syllabus, and a messy out-of-order syllabus with an exam only 2 weeks away. Together they cover all six acceptance criteria, especially the whole-week count (A1), no outside topics (A2), and Week 1 questions that never drift into later-week topics (A4).
