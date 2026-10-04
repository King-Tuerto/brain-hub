## Steps

1. You paste your syllabus and, if you know it, your exam date.
2. If no exam date is given, the plan covers every syllabus topic week by week instead of counting toward an exam.
3. With an exam date, the tool counts the whole weeks from today to the exam and builds one Study Plan entry per week, study topics only — never admin items such as a lab safety quiz, grading, office hours, or the late-work policy.
4. It takes Week 1's topics, drops anything a later week already owns (including related processes and admin items), and writes 5 practice questions on only what's left, with organelle questions limited to structure and no leftover tags.
5. Fix applied — [A4, Test 1]: added a rule that Week 1 organelle questions test structure only (never a process like ATP production or photosynthesis), banned "do not discuss X" notes inside a question, and required removing leftover tags such as [unverified] from questions.
6. Fix applied — [A2, Test 3] and [A4, Test 3]: added a rule excluding admin items from the Study Plan entirely, and an explicit rule that a Week 1 question must not ask about the membrane's protective/barrier role when a later week owns it, or about an admin item such as a lab safety quiz.

Spec changed: yes

## Spec

**Study Plan Builder** — turns your pasted class syllabus, and an exam date if you have one, into a week-by-week study plan plus 5 practice questions on Week 1's topics.

**Inputs**
- Paste your class syllabus — required. Example: "Week 1: Cell structure & organelles. Lab safety quiz due Week 1. Week 2: Membrane permeability. Week 3: Cellular respiration. Week 4: Photosynthesis. Office hours Tuesdays 2-3pm. Late work policy: -10%/day."
- Exam date — not required. Example: "2026-12-15"

**Output** — sections in this order:
1. **Study Plan** — one entry per week, each naming only study topics from the syllabus.
2. **Week 1 Practice Questions** — exactly 5 questions built from Week 1's topics.
3. **Summary** — the hub's standard closing section.

**Acceptance criteria**
- A1: when an exam date is given, the Study Plan has exactly one entry per whole week from today until the exam date, in order, starting with this week.
- A2: every Study Plan entry names only topics that appear in the pasted syllabus, and never an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy, even if the syllabus schedules that item for a particular week.
- A3: Week 1 Practice Questions contains exactly 5 questions, each built only from Week 1 topics that are not already owned by a later week in the plan.
- A4: organelle questions in Week 1 Practice Questions test structure only (shape, parts, location) — never a process a later week owns, such as respiration (how mitochondria make ATP), photosynthesis (why chloroplasts matter), or the membrane's protective/barrier role when membrane permeability is a later week's topic — and no question contains a "do not discuss X" note or a leftover tag such as [unverified].
- A5: no question in Week 1 Practice Questions is about an administrative item, such as a lab safety quiz.
- A6: when no exam date is given, the Study Plan covers every topic in the syllabus, organized week by week, and says that's what it did because no exam date was given yet.

**Blank inputs**
- Exam date left blank: build the Study Plan from the syllabus alone, covering every topic in it organized week by week, and say that this is what was done because no exam date was given yet (see A6).

## Recipe

```recipe
---
recipe_format: 1
id: study-plan-builder
name: Study Plan Builder
description: Turns your pasted class syllabus into a week-by-week study plan plus 5 practice questions on week 1.
version: 1.0.2
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
each week. Use only topics that appear in the syllabus I pasted. A Study Plan
entry is a study topic only: never put an administrative item such as a lab
safety quiz, grading, office hours, or the late-work policy into a Study Plan
entry, even if the syllabus schedules it for a particular week.

Then look at only the first week's topics in that plan. Before writing any
questions, check each candidate topic against every later week's topics in the
plan, and drop anything a later week already owns — even if it overlaps with a
Week 1 topic (for example, don't let a Week 1 question drift into membrane
permeability if that's a Week 2 topic, or into respiration or photosynthesis if
those are Weeks 3-4 topics). Write exactly five practice questions using only
what is left of the first week's topics after that check.

When a Week 1 topic is a cell organelle (such as a mitochondrion or a
chloroplast), write questions about its structure only — shape, parts, where it
sits in the cell — never about the process it performs, such as how
mitochondria make ATP through respiration or why chloroplasts matter for
photosynthesis. Never put a note inside a question saying what not to discuss;
instead write a question that doesn't raise that process in the first place.
The same goes for the cell membrane: if a later week covers the membrane or
membrane permeability, don't ask a Week 1 question about the membrane's
protective or barrier role. Never write a practice question about an
administrative item such as a lab safety quiz. Don't leave any bracket tag
such as [unverified] inside a question.
```
study-plan-builder.recipe.md

## Summary

Applied the Tester's three fixes to Study Plan Builder: Study Plan entries now exclude admin items like a lab safety quiz, and Week 1 Practice Questions test organelle structure only (not respiration/photosynthesis) without leftover "do not discuss" notes or tags like [unverified], and never touch the membrane's barrier role once a later week owns it. Version bumped from 1.0.1 to 1.0.2, same id, same two inputs and two output sections, with Spec criteria A2, A4, and A5 now spelling out these exclusions for the Tester.
