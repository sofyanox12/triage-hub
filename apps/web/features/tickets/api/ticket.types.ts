import {
    PaginationMeta,
    ListResponse,
    ApiErrorResponse,
    ApiError,
    FieldError,
    ApiSuccessResponse,
} from '@/lib/api'

export type TicketStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'RESOLVED'
    | 'FAILED'
    | 'CANCELLED'

export type Ticket = {
    id: string
    customerId: string
    title: string
    description: string
    status: TicketStatus
    category: 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST' | null
    urgency: 'HIGH' | 'MEDIUM' | 'LOW' | null
    sentiment: number | null
    resolutionResponse: string | null
    createdAt: string
    updatedAt: string
    latestDraftUpdatedBy: string | null
    customerName?: string
    customerEmail?: string
}

export type TicketListQuery = {
    page?: number
    pageSize?: number
    sort?: 'createdAt' | 'urgency'
    order?: 'asc' | 'desc'
}

export type {
    PaginationMeta,
    ListResponse,
    ApiErrorResponse,
    FieldError,
    ApiSuccessResponse,
}
export { ApiError }
