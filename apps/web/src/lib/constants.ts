export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

export const DEFAULT_TIMEOUT = 3000
export const DEFAULT_PAGE_SIZE = 10

export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
} as const

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    OVERVIEW: '/overview',
    TICKETS: '/tickets',
} as const

