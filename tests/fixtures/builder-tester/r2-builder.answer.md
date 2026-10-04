## Steps

1. Take in the pasted syllabus and, optionally, the exam date.
2. If an exam date is given, count the whole weeks from today to that date (whole days between the two dates, divided by 7, rounded down) and build one Study Plan entry for each of those weeks, using only topics found in the syllabus.
3. If no exam date is given, instead build the Study Plan by working through every topic in the syllabus, week by week, and say that this is what was done because no exam date was given yet.
4. Look at only the first week's topics in the plan, cross them against every later week's topics, and drop anything a later week owns — even if it overlaps with a Week 1 topic — before writing questions.
5. Write exactly five practice questions using only what is left of the Week 1 topics after that check.
6. Applied fix 1 [A4]: added an explicit check-before-writing step so Week 1 Practice Questions never test a topic the syllabus assigns to a later week (e.g. membrane permeability in Week 2, or respiration/photosynthesis in Weeks 3–4), even when it overlaps a Week 1 topic. Applied fix 2 [A1]: replaced "roughly from now until the exam" with an exact rule — count whole days from the run date to the exam date and divide by 7, rounding down, then make exactly one Study Plan entry per week from that count. Version raised from 1.0.0 to 1.0.1. Every other acceptance criterion and its number is unchanged.

Spec changed: no

## Spec

**Study Plan Builder** — turns a pasted class syllabus into a week-by-week study plan plus five practice questions on the first week's topics.

**Inputs**
- Paste your class syllabus (required). Example: "Week 1: Cell structure. Week 2: Membrane permeability. Week 3–4: Respiration and photosynthesis..."
- Exam date (optional). Example: "2026-12-15"

**Output** (sections, in order):
1. **Study Plan** — one entry per week, each naming the topics to study that week, built only from topics that appear in the pasted syllabus.
2. **Week 1 Practice Questions** — exactly five questions, based only on the first week's topics as listed in the Study Plan.
3. **Summary** (added automatically by the hub) — 2–3 sentences.

**Acceptance criteria**
- A1: When an exam date is given, the Study Plan has exactly one entry for every whole week counted from the run date to the exam date (whole days between the two dates, divided by 7, rounded down) — for example, a run on 2026-10-04 with an exam on 2027-02-26 gives 20 entries, not 19.
- A2: Every topic named anywhere in the Study Plan appears in the pasted syllabus; no outside topics are introduced.
- A3: When the exam date is left blank, the Study Plan instead covers every topic in the syllabus, organized week by week, and the answer states that no exam date was given yet.
- A4: Every one of the five Week 1 Practice Questions tests only a topic assigned to Week 1 in the Study Plan; none tests a topic assigned to a later week, even when that later topic overlaps with a Week 1 topic (e.g. a Week 1 question must not stray into membrane permeability if that's a Week 2 topic, or into respiration/photosynthesis if those are Weeks 3–4 topics).
- A5: The Week 1 Practice Questions section contains exactly five questions, no more and no fewer.
- A6: The Study Plan presents weeks in order, starting from the current week.

**Blank inputs**
- Exam date left blank: build the Study Plan from the syllabus alone, covering every syllabus topic organized week by week, and state in the answer that this was done because no exam date was given.

## Recipe

```recipe
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
```

study-plan-builder.recipe.md

## Summary

Study Plan Builder v1.0.1 turns a pasted syllabus plus an optional exam date into a week-by-week study plan and five Week 1 practice questions, fixing two Tester-found bugs: it now counts study weeks exactly (whole days to the exam date divided by 7, rounded down) instead of estimating, and it checks Week 1 practice questions against every later week's topics so they no longer test material — like membrane permeability or respiration/photosynthesis — that the syllabus assigns to a later week.
