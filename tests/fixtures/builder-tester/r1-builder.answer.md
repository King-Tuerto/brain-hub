## Steps

1. The student pastes their class syllabus and, if they already know it, their exam date.
2. The tool reads the syllabus to find each week's topics, in the order they appear.
3. If an exam date was given, it lays out one entry per week from today through the week of the exam; if no exam date was given, it numbers the weeks instead (Week 1, Week 2, …) and says why.
4. It writes 5 practice questions drawn only from the first week's topics.
5. It returns the Study Plan, the Practice Questions, and a closing Summary.

Spec changed: no

## Spec

**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all based only on the first week's topics.
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not invent or guess one. It builds the plan using week numbers instead of dates and tells the student it did so because no exam date was given.

## Recipe

```recipe
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
```

exam-study-planner.recipe.md

## Summary

Built a Brain Hub recipe called Exam Study Planner that turns a pasted syllabus into a week-by-week plan up to a given exam date, falling back to numbered weeks when the date is unknown, and closes with 5 practice questions on week one's topics. The spec sets 5 acceptance criteria (A1–A5) covering week coverage, the blank-exam-date fallback, syllabus-sourced topics, exactly 5 practice questions, and the final Summary.
