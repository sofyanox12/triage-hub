import pino from 'pino'
import { env } from '@/config/env'

const logger = pino({
    level: env.LOG_LEVEL,
    name: 'triage-worker',
    base: {
        service: 'worker',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
})

export { logger }
