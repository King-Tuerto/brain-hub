## Test plan

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | One entry per whole week from today (2026-10-04) to the exam date, in order, starting this week | Test 1, Test 3 |
| A2 | Every Study Plan entry is a syllabus study topic, never an admin item | Test 1, Test 2, Test 3 |
| A3 | No Week 1 question on membrane transport / selective passage (incl. nuclear pores) when a later week owns membrane permeability and transport | Test 1, Test 2, Test 3 |
| A4 | Week 1 organelle questions ask only about shape, parts or location, never about how it carries out or enables a function | Test 1, Test 2, Test 3 |
| A5 | Blank exam date: plan covers every syllabus topic week by week, and the answer says why | Test 2 |
| A6 | No Week 1 question about an admin item; no bracket tags such as [unverified] | Test 1, Test 2, Test 3 |

Every criterion is covered by at least one test.

## Test cases

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

## How to run them

1. Open the Study Plan Builder tool.
2. Run it once for Test 1: type exactly the inputs listed under Test 1, run it, and copy the whole answer.
3. Start a fresh run and do the same for Test 2 (leave Exam date blank), and copy the whole answer.
4. Start a fresh run and do the same for Test 3, and copy the whole answer.
5. Open a **new chat** — not the chat that built the tool.
6. Paste in "Tester 2 — grade", then this Spec, then these test cases, then the three answers, labelled "Test 1", "Test 2" and "Test 3".
7. Send it and read the grade.

## Summary

Three tests for the Study Plan Builder spec covering acceptance criteria A1–A6: a normal 10-week plan to a 2026-12-15 exam, a blank-exam-date case that must cover every syllabus topic and say why, and a short 2-week window to 2026-10-24 where nuclear-pore transport must not appear in Week 1 questions. Each test checks week counts, exclusion of admin items (lab safety quiz, grading, office hours, late work), organelle questions limited to shape/parts/location, and no bracket tags.
