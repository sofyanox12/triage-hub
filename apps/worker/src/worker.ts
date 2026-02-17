import { Job, Worker } from 'bullmq'
import { logger } from './lib/logger'
import { TicketRepository } from './db/ticket.repository'
import { ai } from './lib/ai'
import { env } from './config/env'
import { TRIAGE_QUEUE, AiAnalysisResult } from '@triage/shared'
import { publishTicketUpdate } from './lib/redis-pubsub'

type TicketJobData = { ticketId: string }
type Ticket = Awaited<ReturnType<typeof TicketRepository.findById>>

const getProcessableTicket = async (
    ticketId: string,
    jobLogger: typeof logger
): Promise<Ticket | null> => {
    const ticket = await TicketRepository.findById(ticketId)

    if (!ticket) {
        jobLogger.error('worker_ticket_missing')
        return null
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
        return null
    }

    return ticket
}

const simulateProcessingDelay = async (jobLogger: typeof logger) => {
    if (env.WORKER_PROCESSING_DELAY_MS > 0) {
        jobLogger.info(
            { delayMs: env.WORKER_PROCESSING_DELAY_MS },
            'worker_processing_delay_start'
        )
        await new Promise((resolve) =>
            setTimeout(resolve, env.WORKER_PROCESSING_DELAY_MS)
        )
    }
}

/**
 * Performs AI analysis on a ticket to determine urgency, sentiment, and category.
 * @param ticket - The ticket object to analyze.
 * @param jobLogger - Logger instance for the job.
 * @returns The analysis result (urgency, sentiment, category, draft).
 */
const performAnalysis = async (
    ticket: NonNullable<Ticket>,
    jobLogger: typeof logger
): Promise<AiAnalysisResult> => {
    jobLogger.info('worker_analyzing_ticket_start')
    const startTime = Date.now()

    const analysis = await ai.analyzeTicket(ticket.title, ticket.description)

    const durationMs = Date.now() - startTime
    jobLogger.info({ durationMs, analysis }, 'worker_ticket_analyzed_success')

    return analysis
}

/**
 * Saves analysis results to DB and publishes update via Redis.
 * @param ticket - The ticket being processed.
 * @param analysis - The AI analysis result.
 */
const saveAndPublishResults = async (
    ticket: NonNullable<Ticket>,
    analysis: AiAnalysisResult
) => {
    await TicketRepository.update(ticket.id, {
        urgency: analysis.urgency,
        sentiment: analysis.sentiment,
        category: analysis.category,
        resolutionResponse: analysis.draft,
        status: 'COMPLETED',
        latestDraftUpdatedBy: null,
    })

    await publishTicketUpdate({
        ticketId: ticket.id,
        customerId: ticket.customerId,
        status: 'COMPLETED',
        urgency: analysis.urgency,
        category: analysis.category,
        sentiment: analysis.sentiment,
        resolutionResponse: analysis.draft,
        updatedAt: new Date().toISOString(),
    })
}

/**
 * Main worker job processor.
 * Fetches ticket, updates status to PROCESSING, performs analysis, and saves results.
 * @param job - The BullMQ job containing ticketId.
 */
const processTicket = async (job: Job<TicketJobData>) => {
    const jobLogger = logger.child({
        jobId: job.id,
        ticketId: job.data.ticketId,
        service: 'ticket-worker',
    })

    const ticket = await getProcessableTicket(job.data.ticketId, jobLogger)
    if (!ticket) return

    await TicketRepository.updateStatus(ticket.id, ticket.status, 'PROCESSING')

    await simulateProcessingDelay(jobLogger)

    try {
        const analysis = await performAnalysis(ticket, jobLogger)

        await saveAndPublishResults(ticket, analysis)
    } catch (error) {
        jobLogger.error({ error }, 'worker_ticket_analyzed_failed')
        throw error
    }
}

const ticketWorker = new Worker<TicketJobData>(TRIAGE_QUEUE, processTicket, {
    connection: { url: env.REDIS_URL },
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
})

ticketWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'worker_job_completed')
})

ticketWorker.on('failed', async (job, err) => {
    logger.error(
        {
            jobId: job?.id,
            message: err.message,
            attemptsMade: job?.attemptsMade,
        },
        'worker_job_failed'
    )

    if (job && job.data.ticketId) {
        const attempts = job.attemptsMade
        const maxAttempts = job.opts.attempts || 3

        if (attempts >= maxAttempts) {
            await TicketRepository.updateStatus(
                job.data.ticketId,
                'PROCESSING',
                'FAILED'
            )
            logger.info(
                { ticketId: job.data.ticketId },
                'worker_ticket_marked_failed'
            )
        } else {
            await TicketRepository.updateStatus(
                job.data.ticketId,
                'PROCESSING',
                'PENDING'
            )
            logger.info(
                { ticketId: job.data.ticketId },
                'worker_ticket_rolled_back_to_pending'
            )
        }
    }
})

export { ticketWorker }
