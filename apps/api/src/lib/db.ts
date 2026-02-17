import { db as sharedDb, sql, Kysely } from '@triage/shared/server'
import { type DbExecutor, type Database } from '@triage/shared'

const db: Kysely<Database> = sharedDb
export { db, sql, type DbExecutor, type Database }
