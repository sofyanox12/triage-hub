import { Response } from 'express'
import { StatusCode } from './status-code'
import type {
    ApiResponse,
    FieldError,
    PaginationMeta,
} from '../types/api-response'

class ResponseHelper {
    static success<T>(
        res: Response,
        data: T,
        message: string = 'Success',
        code: number = StatusCode.OK
    ) {
        const response: ApiResponse<T> = { success: true, code, message, data }
        return res.status(code).json(response)
    }

    static created<T>(res: Response, data: T, message: string = 'Created') {
        return this.success(res, data, message, StatusCode.CREATED)
    }

    static paginated<T>(
        res: Response,
        data: T[],
        meta: PaginationMeta,
        message: string = 'Success'
    ) {
        const response: ApiResponse<T[]> = {
            success: true,
            code: StatusCode.OK,
            message,
            data,
            meta,
        }
        return res.status(StatusCode.OK).json(response)
    }

    static error(
        res: Response,
        message: string,
        code: number,
        errorCode?: string,
        errors?: FieldError[]
    ) {
        const response: ApiResponse<null> = {
            success: false,
            code,
            message,
            errorCode,
            errors,
        }
        return res.status(code).json(response)
    }
    static unauthorized(res: Response, message: string = 'Unauthorized') {
        return this.error(res, message, StatusCode.UNAUTHORIZED, 'A0000')
    }
}

export { ResponseHelper }
