## Test plan

**Changes made since last time:**
- [A4] in Test 1, Test 2 and Test 3: the check now also covers answer explanations. It used to cover "questions, options or answers"; now it covers "questions, options, answers or answer explanations". Why: criterion A4 in the Spec now names "its answer explanation" as a place where later-week topic words must not appear. That part is new, so the check had to change to match it. Nothing else in the check changed.
- No other changes. Every other check is copied word for word, because A1, A2, A3, A5, A6 and the section order are the same in the Spec.

**Coverage:**

| Criterion | Test 1 | Test 2 | Test 3 |
|---|---|---|---|
| Section order | Yes | Yes | Yes |
| A1: one entry per week up to and including the exam week, no Exam Day or single-day entries | Yes | — | Yes |
| A2: 8 weeks when there is no exam date, with a line saying so | — | Yes | — |
| A3: exactly 5 practice questions | Yes | Yes | Yes |
| A4: practice questions use only Week 1 topics | Yes | Yes | Yes |
| A5: every week names a syllabus topic | Yes | Yes | Yes |
| A6: Summary is 2–3 sentences | Yes | Yes | Yes |

Every criterion is covered by at least one test.

## Test cases

### Test 1: normal use

**Inputs to type**
- **Class syllabus:** `ECON 101. Week 1: Scarcity and opportunity cost. Week 2: Supply and demand. Week 3: Elasticity. Week 4: Consumer choice. Week 5: Production costs. Week 6: Monopoly. Week 7: Inflation. Final exam covers all weeks.`
- **Exam date:** `2026-11-18`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 7 week entries (blocks starting 2026-10-04, 10-11, 10-18, 10-25, 11-01, 11-08 and 11-15; the last one contains 2026-11-18). Count them: 7, not 6 and not 8.
- [A1] No line in the answer says 8 weeks was assumed, and the words "no exam date" do not appear.
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-11-18 on its own). Every entry label names a week or a date range.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences. Count sentences by the full stops, question marks or exclamation marks that end them.

### Test 2: edge case, optional input left blank

**Inputs to type**
- **Class syllabus:** `BIO 110. Week 1: Cell structure. Week 2: Mitosis. Week 3: Meiosis. Week 4: Genetics. Week 5: Evolution. Week 6: Ecology. Week 7: Photosynthesis. Week 8: Enzymes. Final exam covers all weeks.`
- **Exam date:** leave blank

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A2] The Study Plan section has exactly 8 week entries. Count them: 8.
- [A2] One line in the answer contains both "8 weeks" (or "eight weeks") and the words "exam date".
- [A2] No exam date (no date in YYYY-MM-DD or written-out form) is presented as the exam date.
- [A5] Each of the 8 week entries contains at least one of these words: cell, mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzymes (any capitalisation; singular or plural counts).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-10-07 on its own). The Study Plan has one entry only, not a day-by-day list.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] *(changed)* If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.

## How to run them

1. Open the Syllabus Study Planner tool.
2. Run it once for Test 1. Type the inputs exactly as shown under "Inputs to type", with nothing added or removed.
3. Copy the tool's whole answer, from the first line to the last, and paste it somewhere safe. Label it "Test 1".
4. Do the same for Test 2. Leave the Exam date box completely empty. Label the answer "Test 2".
5. Do the same for Test 3. Label the answer "Test 3".
6. Open a **new chat**. Do not use the chat that built the tool.
7. Open "Tester 2 — grade" and paste in three things together: the Spec above, these test cases, and the three answers labelled Test 1, Test 2 and Test 3.
8. Send it and read the grades.

## Summary

These are retest cases for the Syllabus Study Planner. They copy the previous tests word for word except for the A4 check, which now also bans later-week topic words in answer explanations. The three tests cover a normal 7-week ECON syllabus, a blank exam date that should give 8 weeks, and a two-week syllabus with the exam in the current week.
