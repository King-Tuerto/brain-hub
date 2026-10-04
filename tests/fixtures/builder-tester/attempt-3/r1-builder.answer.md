## Steps

1. Takes in the pasted class syllabus and, if the student knows it yet, the exam date.
2. If no exam date is given, works out the plan from the syllabus alone instead of from a countdown to an exam.
3. Breaks the syllabus into a week-by-week study plan, one week's topics at a time, up to the exam date (or through the whole syllabus if there is no exam date).
4. Looks at only the first week's topics in that plan.
5. Writes exactly five practice questions drawn only from those first-week topics.
6. Returns the plan, the questions, and a short summary.

## Spec

**Tool name:** Study Plan Builder — turns a pasted class syllabus into a week-by-week study plan with five practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus (required). Example: "Week 1: Intro to Macroeconomics. Week 2: Supply and Demand. Week 3: Market Structures. Week 4: National Income Accounting..."
- Exam date (optional). Example: "2026-12-15"

**Output:** the answer must have these section headings, in this order:
1. **Study Plan** — a week-by-week breakdown, one entry per week, each naming the topics to study that week, drawn from the syllabus.
2. **Week 1 Practice Questions** — exactly five questions based only on the first week's topics.
3. **Summary** — 2–3 sentences wrapping up the plan.

**Acceptance criteria:**
- A1: The Study Plan section has one entry for every week between now and the exam date, when an exam date was given.
- A2: When no exam date was given, the Study Plan section still covers every topic in the syllabus, organized week by week, and says it planned this way because no exam date was given.
- A3: Every week's entry in the Study Plan names only topics that actually appear in the pasted syllabus — nothing from outside it.
- A4: The Week 1 Practice Questions section contains exactly five questions, and every one is based only on the topics listed for the first week.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not guess a date. It builds the study plan from the syllabus alone (see A2) and says in the Study Plan section that it did so because no exam date was given yet.

## Recipe

```recipe
---
recipe_format: 1
id: study-plan-builder
name: Study Plan Builder
description: Turns your pasted class syllabus into a week-by-week study plan plus 5 practice questions on week 1.
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

Break the syllabus into a week-by-week study plan, one week at a time, from now
until the exam date (or through the whole syllabus if there is no exam date),
naming the topics to study each week. Use only topics that appear in the
syllabus I pasted.

Then look at only the first week's topics in that plan and write exactly five
practice questions based on them.
```

study-plan-builder.recipe.md

## Summary

Study Plan Builder is a Brain Hub recipe that turns a pasted syllabus (and an optional exam date) into a week-by-week study plan and five first-week practice questions. When no exam date is given, it plans across the whole syllabus instead of guessing a deadline. The spec defines three required output sections (Study Plan, Week 1 Practice Questions, Summary) and five acceptance criteria a Tester can check directly against the answer.
