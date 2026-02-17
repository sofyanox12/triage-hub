'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Stack, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface InputTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    name: string
    label?: React.ReactNode
    containerClassName?: string
}

const InputTextarea = ({
    name,
    label,
    placeholder,
    className,
    containerClassName,
    ...props
}: InputTextareaProps) => {
    const {
        register,
        formState: { errors },
    } = useFormContext()

    const error = errors[name]?.message as string | undefined

    return (
        <Stack className={cn('gap-2', containerClassName)}>
            {label && <Label htmlFor={name}>{label}</Label>}
            <Textarea
                id={name}
                placeholder={placeholder}
                className={cn(
                    error &&
                        'border-destructive focus-visible:ring-destructive',
                    className
                )}
                {...register(name)}
                {...props}
            />
            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </Stack>
    )
}

export { InputTextarea }
