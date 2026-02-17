'use client'

import { Badge } from '@/components/ui'
import { Ticket } from '@/features/tickets/api/ticket.types'
import { CreditCard, Wrench, Lightbulb, Tag, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
    category: Ticket['category']
    className?: string
}

const CategoryBadge = ({ category, className }: CategoryBadgeProps) => {
    if (!category) return null

    const label = category.replace('_', ' ')

    const colors: Record<string, string> = {
        BILLING: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
        TECHNICAL:
            'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100',
        FEATURE_REQUEST:
            'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100',
    }

    const icons: Record<string, LucideIcon> = {
        BILLING: CreditCard,
        TECHNICAL: Wrench,
        FEATURE_REQUEST: Lightbulb,
    }

    const Icon = icons[category] || Tag

    return (
        <Badge
            variant="outline"
            className={cn(
                'w-fit gap-1.5 px-2 py-1 font-medium rounded-full transition-colors py-1',
                colors[category] || '',
                className
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            <span className="uppercase text-[10px] tracking-wider leading-none">
                {label}
            </span>
        </Badge>
    )
}

export { CategoryBadge }
