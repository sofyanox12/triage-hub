import { Router } from 'express'
import { TicketController } from '@/features/tickets/ticket.controller'

import { authenticate } from '@/middleware/auth'

const ticketRouter: ReturnType<typeof Router> = Router()

ticketRouter.post('/', authenticate, (req, res) =>
    TicketController.createTicket(req, res)
)
ticketRouter.get('/', authenticate, (req, res) =>
    TicketController.listTickets(req, res)
)
ticketRouter.get('/summary', authenticate, (req, res) =>
    TicketController.getSummary(req, res)
)
ticketRouter.get('/:id', authenticate, (req, res) =>
    TicketController.getTicketById(req, res)
)
ticketRouter.patch('/:id/resolve', authenticate, (req, res) =>
    TicketController.resolveTicket(req, res)
)
ticketRouter.patch('/:id/agent-update', authenticate, (req, res) =>
    TicketController.updateTicketAgent(req, res)
)
ticketRouter.patch('/:id/cancel', authenticate, (req, res) =>
    TicketController.cancelTicket(req, res)
)

export { ticketRouter }
