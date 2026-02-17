'use client'

import { useState } from 'react'

import {
    TicketTable,
    TicketFormModal,
    useTickets,
    useTicketStream,
} from '@/features/tickets'
import { useAuth } from '@/features/auth'
import { Stack, Group } from '@/components/ui'

import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

const TicketsPage = () => {
    useTicketStream()
    const { user } = useAuth()
    const [page, setPage] = useState(1)

    const {
        data: tickets,
        isLoading,
        error,
    } = useTickets({ page, pageSize: DEFAULT_PAGE_SIZE })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading tickets</div>

    return (
        <Stack className="space-y-6">
            <Group className="w-full justify-between">
                <Stack className="gap-0">
                    <h2 className="text-2xl font-bold">
                        {user?.type === 'AGENT'
                            ? 'All Tickets'
                            : 'Your Tickets'}
                    </h2>
                    <span>
                        {user?.type === 'AGENT'
                            ? 'Showing available & manageable tickets to agents'
                            : 'Showing tickets you have created'}
                    </span>
                </Stack>

                {user?.type === 'CUSTOMER' && <TicketFormModal />}
            </Group>

            <section aria-label="Tickets">
                <TicketTable
                    tickets={tickets?.data || []}
                    isLoading={isLoading}
                    pagination={tickets?.meta}
                    onPageChange={setPage}
                />
            </section>
        </Stack>
    )
}

export default TicketsPage
