**Tool name:** Exam Study Planner — turns a pasted class syllabus (and, if known, an exam date) into a week-by-week study plan that ends with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** — required, long text. Example: "Week 1: Cell structure and function. Week 2: Cell membranes and transport. Week 3: Cellular respiration."
- **Exam date** — optional, short text. Example: "2026-12-10"

**Output:** two sections, in this order:
1. **Study plan** — one numbered entry per week ("Week 1", "Week 2", ...). Each week lists only topics that appear in the pasted syllabus, in the order they appear there. No two weeks' dates overlap, and weeks are never grouped into a range.
2. **Practice questions** — exactly 5 questions, based only on the first week's (or first session's) topics.

**Acceptance criteria:**
- **A1:** With an exam date given, the plan has one entry for every calendar week from today through the week containing the exam date, including a final partial week if there is one.
- **A2:** With no exam date, the plan is built around the weeks or sessions already listed in the syllabus, ends with one review week covering only topics already listed (no new topics), and says the student should add the real exam date later for exact timing.
- **A3:** Every week lists only topics that appear in the pasted syllabus, in the order they appear there; if the syllabus has fewer topics than there are weeks, the extra weeks review topics already listed instead of introducing new ones.
- **A4:** There are exactly 5 practice questions, and every one of them stays strictly inside the first week's (or first session's) topics — none of them names, compares to, or otherwise overlaps a topic listed under any later week or session in the plan.
- **A5:** No practice question mentions a later week or session by name or number.
- **A6:** Weeks are each a single numbered entry, never a combined range, and no two weeks' date spans overlap.

**Blank inputs:** If "Exam date" is left blank, the plan must be built around the syllabus's own weeks or sessions rather than counted down to a date, must end with one review week of topics already listed (no new ones), and must tell the student to add their real exam date later for exact timing.
