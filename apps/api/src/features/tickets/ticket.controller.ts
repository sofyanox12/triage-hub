import { Request, Response } from 'express'
import { createTicketSchema } from '@triage/shared'
import { TicketService } from './ticket.service'
import {
    listTicketsQuerySchema,
} from './ticket.schema'
import { ResponseHelper } from '@/utils/response-helper'

class TicketController {
    /**
     * Creates new ticket.
     * POST /tickets
     */
    static async createTicket(req: Request, res: Response) {
        const payload = createTicketSchema.parse(req.body)
        const ticket = await TicketService.createTicket({
            ...payload,
            customerId: req.user!.id,
        })
        return ResponseHelper.created(res, ticket)
    }

    /**
     * Lists tickets with pagination and filtering.
     * GET /tickets
     */
    static async listTickets(req: Request, res: Response) {
        const query = listTicketsQuerySchema.parse(req.query)
        const result = await TicketService.listTickets(query, req.user!)
        return ResponseHelper.paginated(res, result.data, result.meta)
    }

    /**
     * Gets a single ticket by ID.
     * GET /tickets/:id
     */
    static async getTicketById(req: Request, res: Response) {
        const ticket = await TicketService.getTicketById(
            req.params.id as string,
            req.user!
        )
        return ResponseHelper.success(res, ticket)
    }

    /**
     * Resolves a ticket (Agent only).
     * POST /tickets/:id/resolve
     */
    static async resolveTicket(req: Request, res: Response) {
        if (req.user?.type !== 'AGENT') {
            return res
                .status(403)
                .json({ message: 'Only agents can resolve tickets' })
        }
        const ticket = await TicketService.resolveTicket(
            req.params.id as string
        )
        return ResponseHelper.success(res, ticket)
    }

    /**
     * Updates ticket properties (Agent only).
     * PATCH /tickets/:id/agent
     */
    static async updateTicketAgent(req: Request, res: Response) {
        if (req.user?.type !== 'AGENT') {
            return res
                .status(403)
                .json({ message: 'Only agents can update tickets' })
        }

        const payload = req.body
        const ticket = await TicketService.updateTicketAgent(
            req.params.id as string,
            payload
        )
        return ResponseHelper.success(res, ticket)
    }

    /**
     * Cancels a ticket.
     * POST /tickets/:id/cancel
     */
    static async cancelTicket(req: Request, res: Response) {
        const ticket = await TicketService.cancelTicket(
            req.params.id as string,
            req.user!
        )
        return ResponseHelper.success(res, ticket)
    }

    /**
     * Gets ticket summary statistics.
     * GET /tickets/summary
     */
    static async getSummary(req: Request, res: Response) {
        const summary = await TicketService.getSummary(req.user!)
        return ResponseHelper.success(res, summary)
    }
}

export { TicketController }
