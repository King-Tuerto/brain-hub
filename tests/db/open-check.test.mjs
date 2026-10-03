// PLAN "Database proof" / DECISIONS Q3: the open-database check against the
// real Express migration, in a throwaway in-memory Postgres (PGlite).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createBrain, rowCount, asRole, OPEN_POLICY, USER_A, STRIPS } from './pglite-brain.mjs'

const PROBE = 'INSERT INTO thoughts (content) VALUES (NULL)'

async function seed(db) {
  await db.query(`INSERT INTO thoughts (content, user_id) VALUES ('seeded thought', $1)`, [USER_A])
}

async function openUp(db) {
  for (const s of OPEN_POLICY) await db.exec(s)
}

test('migration runs on stubs; strips recorded', async (t) => {
  const { db, stripped } = await createBrain()
  t.diagnostic(`stubbed: roles anon/authenticated, schema auth, auth.users, auth.uid(), Supabase default grants`)
  t.diagnostic(`stripped from migration copy: ${stripped.length ? stripped.join('; ') : 'nothing'}`)
  assert.equal(stripped.length, STRIPS.length)
  const r = await db.query(`SELECT relrowsecurity FROM pg_class WHERE relname = 'thoughts'`)
  assert.equal(r.rows[0].relrowsecurity, true, 'RLS must be on for thoughts')
  const anonPolicies = await db.query(
    `SELECT policyname FROM pg_policies WHERE tablename = 'thoughts' AND 'anon' = ANY(roles)`)
  assert.equal(anonPolicies.rows.length, 0, 'locked brain has no anon policy')
  await db.close()
})

for (const seeded of [false, true]) {
  const label = seeded ? 'seeded' : 'empty'

  test(`locked brain (${label}): anon null insert → 42501 from RLS, nothing written`, async () => {
    const { db } = await createBrain()
    if (seeded) await seed(db)
    const before = await rowCount(db)
    assert.equal(before, seeded ? 1 : 0)
    const r = await asRole(db, 'anon', PROBE)
    assert.equal(r.code, '42501', r.message)
    // It must be the policy, not a missing GRANT (anon has table privileges via the stubbed defaults).
    assert.match(r.message, /row-level security/i)
    assert.equal(await rowCount(db), before)
    await db.close()
  })

  test(`open June-cohort brain (${label}): anon null insert → 23502, nothing written`, async () => {
    const { db } = await createBrain()
    if (seeded) await seed(db)
    await openUp(db)
    const before = await rowCount(db)
    const r = await asRole(db, 'anon', PROBE)
    // Reaching 23502 also proves the dedup trigger does not raise on null content.
    assert.equal(r.code, '23502', r.message)
    assert.match(r.message, /content/)
    assert.equal(await rowCount(db), before)
    await db.close()
  })
}

test('control: open brain really is open (anon can read the seeded row)', async () => {
  const { db } = await createBrain()
  await seed(db)
  await openUp(db)
  await db.exec('SET ROLE anon')
  const r = await db.query('SELECT count(*)::int AS n FROM thoughts')
  await db.exec('RESET ROLE')
  assert.equal(r.rows[0].n, 1)
  // and locked brain returns zero rows to anon — the reason a read check cannot tell them apart when empty
  const { db: locked } = await createBrain()
  await seed(locked)
  await locked.exec('SET ROLE anon')
  const r2 = await locked.query('SELECT count(*)::int AS n FROM thoughts')
  await locked.exec('RESET ROLE')
  assert.equal(r2.rows[0].n, 0)
  await db.close(); await locked.close()
})

const UPSERT = `
  INSERT INTO thoughts (user_id, source, content, metadata)
  VALUES ($1, 'brain-hub', $2, $3::jsonb)
  ON CONFLICT (dedup_key, user_id) DO UPDATE
    SET content = excluded.content, source = excluded.source, metadata = excluded.metadata`

const hubMeta = (extra = {}) => JSON.stringify({
  hub: { tool: 'hello-hub', tool_version: '1.0.0', type: 'work_product', tags: ['hello-hub', 'pricing'],
    report: '## Key points\n- a', sources: ['https://example.com/a'], saved_at: '2026-10-03T12:00:00.000Z',
    archived: false, ...extra },
})

test('save upsert as authenticated: same content twice → one row, metadata survives', async () => {
  const { db } = await createBrain()
  const content = 'Pricing strategy summary for later search.'
  const a = await asRole(db, 'authenticated', UPSERT, [USER_A, content, hubMeta()], USER_A)
  assert.equal(a.code, null, a.message)
  const b = await asRole(db, 'authenticated', UPSERT, [USER_A, content, hubMeta({ tags: ['hello-hub', 'pricing', 'v2'] })], USER_A)
  assert.equal(b.code, null, b.message)
  const r = await db.query(`SELECT user_id, source, metadata FROM thoughts`)
  assert.equal(r.rows.length, 1)
  assert.equal(r.rows[0].user_id, USER_A)
  assert.equal(r.rows[0].source, 'brain-hub')
  assert.equal(r.rows[0].metadata.hub.tool, 'hello-hub')
  assert.deepEqual(r.rows[0].metadata.hub.tags, ['hello-hub', 'pricing', 'v2'])
  assert.equal(r.rows[0].metadata.hub.report, '## Key points\n- a')
  await db.close()
})

test('authenticated cannot save a row for another user (RLS with check)', async () => {
  const { db } = await createBrain()
  const other = '22222222-2222-4222-8222-222222222222'
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'other@example.com')`, [other])
  const r = await asRole(db, 'authenticated', UPSERT, [other, 'x', hubMeta()], USER_A)
  assert.equal(r.code, '42501')
  assert.equal(await rowCount(db), 0)
  await db.close()
})

test('enrichment-style update of tags/category/summary leaves metadata.hub intact', async () => {
  const { db } = await createBrain()
  const content = 'Summary to enrich.'
  assert.equal((await asRole(db, 'authenticated', UPSERT, [USER_A, content, hubMeta()], USER_A)).code, null)
  // enrich-thought runs with the service role (bypasses RLS); superuser here.
  await db.query(`UPDATE thoughts SET tags = ARRAY['ai-picked'], category = 'idea', summary = 'ai summary', enriched_at = now()`)
  const r = await db.query(`SELECT tags, category, summary, metadata FROM thoughts`)
  assert.deepEqual(r.rows[0].tags, ['ai-picked'])
  assert.deepEqual(r.rows[0].metadata, JSON.parse(hubMeta()))
  await db.close()
})

test('archive PATCH as owner: metadata.hub.archived = true, row still present', async () => {
  const { db } = await createBrain()
  assert.equal((await asRole(db, 'authenticated', UPSERT, [USER_A, 'to archive', hubMeta()], USER_A)).code, null)
  const id = (await db.query('SELECT id FROM thoughts')).rows[0].id
  const patched = JSON.stringify(JSON.parse(hubMeta({ archived: true })))
  const r = await asRole(db, 'authenticated', `UPDATE thoughts SET metadata = $1::jsonb WHERE id = $2`, [patched, id], USER_A)
  assert.equal(r.code, null, r.message)
  const row = (await db.query('SELECT metadata FROM thoughts')).rows[0]
  assert.equal(row.metadata.hub.archived, true)
  assert.equal(row.metadata.hub.tool, 'hello-hub')
  await db.close()
})
