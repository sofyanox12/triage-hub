'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
    useMemo,
} from 'react'
import { useLogin, useRegister, useLogout } from '../hooks'
import { UserType } from '@triage/shared'
import { useRouter } from 'next/navigation'
import { ROUTES, STORAGE_KEYS } from '@/lib/constants'

interface User {
    id: string
    name: string
    email: string
    type: UserType
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (
        name: string,
        email: string,
        password: string,
        type: UserType
    ) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter()

    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)

    const loginMutation = useLogin()
    const registerMutation = useRegister()
    const logoutMutation = useLogout()

    const handleAuthSuccess = useCallback(
        (accessToken: string, user: User) => {
            setToken(accessToken)
            setUser(user)
            localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
            router.push(ROUTES.OVERVIEW)
        },
        [router]
    )

    const login = useCallback(
        async (email: string, password: string) => {
            const response = await loginMutation.mutateAsync({
                email,
                password,
            })
            handleAuthSuccess(response.accessToken, response.user)
        },
        [loginMutation, handleAuthSuccess, router]
    )

    const register = useCallback(
        async (
            name: string,
            email: string,
            password: string,
            type: UserType
        ) => {
            await registerMutation.mutateAsync({ name, email, password, type })
            await login(email, password)
        },
        [registerMutation, login, router]
    )

    const logout = useCallback(() => {
        logoutMutation.mutate()
        setToken(null)
        setUser(null)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
        router.push(ROUTES.LOGIN)
    }, [logoutMutation, router])

    const isLoading = useMemo(
        () =>
            isInitializing ||
            loginMutation.isPending ||
            registerMutation.isPending,
        [isInitializing, loginMutation.isPending, registerMutation.isPending]
    )

    useEffect(() => {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setIsInitializing(false)
    }, [])

    return (
        <AuthContext.Provider
            value={{ user, token, isLoading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export { AuthProvider, useAuth }
