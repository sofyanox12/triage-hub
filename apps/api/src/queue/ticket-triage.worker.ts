import { Job, Worker } from 'bullmq'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { TicketRepository } from '@/features/tickets/ticket.repository'
import { ai } from '@/lib/ai'
import { env } from '../config/env'

/**
 * Schema for AI analysis result
 */
const AI_ANALYSIS_SCHEMA = z.object({
    sensitivity: z.number().min(0).max(10).optional(),
    sentiment: z.number().min(1).max(10),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    category: z.enum(['BILLING', 'TECHNICAL', 'FEATURE_REQUEST']),
    draft: z.string().min(10),
})

type AIAnalysisResult = z.infer<typeof AI_ANALYSIS_SCHEMA>
type TicketJobData = { ticketId: string }

/**
 * Main ticket ingesting function (runs in background process)
 * @param job - Job data
 */
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

    if (['COMPLETED', 'RESOLVED', 'FAILED'].includes(ticket.status)) {
        jobLogger.info(
            { status: ticket.status },
            'worker_ticket_already_processed'
        )
        return
    }

    await TicketRepository.updateStatus(ticket.id, ticket.status, 'PROCESSING')

    try {
        jobLogger.info('worker_analyzing_ticket')

        const rawAnalysis = await ai.analyzeTicket(
            ticket.title,
            ticket.description
        )

        const parsedAnalysis = AI_ANALYSIS_SCHEMA.safeParse(rawAnalysis)

        if (parsedAnalysis.error) {
            jobLogger.error({ error: parsedAnalysis.error }, 'worker_ticket_analysis_failed')
            await TicketRepository.updateStatus(ticket.id, ticket.status, 'FAILED')
            return
        }

        const analysis = parsedAnalysis.data satisfies AIAnalysisResult

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
        await TicketRepository.updateStatus(ticket.id, ticket.status, 'FAILED')
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
