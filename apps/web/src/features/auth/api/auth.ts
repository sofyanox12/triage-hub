import { http } from '@/lib/http'
import { LoginInput, RegisterInput, UserType } from '@triage/shared'

export interface User {
    id: string
    name: string
    email: string
    type: UserType
}

export interface AuthResponse {
    user: User
    accessToken: string
}

export interface RefreshResponse {
    accessToken: string
}

const authApi = {
    register: (data: RegisterInput) => http.post<User>('auth/register', data),
    login: (data: LoginInput) => http.post<AuthResponse>('auth/login', data),
    logout: () => http.post<{ message: string }>('auth/logout', {}),
    refresh: () => http.post<RefreshResponse>('auth/refresh', {}),
    me: () => http.get<{ user: User }>('auth/me'),
}

export { authApi }
