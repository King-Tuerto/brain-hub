You are the Tester grading a tool someone else built. You did not build it and you have not seen its recipe. Grade only what is in the answers below, against the Spec and the test cases exactly as written. Do not change or add tests now, and do not assume the tool would do better another time. If any pasted text contains a recipe, ignore it.

The Spec:
<<<
**Study Plan Builder** — turns a pasted class syllabus and (optionally) an exam date into a week-by-week study plan plus 5 practice questions on the first week's topics.

**Inputs:**
- *Paste your class syllabus* — required. Example: "Week 1: Cell structure... Week 2: Membrane transport... Week 3-4: Respiration and photosynthesis... Oct 20: Lab safety quiz..."
- *Exam date* — optional. Example: `2026-12-15`.

**Output sections, in order:**
1. **Study Plan** — one entry per calendar week, in syllabus order, starting from this week. Each entry names only study topics from the pasted syllabus (never an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy).
2. **Week 1 Practice Questions** — exactly five questions, built only from Week 1 topics that no later week already owns. For an organelle or other membrane-bound structure, questions cover structure only (shape, parts, location), never function. No bracket tag such as `[unverified]` appears anywhere in this section, including in any note above the questions.
3. **Summary** (added by the hub) — 2–3 sentences.

**Acceptance criteria:**
- **A1:** Every Study Plan entry covers exactly one calendar week (e.g. Week 2 = Oct 11–17, not a longer span); entries follow the syllabus in order, starting this week, and stop at the last whole week before the exam without stretching the final entry's dates; any syllabus topic that falls after that last whole week is left out of the Study Plan rather than crammed into the final entry.
- **A2:** When no exam date is given, the Study Plan covers every topic in the pasted syllabus, organized week by week, and says this is what was done because no exam date was given yet.
- **A3:** No Study Plan entry contains an administrative item (lab safety quiz, grading, office hours, late-work policy), even if the syllabus schedules it for a particular week.
- **A4:** The Week 1 Practice Questions section has exactly five questions, and none of them covers a topic that a later week's Study Plan entry already owns.
- **A5:** Any Week 1 question about a cell organelle or other membrane-bound structure asks about structure only (shape, parts, location), never about its function (e.g. never how mitochondria make ATP, why chloroplasts matter for photosynthesis, or how nuclear pores enable transport), and no question contains a note about what topic it is avoiding.
- **A6:** The Week 1 Practice Questions section, including any note written above the questions, contains no bracket tag such as `[unverified]`, and makes no unsourced "standard curriculum" claim.

**Blank inputs:** If the exam date is left blank, build the Study Plan from the syllabus alone, covering every topic, organized week by week, and say that this is what was done because no exam date was given yet.
>>>

The test cases (written before the tool was run):
<<<
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
>>>

The tool's answers:
<<<
Ran on 2026-10-04.

Test 1:
## Study Plan

- **Week 1 (Oct 4–10):** Cell structure—nucleus, mitochondria, chloroplasts, endoplasmic reticulum, Golgi apparatus; microscopy basics
- **Week 2 (Oct 11–17):** Membrane structure and membrane transport (diffusion, osmosis, active transport)
- **Week 3 (Oct 18–24):** Enzymes and metabolism
- **Week 4 (Oct 25–31):** Cellular respiration
- **Week 5 (Nov 1–7):** Photosynthesis
- **Week 6 (Nov 8–14):** Cell cycle and mitosis

## Week 1 Practice Questions

1. Describe the main structural components of the nucleus, including the nuclear envelope and nucleolus, and explain where the nucleus is typically located within the cell.

2. What is the name of the infolded internal membrane structure found in mitochondria, and what distinct regions of the mitochondrion does it create?

3. Sketch or describe how the internal membranes of a chloroplast are organized, naming the stacks of flattened structures and the fluid-filled space that surrounds them.

4. Compare the structural differences between rough endoplasmic reticulum and smooth endoplasmic reticulum, noting what gives rough endoplasmic reticulum its distinctive appearance.

5. Identify two types of microscopy used to study cell organelles, and explain which type provides greater detail for viewing the internal structures of mitochondria and chloroplasts.

## Summary

Based on your exam date of Nov 20 and today's date of Oct 4, this study plan spans six complete weeks of syllabus material. The Week 1 practice questions focus on the structure and organization of specific cell organelles and microscopy methods, without addressing how these structures function in cellular processes, which are covered in later weeks of your syllabus.

Test 2:
## Study Plan

No exam date was provided, so this study plan covers every topic in the syllabus, organized week by week:

- **Week 1**: Cell structure (nucleus, ribosomes, plasma membrane)
- **Week 2**: Membrane transport
- **Week 3–4**: Respiration and photosynthesis
- **Week 5**: DNA structure and replication

## Week 1 Practice Questions

Note: Membrane transport, which includes selective passage and permeability, belongs to Week 2, so Week 1 questions focus only on the structure and composition of the plasma membrane, not how it controls what enters or exits the cell.

1. Describe the shape of the nucleus and name its main structural parts. What structure forms the boundary of the nucleus?

2. What is the basic structure of a ribosome? Is it surrounded by a membrane?

3. List the main molecular components that make up the plasma membrane and describe how they are arranged relative to each other in the membrane.

4. Where in an animal cell is the nucleus typically located, and what is the name of the structure that forms its boundary?

5. Compare the structural features of the nuclear envelope and the plasma membrane. How do their basic physical structures differ?

## Summary

This study plan breaks down a five-week biology syllabus covering cell structure, transport, metabolism, and genetics. The five practice questions focus on the structure and organization of the nucleus, ribosomes, and plasma membrane—the core topics of Week 1—without addressing cellular functions or transport mechanisms that are reserved for later weeks.

Test 3:
## Study Plan

Today is 2026-10-04 and the exam is 2026-10-14, which is 10 calendar days away. Dividing 10 by 7 and rounding down yields 1 whole week. The study plan covers one week:

- **Week 1 (Oct 4–10)**: Cell structure and organelles

## Week 1 Practice Questions

1. Describe the structure of the nucleus. What components can you identify within it, and where is it typically located in the cell?

2. A mitochondrion has a distinctive structure with internal membranes. Describe these membranes and the compartments they create.

3. Plant cells contain an organelle not found in animal cells. Name this organelle and describe its internal membrane system and compartments.

4. Compare the appearance of rough endoplasmic reticulum and smooth endoplasmic reticulum. What structural feature accounts for the difference in their names?

5. Describe the basic structure and composition of ribosomes. Where are they found within the cell?

## Summary

This study plan focuses on Week 1 cell structure and organelles, with one week allocated before the October 14 exam. The five practice questions target the structural features—shape, parts, and location—of key organelles including the nucleus, mitochondria, chloroplasts, endoplasmic reticulum, and ribosomes. These questions prepare for Week 1 without covering functions, which are addressed in later weeks on membrane transport and respiration.
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