import { sql } from './lib/db'
import { redis } from './lib/redis'
import { logger } from './lib/logger'

async function healthCheck() {
    try {
        await Promise.all([
            sql`SELECT 1`.execute(
                await import('./lib/db.js').then((m) => m.db)
            ),
            redis.ping(),
        ])
        logger.info('health_check_passed')
        process.exit(0)
    } catch (error) {
        logger.error({ error }, 'health_check_failed')
        process.exit(1)
    }
}

healthCheck()
