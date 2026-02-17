import { db, DbExecutor, Database } from '../../lib/db'
import type { TicketStatus } from '@triage/shared'
import type { Generated, Insertable, Kysely, Transaction, Updateable } from 'kysely'

interface CreateTicketData {
    id: string
    customerId: string
    title: string
    description: string
    status: TicketStatus
}

interface FindManyOptions {
    skip: number
    take: number
    sort: 'createdAt' | 'urgency'
    order: 'asc' | 'desc'
}

class TicketRepository {
    /**
     * Creates a new ticket record in the database.
     * @param ticket - The ticket data to insert.
     * @returns The created ticket record.
     */
    static async create(ticket: Insertable<Database['tickets']>, trx: DbExecutor = db) {
        return trx
            .insertInto('tickets')
            .values({
                ...ticket,
                urgency: null,
                sentiment: null,
                category: null,
                resolutionResponse: null,
            })
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    /**
     * Counts total tickets matching filters.
     * @param filters - Search criteria.
     * @returns Object containing total count.
     */
    static async count(
        filters: { customerId?: string; status?: TicketStatus; search?: string } = {},
        trx: DbExecutor = db
    ) {
        let query = trx
            .selectFrom('tickets')
            .select(({ fn }) => fn.countAll<number>().as('count'))

        if (filters.customerId) {
            query = query.where('customerId', '=', filters.customerId)
        }
        if (filters.status) {
            query = query.where('status', '=', filters.status)
        }
        if (filters.search) {
            const searchPattern = `%${filters.search}%`
            query = query.where((eb) =>
                eb.or([
                    eb('title', 'ilike', searchPattern),
                    eb('description', 'ilike', searchPattern),
                ])
            )
        }

        const result = await query.executeTakeFirstOrThrow()
        return { count: Number(result.count) }
    }

    /**
     * Retrieves count of tickets grouped by status.
     * @returns Array of status counts.
     */
    static async getStatusCounts(
        filters: { customerId?: string; status?: TicketStatus } = {},
        trx: DbExecutor = db
    ) {
        let query = trx
            .selectFrom('tickets')
            .select(({ fn }) => fn.countAll<number>().as('total'))

        if (filters.customerId) {
            query = query.where('customerId', '=', filters.customerId)
        }

        if (filters.status) {
            query = query.where('status', '=', filters.status)
        }

        const result = await query.executeTakeFirstOrThrow()
        return result.total
    }

    /**
     * Finds tickets matching the given filters and pagination.
     * @param filters - Search criteria (status, urgency, search text).
     * @param pagination - Page and limit.
     * @returns An object with tickets array and total count.
     */
    static async findMany(
        options: FindManyOptions & { customerId?: string },
        trx: DbExecutor = db
    ) {
        let query = trx
            .selectFrom('tickets')
            .leftJoin('users', 'tickets.customerId', 'users.id')
            .selectAll('tickets')
            .select(['users.name as customerName', 'users.email as customerEmail'])

        if (options.customerId) {
            query = query.where('tickets.customerId', '=', options.customerId)
        }

        if (options.sort === 'urgency') {
            query = query
                .orderBy('urgency', options.order)
                .orderBy('createdAt', 'desc')
        } else {
            query = query.orderBy('createdAt', options.order)
        }

        return query.offset(options.skip).limit(options.take).execute()
    }

    /**
     * Finds a ticket by its ID.
     * @param id - The ticket ID.
     * @returns The ticket record or undefined if not found.
     */
    static async findById(id: string, trx: DbExecutor = db) {
        return trx
            .selectFrom('tickets')
            .leftJoin('users', 'tickets.customerId', 'users.id')
            .selectAll('tickets')
            .select(['users.name as customerName', 'users.email as customerEmail'])
            .where('tickets.id', '=', id)
            .executeTakeFirst()
    }

    /**
     * Update ticket status
     * @param id Ticket ID
     * @param fromStatus Current status
     * @param toStatus New status
     * @param trx Database executor
     * @returns Update result
     */
    static async updateStatus(
        id: string,
        fromStatus: TicketStatus,
        toStatus: TicketStatus,
        trx: DbExecutor = db
    ): Promise<{ numUpdatedRows: bigint }> {
        const result = await trx
            .updateTable('tickets')
            .set({ status: toStatus })
            .where('id', '=', id)
            .where('status', '=', fromStatus)
            .executeTakeFirst()
        return { numUpdatedRows: result.numUpdatedRows }
    }

    /**
     * Updates an existing ticket.
     * @param id - The ticket ID.
     * @param updates - Partial ticket data to update.
     * @returns The updated ticket record.
     */
    static async update(
        id: string,
        updates: Updateable<Database['tickets']>,
        trx: DbExecutor = db
    ) {
        return trx
            .updateTable('tickets')
            .set(updates)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
    }

    /**
     * Retrieves a summary of ticket statistics (total, resolved, unresolved).
     * @param customerId - Optional customer ID filter.
     * @returns Object with statistics.
     */
    static async getSummary(customerId?: string) {
        const query = db.selectFrom('tickets')

        const baseQuery = customerId
            ? query.where('customerId', '=', customerId)
            : query

        const [total, resolved] = await Promise.all([
            baseQuery
                .select(({ fn }) => fn.countAll<number>().as('count'))
                .executeTakeFirstOrThrow(),
            baseQuery
                .where('status', '=', 'RESOLVED')
                .select(({ fn }) => fn.countAll<number>().as('count'))
                .executeTakeFirstOrThrow(),
        ])

        return {
            total: total.count,
            resolved: resolved.count,
            unresolved: total.count - resolved.count,
        }
    }
}

export { TicketRepository }
export type { CreateTicketData, FindManyOptions }
