import { z } from 'zod'

const ticketStatusSchema = z.enum([
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'RESOLVED',
    'FAILED',
])

const ticketCategorySchema = z.enum(['BILLING', 'TECHNICAL', 'FEATURE_REQUEST'])

const ticketUrgencySchema = z.enum(['HIGH', 'MEDIUM', 'LOW'])

const userTypeSchema = z.enum(['AGENT', 'CUSTOMER'])

const createTicketSchema = z.object({
    customerId: z.uuid().optional(),
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    type: userTypeSchema,
})

type CreateTicketInput = z.infer<typeof createTicketSchema>
type LoginInput = z.infer<typeof loginSchema>
type RegisterInput = z.infer<typeof registerSchema>

const TRIAGE_QUEUE = 'ticket-triage'
const TICKET_TRIAGE_JOB = 'ticket-triage-job'

export {
    ticketStatusSchema,
    ticketCategorySchema,
    ticketUrgencySchema,
    userTypeSchema,
    createTicketSchema,
    loginSchema,
    registerSchema,
    TRIAGE_QUEUE,
    TICKET_TRIAGE_JOB,
}

export type { CreateTicketInput, LoginInput, RegisterInput }

export * from './db/types'
export * from './ai/types'
export * from './ai/factory'
export * from './ai/openai.adapter'
export * from './ai/gemini.adapter'
