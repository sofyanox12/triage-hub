'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TicketForm } from './ticket-form'
import { Plus } from 'lucide-react'

const TicketFormModal = () => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Ticket</DialogTitle>
                    <DialogDescription>
                        Submit a new ticket as a customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <TicketForm
                        onSuccess={() => setTimeout(() => setOpen(false), 500)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export { TicketFormModal }
