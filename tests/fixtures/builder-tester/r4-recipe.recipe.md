---
recipe_format: 1
id: syllabus-study-planner
name: Syllabus Study Planner
description: Turn your syllabus into a week-by-week study plan and 5 practice questions on Week 1.
version: 1.0.3
author: Brain Hub student
permissions: [run_ai, save_to_brain]
web_search: none
sourcing: none
inputs:
  - id: syllabus
    label: Class syllabus
    type: long_text
    required: true
    help: Paste the full syllabus text, including topics and dates if you have them.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: 2026-11-18
    help: Leave blank if you don't know it yet.
output:
  sections: [Study Plan, Practice Questions]
save:
  type: work_product
  tags: [study-plan, exam-prep]
---
I'm a university student at the start of a semester, building a week-by-week study plan.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), assume the plan should cover 8 weeks instead. In the Study Plan section, include one line that uses exactly the words "8 weeks" and "exam date", for example: "No exam date was given, so this plan assumes 8 weeks." Do not write it as "8-week".

Build a week-by-week study plan, from today until the exam date (or for 8 weeks if no exam date was given), naming at least one topic from the syllabus for each week. If the exam date falls within one of those weeks, that week still gets exactly one entry — do not split it into day-by-day blocks or a separate "Exam Day" block. For example, if today is 2026-10-04 and the exam falls between 2026-10-04 and 2026-10-10, write one single Study Plan entry such as "Week of 2026-10-04–2026-10-10" naming that week's topic — never write separate lines like "October 4–5", "October 6", "October 7", and never add a separate "Exam Day" line. Then write exactly 5 practice questions and their answers using only the topics you assigned to the first week — don't use any topic word from a later week in the questions or their answer options. Before finishing, check every question, option, and answer against the later weeks' topic words and reword any that match.
