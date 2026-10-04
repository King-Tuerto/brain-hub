## Steps

1. Takes in your pasted class syllabus and, if you have it, your exam date.
2. Builds a week-by-week study plan using only topics that appear in the syllabus, in the order they appear there.
3. If no exam date is given, plans around the weeks or sessions the syllabus already lists and ends with one review week of already-listed topics; if an exam date is given, counts every calendar week from today through the exam week, one numbered entry per week, with no overlapping or grouped weeks.
4. Applied the Tester's fix [A4, Test 2]: added an instruction telling the AI to check each of the 5 practice questions against the topics listed under every later week, and to replace any question that names or overlaps a later week's topic (such as a question on the cell membrane leaking into what Week 2 covers), before finishing.
5. Writes exactly 5 practice questions based only on the first week's (or first session's) topics.
6. Returns the answer as two sections: Study plan, then Practice questions.

## Spec

**Tool name:** Exam Study Planner — turns a pasted class syllabus (and, if known, an exam date) into a week-by-week study plan that ends with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** — required, long text. Example: "Week 1: Cell structure and function. Week 2: Cell membranes and transport. Week 3: Cellular respiration."
- **Exam date** — optional, short text. Example: "2026-12-10"

**Output:** two sections, in this order:
1. **Study plan** — one numbered entry per week ("Week 1", "Week 2", ...). Each week lists only topics that appear in the pasted syllabus, in the order they appear there. No two weeks' dates overlap, and weeks are never grouped into a range.
2. **Practice questions** — exactly 5 questions, based only on the first week's (or first session's) topics.

**Acceptance criteria:**
- **A1:** With an exam date given, the plan has one entry for every calendar week from today through the week containing the exam date, including a final partial week if there is one.
- **A2:** With no exam date, the plan is built around the weeks or sessions already listed in the syllabus, ends with one review week covering only topics already listed (no new topics), and says the student should add the real exam date later for exact timing.
- **A3:** Every week lists only topics that appear in the pasted syllabus, in the order they appear there; if the syllabus has fewer topics than there are weeks, the extra weeks review topics already listed instead of introducing new ones.
- **A4:** There are exactly 5 practice questions, and every one of them stays strictly inside the first week's (or first session's) topics — none of them names, compares to, or otherwise overlaps a topic listed under any later week or session in the plan.
- **A5:** No practice question mentions a later week or session by name or number.
- **A6:** Weeks are each a single numbered entry, never a combined range, and no two weeks' date spans overlap.

**Blank inputs:** If "Exam date" is left blank, the plan must be built around the syllabus's own weeks or sessions rather than counted down to a date, must end with one review week of topics already listed (no new ones), and must tell the student to add their real exam date later for exact timing.

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turns your pasted syllabus into a week-by-week study plan ending in 5 practice questions on week one.
version: 1.0.2
author: "[your name]"
permissions: [run_ai]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    help: Include topics, and weeks or dates if your syllabus lists them.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: "e.g. 2026-12-10"
output:
  sections: [Study plan, Practice questions]
---
I'm a university student preparing for an exam. Today's date is {{today}}.

Here is my class syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), build the plan around the weeks or
sessions already listed in the syllabus instead of counting down to a date,
end with one review week covering syllabus topics already listed (no new
topics), and say that I should add my real exam date later for exact timing.

If my exam date is provided, count every calendar week from {{today}} through
the week that contains the exam date, including a final partial week if there
is one, and give each week its own single numbered entry (Week 1, Week 2,
...). Never group weeks into a range and never let two weeks' dates overlap.

Build me a week-by-week study plan. Under each week, list only topics that
appear in the syllabus above, in the order they appear there. If the syllabus
has fewer topics than there are weeks, use the remaining weeks to review
topics already listed instead of introducing new ones.

Then give me exactly 5 practice questions based only on the first week's (or
first session's) topics. Do not write a question that compares the first
week to, or mentions, any later week or session.

Before finishing, check each of the 5 questions against the topics you listed
under every later week in the plan above. If a question names, touches on, or
overlaps a topic that belongs to a later week or session, replace it with a
new question drawn only from the first week's topics.
---
```

exam-study-planner.recipe.md

## Summary

Exam Study Planner v1.0.2 fixes Tester finding [A4, Test 2] by adding a check step that compares each of the 5 practice questions against every later week's topics and replaces any question that leaks into a later week (the cell-membrane overlap seen in Test 2). The Spec's acceptance criteria A4 and A5 now require every practice question to stay strictly inside the first week's topics, with no mention of or comparison to later weeks or sessions.
