**Exam Study Planner** — turns a pasted class syllabus into a week-by-week study plan that ends with 5 practice questions on the first week's topics.

**Inputs:**
- **Syllabus** (paste your class syllabus) — required. Example: "Week 1: Intro & history. Week 2: Core theory. Week 3: Case studies. Week 4: Applications..."
- **Exam date** — not required. Example: `2026-12-10`

**Output:** The answer has exactly two sections, in this order:
1. **Study plan** — a week-by-week list of topics to cover, taken only from the pasted syllabus.
2. **Practice questions** — exactly 5 questions, all about the first week's topics only.

**Acceptance criteria:**
- A1: The answer has two sections in this order: "Study plan" then "Practice questions".
- A2: When an exam date is given, the study plan has one entry for every week between today and that date.
- A3: Every topic named in the study plan also appears in the pasted syllabus — none are invented.
- A4: The practice questions section has exactly 5 questions, and every one of them is about the first week's topics only.
- A5: When the exam date is left blank, the plan is still broken into weeks using the syllabus's own structure (its listed weeks or sessions), and the answer includes a note telling the student to add the exam date later for exact timing.

**Blank inputs:** If the exam date is left blank, the tool builds the plan around the weeks or sessions already listed in the syllabus instead of counting down to a date, ends with a general final-review week, and notes that adding the real exam date later will give exact week counts.
