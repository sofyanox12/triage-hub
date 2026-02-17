'use client'

import { FormEvent, useState } from 'react'
import { useCreateTicket } from '@/features/tickets/hooks/use-tickets'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Input, Button, Label, Textarea } from '@/components/ui'

const TicketForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [message, setMessage] = useState<{
        text: string
        type: 'success' | 'error'
    } | null>(null)

    const createTicket = useCreateTicket()

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)

        try {
            await createTicket.mutateAsync({
                title,
                description,
            })
            setTitle('')
            setDescription('')
            setMessage({
                text: 'Ticket created. AI triage is running in the background.',
                type: 'success',
            })
            onSuccess?.()
        } catch (error) {
            const text =
                error instanceof ApiError
                    ? error.message
                    : error instanceof Error
                      ? error.message
                      : 'Failed to create ticket'
            setMessage({ text, type: 'error' })
        }
    }

    return (
        <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="e.g. Cannot login to dashboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    minLength={3}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    className="min-h-[100px]"
                    placeholder="Describe your issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    minLength={10}
                />
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createTicket.isPending}>
                    {createTicket.isPending ? 'Submitting...' : 'Create Ticket'}
                </Button>
            </div>
            {message ? (
                <p
                    className={cn(
                        'text-sm',
                        message.type === 'error'
                            ? 'text-destructive'
                            : 'text-green-600'
                    )}
                >
                    {message.text}
                </p>
            ) : null}
        </form>
    )
}

export { TicketForm }
