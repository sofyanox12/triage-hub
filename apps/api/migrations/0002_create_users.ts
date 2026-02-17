import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('users')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('email', 'text', (col) => col.notNull().unique())
        .addColumn('password', 'text', (col) => col.notNull())
        .addColumn('type', 'text', (col) =>
            col.notNull().check(sql`type IN ('AGENT', 'CUSTOMER')`)
        )
        .addColumn('created_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute()

    await sql`
        CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `.execute(db)

    await db.schema
        .createIndex('idx_users_email')
        .on('users')
        .column('email')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').ifExists().execute()
}
