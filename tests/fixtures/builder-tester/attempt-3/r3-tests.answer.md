## Test plan

| Test | What it checks | Criteria covered |
|---|---|---|
| Test 1: normal use | A realistic syllabus mixing topics with admin items, plus an exam date 4 weeks away | A1, A2, A3, A4, A5 |
| Test 2: optional input blank | Same kind of syllabus, exam date left blank | A2, A3, A4, A5, A6 |
| Test 3: tricky input | One messy run-on syllabus where Week 1 is mostly admin items, plus an exam date only 2 weeks away | A1, A2, A3, A4, A5 |

Every criterion (A1 to A6) is covered by at least one test.

## Test cases

### Test 1: normal use

**Inputs to type**
- Paste your class syllabus:
  "BIO 101 Syllabus. Week 1: Cell structure & organelles (nucleus, mitochondria, chloroplasts, ribosomes). Lab safety quiz due Week 1. Week 2: Membrane permeability and transport. Week 3: Cellular respiration. Week 4: Photosynthesis. Grading: 40% exams, 30% labs, 30% homework. Office hours Tuesdays 2-3pm. Late work policy: -10%/day."
- Exam date: [the date exactly 4 weeks from the day you run this, written as YYYY-MM-DD]

**Expected**
- [Order] Sections appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [A1] The Study Plan has exactly 4 week entries, in order, and the first one is this week.
- [A2] Each entry names only syllabus topics: cell structure/organelles, membrane permeability, cellular respiration, photosynthesis.
- [A2] No entry mentions the lab safety quiz, grading, office hours or the late-work policy, not even in Week 1.
- [A3] Week 1 Practice Questions has exactly 5 questions.
- [A3] Every question is about Week 1 topics (cell structure, organelles) only.
- [A4] Organelle questions ask about structure only: shape, parts, location.
- [A4] No question asks how mitochondria make ATP, why chloroplasts matter for photosynthesis, or how the membrane protects the cell or controls what gets in.
- [A4] No question contains a "do not discuss X" note or a leftover tag such as [unverified].
- [A5] No question is about the lab safety quiz or any other admin item.

### Test 2: every optional input left blank

**Inputs to type**
- Paste your class syllabus:
  "Intro Biology. Week 1: Cell structure & organelles. Lab safety quiz due Week 1. Week 2: Membrane permeability. Week 3: Cellular respiration. Week 4: Photosynthesis. Week 5: Cell division (mitosis). Office hours Thursdays 10-11am. Late work policy: -10%/day."
- Exam date: leave blank

**Expected**
- [Order] Sections appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [A6] The Study Plan covers all 5 syllabus topics, organized week by week (5 week entries).
- [A6] The answer clearly says it covered the whole syllabus because no exam date was given yet.
- [A6] The answer does not refuse, stall, or make up an exam date.
- [A2] No entry mentions the lab safety quiz, office hours or the late-work policy.
- [A3] Week 1 Practice Questions has exactly 5 questions, all on cell structure/organelles.
- [A4] No question drifts into membrane permeability or barrier role, respiration, photosynthesis or mitosis.
- [A4] No "do not discuss" notes or leftover tags such as [unverified].
- [A5] No question is about the lab safety quiz.

### Test 3: tricky but fair (messy, admin-heavy input, short time to exam)

**Inputs to type**
- Paste your class syllabus (paste as one single line, exactly like this):
  "week 1 - welcome + syllabus review; grading breakdown (exams 50%, labs 50%); lab safety quiz due fri; cell structure & organelles (cell wall, nucleus, mitochondria, chloroplasts); week 2 - membrane permeability; office hrs moved to wed 1-2pm; week 3 - cellular respiration; late work: -10%/day no exceptions; week 4 - photosynthesis"
- Exam date: [the date exactly 2 weeks from the day you run this, written as YYYY-MM-DD]

**Expected**
- [Order] Sections appear in this order: Study Plan, Week 1 Practice Questions, Summary.
- [A1] The Study Plan has exactly 2 week entries, in order, starting with this week. No Week 3 or Week 4 entry.
- [A2] The Week 1 entry names only cell structure/organelles. It does not list the welcome, syllabus review, grading breakdown or lab safety quiz, even though the syllabus puts them in Week 1.
- [A2] The Week 2 entry names membrane permeability, and not the office hours change.
- [A2] No entry mentions the late-work policy.
- [A3] Week 1 Practice Questions has exactly 5 questions, all on cell structure/organelles.
- [A4] No question is about the membrane's barrier or protective role (Week 2 owns membrane permeability).
- [A4] No question asks how mitochondria make ATP or why chloroplasts matter for photosynthesis. Organelle questions stick to shape, parts, location.
- [A4] No "do not discuss" notes or leftover tags such as [unverified].
- [A5] No question is about the lab safety quiz, grading or the syllabus review.

## How to run them

1. Open the Study Plan Builder.
2. Run it once for Test 1. Type the inputs exactly as listed (fill in the date placeholder with the real date). Copy the whole answer.
3. Start the tool fresh and do the same for Test 2. Copy the whole answer.
4. Start the tool fresh and do the same for Test 3. Copy the whole answer.
5. Open a **new chat**. Do not use the chat that built the tool.
6. Paste in "Tester 2 — grade", together with this Spec, these three test cases, and the three answers, labelled "Test 1", "Test 2" and "Test 3".

## Summary

Three tests for the Study Plan Builder spec: normal use with a 4-week exam date, a blank exam date that must cover the whole syllabus, and a messy admin-heavy syllabus with a 2-week exam date. They check week counts, removal of admin items such as the lab safety quiz, and that the 5 Week 1 practice questions test organelle structure only.
