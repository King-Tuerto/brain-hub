**Exam Study Planner** — turns a pasted class syllabus and an optional exam date into a week-by-week study plan, ending with 5 practice questions on the first week's topics.

**Inputs**
- **Paste your syllabus** (required). Example: "Week 1: Intro to Marketing, Ch. 1-2. Week 2: Consumer Behavior, Ch. 3..."
- **Exam date** (optional). Example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week. Each entry is labeled "Week N", has a line starting with "Topics:" listing that week's topics from the syllabus, and, only when an exam date was given, a calendar date range for that week.
2. **Practice Questions** — exactly 5 questions, numbered 1 to 5, about the Week 1 topics only.
3. **Summary** — added automatically by the hub.

**Acceptance criteria**
- A1: When an exam date is given, the Study Plan section has exactly one week entry for every week between today and the exam date.
- A2: When the exam date is (not provided), the Study Plan section contains a line starting with "Note:" that includes the words "exam date" and "not provided", and no week entry contains a calendar date.
- A3: The Practice Questions section contains exactly 5 questions.
- A4: Each practice question is numbered 1 through 5 and ends with a question mark.
- A5: The Study Plan section contains the label "Week 1" exactly once.
- A6: Every week entry in the Study Plan section contains a line starting with "Topics:".

**Blank inputs**
- If the exam date is left blank, the plan numbers weeks as Week 1, Week 2, and so on with no calendar dates, and includes a line starting with "Note:" saying the exam date was not provided. Everything else — the week topics and the 5 practice questions — is produced the same way as when a date is given.
