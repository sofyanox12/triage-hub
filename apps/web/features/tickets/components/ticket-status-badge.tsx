import { Badge } from '@/components/ui'
import { Ticket } from '@/features/tickets/api/ticket.types'

const TicketStatusBadge = ({ status }: { status: Ticket['status'] }) => {
    let variant:
        | 'default'
        | 'secondary'
        | 'destructive'
        | 'outline'
        | 'success' = 'secondary'
    let label = status

    switch (status) {
        case 'RESOLVED':
            variant = 'success'
            break
        case 'COMPLETED':
        case 'PROCESSING':
        case 'FAILED':
        case 'PENDING':
            variant = 'secondary'
            label = 'PENDING'
            break
        case 'CANCELLED':
            variant = 'secondary'
            break
        default:
            variant = 'secondary'
            label = 'PENDING'
    }

    return <Badge variant={variant}>{label}</Badge>
}

export { TicketStatusBadge }
