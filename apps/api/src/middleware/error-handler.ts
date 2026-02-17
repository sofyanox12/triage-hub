import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { logger } from '@/lib/logger'
import { LOG_EVENTS, ERROR_MESSAGES } from '@/lib/constants'
import { ServiceException, ValidationException } from '@/lib/exception'
import { ResponseHelper } from '@/utils/response-helper'
import { StatusCode } from '@/utils/status-code'

/**
 * Error handling middleware
 * @description Handle all exceptions and return appropriate responses.
 */
const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    void next
    const requestLogger = req.log ?? logger

    if (err instanceof ZodError) err = new ValidationException(err)

    if (err instanceof ServiceException) {
        requestLogger.warn(
            { type: err.name, errorCode: err.errorCode, message: err.message },
            LOG_EVENTS.SERVICE_EXCEPTION
        )
        return ResponseHelper.error(
            res,
            err.message,
            err.httpCode,
            err.errorCode,
            err.fieldErrors
        )
    }

    if (err instanceof Error) {
        requestLogger.error(
            { message: err.message, stack: err.stack },
            LOG_EVENTS.UNHANDLED_ERROR
        )
    } else {
        requestLogger.error({ err }, LOG_EVENTS.UNKNOWN_ERROR)
    }

    return ResponseHelper.error(
        res,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        StatusCode.INTERNAL_SERVER_ERROR
    )
}

export { errorHandler }
