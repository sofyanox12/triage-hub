import { defineConfig } from 'kysely-ctl'
import { PostgresDialect } from 'kysely'
import pg from 'pg'

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

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new Pool(getConnectionConfig()),
    }),
    migrations: {
        migrationFolder: 'migrations',
    },
})
