'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/features/auth'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ROUTES } from '@/lib/constants'

const RegisterPage = () => {
    const { user, token, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && (user || token)) {
            router.push(ROUTES.HOME)
        }
    }, [user, token, isLoading, router])

    if (isLoading) {
        return null
    }

    if (user || token) {
        return null
    }

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <RegisterForm />
        </div>
    )
}

export default RegisterPage
