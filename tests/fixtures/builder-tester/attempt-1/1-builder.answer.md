## Steps

1. Ask the student to paste their class syllabus.
2. Ask for the exam date, making clear it's fine to leave blank.
3. Read the syllabus to find its topics and how they're grouped into weeks or sessions.
4. Lay out a week-by-week plan from today until the exam date (or, with no exam date, one week per session already in the syllabus), using only topics that appear in the syllabus.
5. Write 5 practice questions that cover only the first week's topics.
6. Hand back the plan and the practice questions.

## Spec

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

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turns your pasted syllabus into a week-by-week study plan ending in 5 practice questions on week one.
version: 1.0.0
author: "[your name]"
permissions: [run_ai]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    help: Include topics, and weeks or dates if your syllabus lists them.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: "e.g. 2026-12-10"
output:
  sections: [Study plan, Practice questions]
---
I'm a university student preparing for an exam. Today's date is {{today}}.

Here is my class syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), build the plan around the weeks or sessions
already listed in the syllabus instead of counting down to a date, end with a
general final-review week, and say that I should add my real exam date later
for exact timing.

Build me a week-by-week study plan, using only topics that appear in the
syllabus above, in the order they appear there. For each week, list the
topics to study that week. Then give me exactly 5 practice questions based
only on the first week's topics.
```

exam-study-planner.recipe.md

## Summary

This recipe, Exam Study Planner, takes a pasted class syllabus and an optional exam date and returns a week-by-week study plan plus 5 practice questions on the first week's material. When the exam date is left blank, it falls back to the syllabus's own week structure and flags that the student should add the real date later for exact timing.
