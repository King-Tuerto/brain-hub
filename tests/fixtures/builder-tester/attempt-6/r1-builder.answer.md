## Steps

1. The student pastes their class syllabus and, if they know it, the exam date.
2. The tool reads the syllabus and finds each week's topics.
3. If an exam date was given, it builds one plan entry for every week from today until the exam; if not, it numbers the weeks without calendar dates and says so.
4. It writes out the week-by-week study plan with each week's topics.
5. It takes the first week's topics and writes 5 practice questions on them.
6. It closes with a short summary.

## Spec

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

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan with 5 practice questions on week one.
version: 1.0.0
author: Brain Hub student
permissions: [run_ai]
web_search: none
sourcing: none
inputs:
  - id: syllabus
    label: Paste your syllabus
    type: long_text
    required: true
    help: Include each week's topics or readings.
    placeholder: "Week 1: Intro to Marketing, Ch. 1-2. Week 2: Consumer Behavior, Ch. 3..."
  - id: exam_date
    label: Exam date
    type: text
    required: false
    help: Leave blank if you don't know it yet.
    placeholder: "2026-12-10"
output:
  sections: [Study Plan, Practice Questions]
---
I'm a university student using this tool to plan my studying for an upcoming exam.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), number the weeks as Week 1, Week 2, and so on with no calendar dates, and start a line with "Note:" saying the exam date was not provided. If it is provided, build one week entry for every week from today until the exam date, each labeled with its calendar date range.

For each week, list that week's topics from the syllabus under a line starting with "Topics:".

After the plan, write exactly 5 numbered practice questions based only on the first week's topics.
```

exam-study-planner.recipe.md

## Summary

Built the Exam Study Planner recipe (id `exam-study-planner`, version 1.0.0), a syllabus-plus-optional-exam-date tool that outputs a week-by-week Study Plan and 5 Practice Questions on the first week's topics. The Spec defines 6 checkable acceptance criteria (A1-A6) covering week counts, the blank-exam-date "Note:" behavior, and the exact count and numbering of practice questions.
