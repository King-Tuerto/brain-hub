**Exam Study Planner** — turns a pasted class syllabus into a week-by-week study plan up to the exam, ending in 5 practice questions on the first week's topics.

**Inputs**
- Paste your class syllabus — required. Example: "Week 1: Intro to macro... Week 2: Supply and demand..."
- Exam date — optional. Example: `2026-12-10`.

**Output** — the answer has exactly three sections, in this order:
1. **Study plan** — one numbered entry per calendar week (Week 1, Week 2, …) from the run date through the week containing the exam date, including a final partial week if there is one. No grouped ranges (no "Week 3–4") and no overlapping dates. Each week lists only topics that appear in the pasted syllabus, in the order the syllabus gives them. If the syllabus has fewer topics than there are weeks, the extra weeks review syllabus topics already listed rather than introduce new ones.
2. **Practice questions** — exactly 5 questions, all about the first week's (or first session's) topics only. None of them compares the first week to, or mentions, any later week or session.
3. **Summary** — a short closing section the tool always adds automatically; it is not something the answer's own instructions ask for, and nothing follows it.

**Acceptance criteria**
- A1: The answer contains only the sections "Study plan", "Practice questions", and the hub's automatic "Summary" — in that order, with nothing after "Summary" and no other heading anywhere.
- A2: The study plan has exactly one entry per calendar week from the run date through the week containing the exam date, including the final partial week, numbered singly with no grouped ranges and no overlapping dates (e.g. 2026-10-04 to 2026-12-10 is 10 weeks; 2026-10-04 to 2027-01-15 is 15 weeks).
- A3: Every topic named under a week appears in the pasted syllabus; where the syllabus is shorter than the plan, the extra weeks only repeat or review syllabus topics, never new ones.
- A4: All 5 practice questions concern only the first week's (or first session's) topics, with no comparison to or mention of a later week or session.
- A5: There are exactly 5 practice questions, no more and no fewer.

**Blank inputs**
- If the exam date is left blank, the plan is built around the weeks or sessions already listed in the syllabus instead of counting to a date, ends with a review week covering syllabus topics already listed (no new topics), and tells the student to add their real exam date later for exact timing.
