'use client'

import { Ticket } from '@/features/tickets/api/ticket.types'
import { UrgencyBadge } from './urgency-badge'
import { TicketStatusBadge } from './ticket-status-badge'
import { AiStatusIndicator } from './ai-status-indicator'
import Link from 'next/link'
import {
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui'
import { useAuth } from '@/features/auth/providers/auth-provider'
import { TableData } from '@/components/table-data'
import { ticketTableColumns } from './ticket-table.columns'
import { PaginationMeta } from '@/lib/api'
import { useMemo } from 'react'
import { Eye } from 'lucide-react'

interface TicketTableProps {
    tickets: Ticket[]
    isLoading?: boolean
    pagination?: PaginationMeta
    onPageChange?: (page: number) => void
}

/**
 * Renders a data table of tickets with pagination and actions.
 * @param tickets - List of tickets.
 * @param isLoading - Loading state.
 * @param pagination - Pagination metadata.
 * @param onPageChange - Callback for page change.
 */
export const TicketTable = ({
    tickets,
    isLoading,
    pagination,
    onPageChange,
}: TicketTableProps) => {
    const { user } = useAuth()
    const isAgent = useMemo(() => user?.type === 'AGENT', [user])
    const columns = useMemo(() => ticketTableColumns(isAgent), [isAgent])

    const data = tickets.map((ticket) => ({
        title: ticket.title,
        status: (
            <div className="flex flex-col gap-1.5">
                <TicketStatusBadge status={ticket.status} />
                {isAgent && <AiStatusIndicator status={ticket.status} />}
            </div>
        ),
        urgency: ticket.urgency ? (
            <UrgencyBadge urgency={ticket.urgency} />
        ) : (
            <span className="text-muted-foreground">-</span>
        ),
        category: ticket.category || '-',
        customer: ticket.customerName || '-',
        createdAt: new Date(ticket.createdAt).toLocaleDateString(),
        action: (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/tickets/${ticket.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>View Details</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        ),
    }))

    return (
        <TableData
            columns={columns}
            data={data}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={onPageChange}
        />
    )
}
