import { db } from '@/lib/db'
import { app } from '@/app'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { redis } from '@/lib/redis'
import { ticketQueue } from '@/queue/ticket-queue'

const server = app.listen(env.PORT, async () => {
    logger.info({ port: env.PORT }, 'api_started')
})

let isShuttingDown = false

const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) return
    isShuttingDown = true

    logger.info({ signal }, 'api_shutdown_signal')

    server.close(async (err) => {
        if (err) {
            logger.error({ message: err.message }, 'api_server_close_error')
            process.exit(1)
        }

        try {
            await ticketQueue.close()
            await db.destroy()
            await redis.quit()
            logger.info('api_shutdown_complete')
            process.exit(0)
        } catch (closeErr) {
            const message =
                closeErr instanceof Error
                    ? closeErr.message
                    : 'unknown close error'
            logger.error({ message }, 'api_shutdown_error')
            process.exit(1)
        }
    })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
