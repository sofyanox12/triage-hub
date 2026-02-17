import { ZodError } from 'zod'
import { StatusCode } from '@triage/shared'

type FieldError = {
    field: string
    message: string
}

/**
 * Unified exception class for the application
 */
class ServiceException extends Error {
    readonly httpCode: number
    readonly errorCode: string
    readonly fieldErrors?: FieldError[]

    constructor(
        message: string,
        httpCode: number = StatusCode.INTERNAL_SERVER_ERROR,
        errorCode: string = 'E0000',
        fieldErrors?: FieldError[]
    ) {
        super(message)
        this.name = 'ServiceException'
        this.httpCode = httpCode
        this.errorCode = errorCode
        this.fieldErrors = fieldErrors
        Error.captureStackTrace(this, this.constructor)
    }

    static withFields(
        message: string,
        httpCode: number,
        errorCode: string,
        fields: FieldError[]
    ): ServiceException {
        return new ServiceException(message, httpCode, errorCode, fields)
    }
}

/**
 * Validation exception class
 * @description Handle edge-cases validation exception (with field or not).
 */
class ValidationException extends ServiceException {
    constructor(
        error: ZodError | string | FieldError[],
        errorCode: string = 'V0000'
    ) {
        if (typeof error === 'string') {
            super(error, StatusCode.UNPROCESSABLE_ENTITY, errorCode)
        } else if (Array.isArray(error)) {
            super(
                'Validation Error',
                StatusCode.UNPROCESSABLE_ENTITY,
                errorCode,
                error
            )
        } else {
            const fieldErrors: FieldError[] = error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }))
            super(
                'Validation Error',
                StatusCode.UNPROCESSABLE_ENTITY,
                errorCode,
                fieldErrors
            )
        }
        this.name = 'ValidationException'
    }
}

/**
 * Bad request exception class
 * @description Handle bad request exception.
 */
class BadRequestException extends ServiceException {
    constructor(message: string = 'Bad Request', errorCode: string = 'C0000') {
        super(message, StatusCode.BAD_REQUEST, errorCode)
        this.name = 'BadRequestException'
    }
}

/**
 * Not found exception class
 * @description Handle not found exception.
 */
class NotFoundException extends ServiceException {
    constructor(message: string = 'Not Found', errorCode: string = 'C0000') {
        super(message, StatusCode.NOT_FOUND, errorCode)
        this.name = 'NotFoundException'
    }
}

/**
 * Conflict exception class
 * @description Handle conflict exception.
 */
class ConflictException extends ServiceException {
    constructor(message: string = 'Conflict', errorCode: string = 'C0000') {
        super(message, StatusCode.CONFLICT, errorCode)
        this.name = 'ConflictException'
    }
}

/**
 * Unauthorized exception class
 * @description Handle unauthorized exception.
 */
class UnauthorizedException extends ServiceException {
    constructor(message: string = 'Unauthorized', errorCode: string = 'A0000') {
        super(message, StatusCode.UNAUTHORIZED, errorCode)
        this.name = 'UnauthorizedException'
    }
}

/**
 * Internal exception class
 * @description Handle internal server error exception.
 */
class InternalException extends ServiceException {
    readonly originalError?: Error | unknown

    constructor(
        message: string = 'Internal Server Error',
        originalError?: Error | unknown,
        errorCode: string = 'E0000'
    ) {
        super(message, StatusCode.INTERNAL_SERVER_ERROR, errorCode)
        this.name = 'InternalException'
        this.originalError = originalError
    }
}

export {
    ServiceException,
    ValidationException,
    BadRequestException,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    InternalException,
}

export type { FieldError }
