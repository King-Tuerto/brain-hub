## Test plan

No changes: the tests are the same as last time.

Every acceptance criterion in the Spec matches what the previous tests already check, so all three tests are copied word for word to keep the bar fixed.

Coverage:
- **A1** (one entry per week through the exam week, exam week not split): Test 1, Test 3
- **A2** (8 weeks when no exam date, with a line saying so): Test 2
- **A3** (exactly 5 practice questions): Test 1, Test 2, Test 3
- **A4** (questions and options use only Week 1 topics): Test 1, Test 2, Test 3
- **A5** (every week names a syllabus topic): Test 1, Test 2, Test 3
- **A6** (Summary is 2–3 sentences): Test 1, Test 2, Test 3
- **Section order** (Study Plan, Practice Questions, Summary): Test 1, Test 2, Test 3

## Test cases

### Test 1: normal use

**Inputs to type**
- **Class syllabus:** `ECON 101. Week 1: Scarcity and opportunity cost. Week 2: Supply and demand. Week 3: Elasticity. Week 4: Consumer choice. Week 5: Production costs. Week 6: Monopoly. Week 7: Inflation. Final exam covers all weeks.`
- **Exam date:** `2026-11-18`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 7 week entries (blocks starting 2026-10-04, 10-11, 10-18, 10-25, 11-01, 11-08 and 11-15; the last one contains 2026-11-18). Count them: 7, not 6 and not 8.
- [A1] No line in the answer says 8 weeks was assumed, and the words "no exam date" do not appear.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
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
- [A4] Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options or answers; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.

## How to run them

1. Open the Syllabus Study Planner tool.
2. Run it once for Test 1: type exactly the inputs listed under Test 1 and run it. Copy the whole answer.
3. Run it again for Test 2 with exactly the Test 2 inputs (leave Exam date blank). Copy the whole answer.
4. Run it again for Test 3 with exactly the Test 3 inputs. Copy the whole answer.
5. Open a **new chat** (not the chat that built the tool).
6. Paste "Tester 2 — grade" into it, together with the Spec above and these test cases.
7. Paste the three answers, labelled "Test 1", "Test 2" and "Test 3".

## Summary

Retest of the Syllabus Study Planner with no changes: the three tests (ECON 101 with a 2026-11-18 exam, BIO 110 with no exam date, and a two-week syllabus with the exam this week) are copied word for word. They check one Study Plan entry per week through the exam week, the 8-week default, exactly 5 Week 1-only practice questions, and a 2–3 sentence Summary.
