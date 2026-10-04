---
recipe_format: 1
id: study-plan-builder
name: Study Plan Builder
description: Turns your pasted class syllabus into a week-by-week study plan plus 5 practice questions on week 1.
version: 1.0.1
author: Brain Hub student
permissions: [run_ai]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    help: Paste the whole syllabus, including the week-by-week topic list if it has one.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: "2026-12-15"
    help: Leave blank if you don't know it yet.
output:
  sections: [Study Plan, Week 1 Practice Questions]
---
I'm a university student at the start of a semester, using my syllabus to build a study plan.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), don't guess one. Instead, build the study plan
from the syllabus alone: cover every topic in it, organized week by week, and say
that this is what you did because no exam date was given yet.

If my exam date is provided, first count the whole weeks from today's date to the
exam date: take the whole number of days between the two dates and divide by 7,
rounding down. Build exactly that many Study Plan entries, one per week, in order,
starting from this week and continuing up to the exam. For example, a run on
2026-10-04 with an exam on 2027-02-26 is 20 weeks, not 19.

Break the syllabus into that week-by-week study plan, naming the topics to study
each week. Use only topics that appear in the syllabus I pasted.

Then look at only the first week's topics in that plan. Before writing any
questions, check each candidate topic against every later week's topics in the
plan, and drop anything a later week already owns — even if it overlaps with a
Week 1 topic (for example, don't let a Week 1 question drift into membrane
permeability if that's a Week 2 topic, or into respiration or photosynthesis if
those are Weeks 3-4 topics). Write exactly five practice questions using only
what is left of the first week's topics after that check.
---
