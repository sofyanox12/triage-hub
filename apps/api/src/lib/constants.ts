const LOG_EVENTS = {
    HEALTH_CHECK_FAILED: 'health_check_failed',
    REQUEST_VALIDATION_ERROR: 'request_validation_error',
    SERVICE_EXCEPTION: 'service_exception',
    UNHANDLED_ERROR: 'api_unhandled_error',
    UNKNOWN_ERROR: 'api_unknown_error',
} as const

const ERROR_MESSAGES = {
    SERVICE_DEGRADED: 'Service degraded',
    INTERNAL_SERVER_ERROR: 'Internal server error',
} as const

const DEFAULT_PAGINATION = {
    PAGE: 1,
    PAGE_SIZE: 10,
    SORT: 'createdAt',
    ORDER: 'desc',
} as const

export { LOG_EVENTS, ERROR_MESSAGES, DEFAULT_PAGINATION }
