'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Button, Input } from '@/components/ui'

interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string
    label?: string
}

const InputPassword = ({
    name,
    label,
    placeholder,
    className,
    ...props
}: InputPasswordProps) => {
    const [showPassword, setShowPassword] = useState(false)
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    className={cn(
                        'pr-10',
                        error &&
                            'border-destructive focus-visible:ring-destructive',
                        className
                    )}
                    {...register(name)}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                </Button>
            </div>
            {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
            )}
        </div>
    )
}

export { InputPassword }
