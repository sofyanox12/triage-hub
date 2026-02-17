'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'

const Home = () => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push('/overview')
            } else {
                router.push('/login')
            }
        }
    }, [user, isLoading, router])

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
                Redirecting...
            </div>
        </div>
    )
}

export default Home
