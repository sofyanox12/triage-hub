import type { UserType } from '@triage/shared'
import type { Logger } from 'pino'

declare global {
    namespace Express {
        interface Request {
            requestId: string
            log: Logger
            user?: {
                id: string
                type: UserType
            }
        }
    }
}

export { }
