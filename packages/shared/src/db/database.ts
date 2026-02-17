import { Kysely, PostgresDialect, sql, CamelCasePlugin } from 'kysely'
import pg from 'pg'
import type { Database } from './types'

const { Pool } = pg

function getConnectionConfig() {
    if (process.env.DATABASE_URL)
        return { connectionString: process.env.DATABASE_URL }
    return {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'triage_hub',
        user: process.env.DB_USER || 'triage',
        password: process.env.DB_PASSWORD || 'triage',
    }
}

export const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool: new Pool(getConnectionConfig()) }),
    plugins: [new CamelCasePlugin()],
})

export { Kysely, sql }
