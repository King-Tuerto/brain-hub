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
