---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan until your exam, plus 5 practice questions on week one.
version: 1.0.4
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

Give me exactly 5 practice questions based only on the first week's topics
from my syllabus. Do not write a question — including any multiple-choice
answer options — that mentions, previews, or acts as an "introduction to" any
topic from week 2 or later, and do not write a question that can only be
answered using, or is framed around (such as a comparison to, or a scenario
built on), a concept from week 2 or later — every question, and every answer
option, must be fully self-contained within the first week's topics.

Build the wrong (incorrect) answer options using only first-week material.
Never let an option name, or be built around, a later week's topic — not even
in passing, such as describing what a first-week concept lacks or how it
differs compared to something that is itself a later week's topic. If a
distractor would only make sense by referencing a week 2+ term, replace it
with one built entirely from other first-week material instead (a different
first-week structure, step, or concept).

Before giving me the final answer, check every answer option — not just the
question stems — word by word against the list of week 2 or later topics, and
rewrite any option that names one or depends on one, even in passing. Then
re-check each of the 5 questions one by one — the stem and every answer
option — against the first week's topic list, and rewrite any question that
touches a week 2 or later topic in any way, including through its framing,
scenario, or an incidental word choice, until none do.
---
