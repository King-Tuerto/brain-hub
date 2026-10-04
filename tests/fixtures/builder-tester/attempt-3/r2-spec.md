**Study Plan Builder** — turns a pasted class syllabus into a week-by-week study plan plus five practice questions on the first week's topics.

**Inputs**
- Paste your class syllabus (required). Example: "Week 1: Cell structure. Week 2: Membrane permeability. Week 3–4: Respiration and photosynthesis..."
- Exam date (optional). Example: "2026-12-15"

**Output** (sections, in order):
1. **Study Plan** — one entry per week, each naming the topics to study that week, built only from topics that appear in the pasted syllabus.
2. **Week 1 Practice Questions** — exactly five questions, based only on the first week's topics as listed in the Study Plan.
3. **Summary** (added automatically by the hub) — 2–3 sentences.

**Acceptance criteria**
- A1: When an exam date is given, the Study Plan has exactly one entry for every whole week counted from the run date to the exam date (whole days between the two dates, divided by 7, rounded down) — for example, a run on 2026-10-04 with an exam on 2027-02-26 gives 20 entries, not 19.
- A2: Every topic named anywhere in the Study Plan appears in the pasted syllabus; no outside topics are introduced.
- A3: When the exam date is left blank, the Study Plan instead covers every topic in the syllabus, organized week by week, and the answer states that no exam date was given yet.
- A4: Every one of the five Week 1 Practice Questions tests only a topic assigned to Week 1 in the Study Plan; none tests a topic assigned to a later week, even when that later topic overlaps with a Week 1 topic (e.g. a Week 1 question must not stray into membrane permeability if that's a Week 2 topic, or into respiration/photosynthesis if those are Weeks 3–4 topics).
- A5: The Week 1 Practice Questions section contains exactly five questions, no more and no fewer.
- A6: The Study Plan presents weeks in order, starting from the current week.

**Blank inputs**
- Exam date left blank: build the Study Plan from the syllabus alone, covering every syllabus topic organized week by week, and state in the answer that this was done because no exam date was given.
