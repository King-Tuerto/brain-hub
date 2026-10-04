## Steps

1. Took the student's current recipe (`exam-study-planner`, version 1.0.0) and the Tester's three fixes, all pointing at the same acceptance criterion, A4 (practice questions scope).
2. Applied Fix 1 and Fix 2 together: tightened A4 so a practice question fails not only if it names a later week's topic, but also if answering it needs a concept that belongs to Week 2 or later, including an "introduction to" framing of that topic.
3. Applied Fix 3: added a new acceptance criterion, A6, requiring a self-check step before the answer is given — the tool must confirm none of the 5 questions touches Week 2+ material, and fix any that do before showing them.
4. Updated the recipe body's practice-questions instruction to state the strict Week 1-only rule and to add the self-check step, matching the new A4 and A6.
5. Kept A1, A2, A3 and A5 exactly as before, and raised the version from 1.0.0 to 1.0.1.

Spec changed: yes

## Spec

**Exam Study Planner** — turns a pasted class syllabus (and, if known, an exam date) into a week-by-week study plan up to the exam, plus 5 practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus — long text, required. Example: "Week 1: Supply and demand. Week 2: Market structures. Week 3: Elasticity..."
- Exam date — short text, optional. Example: `2026-12-10`

**Output sections, in order:**
1. **Study Plan** — one entry per week, built from the syllabus's own topics and order. If no exam date was given, entries are labeled Week 1, Week 2, etc., covering every week the syllabus lists, and the section says plainly that week numbers were used because no exam date was given. If an exam date was given, entries run from today through the week of the exam, using the syllabus's week-by-week topics in order; if the syllabus has more or fewer weeks than fit before the exam, the section says so.
2. **Practice Questions** — exactly 5 questions, based only on the topics the syllabus lists for Week 1.
3. **Summary** — added automatically; not written by the tool itself.

**Acceptance criteria:**
- **A1:** The answer only uses the syllabus text and exam date the student entered — it does not invent course details.
- **A2:** When the exam date is blank, the Study Plan uses Week 1, Week 2, ... through every week the syllabus lists, and states that week numbers were used because no exam date was given.
- **A3:** When the exam date is given, the Study Plan has one entry for every week from today up to and including the week of the exam, in the syllabus's own topic order, and notes any mismatch between the syllabus's week count and the time before the exam.
- **A4:** Every practice question stays strictly inside Week 1's topics only. A question fails this check if it names a topic first introduced in Week 2 or later, if answering it needs a concept from a later week (even without naming it), or if it introduces a later topic using "introduction to" framing.
- **A5:** The Practice Questions section contains exactly 5 questions.
- **A6:** Before giving the answer, the tool performs a self-check confirming none of the 5 questions touches Week 2 or later content, and revises any question that does; the answer reflects this check having been done.

**Blank inputs:** If the exam date is left blank, the tool does not invent one — it builds the plan using week numbers instead and says so in the Study Plan, as required by A2.

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan until your exam, plus 5 practice questions on week one.
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
syllabus. A question is off-topic if it names a topic first introduced in
Week 2 or later, if answering it needs a concept from a later week even
without naming it, or if it introduces a later topic using "introduction to"
wording. Before giving me the questions, check all 5 against this rule
yourself and replace any question that fails it, so none remain.
```
exam-study-planner.recipe.md

## Summary

The Exam Study Planner recipe was updated to version 1.0.1 to fix three Tester-reported failures where practice questions leaked into Week 2+ material; acceptance criterion A4 was strengthened and a new self-check criterion, A6, was added, while A1–A3 and A5 were left unchanged. The recipe body now states the strict Week 1-only rule explicitly and instructs the AI to self-check its 5 questions against it before answering.
