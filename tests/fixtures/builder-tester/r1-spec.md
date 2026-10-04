**Tool name:** Study Plan Builder — turns a pasted class syllabus into a week-by-week study plan with five practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus (required). Example: "Week 1: Intro to Macroeconomics. Week 2: Supply and Demand. Week 3: Market Structures. Week 4: National Income Accounting..."
- Exam date (optional). Example: "2026-12-15"

**Output:** the answer must have these section headings, in this order:
1. **Study Plan** — a week-by-week breakdown, one entry per week, each naming the topics to study that week, drawn from the syllabus.
2. **Week 1 Practice Questions** — exactly five questions based only on the first week's topics.
3. **Summary** — 2–3 sentences wrapping up the plan.

**Acceptance criteria:**
- A1: The Study Plan section has one entry for every week between now and the exam date, when an exam date was given.
- A2: When no exam date was given, the Study Plan section still covers every topic in the syllabus, organized week by week, and says it planned this way because no exam date was given.
- A3: Every week's entry in the Study Plan names only topics that actually appear in the pasted syllabus — nothing from outside it.
- A4: The Week 1 Practice Questions section contains exactly five questions, and every one is based only on the topics listed for the first week.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not guess a date. It builds the study plan from the syllabus alone (see A2) and says in the Study Plan section that it did so because no exam date was given yet.
