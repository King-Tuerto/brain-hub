---
recipe_format: 1
id: hello-hub
name: Hello Hub
description: A quick test tool — get the key points on any topic and what to do next.
version: 1.0.0
author: Brain Hub
permissions: [search_brain, save_to_brain, run_ai]
web_search: helpful
inputs:
  - id: topic
    label: Topic
    type: text
    required: true
    placeholder: e.g. supply chain risk
  - id: depth
    label: How deep?
    type: choose_one
    required: true
    options: [Quick, Thorough]
brain_context:
  query: "{{topic}}"
  limit: 3
output:
  sections: [Key points, Next steps]
save:
  type: work_product
  tags: [hello-hub, "{{topic}}"]
---
I'm a university student. Give me a {{depth}} overview of this topic: {{topic}}

What I already know about it:
{{brain_context}}

List the key points I should understand, building on what I already know, then
suggest two or three concrete next steps.
