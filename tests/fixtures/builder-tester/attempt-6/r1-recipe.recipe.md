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
