'use client'

import Link from 'next/link'
import { Activity, Ticket, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth'
import { ticketService, useTicketStream } from '@/features/tickets'
import {
    Group,
    Stack,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui'

const OverviewPage = () => {
    const { user } = useAuth()
    const { data: summary, isLoading } = useQuery({
        queryKey: ['tickets', 'summary'],
        queryFn: () => ticketService.getSummary(),
    })

    const isAgent = user?.type === 'AGENT'

    useTicketStream()

    return (
        <Stack className="gap-8">
            <Group className="justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                {!isAgent && (
                    <Button asChild>
                        <Link href="/tickets">Go to Tickets</Link>
                    </Button>
                )}
            </Group>

            <Stack className="w-full">
                <h1 className="font-semibold text-xl">
                    Welcome back, {user?.name}
                </h1>
                <span className="text-muted-foreground">
                    {isAgent
                        ? 'As an agent, you can review pending tickets, edit AI-generated drafts, and resolve issues.'
                        : "As a customer, you can create new tickets, view their status, and edit them if they haven't been resolved yet."}
                </span>
            </Stack>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {isAgent ? 'Total Unresolved' : 'Total Tickets'}
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading
                                ? '...'
                                : isAgent
                                  ? summary?.unresolved
                                  : summary?.total}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isAgent
                                ? 'Tickets waiting for response'
                                : 'Total tickets submitted by you'}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Resolved Tickets
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : summary?.resolved}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Tickets marked as resolved
                        </p>
                    </CardContent>
                </Card>
                {!isAgent && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Status Summary
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading || !summary
                                    ? '...'
                                    : (summary.total ?? 0) -
                                      (summary.resolved ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Pending or processing tickets
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Stack>
    )
}

export default OverviewPage
