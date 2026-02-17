'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string
    label?: string
    rightSection?: React.ReactNode
    leftSection?: React.ReactNode
}

const InputText = ({
    name,
    label,
    placeholder,
    type = 'text',
    className,
    rightSection,
    leftSection,
    ...props
}: InputTextProps) => {
    const {
        register,
        formState: { errors },
    } = useFormContext()

    const error = errors[name]?.message as string | undefined

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="relative">
                <Input
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    className={cn(
                        leftSection && 'pl-10',
                        rightSection && 'pr-10',
                        error &&
                            'border-destructive focus-visible:ring-destructive',
                        className
                    )}
                    {...register(name, { valueAsNumber: type === 'number' })}
                    {...props}
                />
                {leftSection && (
                    <div className="pointer-events-none absolute left-0 top-0 flex h-full items-center pl-3">
                        {leftSection}
                    </div>
                )}
                {rightSection && (
                    <div className="pointer-events-none absolute right-0 top-0 flex h-full items-center pr-3">
                        {rightSection}
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    )
}

export { InputText }
