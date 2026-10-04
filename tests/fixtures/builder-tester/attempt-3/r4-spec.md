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
