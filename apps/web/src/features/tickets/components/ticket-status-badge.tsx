import { Badge, Group } from '@/components/ui'
import { Ticket } from '@/features/tickets/api/ticket.types'
import { cn } from '@/lib/utils'

const TicketStatusBadge = ({ status }: { status: Ticket['status'] }) => {
    let label = status
    let dotColor = 'bg-slate-500'
    let containerClass = 'bg-slate-50 text-slate-700 border-slate-200'

    switch (status) {
        case 'RESOLVED':
            label = 'RESOLVED'
            dotColor = 'bg-green-500'
            containerClass = 'bg-green-50 text-green-700 border-green-200'
            break
        case 'CANCELLED':
            label = 'CANCELLED'
            dotColor = 'bg-red-500'
            containerClass = 'bg-red-50 text-red-700 border-red-200'
            break
        default:
            label = 'PENDING'
            dotColor = 'bg-slate-500'
            containerClass = 'bg-slate-50 text-slate-700 border-slate-200'
    }

    return (
        <Badge
            variant="outline"
            className={cn(
                'w-fit rounded-full px-2.5 py-1.5 font-medium transition-colors border',
                containerClass
            )}
        >
            <Group className="gap-1.5">
                <div
                    className={cn(
                        'h-1.5 w-1.5 rounded-full shadow-sm',
                        dotColor
                    )}
                />
                <span className="uppercase text-[10px] tracking-wider leading-none">
                    {label}
                </span>
            </Group>
        </Badge>
    )
}

export { TicketStatusBadge }
