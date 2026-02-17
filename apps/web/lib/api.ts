export type FieldError = {
    field: string
    message: string
}

export type ApiErrorResponse = {
    success: false
    code: number
    message: string
    errorCode?: string
    errors?: FieldError[]
}

class ApiError extends Error {
    code: number
    errorCode?: string
    fieldErrors?: FieldError[]

    constructor(response: ApiErrorResponse) {
        super(response.message)
        this.name = 'ApiError'
        this.code = response.code
        this.errorCode = response.errorCode
        this.fieldErrors = response.errors
    }
}

export type PaginationMeta = {
    page: number
    pageSize: number
    total: number
    totalPages: number
    sort: string
    order: string
}

export type ApiSuccessResponse<T> = {
    success: true
    code: number
    message: string
    data: T
    meta?: PaginationMeta
}

export type ListResponse<T> = {
    data: T[]
    meta: PaginationMeta
}

export { ApiError }
