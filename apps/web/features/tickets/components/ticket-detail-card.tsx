'use client'

import { Ticket, TicketStatus } from '@/features/tickets/api/ticket.types'
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
import { useUpdateTicketAgent } from '@/features/tickets/hooks/use-tickets'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/features/auth/providers/auth-provider'

interface TicketDetailCardProps {
    ticket: Ticket
}

/**
 * Displays detailed ticket information and actions.
 * @param ticket - The ticket to display.
 */
const TicketDetailCard = ({ ticket }: TicketDetailCardProps) => {
    const updateTicketAgent = useUpdateTicketAgent()
    const isUpdating = updateTicketAgent.isPending
    const { user } = useAuth()
    const isAgent = user?.type === 'AGENT'

    const [status, setStatus] = useState<TicketStatus>(ticket.status)
    const [comment, setComment] = useState('')

    useEffect(() => {
        setStatus(ticket.status)
    }, [ticket.status])

    const handleStatusChange = async (newStatus: TicketStatus) => {
        setStatus(newStatus)
        try {
            await updateTicketAgent.mutateAsync({
                id: ticket.id,
                data: { status: newStatus },
            })
        } catch (error) {
            setStatus(ticket.status)
            console.error('Failed to update status', error)
        }
    }

    const handleAddComment = async () => {
        if (!comment.trim()) return

        try {
            console.log('Adding comment:', comment)
            setComment('')
        } catch (error) {
            console.error('Failed to add comment', error)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                    {ticket.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={
                            ticket.urgency === 'HIGH'
                                ? 'destructive'
                                : ticket.urgency === 'MEDIUM'
                                  ? 'default'
                                  : 'secondary'
                        }
                    >
                        {ticket.urgency || 'UNKNOWN'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label>Description</Label>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            {isAgent ? (
                                <Select
                                    value={status}
                                    onValueChange={(value) =>
                                        handleStatusChange(
                                            value as TicketStatus
                                        )
                                    }
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">
                                            Open
                                        </SelectItem>
                                        <SelectItem value="IN_PROGRESS">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="RESOLVED">
                                            Resolved
                                        </SelectItem>
                                        <SelectItem value="CANCELLED">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-sm font-medium">
                                    {status.replace('_', ' ')}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Created At</Label>
                            <div className="text-sm text-muted-foreground">
                                {new Date(ticket.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {isAgent && (
                        <div className="grid gap-3">
                            <Label>Internal Notes</Label>
                            <div className="flex gap-2">
                                <Textarea
                                    className="min-h-[100px]"
                                    placeholder="Add a comment..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={isUpdating}
                                />
                                <Button
                                    onClick={handleAddComment}
                                    disabled={!comment.trim() || isUpdating}
                                    className="self-end"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Post'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export { TicketDetailCard }
