## Steps

1. Read the current Spec, the current recipe, and the Tester's fix.
2. Applied fix 1 ([A4, Test 1]): reworded acceptance criterion A4 so it bans not just a later week's exact topic word, but any other form of that word (e.g. "produce", "produces", "produced", "producing" when "production" is a Week 5 topic).
3. Updated the recipe's prompt template to tell the AI to avoid those word forms too, and to rewrite opportunity-cost questions using neutral verbs such as "grow", "make" or "build" instead of a later week's topic word or any form of it.
4. Kept the same id, left every other acceptance criterion (A1, A2, A3, A5, A6) word for word unchanged, and raised the version from 1.0.4 to 1.0.5.

Spec changed: yes.

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
- A4: Every practice question, every one of its answer options, and its answer explanation uses only a topic word that appears under Week 1 in the Study Plan; no question, option, or answer explanation uses a topic word that appears only under a later week, including any other form of that word (for example, if "production" is a later week's topic word, "produce", "produces", "produced" and "producing" are also not allowed).
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
version: 1.0.5
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

Build a week-by-week study plan, from today until the exam date (or for 8 weeks if no exam date was given), naming at least one topic from the syllabus for each week. If the exam date falls within one of those weeks, that week still gets exactly one entry — do not split it into day-by-day blocks or a separate "Exam Day" block. For example, if today is 2026-10-04 and the exam falls between 2026-10-04 and 2026-10-10, write one single Study Plan entry such as "Week of 2026-10-04–2026-10-10" naming that week's topic — never write separate lines like "October 4–5", "October 6", "October 7", and never add a separate "Exam Day" line. Then write exactly 5 practice questions and their answers (including any explanation of why an answer is correct), using only the topics you assigned to the first week — don't use any topic word from a later week, or any other form of that word (for example, if "production" is a later week's topic, do not use "produce", "produces", "produced" or "producing" either), in the questions, their answer options, or their answer explanations. If a question is about opportunity cost, use neutral verbs such as "grow", "make" or "build" instead of a later week's topic word or any form of it. Before finishing, check every question, option, and answer explanation against the later weeks' topic words — including their other word forms — and reword any that match.
```
syllabus-study-planner.recipe.md

## Summary

Applied the Tester's fix by tightening acceptance criterion A4 and the recipe's prompt so that word forms of a later week's topic (not just the exact word) are also banned from practice questions, options, and explanations, and so opportunity-cost questions use neutral verbs instead. The id stayed `syllabus-study-planner`, every other acceptance criterion kept its number and wording, and the version moved from 1.0.4 to 1.0.5.
