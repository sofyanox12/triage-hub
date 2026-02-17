import { db, DbExecutor, Database } from '../lib/db'
import type { TicketStatus } from '@triage/shared'
import { Updateable } from 'kysely'

class TicketRepository {
    /**
     * Find ticket by ID
     */
    static async findById(id: string, trx: DbExecutor = db) {
        return trx
            .selectFrom('tickets')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst()
    }

    /**
     * Update ticket status
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
     * Generic update
     */
    static async update(
        id: string,
        data: Updateable<Database['tickets']>,
        trx: DbExecutor = db
    ) {
        return trx
            .updateTable('tickets')
            .set(data)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst()
    }
}

export { TicketRepository }
