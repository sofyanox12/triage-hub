'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Ticket, LogOut, User } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui'
import { ROUTES } from '@/lib/constants'

const Sidebar = () => {
    const pathname = usePathname()
    const { logout, user } = useAuth()

    const links = [
        {
            href: ROUTES.OVERVIEW,
            label: 'Overview',
            icon: LayoutDashboard,
        },
        {
            href: ROUTES.TICKETS,
            label: 'Tickets',
            icon: Ticket,
        },
    ]

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                    href={ROUTES.HOME}
                    className="flex items-center gap-2 font-semibold"
                >
                    <Ticket className="h-6 w-6" />
                    <span className="">Triage Hub</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1 py-2">
                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive =
                            pathname === link.href ||
                            pathname.startsWith(`${link.href}/`)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
                                    isActive
                                        ? 'bg-muted text-primary'
                                        : 'text-muted-foreground'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="border-t p-4">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={logout}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}

export { Sidebar }
