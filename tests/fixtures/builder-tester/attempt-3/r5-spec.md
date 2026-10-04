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
