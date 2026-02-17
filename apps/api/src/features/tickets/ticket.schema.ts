import { z } from 'zod'

const listTicketsQuerySchema = z.object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    status: z
        .enum([
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'RESOLVED',
            'FAILED',
            'CANCELLED',
        ])
        .optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('createdAt'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
})

const createTicketSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    senderId: z.string().uuid().optional(),
    customerId: z.string().uuid().optional(),
})

const updateTicketSchema = z.object({
    status: z
        .enum([
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'RESOLVED',
            'FAILED',
            'CANCELLED',
        ])
        .optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    assignedTo: z.string().optional(),
})

const updateTicketAgentSchema = z.object({
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    category: z.enum(['BILLING', 'TECHNICAL', 'FEATURE_REQUEST']).optional(),
    sentiment: z.number().min(1).max(10).optional(),
    resolutionResponse: z.string().optional(),
})

type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>

export {
    listTicketsQuerySchema,
    createTicketSchema,
    updateTicketSchema,
    updateTicketAgentSchema,
}
export type { ListTicketsQuery }
