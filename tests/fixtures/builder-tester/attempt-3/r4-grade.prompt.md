You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Study Plan Builder** — turns a pasted class syllabus into a week-by-week study plan, plus 5 practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus — required — long text. Example: "Week 1: Cell structure and organelles. Week 2: Membrane permeability and transport. Week 3-4: Respiration and photosynthesis..."
- Exam date — optional — text. Example: "2026-12-15"

**Output** (section headings, in order):
- **Study Plan** — one entry per week, from this week up to the exam date, naming only topics that appear in the pasted syllabus. No entry is an administrative item (a lab safety quiz, grading, office hours, the late-work policy), even if the syllabus schedules one for a particular week.
- **Week 1 Practice Questions** — exactly 5 questions, built only from the first week's topics that no later week already owns.
- **Summary** — the hub's standard closing section.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every whole week between today and the exam date (days between the two dates ÷ 7, rounded down), in order, starting from this week.
- A2: Every Study Plan entry is a study topic drawn from the pasted syllabus; none is an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy.
- A3: None of the five Week 1 Practice Questions asks about transport or selective passage through any membrane (for example, how nuclear pores let material move between the nucleus and the cytoplasm) when a later week's Study Plan entry already covers membrane permeability and transport.
- A4: Every Week 1 Practice Question about a cell organelle asks only about its shape, its parts, or where it sits in the cell — never about how it carries out or enables a function (such as how mitochondria make ATP, or how nuclear pores enable communication).
- A5: If the exam date is left blank, the Study Plan instead covers every topic in the syllabus, organized week by week, and the answer states that this is what was done because no exam date was given.
- A6: No Week 1 Practice Question is about an administrative item (such as a lab safety quiz), and none contains a bracket tag such as [unverified].

**Blank inputs:**
- Exam date left blank: the Study Plan is built from the syllabus alone, covering every topic in it organized week by week, and the answer says that is what it did because no exam date was given yet.
>>>

The test cases (written before the tool was run):
<<<
### Test 1 — normal use

**Inputs to type**
- Paste your class syllabus: "BIO 101 — Fall 2026. Week 1: Cell structure and organelles (nucleus, nuclear envelope and nuclear pores, mitochondria, ribosomes, endoplasmic reticulum, Golgi apparatus). Week 2: Membrane permeability and transport (diffusion, osmosis, active transport). Week 3: Enzymes and metabolism. Week 4: Cellular respiration. Week 5: Photosynthesis. Week 6: Cell cycle and mitosis. Week 7: Meiosis. Week 8: Mendelian genetics. Week 9: DNA structure and replication. Week 10: Transcription and translation. Week 11: Gene regulation. Grading: exams 60%, labs 25%, quizzes 15%. Office hours: Tuesdays 2–4pm. Late work loses 10% per day."
- Exam date: 2026-12-15

**Expected**
- [A1] The Study Plan has exactly 10 entries (72 days from 2026-10-04 to 2026-12-15, ÷ 7 = 10.3, rounded down to 10).
- [A1] Entries are in order and the first one is the current week (week of 2026-10-04), not a later week.
- [A2] Every entry names a topic from the pasted syllabus (cell structure, membrane transport, enzymes, respiration, etc.); none is a made-up topic.
- [A2] No entry is grading, office hours, or the late-work policy.
- [A3] Membrane permeability and transport appears as a later week (Week 2), and none of the 5 Week 1 questions asks about diffusion, osmosis, transport, or how nuclear pores let material move in or out of the nucleus.
- [A4] Any Week 1 question about an organelle (nucleus, mitochondria, Golgi, ER, ribosomes) asks only about its shape, its parts, or where it sits in the cell — none asks how it makes ATP, makes proteins, packages material, or enables communication.
- [A6] Exactly 5 Week 1 Practice Questions; none is about grading, office hours or late work; none contains a bracket tag like [unverified].
- Section headings appear in order: Study Plan, Week 1 Practice Questions, Summary.

