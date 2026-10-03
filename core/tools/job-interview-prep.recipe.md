---
recipe_format: 1
id: job-interview-prep
name: Job & Interview Prep
description: Paste a job posting and get what your resume should show, how to handle your gaps, questions to prepare, and questions to ask.
version: 1.0.0
author: Brain Hub
permissions: [search_brain, save_to_brain, run_ai]
web_search: helpful
sourcing: advice
inputs:
  - id: company_name
    label: Company
    type: text
    required: true
    placeholder: e.g. Northwind Analytics
  - id: job_posting
    label: Paste the job posting
    type: long_text
    required: true
    help: The whole listing — title, responsibilities, requirements.
  - id: my_background
    label: Your background (optional)
    type: long_text
    required: false
    help: A few lines or your resume — projects, jobs, clubs, skills. Only what is true.
  - id: weaknesses
    label: Gaps you're worried about (optional)
    type: long_text
    required: false
    help: A skill you're light on, little experience, a career change.
brain_context:
  query: "{{company_name}}"
  limit: 5
output:
  sections: [Resume essentials, Handling your gaps, Questions to prepare for, Smart questions to ask]
save:
  type: work_product
  tags: [job-prep, "{{company_name}}"]
---
I'm a university student preparing to apply and interview for this job on {{today}}.

Company: {{company_name}}

Job posting:
{{job_posting}}

My background, in my own words:
{{my_background}}

Gaps I'm worried about:
{{weaknesses}}

What my own notes say about this company or my experience:
{{brain_context}}

Use only the background above and my notes as facts about me. If my background is (not provided) and my notes are empty, give advice that works for any student and use placeholders such as [your project] or [your result] wherever my own details belong. If my gaps are (not provided), cover the two or three gaps most common for this kind of role, and say that is what you did.

Resume essentials: what a strong resume for this specific job must show, using the posting's own words for skills and keywords to mirror. Where my background already shows something, point to it; where it does not, say what kind of evidence would show it.

Handling your gaps: for each gap, an honest, confident way to address it in an interview, plus one concrete step I could take before the interview.

Questions to prepare for: the questions this interviewer is most likely to ask — common ones and ones specific to this posting — each with a one-line note on what a strong answer shows.

Smart questions to ask: five or six specific questions that show I read the posting closely and researched the company.
