import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('tickets')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn('customer_id', 'uuid', (col) =>
            col.notNull().references('users.id')
        )
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('resolution_response', 'text')
        .addColumn('urgency', 'text', (col) =>
            col.check(sql`urgency IN ('HIGH', 'MEDIUM', 'LOW')`)
        )
        .addColumn('sentiment', 'integer')
        .addColumn('category', 'text', (col) =>
            col.check(
                sql`category IN ('BILLING', 'TECHNICAL', 'FEATURE_REQUEST')`
            )
        )
        .addColumn('status', 'text', (col) =>
            col
                .notNull()
                .defaultTo('PENDING')
                .check(
                    sql`status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'RESOLVED', 'FAILED', 'CANCELLED')`
                )
        )
        .addColumn('created_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('latest_draft_updated_by', 'uuid', (col) =>
            col.references('users.id').onDelete('set null')
        )
        .execute()

    await sql`
        CREATE TRIGGER trg_tickets_updated_at
        BEFORE UPDATE ON tickets
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `.execute(db)

    await db.schema
        .createIndex('idx_tickets_customer_id')
        .on('tickets')
        .column('customer_id')
        .execute()

    await db.schema
        .createIndex('idx_tickets_status')
        .on('tickets')
        .column('status')
        .execute()

    await db.schema
        .createIndex('idx_tickets_urgency')
        .on('tickets')
        .column('urgency')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('tickets').ifExists().execute()
}
