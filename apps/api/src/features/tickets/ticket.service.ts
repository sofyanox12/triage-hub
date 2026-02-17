import { randomUUID } from 'node:crypto'
import type { CreateTicketInput, UserType, TicketUrgency, TicketCategory, TicketStatus } from '@triage/shared'
import { TicketRepository } from './ticket.repository'
import { NotFoundException, ConflictException, BadRequestException } from '@/lib/exception'
import type { ListTicketsQuery } from './ticket.schema'
import { enqueueTicketTriage } from '@/queue/ticket-queue'

type TicketOutput = {
    id: string
    customerId: string
    title: string
    description: string
    resolutionResponse: string | null
    urgency: TicketUrgency | null
    sentiment: number | null
    category: TicketCategory | null
    status: TicketStatus
    createdAt: Date
    updatedAt: Date
    latestDraftUpdatedBy: string | null
    customerName: string | null
    customerEmail: string | null
}

type UserMetadata = {
    id: string
    type: UserType
}

class TicketService {
    /**
     * Creates a new ticket for a customer.
     * @param data - The ticket creation payload (title, description, etc.).
     * @returns The newly created ticket object.
     */
    static async createTicket(data: CreateTicketInput) {
        if (!data.customerId) {
            throw new Error('Customer ID is required to create a ticket')
        }

        const ticketId = randomUUID()

        const ticket = await TicketRepository.create({
            id: ticketId,
            customerId: data.customerId,
            title: data.title,
            description: data.description,
            status: 'PENDING',
        })

        await enqueueTicketTriage(ticketId)

        return ticket
    }

    /**
     * Retrieves a single ticket by its ID.
     * @param id - The UUID of the ticket.
     * @param user - The user requesting the ticket (for access control).
     * @returns The ticket object.
     * @throws {NotFoundException} if the ticket does not exist or user access is denied.
     */
    static async getTicketById(
        id: string,
        user: UserMetadata
    ) {
        const ticket = await TicketRepository.findById(id)
        if (!ticket) throw new NotFoundException('Ticket not found')

        if (user.type === 'CUSTOMER') {
            if (ticket.customerId !== user.id) {
                throw new NotFoundException('Ticket not found')
            }
            return this.maskTicketForCustomer(ticket)
        }

        return ticket
    }

    /**
     * Retrieves a paginated list of tickets based on filters.
     * @returns A paginated result containing tickets and metadata.
     */
    static async listTickets(
        query: ListTicketsQuery,
        user: UserMetadata
    ) {
        const skip = (query.page - 1) * query.pageSize
        const isCustomer = user.type === 'CUSTOMER'
        const customerId = isCustomer ? user.id : undefined

        const [total, tickets] = await Promise.all([
            TicketRepository.count({ customerId, status: query.status }).then(r => r.count),
            TicketRepository.findMany({
                skip,
                take: query.pageSize,
                sort: query.sort as 'createdAt' | 'urgency',
                order: query.order,
                customerId,
            }),
        ])

        const maskedTickets = isCustomer
            ? tickets.map((t) => this.maskTicketForCustomer(t))
            : tickets

        return {
            data: maskedTickets,
            meta: {
                page: query.page,
                pageSize: query.pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
                sort: query.sort,
                order: query.order,
            },
        }
    }

    /**
     * Resolves a ticket with a resolution response.
     * @returns The updated ticket.
     */
    static async resolveTicket(id: string) {
        const existing = await TicketRepository.findById(id)
        if (!existing) throw new NotFoundException('Ticket not found')

        if (existing.status === 'RESOLVED') {
            throw new ConflictException('Ticket is already resolved')
        }

        if (existing.status !== 'COMPLETED') {
            throw new ConflictException(
                `Only COMPLETED tickets can be resolved. Current status: ${existing.status}`
            )
        }

        const result = await TicketRepository.updateStatus(
            id,
            'COMPLETED',
            'RESOLVED'
        )

        if (result && BigInt(result.numUpdatedRows) === 1n) {
            return TicketRepository.findById(id)
        }

        throw new Error('Failed to resolve ticket')
    }

    /**
     * Cancels a ticket.
     * @param id - The ID of the ticket to cancel.
     * @param user - The user requesting cancellation.
     * @returns The updated ticket.
     */
    static async cancelTicket(
        id: string,
        user: UserMetadata
    ) {
        const ticket = await TicketRepository.findById(id)
        if (!ticket) throw new NotFoundException('Ticket not found')

        if (user.type === 'CUSTOMER' && ticket.customerId !== user.id) {
            throw new BadRequestException('Unauthorized')
        }

        if (['RESOLVED', 'CANCELLED', 'PROCESSING'].includes(ticket.status)) {
            throw new ConflictException(
                'Cannot cancel a resolved, processing, or already cancelled ticket'
            )
        }

        const updated = await TicketRepository.update(id, {
            status: 'CANCELLED',
        })

        if (!updated) {
            throw new BadRequestException('Failed to cancel ticket')
        }
        return updated
    }

    /**
     * Updates ticket urgency or category by an agent.
     * @param ticketId - The ID of the ticket.
     * @param data - Ticket data to update.
     * @returns The updated ticket.
     */
    static async updateTicketAgent(
        id: string,
        data: {
            urgency?: TicketUrgency
            category?: TicketCategory
            resolutionResponse?: string
        }
    ) {
        const ticket = await TicketRepository.findById(id)

        if (!ticket) {
            throw new NotFoundException('Ticket not found')
        }

        if (['CANCELLED', 'RESOLVED'].includes(ticket.status)) {
            throw new ConflictException('Cannot edit finalized ticket')
        }

        const updated = await TicketRepository.update(id, data)

        if (!updated) {
            throw new Error('Failed to update ticket')
        }

        return updated
    }

    /**
     * Retrieves a summary of ticket statistics.
     * @param user - The user requesting summary (customer gets their own stats).
     * @returns An object containing counts of tickets by status.
     */
    static async getSummary(user: UserMetadata) {
        const customerId = user.type === 'CUSTOMER' ? user.id : undefined
        return TicketRepository.getSummary(customerId)
    }

    /**
     * Masks ticket metadata for customer visibility.
     * @param ticket - The raw ticket object.
     * @returns The masked ticket object.
     */
    private static maskTicketForCustomer(ticket: TicketOutput) {
        const isResolvedOrCancelled = ['RESOLVED', 'CANCELLED'].includes(ticket.status)
        const resolutionResponse = ticket.status === 'RESOLVED' ? ticket.resolutionResponse : null
        const maskedTicketStatus = isResolvedOrCancelled ? ticket.status : 'PENDING'
        const urgency = ticket.status === 'RESOLVED' ? ticket.urgency : null
        const category = ticket.status === 'RESOLVED' ? ticket.category : null

        return {
            ...ticket,
            urgency,
            category,
            sentiment: null,
            resolutionResponse,
            status: maskedTicketStatus,
        }
    }
}

export { TicketService }
