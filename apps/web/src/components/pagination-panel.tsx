'use client'

import { Button } from '@/components/ui'
import { PaginationMeta } from '@/lib/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationPanelProps {
    pagination: PaginationMeta
    onPageChange: (page: number) => void
}

export function PaginationPanel({
    pagination,
    onPageChange,
}: PaginationPanelProps) {
    const { page, totalPages } = pagination
    const isFirstPage = page === 1
    const isLastPage = page === totalPages

    return (
        <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={isFirstPage}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={isLastPage}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                </Button>
            </div>
        </div>
    )
}
