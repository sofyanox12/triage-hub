import type { HTMLAttributes } from 'react'

type BoxProps = HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>
}

const Box = ({ children, ...rest }: BoxProps) => {
    return <div {...rest}>{children}</div>
}

export { Box }
