import { Ticket } from '@/features/tickets/api/ticket.types'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface AiStatusIndicatorProps {
    status: Ticket['status']
}

export const AiStatusIndicator = ({ status }: AiStatusIndicatorProps) => {
    if (status === 'PROCESSING') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>AI is processing...</span>
            </div>
        )
    }

    if (status === 'COMPLETED') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>AI draft ready</span>
            </div>
        )
    }

    if (status === 'FAILED') {
        return (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>AI failed to ingest</span>
            </div>
        )
    }

    return null
}