### Test 2 — edge case, every optional input blank

**Inputs to type**
- Paste your class syllabus: "Intro Cell Biology. Week 1: Lab safety quiz; Cell structure and organelles — nucleus, nuclear pores, mitochondria, chloroplasts, vacuoles. Week 2: Membrane permeability and transport. Week 3-4: Respiration and photosynthesis. Week 5: Cell division. Late-work policy: no late labs accepted. Office hours by appointment."
- Exam date: leave blank

**Expected**
- [A5] The answer clearly states that, because no exam date was given, the plan covers every topic in the syllabus, organized week by week.
- [A5] Every syllabus study topic appears in the plan: cell structure and organelles, membrane permeability and transport, respiration, photosynthesis, cell division. None is missing.
- [A5] The plan is organized week by week (Weeks 3-4 may be one combined entry or split, but respiration and photosynthesis both appear).
- [A2] No entry is the lab safety quiz, the late-work policy, or office hours, even though Week 1 schedules the quiz.
- [A3] A later week covers membrane permeability and transport, and none of the 5 Week 1 questions asks about transport across a membrane or about material moving through nuclear pores.
- [A4] Organelle questions (nucleus, mitochondria, chloroplasts, vacuoles) ask only about shape, parts or location — none asks how mitochondria make ATP or how chloroplasts carry out photosynthesis.
- [A6] Exactly 5 Week 1 questions; none is about the lab safety quiz; no bracket tags like [unverified].
- The answer does not invent an exam date.

### Test 3 — tricky but fair: very short window, admin noise, overlapping topic

**Inputs to type**
- Paste your class syllabus: "Week 1: Lab safety quiz (must pass before any lab). Cell structure and organelles: nucleus, nuclear envelope, nuclear pores and how they control what enters and leaves the nucleus, mitochondria, rough and smooth ER. Week 2: Membrane permeability and transport — selective permeability, channels, pumps. Week 3: Respiration. Week 4: Photosynthesis. Grading policy and office hours are on Canvas."
- Exam date: 2026-10-24

**Expected**
- [A1] The Study Plan has exactly 2 entries (20 days from 2026-10-04 to 2026-10-24, ÷ 7 = 2.86, rounded down to 2) — not 3, and not the full 4-week syllabus.
- [A1] The 2 entries are in order, starting with this week: cell structure and organelles, then membrane permeability and transport.
- [A2] Neither entry is the lab safety quiz, grading, or office hours.
- [A3] Because Week 2 covers membrane permeability and transport, no Week 1 question asks how nuclear pores control what enters or leaves the nucleus, or anything about selective passage through any membrane — even though the syllabus lists that under Week 1.
- [A4] Organelle questions ask only about shape, parts or location (e.g. what the nuclear envelope is made of, where the rough ER sits) — none asks how mitochondria make ATP or how pores enable communication.
- [A6] Exactly 5 Week 1 questions; none is about the lab safety quiz; no bracket tags like [unverified].
- Respiration and photosynthesis (Weeks 3–4) do not appear as Study Plan entries, since they fall after the exam window.
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

| Week | Topic |
|------|-------|
| 1 | Cell structure and organelles |
| 2 | Membrane permeability and transport |
| 3 | Enzymes and metabolism |
| 4 | Cellular respiration |
| 5 | Photosynthesis |
| 6 | Cell cycle and mitosis |
| 7 | Meiosis |
| 8 | Mendelian genetics |
| 9 | DNA structure and replication |
| 10 | Transcription, translation, and gene regulation |

**Note:** The syllabus lists 11 weeks of topics, but the exam is 10 weeks away from today (October 4, 2026). I combined transcription, translation, and gene regulation into Week 10.

## Week 1 Practice Questions

1. Describe the major structures of a mitochondrion, including the outer membrane, inner membrane, cristae, and matrix. What is the shape and general organization of this organelle?

2. The nucleus contains several internal structures. List the major components visible in a nucleus and describe where each is typically located.

