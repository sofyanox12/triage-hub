import { User, Mail } from 'lucide-react'

interface TicketCustomerInfoProps {
    customerName?: string | null
    customerEmail?: string | null
}

const TicketCustomerInfo = ({
    customerName,
    customerEmail,
}: TicketCustomerInfoProps) => {
    return (
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
                        {customerName || 'Unknown Customer'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Mail className="h-3.5 w-3.5" />
                        {customerEmail || 'No email provided'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export { TicketCustomerInfo }
