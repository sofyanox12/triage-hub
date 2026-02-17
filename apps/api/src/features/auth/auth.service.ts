import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import { UserRepository } from '@/features/users/user.repository'
import { LoginInput, RegisterInput } from '@triage/shared'
import { ConflictException, UnauthorizedException } from '@/lib/exception'

class AuthService {
    /**
     * Register a new user
     */
    static async register(data: RegisterInput) {
        const existingUser = await UserRepository.findByEmail(data.email)
        if (existingUser) {
            throw new ConflictException('Email already in use')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const user = await UserRepository.create({
            ...data,
            password: hashedPassword,
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            type: user.type,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    }

    /**
     * Login user
     */
    static async login(data: LoginInput) {
        const user = await UserRepository.findByEmail(data.email)
        if (!user) {
            throw new UnauthorizedException('Invalid email or password')
        }

        const isPasswordValid = await bcrypt.compare(
            data.password,
            user.password
        )
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password')
        }

        const tokens = this.generateTokens(user.id, user.type)

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            ...tokens,
        }
    }

    /**
     * Refresh access token
     */
    static async refresh(refreshToken: string) {
        try {
            const payload = jwt.verify(
                refreshToken,
                env.REFRESH_TOKEN_SECRET
            ) as {
                sub: string
                type: string
            }

            const user = await UserRepository.findById(payload.sub)
            if (!user) {
                throw new UnauthorizedException('User not found')
            }

            const tokens = this.generateTokens(user.id, user.type)
            return tokens
        } catch {
            throw new UnauthorizedException('Invalid refresh token')
        }
    }

    /**
     * Generate Access and Refresh tokens
     */
    private static generateTokens(userId: string, type: string) {
        const accessToken = jwt.sign(
            { sub: userId, type },
            env.ACCESS_TOKEN_SECRET || 'access-secret',
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            { sub: userId, type },
            env.REFRESH_TOKEN_SECRET || 'refresh-secret',
            { expiresIn: '7d' }
        )

        return { accessToken, refreshToken }
    }
}

export { AuthService }
