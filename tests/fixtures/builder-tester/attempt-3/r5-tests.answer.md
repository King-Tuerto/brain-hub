## Test plan

Today is 2026-10-04 (a Sunday), so "this week" is Oct 4–10. Each calendar week below runs Sunday to Saturday, matching the Spec's example (Week 2 = Oct 11–17).

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | One calendar week per entry, syllabus order, starts this week, stops at the last whole week before the exam, later topics left out | Test 1, Test 3 (Test 2 also checks one-week entries) |
| A2 | No exam date: every topic covered, week by week, with a note saying why | Test 2 |
| A3 | No administrative items in the Study Plan | Test 1, Test 2, Test 3 |
| A4 | Exactly five Week 1 questions, none on a topic a later week owns | Test 1, Test 2, Test 3 |
| A5 | Organelle / membrane-bound structure questions ask structure only; no "topic I am avoiding" notes | Test 1, Test 2, Test 3 |
| A6 | No bracket tags such as `[unverified]` and no unsourced "standard curriculum" claim in the questions section | Test 1, Test 2, Test 3 |

## Test cases

### Test 1 — Normal use

**Inputs to type**
- *Paste your class syllabus:*
  `Grading: see the course page. Late-work policy: late work loses credit each day. Office hours: Tuesday afternoons. Week 1: Cell structure - nucleus, mitochondria, chloroplasts, endoplasmic reticulum, Golgi apparatus; microscopy basics. Week 2: Membrane structure and membrane transport (diffusion, osmosis, active transport). Oct 20: Lab safety quiz. Week 3: Enzymes and metabolism. Week 4: Cellular respiration. Week 5: Photosynthesis. Week 6: Cell cycle and mitosis. Week 7: Meiosis. Week 8: Mendelian genetics.`
- *Exam date:* `2026-11-20`

**Expected**
- [ ] [A1] The Study Plan has exactly 6 entries: Oct 4–10, Oct 11–17, Oct 18–24, Oct 25–31, Nov 1–7, Nov 8–14.
- [ ] [A1] Each entry spans exactly 7 days (Sunday–Saturday); no entry is two weeks long.
- [ ] [A1] Entries follow syllabus order: cell structure, membrane transport, enzymes, respiration, photosynthesis, cell cycle/mitosis.
- [ ] [A1] The last entry ends Nov 14 — it is not stretched to Nov 19 or Nov 20.
- [ ] [A1] Meiosis and Mendelian genetics do not appear anywhere in the Study Plan (not squeezed into the Nov 8–14 entry).
- [ ] [A3] No entry mentions the lab safety quiz, grading, office hours, or the late-work policy (check the Oct 18–24 entry especially).
- [ ] [A4] The Week 1 Practice Questions section has exactly 5 questions.
- [ ] [A4] No question is about membrane transport, enzymes, cellular respiration, or photosynthesis (these belong to later weeks).
- [ ] [A5] Any question on the nucleus, mitochondria, chloroplasts, ER or Golgi asks about shape, parts, or location only — none asks what it does, how it makes ATP, or why it matters for photosynthesis.
- [ ] [A5] No question includes a note such as "avoiding respiration" or "not covering function".
- [ ] [A6] No bracket tag (e.g. `[unverified]`) appears anywhere in the questions section, including any note above the questions.
- [ ] [A6] No claim like "based on standard curriculum" appears in the questions section.
- [ ] A Summary section of 2–3 sentences appears last.

### Test 2 — Edge case: optional input left blank

**Inputs to type**
- *Paste your class syllabus:*
  `Week 1: Cell structure (nucleus, ribosomes, plasma membrane). Week 2: Membrane transport. Oct 20: Lab safety quiz. Week 3-4: Respiration and photosynthesis. Week 5: DNA structure and replication. Office hours: Thursdays after class.`
- *Exam date:* leave blank

**Expected**
- [ ] [A2] The answer says plainly that the plan covers the whole syllabus because no exam date was given yet.
- [ ] [A2] Every study topic appears in the Study Plan: cell structure, membrane transport, respiration, photosynthesis, DNA structure and replication.
- [ ] [A2] The plan is organized week by week, starting Oct 4–10.
- [ ] [A1] "Week 3-4" is not one two-week entry: respiration and photosynthesis are spread over two separate one-week entries (Oct 18–24 and Oct 25–31), and DNA falls in Nov 1–7.
- [ ] [A3] The lab safety quiz and office hours appear in no Study Plan entry.
- [ ] [A4] Exactly 5 Week 1 practice questions.
- [ ] [A4] No question is about membrane transport (diffusion, osmosis, moving things across the membrane), respiration, photosynthesis, or DNA.
- [ ] [A5] Questions on the nucleus or plasma membrane ask about structure only (parts, layers, location) — none asks how nuclear pores enable transport or what the membrane lets through.
- [ ] [A5] No question carries a note about what topic it is avoiding.
- [ ] [A6] No bracket tag and no "standard curriculum" claim in the questions section.
- [ ] A Summary section of 2–3 sentences appears last.

### Test 3 — Tricky case: very short syllabus, exam very soon

**Inputs to type**
- *Paste your class syllabus:*
  `Week 1: Cell structure and organelles; lab safety quiz. Week 2: Membrane transport. Week 3: Respiration. Late work not accepted.`
- *Exam date:* `2026-10-14`

**Expected**
- [ ] [A1] The Study Plan has exactly 1 entry: Oct 4–10.
- [ ] [A1] That entry is not stretched to Oct 13 or Oct 14.
- [ ] [A1] Membrane transport and respiration are left out of the Study Plan, not crammed into the Oct 4–10 entry.
- [ ] [A3] The single entry lists cell structure / organelles only — the lab safety quiz scheduled in Week 1 is not in it, and the late-work rule appears nowhere in the plan.
- [ ] [A4] Exactly 5 Week 1 practice questions, all on cell structure / organelles.
- [ ] [A4] No question is about membrane transport or respiration.
- [ ] [A5] Every organelle question asks shape, parts, or location only — no function questions (e.g. nothing on making ATP or making proteins).
- [ ] [A5] No question includes a note about a topic it is avoiding.
- [ ] [A6] No bracket tag and no "standard curriculum" claim in the questions section, including any note above the questions.
- [ ] A Summary section of 2–3 sentences appears last.

## How to run them

1. Open the Study Plan Builder.
2. Enter the Test 1 inputs exactly as written above (copy and paste the syllabus text; type the exam date exactly). Run the tool.
3. Copy the whole answer, top to bottom, and save it somewhere labelled "Test 1".
4. Do the same with the Test 2 inputs (leave the exam date empty) and save the answer as "Test 2".
5. Do the same with the Test 3 inputs and save the answer as "Test 3".
6. Open a **new chat** — not the chat that built the tool.
7. Paste "Tester 2 — grade" there, followed by the Spec, these three test cases, and the three answers, each clearly labelled Test 1, Test 2 and Test 3. Send it all together.

## Summary

Three tests for the Study Plan Builder spec (A1–A6), dated from 2026-10-04: a normal 8-week biology syllabus with exam 2026-11-20 (expect 6 one-week entries ending Nov 14), a blank exam date with a "Week 3-4" range (expect all topics week by week plus a no-exam-date note), and a tiny syllabus with exam 2026-10-14 (expect a single Oct 4–10 entry). Every test checks that admin items stay out of the plan and that the five Week 1 questions are structure-only, avoid later weeks' topics, and carry no bracket tags or "standard curriculum" claims.
