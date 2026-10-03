// Builds a throwaway Express brain in PGlite (in memory) from the verbatim
// fixture migration. Only what the migration references is stubbed, and the
// stubs mirror what a real Supabase project provides.
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { vector } from '@electric-sql/pglite-pgvector'

export const FIXTURE = new URL('../fixtures/express-migration.sql', import.meta.url)

// What a Supabase project already has before migration.sql is pasted in.
export const SUPABASE_STUBS = [
  // Roles PostgREST switches to. NOLOGIN, no BYPASSRLS, like Supabase.
  `CREATE ROLE anon NOLOGIN NOINHERIT`,
  `CREATE ROLE authenticated NOLOGIN NOINHERIT`,
  // auth schema + the two objects the migration references.
  `CREATE SCHEMA auth`,
  `CREATE TABLE auth.users (id uuid PRIMARY KEY, email text)`,
  `CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
     $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$`,
  `GRANT USAGE ON SCHEMA auth TO anon, authenticated`,
  `GRANT USAGE ON SCHEMA public TO anon, authenticated`,
  // Supabase grants table privileges to anon/authenticated by default; RLS is
  // what keeps them out. Without this the "locked" result would come from a
  // missing GRANT, not from RLS, and prove nothing.
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated`,
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated`,
  `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated`,
]

// Statements removed from an in-memory copy of the migration because PGlite
// cannot run them. Each entry: [pattern, reason]. Currently none are needed;
// the test prints this list so any future strip is visible in the output.
export const STRIPS = []

export async function migrationText() {
  let sql = await readFile(FIXTURE, 'utf8')
  if (sql.charCodeAt(0) === 0xfeff) sql = sql.slice(1)
  const stripped = []
  for (const [re, reason] of STRIPS) {
    const before = sql
    sql = sql.replace(re, `-- [stripped by test: ${reason}]`)
    if (sql !== before) stripped.push(reason)
  }
  return { sql, stripped }
}

export const USER_A = '11111111-1111-4111-8111-111111111111'

export async function createBrain() {
  const db = await PGlite.create({ extensions: { vector } })
  for (const s of SUPABASE_STUBS) await db.exec(s)
  const { sql, stripped } = await migrationText()
  await db.exec(sql)
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1, 'student@example.com')`, [USER_A])
  return { db, stripped }
}

export async function rowCount(db) {
  await db.exec('RESET ROLE')
  const r = await db.query('SELECT count(*)::int AS n FROM thoughts')
  return r.rows[0].n
}

// Runs one statement as a role, in its own call, and returns the SQLSTATE
// (or null on success). Always resets the role afterwards.
export async function asRole(db, role, sql, params = [], sub = null) {
  await db.exec(`SET ROLE ${role}`)
  await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [sub ?? ''])
  try {
    await db.query(sql, params)
    return { code: null, message: null }
  } catch (e) {
    return { code: e.code, message: e.message }
  } finally {
    await db.exec('RESET ROLE')
    await db.query(`SELECT set_config('request.jwt.claim.sub', '', false)`)
  }
}

export const OPEN_POLICY = [
  `CREATE POLICY temporary_open_access ON thoughts FOR ALL TO anon USING (true) WITH CHECK (true)`,
  `GRANT ALL ON thoughts TO anon`,
]
