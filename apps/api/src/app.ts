import 'express-async-errors'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { logger } from './lib/logger'
import { LOG_EVENTS, ERROR_MESSAGES } from './lib/constants'
import { checkHealth } from './lib/health'
import { errorHandler } from './middleware/error-handler'
import { requestContextMiddleware } from './middleware/request-context'
import { ticketRouter } from './routes/tickets'
import { ticketStreamRouter } from './routes/ticket-stream'
import { authRouter } from './features/auth/auth.route'
import { ResponseHelper } from './utils/response-helper'
import { StatusCode } from './utils/status-code'

const app: ReturnType<typeof express> = express()

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (env.NODE_ENV === 'development') return callback(null, true)
        if (origin === env.WEB_ORIGIN) return callback(null, true)
        else return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(requestContextMiddleware)

app.get('/health', async (_, res) => {
    const health = await checkHealth()

    if (!health.ok)
        logger.error(health.services, LOG_EVENTS.HEALTH_CHECK_FAILED)

    return health.ok
        ? ResponseHelper.success(res, health.services)
        : ResponseHelper.error(
            res,
            ERROR_MESSAGES.SERVICE_DEGRADED,
            StatusCode.SERVICE_UNAVAILABLE
        )
})

const apiRouter = express.Router()

apiRouter.use('/tickets', ticketStreamRouter)
apiRouter.use('/tickets', ticketRouter)
apiRouter.use('/auth', authRouter)

app.use('/api', apiRouter)
app.use(errorHandler)

export { app }
