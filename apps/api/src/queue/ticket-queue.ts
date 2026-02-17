import { Queue, type ConnectionOptions } from 'bullmq'
import { TICKET_TRIAGE_JOB, TRIAGE_QUEUE } from '@triage/shared'
import { redis } from '@/lib/redis'

export type TicketJobData = { ticketId: string }

const ticketQueue = new Queue<TicketJobData, unknown, typeof TICKET_TRIAGE_JOB>(
    TRIAGE_QUEUE,
    {
        connection: redis as unknown as ConnectionOptions,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                age: 3600,
                count: 1000,
            },
            removeOnFail: false,
        },
    }
)

const enqueueTicketTriage = async (ticketId: string) => {
    const job = await ticketQueue.add(
        TICKET_TRIAGE_JOB,
        { ticketId },
        {
            jobId: `${ticketId}-${Date.now()}`,
        }
    )

    return job.id
}

export { ticketQueue, enqueueTicketTriage }
