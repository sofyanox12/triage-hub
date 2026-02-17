import { TableColumnProps } from '@/components/table-data'

export const ticketTableColumns = (isAgent: boolean): TableColumnProps[] => {
    const columns: TableColumnProps[] = [
        {
            key: 'title',
            title: 'Title',
            className: 'font-medium',
        },
        {
            key: 'status',
            title: 'Status',
        },
        {
            key: 'urgency',
            title: 'Priority',
        },
        {
            key: 'category',
            title: 'Category',
        },
    ]

    if (isAgent) {
        columns.push(
            {
                key: 'customer',
                title: 'Customer',
            }
        )
    }

    columns.push(
        {
            key: 'createdAt',
            title: 'Created',
        },
        {
            key: 'action',
            title: 'Action',
            position: 'right',
        }
    )

    return columns
}