3. Explain the structural differences between rough and smooth endoplasmic reticulum. Where is each type typically found in the cell?

4. Describe the structural components of a ribosome and how it is organized.

5. Describe the key structural features of the Golgi apparatus and explain how it is arranged in relation to other organelles in the cell.

## Summary

This study plan breaks the 11-week BIO 101 syllabus into 10 weeks matched to your exam date of December 15, 2026. The Week 1 practice questions focus exclusively on organelle structure, shape, location, and composition—avoiding any functions that belong to later weeks, such as transport mechanisms (Week 2), respiration (Week 4), or protein synthesis (Week 10).

Test 2:
## Study Plan

Since your exam date was not provided, this study plan is organized directly from the syllabus by week, covering all academic topics:

- **Week 1:** Cell structure and organelles (nucleus, nuclear pores, mitochondria, chloroplasts, vacuoles)
- **Week 2:** Membrane permeability and transport
- **Week 3–4:** Respiration and photosynthesis
- **Week 5:** Cell division

Note: This plan covers only study topics from your syllabus. Administrative items such as the lab safety quiz, office hours, and the late-work policy are excluded.

## Week 1 Practice Questions

Note: These questions are based on standard introductory cell biology curriculum [unverified]. They focus exclusively on the structure of Week 1 organelles—their shapes, parts, and locations—and deliberately avoid functional concepts such as membrane transport, respiration, or photosynthesis, which belong to later weeks.

1. Describe the general shape of the nucleus in a typical animal cell and name the double-layered membrane structure that surrounds it.

2. What are nuclear pores, and in which cellular membrane are they located?

3. Mitochondria have two membranes. Describe the distinctive structural feature or pattern visible on the inner mitochondrial membrane.

4. Chloroplasts also have a double-membrane structure. Name the stacked internal membrane compartments found inside chloroplasts, and describe how they are organized.

5. In a mature plant cell, where is the large central vacuole typically located, and describe its size relative to the other structures in the cell.

## Summary

This study plan covers all academic topics from your Intro Cell Biology syllabus, organized by week from Week 1 through Week 5, since no exam date was provided. The five Week 1 practice questions focus exclusively on cellular structure and organelle morphology—shapes, parts, and locations—without addressing functions that your syllabus assigns to later weeks. These questions establish foundational knowledge of Week 1 material before progressing to functional concepts in subsequent weeks.

Test 3:
## Study Plan

Note: Based on the exam date of 2026-10-24 and today's date of 2026-10-04, there are 2 whole weeks until the exam (20 days ÷ 7 = 2.857, rounded down).

- **Week 1 (Oct 4–10):** Cell structure and organelles — nucleus, nuclear envelope, nuclear pores, mitochondria, rough endoplasmic reticulum, smooth endoplasmic reticulum
- **Week 2 (Oct 11–24):** Membrane permeability and transport (selective permeability, channels, pumps), cellular respiration, photosynthesis

## Week 1 Practice Questions

1. Describe the structure and location of the nucleus within the cell. What does the nuclear envelope look like, and what major features does it have?

2. What are nuclear pores? Describe their physical structure and how they are arranged on the nuclear envelope.

3. Describe the shape, size, and location of a mitochondrion. What structural features distinguish it from other organelles in the cell?

4. Describe the appearance of rough endoplasmic reticulum (rough ER). What gives it its characteristic appearance, and where in the cell is it located?

5. How does smooth endoplasmic reticulum (smooth ER) differ structurally from rough ER? Where would you find smooth ER in the cell, and what does it look like?

## Summary

This study plan distributes 4 weeks of syllabus content into 2 calendar weeks before the exam, with Week 1 focusing on the structural anatomy of the nucleus, mitochondria, and endoplasmic reticulum. The five practice questions test only structural and locational knowledge—shape, parts, and cellular positioning—while deliberately avoiding functional concepts (selective transport, ATP synthesis, and photosynthesis) that are reserved for later study weeks.
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