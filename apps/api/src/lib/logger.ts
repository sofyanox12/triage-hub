import pino from 'pino'
import { env } from '@/config/env'

/**
 * Logger instance using pino
 */
const logger = pino({
    level: env.LOG_LEVEL,
    name: 'triage-api',
    base: {
        service: 'api',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
})

export { logger }
