import type { PropsWithChildren } from 'react'
import { Box } from './box'
import { cn } from '@/lib/utils'

type StackProps = React.ComponentProps<'div'> &
    PropsWithChildren & {
        gap?: number
    }

const Stack = ({ className, children, gap = 4, ...rest }: StackProps) => {
    return (
        <Box {...rest} className={cn('flex flex-col flex-wrap', className)}>
            {children}
        </Box>
    )
}

export { Stack }
