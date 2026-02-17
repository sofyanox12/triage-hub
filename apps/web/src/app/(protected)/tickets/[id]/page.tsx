'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTicket } from '@/features/tickets/hooks/use-tickets'
import { TicketDetailCard } from '@/features/tickets'
import { useTicketStream } from '@/features/tickets/hooks/use-ticket-stream'

const TicketDetailPage = () => {
    useTicketStream()
    const params = useParams()
    const id = params.id as string
    const { data: ticket, isLoading, error } = useTicket(id)

    if (isLoading) {
        return <div>Loading ticket...</div>
    }

    if (error || !ticket) {
        return (
            <div>
                <p className="text-destructive">
                    Error loading ticket. Please try again.
                </p>
                <Link href="/tickets" className="text-primary hover:underline">
                    Back to tickets
                </Link>
            </div>
        )
    }

    return (
        <main className="space-y-4">
            <p>
                <Link
                    href="/tickets"
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ← Back to tickets
                </Link>
            </p>
            <TicketDetailCard ticket={ticket} />
        </main>
    )
}

export default TicketDetailPage
