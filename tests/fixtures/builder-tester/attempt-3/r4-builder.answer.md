## Steps

1. Take the pasted class syllabus, and the exam date if it's known.
2. If the exam date is given, count whole weeks from today to it (days ÷ 7, rounded down) and build that many weekly entries; if it's blank, use every syllabus topic instead, organized week by week.
3. Build the Study Plan, one entry per week, using only topics from the syllabus — never an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy.
4. Take the first week's topics, drop anything a later week already owns, and write exactly 5 practice questions from what's left.
5. Applied Fix 1 [A3]: the practice-question rule was widened from "the cell membrane" to "any membrane" — a Week 1 question may no longer ask about transport or selective passage through any membrane (including the nuclear envelope and its pores) when a later week owns membrane permeability and transport.
6. Applied Fix 2 [A4]: the organelle-question rule was widened from "don't name a specific process like respiration or photosynthesis" to "never ask how any organelle enables or carries out a function" — so a question like how nuclear pores enable selective communication is now also excluded, leaving only shape, parts, and location questions.

Spec changed: yes

## Spec

**Study Plan Builder** — turns a pasted class syllabus into a week-by-week study plan, plus 5 practice questions on the first week's topics.

**Inputs:**
- Paste your class syllabus — required — long text. Example: "Week 1: Cell structure and organelles. Week 2: Membrane permeability and transport. Week 3-4: Respiration and photosynthesis..."
- Exam date — optional — text. Example: "2026-12-15"

**Output** (section headings, in order):
- **Study Plan** — one entry per week, from this week up to the exam date, naming only topics that appear in the pasted syllabus. No entry is an administrative item (a lab safety quiz, grading, office hours, the late-work policy), even if the syllabus schedules one for a particular week.
- **Week 1 Practice Questions** — exactly 5 questions, built only from the first week's topics that no later week already owns.
- **Summary** — the hub's standard closing section.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every whole week between today and the exam date (days between the two dates ÷ 7, rounded down), in order, starting from this week.
- A2: Every Study Plan entry is a study topic drawn from the pasted syllabus; none is an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy.
- A3: None of the five Week 1 Practice Questions asks about transport or selective passage through any membrane (for example, how nuclear pores let material move between the nucleus and the cytoplasm) when a later week's Study Plan entry already covers membrane permeability and transport.
- A4: Every Week 1 Practice Question about a cell organelle asks only about its shape, its parts, or where it sits in the cell — never about how it carries out or enables a function (such as how mitochondria make ATP, or how nuclear pores enable communication).
- A5: If the exam date is left blank, the Study Plan instead covers every topic in the syllabus, organized week by week, and the answer states that this is what was done because no exam date was given.
- A6: No Week 1 Practice Question is about an administrative item (such as a lab safety quiz), and none contains a bracket tag such as [unverified].

**Blank inputs:**
- Exam date left blank: the Study Plan is built from the syllabus alone, covering every topic in it organized week by week, and the answer says that is what it did because no exam date was given yet.

## Recipe

```recipe
---
recipe_format: 1
id: study-plan-builder
name: Study Plan Builder
description: Turns your pasted class syllabus into a week-by-week study plan plus 5 practice questions on week 1.
version: 1.0.3
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

When a Week 1 topic is a cell organelle or another membrane-bound structure
(such as the nucleus, a mitochondrion, or a chloroplast), write questions about
its structure only — shape, parts, and where it sits in the cell — never about
how it enables or carries out a function, such as how mitochondria make ATP
through respiration, why chloroplasts matter for photosynthesis, or how nuclear
pores enable selective communication between the nucleus and cytoplasm. Never
put a note inside a question saying what not to discuss; instead write a
question that doesn't raise that function in the first place. The same applies
to any membrane: if a later week owns membrane permeability and transport,
don't ask a Week 1 question about transport or selective passage through any
membrane, including the nuclear envelope's pores. Never write a practice
question about an administrative item such as a lab safety quiz. Don't leave
any bracket tag such as [unverified] inside a question.
```

study-plan-builder.recipe.md

## Summary

Fixed the Study Plan Builder recipe (v1.0.2 → v1.0.3) to close two gaps the Tester found in Test 1: Week 1 practice questions had asked about communication through the nuclear envelope's pores (a membrane-transport question) and about how organelles perform their functions, instead of sticking to shape, parts, and location. The recipe body now generalizes its "no cell membrane transport" and "no organelle function" rules to cover any membrane and any function-based question, and the Spec's A3/A4 acceptance criteria were reworded to match while A1, A2, A5, and A6 keep their prior checks.
