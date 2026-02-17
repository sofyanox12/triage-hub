import { Router } from 'express'
import { TicketController } from '@/features/tickets/ticket.controller'

import { authenticate } from '@/middleware/auth'

const ticketRouter: ReturnType<typeof Router> = Router()

ticketRouter.post('/', authenticate, (req, res) =>
    TicketController.create(req, res)
)
ticketRouter.get('/', authenticate, (req, res) =>
    TicketController.list(req, res)
)
ticketRouter.get('/summary', authenticate, (req, res) =>
    TicketController.getSummary(req, res)
)
ticketRouter.get('/:id', authenticate, (req, res) =>
    TicketController.getById(req, res)
)
ticketRouter.patch('/:id/resolve', authenticate, (req, res) =>
    TicketController.resolve(req, res)
)
ticketRouter.patch('/:id/agent-update', authenticate, (req, res) =>
    TicketController.updateAgent(req, res)
)
ticketRouter.patch('/:id/cancel', authenticate, (req, res) =>
    TicketController.cancel(req, res)
)

export { ticketRouter }
