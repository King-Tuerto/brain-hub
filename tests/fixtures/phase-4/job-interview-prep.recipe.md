---
recipe_format: 1
id: job-interview-prep
name: Job & Interview Prep
description: Paste a job posting and get resume tips, weakness defenses, likely interview questions, and smart questions to ask.
version: 1.0.0
author: Maria Lopez
permissions: [search_brain, save_to_brain, run_ai]
web_search: required
inputs:
  - id: job_posting
    label: Paste the job posting
    type: long_text
    required: true
    help: Copy the whole listing — title, responsibilities, and requirements.
  - id: known_weaknesses
    label: Weaknesses you want help defending
    type: long_text
    required: false
    help: Gaps in experience, a skill you're light on, a career change — whatever worries you.
brain_context:
  query: "resume background skills experience"
  limit: 5
output:
  sections: [Resume Highlights, Defending Your Weaknesses, Interview Questions to Prepare For, Smart Questions to Ask]
save:
  type: work_product
  tags: [job-search, interview-prep]
---
I'm Maria Lopez, a university student preparing to apply for a job, on {{today}}.

Job posting:
{{job_posting}}

Weaknesses I want help defending:
{{known_weaknesses}}

What you know about my background, skills and experience:
{{brain_context}}

Based on the job posting, tell me what a strong resume for this role should
include and emphasize given my background. Help me defend my known weaknesses
so they come across as strengths or non-issues. Give me the questions I
should prepare for in the interview, and give me smart, specific questions to
ask the interviewer that show I understand the role and the company.
