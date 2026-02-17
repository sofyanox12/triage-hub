import { db, sql } from '../lib/db'

async function resetTickets() {
    console.log('Resetting tickets...')
    await sql`TRUNCATE TABLE tickets RESTART IDENTITY CASCADE`.execute(db)
    console.log('Tickets reset successfully.')
}

async function resetUsers() {
    console.log('Resetting users (cascading to tickets)...')
    await sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`.execute(db)
    console.log('Users and associated tickets reset successfully.')
}

async function resetAll() {
    console.log('Resetting all tables...')
    await sql`TRUNCATE TABLE users, migrations, migration_lock RESTART IDENTITY CASCADE`.execute(db)
    await sql`TRUNCATE TABLE users, tickets RESTART IDENTITY CASCADE`.execute(db)
    console.log('All tables reset successfully.')
}

async function main() {
    const arg = process.argv[2]

    try {
        if (arg === '--tickets') {
            await resetTickets()
        } else if (arg === '--users') {
            await resetUsers()
        } else if (arg === '--all') {
            await resetAll()
        } else {
            console.error('Usage: tsx src/scripts/db-reset.ts [--tickets|--users|--all]')
            process.exit(1)
        }
        process.exit(0)
    } catch (error) {
        console.error('Reset failed:', error)
        process.exit(1)
    }
}

main()
