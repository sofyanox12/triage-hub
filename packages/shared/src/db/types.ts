import type { Generated, Kysely, Transaction } from 'kysely'

/**
 * Database executable(s)
 */
type DbTransaction = Transaction<Database>
type DbExecutor = Kysely<Database> | DbTransaction


/**
 * Ticket enum(s)
 */
type TicketStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'RESOLVED'
    | 'FAILED'
    | 'CANCELLED'

type TicketCategory = 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST'
type TicketUrgency = 'HIGH' | 'MEDIUM' | 'LOW'
type UserType = 'AGENT' | 'CUSTOMER'


/**
 * Database table(s)
 */
interface TicketsTable {
    id: Generated<string>
    customerId: string
    title: string
    description: string
    resolutionResponse: string | null
    urgency: TicketUrgency | null
    sentiment: number | null
    category: TicketCategory | null
    status: Generated<TicketStatus>
    createdAt: Generated<Date>
    updatedAt: Generated<Date>
    latestDraftUpdatedBy: string | null
}

interface UsersTable {
    id: Generated<string>
    name: string
    email: string
    password: string
    type: UserType
    createdAt: Generated<Date>
    updatedAt: Generated<Date>
}


/**
 * Database interface
 */
interface Database {
    tickets: TicketsTable
    users: UsersTable
}

export type {
    Database,
    DbTransaction,
    DbExecutor,
    TicketsTable,
    UsersTable,
    TicketStatus,
    TicketCategory,
    TicketUrgency,
    UserType,
}
