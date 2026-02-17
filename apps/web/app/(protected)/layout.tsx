'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth'
import { Sidebar } from '@/components/sidebar'

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                    Loading...
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="flex h-screen w-full bg-background">
            <div className="hidden border-r bg-muted/40 md:block">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto">
                <div className="h-full px-4 py-6 lg:px-8">{children}</div>
            </main>
        </div>
    )
}

export default ProtectedLayout
