'use client'

import { Ticket } from '@/features/tickets/api/ticket.types'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Button,
    Label,
} from '@/components/ui'
import {
    useUpdateTicketAgent,
    useResolveTicket,
    useCancelTicket,
} from '@/features/tickets/hooks/use-tickets'
import { useForm } from 'react-hook-form'
import { FormWrapper } from '@/components/inputs'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/providers/auth-provider'
import { TicketStatusBadge } from './ticket-status-badge'
import { CategoryBadge } from './category-badge'
import { UrgencyBadge } from './urgency-badge'
import { toast } from 'sonner'
import { TicketUrgency } from '@/lib/types/ticket'
import { TicketCustomerInfo } from './ticket-customer-info'
import { TicketAgentActions } from './ticket-agent-actions'

interface TicketDetailCardProps {
    ticket: Ticket
}

/**
 * Displays detailed ticket information and actions.
 * @param ticket - The ticket to display.
 */
const TicketDetailCard = ({ ticket }: TicketDetailCardProps) => {
    const updateTicketAgent = useUpdateTicketAgent()
    const resolveTicket = useResolveTicket()
    const cancelTicket = useCancelTicket()

    const { user } = useAuth()
    const isAgent = user?.type === 'AGENT'

    const form = useForm<{
        resolutionResponse: string
        urgency: TicketUrgency
    }>({
        defaultValues: {
            resolutionResponse: ticket.resolutionResponse ?? '',
            urgency: ticket.urgency ?? 'LOW',
        },
    })

    useEffect(() => {
        form.reset({
            resolutionResponse: ticket.resolutionResponse ?? '',
            urgency: ticket.urgency ?? 'LOW',
        })
    }, [ticket, form])

    const isProcessing =
        ticket.status === 'PENDING' || ticket.status === 'PROCESSING'
    const isFinalized =
        ticket.status === 'RESOLVED' || ticket.status === 'CANCELLED'
    const isCompleted = ticket.status === 'COMPLETED'
    const isFailed = ticket.status === 'FAILED'

    const isDisabled =
        (!isCompleted && !isFailed) ||
        isFinalized ||
        updateTicketAgent.isPending

    const handleSave = async () => {
        const { resolutionResponse, urgency } = form.getValues()
        try {
            await updateTicketAgent.mutateAsync({
                id: ticket.id,
                data: {
                    resolutionResponse,
                    urgency: urgency,
                },
            })
            toast.success('Changes saved successfully')
        } catch (error) {
            toast.error('Failed to save changes')
            console.error('Failed to save changes:', error)
        }
    }

    const handleResolve = async () => {
        const { resolutionResponse, urgency } = form.getValues()
        try {
            if (
                resolutionResponse !== ticket.resolutionResponse ||
                urgency !== ticket.urgency
            ) {
                await updateTicketAgent.mutateAsync({
                    id: ticket.id,
                    data: {
                        resolutionResponse,
                        urgency: urgency,
                    },
                })
            }
            await resolveTicket.mutateAsync(ticket.id)
            toast.success('Ticket resolved successfully')
        } catch (error) {
            toast.error('Failed to resolve ticket')
            console.error('Failed to resolve ticket:', error)
        }
    }

    const handleCancel = async () => {
        try {
            await cancelTicket.mutateAsync(ticket.id)
            toast.success('Ticket cancelled successfully')
        } catch (error) {
            toast.error('Failed to cancel ticket')
            console.error('Failed to cancel ticket:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                    {ticket.title}
                </CardTitle>
                {ticket.urgency && (
                    <div className="flex items-center gap-2">
                        <UrgencyBadge urgency={ticket.urgency} />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <FormWrapper form={form} className="space-y-0">
                    <div className="grid gap-6">
                        {isAgent && (
                            <TicketCustomerInfo
                                customerName={ticket.customerName}
                                customerEmail={ticket.customerEmail}
                            />
                        )}

                        <div className="grid gap-3">
                            <Label className="text-muted-foreground">
                                Description
                            </Label>
                            <div className="text-sm font-medium whitespace-pre-wrap">
                                {ticket.description}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Status
                                </Label>
                                <div>
                                    <TicketStatusBadge status={ticket.status} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Created At
                                </Label>
                                <div className="text-sm font-medium">
                                    {new Date(
                                        ticket.createdAt
                                    ).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {ticket.category && (
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">
                                    Category
                                </Label>
                                <div>
                                    <CategoryBadge
                                        category={ticket.category}
                                        className="px-3 py-1 text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        {isAgent && (
                            <TicketAgentActions
                                ticket={ticket}
                                isProcessing={isProcessing}
                                isDisabled={isDisabled}
                                isFinalized={isFinalized}
                                isCompleted={isCompleted || isFailed}
                                handleSave={handleSave}
                                handleResolve={handleResolve}
                                handleCancel={handleCancel}
                                isSavePending={updateTicketAgent.isPending}
                                isResolvePending={resolveTicket.isPending}
                                isCancelPending={cancelTicket.isPending}
                            />
                        )}
                    </div>
                </FormWrapper>
            </CardContent>
        </Card>
    )
}

export { TicketDetailCard }
