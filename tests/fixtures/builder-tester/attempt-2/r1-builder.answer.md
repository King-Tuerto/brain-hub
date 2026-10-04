## Steps

1. You paste your class syllabus and, if you know it, your exam date.
2. If you leave the exam date blank, the tool assumes a short default study length and says so.
3. It builds a week-by-week study plan from this week until the exam (or the assumed length), using your syllabus topics in order.
4. It writes 5 practice questions based only on the first week's topics.
5. It gives you the plan, the questions, and a summary.

## Spec

**Exam Study Plan** — turns your pasted class syllabus and exam date into a week-by-week study plan plus 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** — required. Example: "Week 1: Intro & history. Week 2: Core theory. Week 3: Case studies. Week 4: Applications..."
- **Exam date** — not required. Example: `2026-12-15`.

**Output** (section headings, in order):
1. **Study Plan** — one entry for every week from this week until the exam date, in order, each listing the syllabus topics assigned to that week.
2. **Practice Questions** — exactly 5 questions, based only on the topics from the first week of the plan.
3. **Summary** (added by the hub to every answer) — 2–3 sentences wrapping up the plan.

**Acceptance criteria:**
- A1: The answer has a "Study Plan" section with one entry for every week from the current week until the exam date (or, if no exam date was given, a stated default-length plan).
- A2: The weeks in the Study Plan are in order, starting from the current week.
- A3: Each week in the Study Plan lists topics drawn from the pasted syllabus.
- A4: The answer has a "Practice Questions" section containing exactly 5 questions.
- A5: Every practice question is based only on the first week's topics, not later weeks.
- A6: The answer ends with the hub's required "## Summary" section.

**Blank inputs:** If the exam date is left blank, the answer must assume a default study length (4 weeks) starting from the current week, and must say in a `Note:` that it made this assumption because no exam date was given.

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-plan
name: Exam Study Plan
description: Turns your pasted syllabus and exam date into a week-by-week study plan plus 5 practice questions on week one.
version: 1.0.0
author: [your name]
permissions: [run_ai, save_to_brain]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    placeholder: "Week 1: Intro & history. Week 2: Core theory..."
  - id: exam_date
    label: Exam date
    type: text
    required: false
    help: Leave blank if you don't know it yet
    placeholder: "2026-12-15"
output:
  sections: [Study Plan, Practice Questions]
save:
  type: work_product
  tags: [study-plan, exam-prep]
---
I'm a university student using this tool to turn my class syllabus into a study plan.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), assume a 4-week study plan starting this week, and say so in a Note: explaining that you assumed this because no exam date was given.

Build a week-by-week study plan from this week until the exam date (or the assumed 4-week length), with one entry per week, covering the syllabus topics in the order they appear. Then write exactly 5 practice questions based only on the first week's topics.
```

exam-study-plan.recipe.md

## Summary

Built the Exam Study Plan recipe for Brain Hub: students paste their syllabus and an optional exam date, and get a week-by-week plan plus 5 practice questions on week one, defaulting to a 4-week plan with a stated assumption when no exam date is given.
