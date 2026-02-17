import { PropsWithChildren, ReactNode } from 'react'
import { PaginationProps } from './pagination'
import { ColumnDef, SortingState, OnChangeFn } from '@tanstack/react-table'

export interface TableColumnProps {
    title?: ReactNode
    key: string
    sortKey?: string
    sortable?: boolean
    className?: string
    columnClassName?: string
    width?: number
    position?: 'left' | 'center' | 'right'
}

export type TableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>

export interface TableBodyProps extends PropsWithChildren {
    isLoading: boolean
    width: number
    useNumbering?: boolean
}

export interface TableProps<TData> {
    useNumbering?: boolean
    isLoading?: boolean
    columns: TableColumn<TData>[]
    data: TData[]
    pagination?: PaginationProps
    showPaginationNumbers?: boolean
    filterMenu?: ReactNode
    showToolbar?: boolean
    showFilter?: boolean
    expandedRowRender?: (record: TData) => ReactNode
    sorting?: SortingState
    onSortingChange?: OnChangeFn<SortingState>
}
