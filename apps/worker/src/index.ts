import { logger } from './lib/logger'
import { ticketWorker } from './worker'
import { redis } from './lib/redis'
import { db } from './lib/db'

const start = async () => {
    logger.info('worker_service_starting')

    logger.info('worker_service_started')
}

start()

const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'worker_shutdown_signal')

    try {
        await ticketWorker.close()
        await redis.quit()
        await db.destroy()
        logger.info('worker_shutdown_complete')
        process.exit(0)
    } catch (err) {
        logger.error({ err }, 'worker_shutdown_error')
        process.exit(1)
    }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
