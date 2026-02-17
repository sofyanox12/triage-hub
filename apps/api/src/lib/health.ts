import { db, sql } from '@triage/shared/server'
import { redis } from './redis'

const ServiceStatus = {
    UP: 'UP',
    DOWN: 'DOWN',
} as const

type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus]

type HealthResult = {
    ok: boolean
    services: {
        database: ServiceStatus
        redis: ServiceStatus
    }
}

/**
 * Checks the database connection.
 * @returns {Promise<ServiceStatus>} The service status.
 */
const checkDatabaseConnection = async (): Promise<ServiceStatus> => {
    try {
        await sql`SELECT 1`.execute(db)
        return ServiceStatus.UP
    } catch {
        return ServiceStatus.DOWN
    }
}

/**
 * Checks the Redis connection.
 * @returns {Promise<ServiceStatus>} The service status.
 */
const checkRedisConnection = async (): Promise<ServiceStatus> => {
    try {
        if ((await redis.ping()) !== 'PONG') return ServiceStatus.DOWN
        return ServiceStatus.UP
    } catch {
        return ServiceStatus.DOWN
    }
}

/**
 * Checks the health of the application.
 * @returns {Promise<HealthResult>} The health result.
 */
const checkHealth = async (): Promise<HealthResult> => {
    const database = await checkDatabaseConnection()
    const redisStatus = await checkRedisConnection()

    return {
        ok: database === ServiceStatus.UP && redisStatus === ServiceStatus.UP,
        services: { database, redis: redisStatus },
    }
}

export { checkHealth }
