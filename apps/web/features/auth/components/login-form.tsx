'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@triage/shared'
import { useAuth } from '../hooks/use-auth'
import { FormWrapper, InputText, InputPassword } from '@/components/inputs'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'

const LoginForm = () => {
    const [error, setError] = useState('')
    const { login, isLoading } = useAuth()

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginInput) => {
        setError('')
        try {
            await login(data.email, data.password)
        } catch (err: unknown) {
            const errorData = (
                err as { response?: { data?: { message?: string } } }
            )?.response?.data
            setError(errorData?.message || 'Login failed')
        }
    }

    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your dashboard
                </p>
            </div>

            <FormWrapper form={form} onSubmit={onSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                        {error}
                    </div>
                )}

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

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </FormWrapper>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">
                    Don&apos;t have an account?{' '}
                </span>
                <Link
                    href={ROUTES.REGISTER}
                    className="font-medium text-primary hover:underline"
                >
                    Sign up
                </Link>
            </div>
        </div>
    )
}

export { LoginForm }
