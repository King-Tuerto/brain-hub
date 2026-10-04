---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turns your pasted syllabus into a week-by-week study plan ending in 5 practice questions on week one.
version: 1.0.1
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

If my exam date is (not provided), build the plan around the weeks or
sessions already listed in the syllabus instead of counting down to a date,
end with one review week covering syllabus topics already listed (no new
topics), and say that I should add my real exam date later for exact timing.

If my exam date is provided, count every calendar week from {{today}} through
the week that contains the exam date, including a final partial week if there
is one, and give each week its own single numbered entry (Week 1, Week 2,
...). Never group weeks into a range and never let two weeks' dates overlap.

Build me a week-by-week study plan. Under each week, list only topics that
appear in the syllabus above, in the order they appear there. If the syllabus
has fewer topics than there are weeks, use the remaining weeks to review
topics already listed instead of introducing new ones.

Then give me exactly 5 practice questions based only on the first week's (or
first session's) topics. Do not write a question that compares the first
week to, or mentions, any later week or session.
---
