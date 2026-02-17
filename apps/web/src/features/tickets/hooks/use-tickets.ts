import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import { ticketService as api } from '@/features/tickets/api/ticket.service'
import type { TicketListQuery } from '@/features/tickets/api/ticket.types'

const ticketKeys = {
    all: ['tickets'] as const,
    lists: () => [...ticketKeys.all, 'list'] as const,
    list: (filters: TicketListQuery) =>
        [...ticketKeys.lists(), filters] as const,
    details: () => [...ticketKeys.all, 'detail'] as const,
    detail: (id: string) => [...ticketKeys.details(), id] as const,
}

/**
 * Fetches tickets with pagination and filtering.
 * @param query - Filtering options.
 * @returns Query result for tickets.
 */
export const useTickets = (query: TicketListQuery = {}) => {
    return useQuery({
        queryKey: ticketKeys.list(query),
        queryFn: () => api.listTickets(query),
        placeholderData: keepPreviousData,
    })
}

/**
 * Fetches a single ticket by ID.
 * @param id - Ticket ID.
 */
export const useTicket = (id: string) => {
    return useQuery({
        queryKey: ticketKeys.detail(id),
        queryFn: () => api.getTicket(id),
        enabled: !!id,
    })
}

/**
 * Hook to create a new ticket.
 */
export const useCreateTicket = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.createTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
        },
    })
}

/**
 * Hook to resolve a ticket.
 */
export const useResolveTicket = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.resolveTicket,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ticketKeys.detail(data.id),
            })
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
        },
    })
}

/**
 * Hook to cancel a ticket.
 */
export const useCancelTicket = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: api.cancelTicket,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ticketKeys.detail(data.id),
            })
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
        },
    })
}

/**
 * Hook to update ticket details as an agent.
 */
export const useUpdateTicketAgent = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string
            data: Parameters<typeof api.updateTicketAgent>[1]
        }) => api.updateTicketAgent(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ticketKeys.detail(data.id),
            })
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists() })
        },
    })
}

export { ticketKeys }
