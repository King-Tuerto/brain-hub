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
