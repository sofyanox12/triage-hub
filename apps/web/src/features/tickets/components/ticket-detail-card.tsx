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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/components/ui'
import {
    useUpdateTicketAgent,
    useResolveTicket,
    useCancelTicket,
} from '@/features/tickets/hooks/use-tickets'
import { useState } from 'react'
import {
    Loader2,
    Save,
    CheckCircle,
    XCircle,
    Brain,
    User,
    Mail,
} from 'lucide-react'
import { useAuth } from '@/features/auth/providers/auth-provider'
import { TicketStatusBadge } from './ticket-status-badge'
import { CategoryBadge } from './category-badge'
import { UrgencyBadge } from './urgency-badge'
import { toast } from 'sonner'

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

    const [draft, setDraft] = useState(ticket.resolutionResponse ?? '')
    const [urgency, setUrgency] = useState<
        'LOW' | 'MEDIUM' | 'HIGH' | undefined
    >(ticket.urgency ?? undefined)

    const isProcessing =
        ticket.status === 'PENDING' || ticket.status === 'PROCESSING'
    const isFinalized =
        ticket.status === 'RESOLVED' || ticket.status === 'CANCELLED'
    const isCompleted = ticket.status === 'COMPLETED'

    const isDisabled =
        !isCompleted || isFinalized || updateTicketAgent.isPending

    const handleSave = async () => {
        try {
            await updateTicketAgent.mutateAsync({
                id: ticket.id,
                data: {
                    resolutionResponse: draft,
                    urgency,
                },
            })
            toast.success('Changes saved successfully')
        } catch (error) {
            toast.error('Failed to save changes')
            console.error('Failed to save changes:', error)
        }
    }

    const handleResolve = async () => {
        try {
            // Save draft/urgency first if changed
            if (
                draft !== ticket.resolutionResponse ||
                urgency !== ticket.urgency
            ) {
                await updateTicketAgent.mutateAsync({
                    id: ticket.id,
                    data: {
                        resolutionResponse: draft,
                        urgency,
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
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label className="text-muted-foreground">
                            Description
                        </Label>
                        <div className="text-sm font-medium whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    {isAgent && (
                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-secondary/20 border">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                        Customer
                                    </span>
                                    <span className="text-sm font-bold">
                                        {ticket.customerName ||
                                            'Unknown Customer'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                        <Mail className="h-3.5 w-3.5" />
                                        {ticket.customerEmail ||
                                            'No email provided'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                {new Date(ticket.createdAt).toLocaleString()}
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
                        <>
                            <div className="grid gap-3">
                                <Label className="flex items-center gap-2">
                                    Resolution Response
                                    {isProcessing && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-normal"
                                        >
                                            <Brain className="mr-1 h-3 w-3" />
                                            AI processing...
                                        </Badge>
                                    )}
                                </Label>
                                <Textarea
                                    className="min-h-[120px]"
                                    placeholder="Prefilled resolution draft..."
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    disabled={isDisabled}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Urgency</Label>
                                    <Select
                                        value={urgency}
                                        onValueChange={(
                                            val: 'LOW' | 'MEDIUM' | 'HIGH'
                                        ) => setUrgency(val)}
                                        disabled={isDisabled}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select urgency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="MEDIUM">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="HIGH">
                                                High
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Sentiment Score (AI)</Label>
                                    <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                                        {ticket.sentiment ?? '-'} / 10
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={
                                        isFinalized ||
                                        ticket.status === 'PROCESSING' ||
                                        cancelTicket.isPending
                                    }
                                >
                                    {cancelTicket.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Cancel Ticket
                                </Button>

                                <div className="flex items-center gap-2 ml-auto">
                                    <Button
                                        variant="secondary"
                                        onClick={handleSave}
                                        disabled={
                                            isDisabled ||
                                            updateTicketAgent.isPending
                                        }
                                    >
                                        {updateTicketAgent.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save Changes
                                    </Button>

                                    <Button
                                        onClick={handleResolve}
                                        disabled={
                                            !isCompleted ||
                                            resolveTicket.isPending
                                        }
                                    >
                                        {resolveTicket.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                        )}
                                        Resolve
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export { TicketDetailCard }
