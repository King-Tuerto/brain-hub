**Exam Study Planner** — turns a pasted class syllabus (and, if known, an exam date) into a week-by-week study plan up to the exam, plus 5 practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus — long text, required. Example: "Week 1: Supply and demand. Week 2: Market structures. Week 3: Elasticity..."
- Exam date — short text, optional. Example: `2026-12-10`

**Output sections, in order:**
1. **Study Plan** — one entry per week, built from the syllabus's own topics and order. If no exam date was given, entries are labeled Week 1, Week 2, etc., covering every week the syllabus lists, and the section says plainly that week numbers were used because no exam date was given. If an exam date was given, entries run from today through the week of the exam, using the syllabus's week-by-week topics in order; if the syllabus has more or fewer weeks than fit before the exam, the section says so.
2. **Practice Questions** — exactly 5 questions, based only on the topics the syllabus lists for Week 1.
3. **Summary** — added automatically; not written by the tool itself.

**Acceptance criteria:**
- **A1:** The answer only uses the syllabus text and exam date the student entered — it does not invent course details.
- **A2:** When the exam date is blank, the Study Plan uses Week 1, Week 2, ... through every week the syllabus lists, and states that week numbers were used because no exam date was given.
- **A3:** When the exam date is given, the Study Plan has one entry for every week from today up to and including the week of the exam, in the syllabus's own topic order, and notes any mismatch between the syllabus's week count and the time before the exam.
- **A4:** Every practice question stays strictly inside Week 1's topics only. A question fails this check if it names a topic first introduced in Week 2 or later, if answering it needs a concept from a later week (even without naming it), or if it introduces a later topic using "introduction to" framing.
- **A5:** The Practice Questions section contains exactly 5 questions.
- **A6:** Before giving the answer, the tool performs a self-check confirming none of the 5 questions touches Week 2 or later content, and revises any question that does; the answer reflects this check having been done.

**Blank inputs:** If the exam date is left blank, the tool does not invent one — it builds the plan using week numbers instead and says so in the Study Plan, as required by A2.
