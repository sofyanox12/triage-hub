'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@triage/shared'
import { useAuth } from '../hooks/use-auth'
import {
    FormWrapper,
    InputText,
    InputPassword,
    InputSelect,
} from '@/components/inputs'
import { Button } from '@/components/ui'

import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

const RegisterForm = () => {
    const [error, setError] = useState('')
    const { register: registerUser, isLoading } = useAuth()

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            type: 'CUSTOMER',
        },
    })

    const onSubmit = async (data: RegisterInput) => {
        setError('')
        try {
            await registerUser(data.name, data.email, data.password, data.type)
        } catch (err: unknown) {
            const errorData = (
                err as { response?: { data?: { message?: string } } }
            )?.response?.data
            setError(errorData?.message || 'Registration failed')
        }
    }

    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your details below to create your account
                </p>
            </div>

            <FormWrapper form={form} onSubmit={onSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

                <InputText
                    name="name"
                    label="Name"
                    placeholder="Enter your name"
                />
                <InputText
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                />
                <InputPassword
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                />

                <InputSelect
                    name="type"
                    label="Account Type"
                    placeholder="Select account type"
                    description="Quickly pre-select the account type for technical brief purpose."
                    items={[
                        { value: 'CUSTOMER', label: 'Customer' },
                        { value: 'AGENT', label: 'Agent' },
                    ]}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
            </FormWrapper>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">
                    Already have an account?{' '}
                </span>
                <Link
                    href={ROUTES.LOGIN}
                    className="font-medium text-primary hover:underline"
                >
                    Sign in
                </Link>
            </div>
        </div>
    )
}

export { RegisterForm }
