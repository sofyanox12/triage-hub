import { Job, Worker } from 'bullmq'
import { logger } from '@/lib/logger'
import { TicketRepository } from '@/features/tickets/ticket.repository'
import { ai } from '@/lib/ai'
import { env } from '../config/env'

type TicketJobData = { ticketId: string }

const processTicket = async (job: Job<TicketJobData>) => {
    const jobLogger = logger.child({
        jobId: job.id,
        ticketId: job.data.ticketId,
        service: 'ticket-worker',
    })

    const ticket = await TicketRepository.findById(job.data.ticketId)
    if (!ticket) {
        jobLogger.error('worker_ticket_missing')
        return
    }

    if (
        ticket.status === 'COMPLETED' ||
        ticket.status === 'RESOLVED' ||
        ticket.status === 'FAILED'
    ) {
        jobLogger.info(
            { status: ticket.status },
            'worker_ticket_already_processed'
        )
        return
    }

    await TicketRepository.updateStatus(ticket.id, ticket.status, 'PROCESSING')

    try {
        jobLogger.info('worker_analyzing_ticket')

        const analysis = await ai.analyzeTicket(
            ticket.title,
            ticket.description
        )

        await TicketRepository.update(ticket.id, {
            urgency: analysis.urgency,
            sentiment: analysis.sentiment,
            category: analysis.category,
            resolutionResponse: analysis.draft,
            status: 'COMPLETED',
        })

        jobLogger.info({ analysis }, 'worker_ticket_analyzed')
    } catch (error) {
        jobLogger.error({ error }, 'worker_ticket_failed')
        throw error
    }
}

const ticketWorker = new Worker<TicketJobData>('ticket-triage', processTicket, {
    connection: { url: env.REDIS_URL },
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
})

export { ticketWorker }
