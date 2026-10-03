---
recipe_format: 1
id: interview-prep
name: Interview Prep
description: Paste a job posting and get resume must-haves, weakness defenses, likely interview questions, and smart questions to ask.
version: 1.0.0
author: Maria Lopez
permissions: [search_brain, save_to_brain, run_ai]
web_search: helpful
sourcing: advice
inputs:
  - id: company_name
    label: Company name
    type: text
    required: true
  - id: job_posting
    label: Paste the job posting
    type: long_text
    required: true
    help: The full listing — responsibilities, requirements, anything else posted.
  - id: weaknesses
    label: Your known weaknesses or gaps (optional)
    type: long_text
    required: false
    help: Things you're worried a recruiter will flag — skills, experience, gaps in your history.
brain_context:
  query: "{{company_name}}"
  limit: 5
output:
  sections: [Resume essentials, Defending your weaknesses, Questions to prepare for, Smart questions to ask]
save:
  type: work_product
  tags: [interview-prep, "{{company_name}}"]
---
I'm a university student preparing for a job application and interview on {{today}}.

Company: {{company_name}}

Job posting:
{{job_posting}}

My known weaknesses or gaps: {{weaknesses}}

What I already know from my own notes:
{{brain_context}}

If my weaknesses are (not provided), pick the two or three gaps most common for
this kind of role and say that is what you did.

Look into the company briefly if it helps. Then tell me what a strong resume
for this specific job should include — the skills, experience and keywords to
highlight — using only what you know about me plus placeholders like [your
project] where you don't. Next, help me defend my weaknesses with honest,
confident framing I can use in an interview. Then give me the questions I
should prepare for, from standard ones to questions specific to this role.
Finally, give me smart, specific questions to ask the interviewer that show I
understood the posting and did my homework on the company.
