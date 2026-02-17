import IORedis from 'ioredis'
import { env } from '@/config/env'

/**
 * Redis client
 */
const redis = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
})

export { redis }
