export interface FieldError {
    field: string
    message: string
}

export interface PaginationMeta {
    page: number
    pageSize: number
    total: number
    totalPages: number
    sort?: string
    order?: string
}

export interface ApiResponse<T> {
    success: boolean
    code: number
    message: string
    errorCode?: string
    data?: T
    errors?: FieldError[]
    meta?: PaginationMeta
}
