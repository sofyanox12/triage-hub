import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserType, StatusCode } from '@triage/shared'
import { env } from '../config/env'
import { getRedisClient, CHANNEL_TICKETS_UPDATED, TicketUpdatePayload } from '../lib/redis-pubsub'
import { logger } from '../lib/logger'

const router: Router = Router()

/**
 * Handles Server-Sent Events (SSE) for real-time ticket updates.
 * GET /ticket-stream
 */
export const ticketStreamHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const token = req.query.token as string

    if (!token) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Missing token' })
        return
    }

    let user: { id: string; type: UserType }

    try {
        const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
            sub: string
            type: string
        }
        user = {
            id: payload.sub,
            type: payload.type as UserType,
        }
    } catch {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid token' })
        return
    }

    res.writeHead(StatusCode.OK, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    res.write('data: "connected"\n\n')

    if (typeof (res as any).flush === 'function') (res as any).flush()

    const redisSubscriber = getRedisClient().duplicate()

    redisSubscriber.on('error', (err) => {
        logger.error({ err }, 'Redis subscriber error')
    })

    await redisSubscriber.subscribe(CHANNEL_TICKETS_UPDATED)

    const messageHandler = (channel: string, message: string) => {
        if (channel !== CHANNEL_TICKETS_UPDATED) return

        try {
            logger.debug({ channel, message }, 'Received Redis message')
            const payload: TicketUpdatePayload = JSON.parse(message)

            let shouldSend = false
            if (user.type === 'AGENT') {
                shouldSend = true
            } else if (user.type === 'CUSTOMER') {
                if (payload.customerId && payload.customerId === user.id) {
                    shouldSend = true
                } else {
                    logger.debug({ payloadCustomerId: payload.customerId, userId: user.id }, 'SSE Update filtered out for customer')
                }
            }

            if (shouldSend) {
                logger.debug({ userId: user.id }, 'Sending SSE update to user')

                let textToSend = message
                if (user.type === 'CUSTOMER') {
                    const maskedPayload: TicketUpdatePayload = {
                        ...payload,
                        urgency: null,
                        category: null,
                        sentiment: null,
                        resolutionResponse: payload.status === 'RESOLVED' ? payload.resolutionResponse : null,
                        status: (payload.status === 'RESOLVED' || payload.status === 'CANCELLED')
                            ? payload.status
                            : 'PENDING'
                    }
                    textToSend = JSON.stringify(maskedPayload)
                }

                res.write(`data: ${textToSend}\n\n`)

                if ('flush' in res && typeof res.flush === 'function')
                    res.flush()
            }
        } catch (err) {
            logger.error({ err }, 'Failed to parse SSE message')
        }
    }

    redisSubscriber.on('message', messageHandler)

    req.on('close', () => {
        redisSubscriber.unsubscribe(CHANNEL_TICKETS_UPDATED)
        redisSubscriber.quit()
        logger.debug('SSE connection closed')
    })
}

router.get('/stream', ticketStreamHandler)

export { router as ticketStreamRouter }
