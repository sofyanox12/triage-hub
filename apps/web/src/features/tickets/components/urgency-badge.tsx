import { Badge } from '@/components/ui'
import { Ticket } from '@/features/tickets/api/ticket.types'

const UrgencyBadge = ({ urgency }: { urgency: Ticket['urgency'] }) => {
    const variant =
        urgency === 'HIGH'
            ? 'destructive'
            : urgency === 'MEDIUM'
              ? 'warning'
              : 'success'
    return (
        <Badge className="rounded-lg py-1 px-3 text-[10px]" variant={variant}>
            {urgency}
        </Badge>
    )
}

export { UrgencyBadge }
