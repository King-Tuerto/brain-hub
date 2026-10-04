## Steps

1. Read the Tester's fix: practice questions, their answer options, AND their answer explanations must stay inside Week 1's topic words — the Tester caught "production" (a Week 5 word) leaking into an explanation.
2. Applied the fix to acceptance criterion A4: widened it from "question and option" to "question, option, and answer explanation," both for what must be Week-1-only and what must never contain a later week's word. No other criterion, its number, or its wording was touched.
3. Applied the matching fix to the recipe body: the practice-question instruction now names the answer explanation alongside the question and its options, and the pre-finish check now re-reads explanations against the later weeks' topic words, not just questions and options.
4. Kept the same tool id (`syllabus-study-planner`) and raised the version from 1.0.3 to 1.0.4.
5. Spec changed: yes

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
- A4: Every practice question, every one of its answer options, and its answer explanation uses only a topic word that appears under Week 1 in the Study Plan; no question, option, or answer explanation uses a topic word that appears only under a later week.
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
version: 1.0.4
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

Build a week-by-week study plan, from today until the exam date (or for 8 weeks if no exam date was given), naming at least one topic from the syllabus for each week. If the exam date falls within one of those weeks, that week still gets exactly one entry — do not split it into day-by-day blocks or a separate "Exam Day" block. For example, if today is 2026-10-04 and the exam falls between 2026-10-04 and 2026-10-10, write one single Study Plan entry such as "Week of 2026-10-04–2026-10-10" naming that week's topic — never write separate lines like "October 4–5", "October 6", "October 7", and never add a separate "Exam Day" line. Then write exactly 5 practice questions and their answers (including any explanation of why an answer is correct), using only the topics you assigned to the first week — don't use any topic word from a later week in the questions, their answer options, or their answer explanations. Before finishing, check every question, option, and answer explanation against the later weeks' topic words and reword any that match.
```
`syllabus-study-planner.recipe.md`

## Summary

Applied the Tester's A4 fix so the no-later-week-words check also covers answer explanations, not just questions and options, and raised the recipe version from 1.0.3 to 1.0.4 while keeping the same tool id, `syllabus-study-planner`. Every other acceptance criterion and its wording stayed unchanged. Spec changed: yes.
