import Redis from 'ioredis'
import { env } from '../config/env'
import { logger } from './logger'

const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
})

redis.on('error', (err) => {
    logger.error({ err }, 'Redis connection error')
})

redis.on('connect', () => {
    logger.info('Redis connected')
})

export type TicketUpdatePayload = {
    ticketId: string
    customerId?: string
    status: string
    urgency: string | null
    category: string | null
    sentiment: number | null
    resolutionResponse: string | null
    updatedAt: string
}

export const CHANNEL_TICKETS_UPDATED = 'tickets:updated'

export const publishTicketUpdate = async (payload: TicketUpdatePayload) => {
    try {
        await redis.publish(CHANNEL_TICKETS_UPDATED, JSON.stringify(payload))
        logger.debug({ ticketId: payload.ticketId }, 'Published ticket update')
    } catch (error) {
        logger.error({ error, ticketId: payload.ticketId }, 'Failed to publish ticket update')
    }
}

export const getRedisClient = () => redis
