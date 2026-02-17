import { Badge, Box, Group } from '@/components/ui'
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

    return (
        <Badge className="w-fit rounded-lg py-1" variant={variant}>
            <Group className="gap-1">
                <Box className="mr-2 h-2 w-2 rounded-full bg-black" />
                {label}
            </Group>
        </Badge>
    )
}

export { TicketStatusBadge }
