## Steps

1. Take the pasted syllabus and the optional exam date as input.
2. Applied the Tester's fix (A1, Test 3): when the exam date falls inside the current week, the Study Plan must still give exactly one entry for that week — never split it into day-by-day blocks plus a separate "Exam Day" block. Updated acceptance criterion A1 and the Study Plan line of the Output section to say this explicitly.
3. Build the week-by-week Study Plan from today through the exam date (or 8 weeks if no exam date is given), naming at least one syllabus topic per week.
4. Generate exactly 5 practice questions with answers, using only topics assigned to Week 1.
5. Append the automatic Summary section.
6. Return the updated Spec and recipe, with the version raised to 1.0.1.

Spec changed: yes

## Spec

**Syllabus Study Planner** — turns a pasted class syllabus into a week-by-week study plan leading up to the exam, plus 5 practice questions on the first week's topics.

**Inputs**
- **Class syllabus** (required) — paste the full syllabus text. Example: "Week 1: Intro & history. Week 2: Supply and demand. Week 3: Market structures. Final exam covers all weeks."
- **Exam date** (optional) — the date of the exam. Example: "2026-11-18"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, from today until the exam, each naming at least one topic taken from the syllabus. If the exam date falls within a week, that week still gets exactly one entry (never split into day-by-day blocks or a separate Exam Day entry).
2. **Practice Questions** — exactly 5 questions, with answers, covering only the first week's topics.
3. **Summary** (added automatically) — 2–3 sentences.

**Acceptance criteria**
- A1: The Study Plan section has exactly one entry for every week counting from today through the exam date (inclusive of the exam week), with exactly one entry for the week containing the exam date — never split into day-by-day blocks or a separate Exam Day entry.
- A2: If no exam date was given, the Study Plan section covers exactly 8 weeks, and one line states that 8 weeks was assumed because no exam date was given.
- A3: The Practice Questions section contains exactly 5 questions.
- A4: Every practice question and every one of its answer options uses only a topic word that appears under Week 1 in the Study Plan; no question or option uses a topic word that appears only under a later week.
- A5: Every week listed in the Study Plan names at least one topic taken from the pasted syllabus.
- A6: The Summary section is 2–3 sentences.

**Blank inputs** — if the exam date is left blank, the plan covers 8 weeks instead of counting to an exam date, and the Study Plan section says this was assumed.

## Recipe

```recipe
---
recipe_format: 1
id: syllabus-study-planner
name: Syllabus Study Planner
description: Turn your syllabus into a week-by-week study plan and 5 practice questions on Week 1.
version: 1.0.1
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

If my exam date is (not provided), assume the plan should cover 8 weeks instead, and say in the Study Plan section that you assumed 8 weeks because no exam date was given.

Build a week-by-week study plan, from today until the exam date (or for 8 weeks if no exam date was given), naming at least one topic from the syllabus for each week. If the exam date falls within one of those weeks, that week still gets exactly one entry — do not split it into day-by-day blocks or a separate "Exam Day" block. Then write exactly 5 practice questions and their answers using only the topics you assigned to the first week — don't use any topic word from a later week in the questions or their answer options.
```
syllabus-study-planner.recipe.md

## Summary

Applied the Tester's A1/Test 3 fix so a week containing the exam date still produces exactly one Study Plan entry instead of day-by-day blocks plus a separate Exam Day block. The Spec's A1 criterion and Study Plan output description were updated, and the recipe's body and version (now 1.0.1) were updated to match, with the tool id unchanged.
