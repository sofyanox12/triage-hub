import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { LoginInput, RegisterInput } from '@triage/shared'

export const useLogin = () => {
    return useMutation({
        mutationFn: (data: LoginInput) => authApi.login(data),
    })
}

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterInput) => authApi.register(data),
    })
}

export const useLogout = () => {
    return useMutation({
        mutationFn: () => authApi.logout(),
    })
}
