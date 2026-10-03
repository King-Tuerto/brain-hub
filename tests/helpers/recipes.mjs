// Recipe texts used by e2e tests (installed by pasting, or served by the fake GitHub).
export { NETWORKING_PREP } from '../unit/_fixtures.mjs'

export const REQUIRED_TOOL = `---
recipe_format: 1
id: company-news
name: Company News
description: The latest news about a company.
version: 1.0.0
author: Nitpick
permissions: [run_ai]
web_search: required
inputs:
  - id: company
    label: Company
    type: text
    required: true
output:
  sections: [Latest news, What it means]
---
Find the latest news about {{company}} as of {{today}}.
`

export const NONE_TOOL = `---
recipe_format: 1
id: tidy-text
name: Tidy Text
description: Rewrites a paragraph more clearly.
version: 1.0.0
author: Nitpick
permissions: [run_ai]
web_search: none
inputs:
  - id: text
    label: Your paragraph
    type: long_text
    required: true
output:
  sections: [Rewrite, What changed]
---
Rewrite this paragraph more clearly:

{{text}}
`

export const GH_TOOL = `---
recipe_format: 1
id: gh-tool
name: From GitHub
description: A plugin found through the GitHub API.
version: 1.0.0
author: Nitpick
permissions: [run_ai]
web_search: none
inputs:
  - id: thing
    label: Thing
    type: text
    required: true
output:
  sections: [One, Two]
---
Tell me about {{thing}}.
`

export const MANIFEST_TOOL = GH_TOOL.replace('id: gh-tool', 'id: manifest-tool').replace('name: From GitHub', 'name: From Manifest')

export const BAD_RECIPE = `---
recipe_format: 2
id: Bad_Tool
name: Bad
description: <script>alert(1)</script>
version: 1.0
author: Nitpick
permissions: [run_ai, delete_everything]
web_search: sometimes
inputs:
  - id: x
    label: X
    type: date
    required: true
output:
  sections: [Only one]
---
Hello {{ghost}}
`

// An answer with a dangerous payload, no sources, and a missing section.
export const HOSTILE_ANSWER = `## Key points
- Plain point with no link <img src=x onerror="window.__pwned=1">
<script>window.__pwned=2</script>

## Summary
A summary with no sources.
`
