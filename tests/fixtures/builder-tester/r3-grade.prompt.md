You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Study Plan Builder** — turns your pasted class syllabus, and an exam date if you have one, into a week-by-week study plan plus 5 practice questions on Week 1's topics.

**Inputs**
- Paste your class syllabus — required. Example: "Week 1: Cell structure & organelles. Lab safety quiz due Week 1. Week 2: Membrane permeability. Week 3: Cellular respiration. Week 4: Photosynthesis. Office hours Tuesdays 2-3pm. Late work policy: -10%/day."
- Exam date — not required. Example: "2026-12-15"

**Output** — sections in this order:
1. **Study Plan** — one entry per week, each naming only study topics from the syllabus.
2. **Week 1 Practice Questions** — exactly 5 questions built from Week 1's topics.
3. **Summary** — the hub's standard closing section.

**Acceptance criteria**
- A1: when an exam date is given, the Study Plan has exactly one entry per whole week from today until the exam date, in order, starting with this week.
- A2: every Study Plan entry names only topics that appear in the pasted syllabus, and never an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy, even if the syllabus schedules that item for a particular week.
- A3: Week 1 Practice Questions contains exactly 5 questions, each built only from Week 1 topics that are not already owned by a later week in the plan.
- A4: organelle questions in Week 1 Practice Questions test structure only (shape, parts, location) — never a process a later week owns, such as respiration (how mitochondria make ATP), photosynthesis (why chloroplasts matter), or the membrane's protective/barrier role when membrane permeability is a later week's topic — and no question contains a "do not discuss X" note or a leftover tag such as [unverified].
- A5: no question in Week 1 Practice Questions is about an administrative item, such as a lab safety quiz.
- A6: when no exam date is given, the Study Plan covers every topic in the syllabus, organized week by week, and says that's what it did because no exam date was given yet.

**Blank inputs**
- Exam date left blank: build the Study Plan from the syllabus alone, covering every topic in it organized week by week, and say that this is what was done because no exam date was given yet (see A6).
>>>

The test cases (written before the tool was run):
<<<
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
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

Based on the exam date of November 1, 2026, there are 4 whole weeks from October 4 to the exam. Here is the week-by-week study plan based on the syllabus:

- **Week 1 (October 4–10):** Cell structure & organelles (nucleus, mitochondria, chloroplasts, ribosomes)
- **Week 2 (October 11–17):** Membrane permeability and transport
- **Week 3 (October 18–24):** Cellular respiration
- **Week 4 (October 25–31):** Photosynthesis

## Week 1 Practice Questions

1. Describe the double-membrane structure of mitochondria, including the outer membrane, inner membrane, and the compartments they create.

2. Explain the structure of the nuclear envelope and describe how its pores enable selective communication between the nucleus and the cytoplasm.

3. Identify the locations where ribosomes are found in a cell and describe their basic structural composition.

4. List and describe the major structures found inside the nucleus, such as the nucleolus and chromatin.

5. Compare the structural organization of chloroplasts and mitochondria, focusing on the number and arrangement of their membranes.

## Summary

These five questions focus on the structural features of Week 1 organelles—nucleus, mitochondria, chloroplasts, and ribosomes—without introducing processes covered in later weeks. By building this structural foundation first, you'll be prepared to understand how these organelles function during cellular respiration (Week 3) and photosynthesis (Week 4).

Test 2:
## Study Plan

Note: No exam date was provided, so this study plan follows the syllabus directly, organized week by week:

- **Week 1:** Cell structure & organelles
- **Week 2:** Membrane permeability
- **Week 3:** Cellular respiration
- **Week 4:** Photosynthesis
- **Week 5:** Cell division (mitosis)

Note: Administrative items from the syllabus (Lab safety quiz, office hours, late work policy) are not included in the study plan, as it focuses on course content topics.

## Week 1 Practice Questions

1. What are the main structural differences between a prokaryotic cell and a eukaryotic cell?

2. Describe the structure of the nucleus in a eukaryotic cell, including what the nuclear envelope is and what it contains.

3. A mitochondrion has a distinctive double-membrane structure. Describe the outer membrane, inner membrane, and the compartments they create.

4. Describe the structure of a chloroplast, including how many membranes it has and its general internal organization.

5. Explain the structural difference between rough endoplasmic reticulum and smooth endoplasmic reticulum, and what causes the "rough" appearance.

## Summary

This study plan covers all topics from the syllabus organized by week. Since no exam date was provided, the plan follows the syllabus structure directly. The five Week 1 practice questions focus on cell and organelle structure, avoiding overlap with topics covered in later weeks.

Test 3:
## Study Plan

Note: I calculated 2 whole weeks from today (October 4, 2026) to your exam date (October 18, 2026): 14 days ÷ 7 = 2 weeks.

**Week 1 (October 4–10):** Cell structure and organelles—cell wall, nucleus, mitochondria, and chloroplasts

**Week 2 (October 11–17):** Membrane permeability

## Week 1 Practice Questions

1. Describe the composition and basic structural organization of a cell wall in plant cells.

2. Name and describe the major structural components of a nucleus, including the nuclear envelope and nucleolus, and explain how they are arranged.

3. Draw and label a mitochondrion, identifying the outer membrane, inner membrane, matrix, and cristae.

4. Sketch a chloroplast and describe how its outer membrane, inner membrane, thylakoids, and stroma are arranged.

5. Identify at least two structural features that mitochondria and chloroplasts share, such as their double-membrane organization or their internal compartments.

## Summary

You have 2 weeks until your exam. This study plan covers your syllabus in chronological order: Week 1 focuses on cell structure and organelles (cell wall, nucleus, mitochondria, and chloroplasts), while Week 2 covers membrane permeability. The practice questions address only structural features of Week 1 organelles, excluding topics like cellular respiration and photosynthesis that appear in later weeks of your syllabus.
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