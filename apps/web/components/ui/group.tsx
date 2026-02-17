import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type GroupProps = React.ComponentProps<'div'> & PropsWithChildren

const Group = ({ className, children, ...rest }: GroupProps) => {
    return (
        <div
            {...rest}
            className={cn(
                `flex flex-row flex-wrap items-center gap-3`,
                className
            )}
        >
            {children}
        </div>
    )
}

export { Group }
