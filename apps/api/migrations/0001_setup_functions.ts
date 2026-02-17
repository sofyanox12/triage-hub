import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await sql`
        CREATE OR REPLACE FUNCTION set_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    await sql`DROP FUNCTION IF EXISTS set_updated_at() CASCADE`.execute(db)
}
