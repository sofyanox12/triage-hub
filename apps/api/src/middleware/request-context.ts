import { randomUUID } from 'node:crypto'
import { NextFunction, Request, Response } from 'express'
import { logger } from '@/lib/logger'

const requestContextMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestId = randomUUID()
    const requestLogger = logger.child({ requestId })
    const startedAt = process.hrtime.bigint()

    req.requestId = requestId
    req.log = requestLogger
    res.setHeader('x-request-id', requestId)

    requestLogger.info(
        {
            method: req.method,
            path: req.path,
        },
        'request_started'
    )

    res.on('finish', () => {
        const durationMs =
            Number(process.hrtime.bigint() - startedAt) / 1_000_000

        requestLogger.info(
            {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                durationMs: Number(durationMs.toFixed(2)),
            },
            'request_completed'
        )
    })

    next()
}

export { requestContextMiddleware }
