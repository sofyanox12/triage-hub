import { Badge } from '@/components/ui'
import { Ticket } from '@/features/tickets/api/ticket.types'

const UrgencyBadge = ({ urgency }: { urgency: Ticket['urgency'] }) => {
    const variant =
        urgency === 'HIGH'
            ? 'destructive'
            : urgency === 'MEDIUM'
              ? 'warning'
              : 'outline'
    return (
        <Badge className="rounded-lg py-1" variant={variant}>
            {urgency}
        </Badge>
    )
}

export { UrgencyBadge }
