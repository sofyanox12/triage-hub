'use client'

import React, { ReactNode } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui'
import { PaginationMeta } from '@/lib/api'
import { PaginationPanel } from './pagination-panel'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Props for a table column.
 */
export type TableColumnProps = {
    key: string
    title: ReactNode
    className?: string
    columnClassName?: string
    sortable?: boolean
    sortKey?: string
    width?: number
    position?: 'left' | 'center' | 'right'
    render?: (row: Record<string, any>) => ReactNode
}

interface TableDataProps {
    columns: TableColumnProps[]
    data: Array<Record<string, ReactNode>>
    isLoading?: boolean
    pagination?: PaginationMeta
    onPageChange?: (page: number) => void
    className?: string
}

/**
 * A generic data table component with pagination support.
 * @param columns - Table column definitions.
 * @param data - Array of row data.
 * @param isLoading - Loading state.
 * @param pagination - Pagination metadata.
 * @param onPageChange - Callback for page changes.
 * @param className - Additional container styling.
 */
export function TableData({
    columns,
    data,
    isLoading,
    pagination,
    onPageChange,
    className,
}: TableDataProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100/50">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={cn(
                                        column.columnClassName,
                                        column.position === 'center' &&
                                            'text-center',
                                        column.position === 'right' &&
                                            'text-right',
                                        column.width && `w-[${column.width}px]`
                                    )}
                                >
                                    {column.title}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={`${rowIndex}-${column.key}`}
                                            className={cn(
                                                column.className,
                                                column.position === 'center' &&
                                                    'text-center',
                                                column.position === 'right' &&
                                                    'text-right'
                                            )}
                                        >
                                            {column.render
                                                ? column.render(row)
                                                : row[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && onPageChange && (
                <PaginationPanel
                    pagination={pagination}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    )
}
