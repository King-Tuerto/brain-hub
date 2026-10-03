// GitHub Pages runs Jekyll unless the repo root has a .nojekyll file. Jekyll
// turns every .md file that starts with "---" (every recipe) into an HTML page
// and treats {{placeholders}} as template code, so recipe URLs 404 on the live
// site. The local test server serves files untouched and can't see this, which
// is how it shipped unnoticed from Phase 2 to Phase 5.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'

test('.nojekyll exists at the repo root, so Pages serves recipes as raw files', async () => {
  await assert.doesNotReject(access(new URL('../../.nojekyll', import.meta.url)))
})
