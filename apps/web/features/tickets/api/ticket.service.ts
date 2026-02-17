import { http } from '@/lib/http'
import type { Ticket, TicketListQuery, ListResponse, TicketStatus } from './ticket.types'

const ticketService = {
    createTicket: async (payload: { title: string; description: string }) => {
        return http.post<Ticket>('tickets', payload)
    },

    listTickets: async (query: TicketListQuery = {}) => {
        return http.get<ListResponse<Ticket>>('tickets', { params: query })
    },

    getTicket: async (id: string) => {
        return http.get<Ticket>(`tickets/${id}`)
    },

    resolveTicket: async (id: string) => {
        return http.patch<Ticket>(`tickets/${id}/resolve`, {})
    },

    cancelTicket: async (id: string) => {
        return http.patch<Ticket>(`tickets/${id}/cancel`, {})
    },

    updateTicketAgent: async (
        id: string,
        payload: {
            urgency?: 'LOW' | 'MEDIUM' | 'HIGH'
            category?: 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST'
            sentiment?: number
            resolutionResponse?: string
            status?: TicketStatus
        }
    ) => {
        return http.patch<Ticket>(`tickets/${id}/agent-update`, payload)
    },

    getSummary: async () => {
        return http.get<{
            total: number
            resolved: number
            unresolved: number
        }>('tickets/summary')
    },
}

export { ticketService }
