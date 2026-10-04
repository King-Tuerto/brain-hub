---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan until your exam, plus 5 practice questions on week one.
version: 1.0.0
author: Brain Hub student
permissions: [run_ai]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    help: Include the topics or schedule listed for each week or unit.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: 2026-12-10
output:
  sections: [Study Plan, Practice Questions]
---
I'm a university student using this tool at the start of the semester.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), do not invent one. Build the plan using week
numbers instead (Week 1, Week 2, and so on) covering every week my syllabus
lists, and say in the Study Plan that you used week numbers because no exam
date was given.

If my exam date is provided, build the plan with one entry for every week from
today up to and including the week of my exam date, using the topics from my
syllabus for each week in the order the syllabus presents them. If the
syllabus has more or fewer weeks than fit before the exam date, say so.

Give me 5 practice questions based only on the first week's topics from my
syllabus.
