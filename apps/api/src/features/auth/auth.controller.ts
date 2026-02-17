import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { ResponseHelper } from '@/utils/response-helper'
import { loginSchema, registerSchema, UserType } from '@triage/shared'
import { env } from '@/config/env'

interface AuthenticatedRequest extends Request {
    user: {
        id: string
        type: UserType
    }
}

class AuthController {
    /**
     * Registers a new user.
     * POST /auth/register
     */
    static async register(req: Request, res: Response) {
        const payload = registerSchema.parse(req.body)
        const user = await AuthService.register(payload)
        return ResponseHelper.created(res, user)
    }

    /**
     * Logs in a user.
     * POST /auth/login
     */
    static async login(req: Request, res: Response) {
        const payload = loginSchema.parse(req.body)
        const { user, accessToken, refreshToken } =
            await AuthService.login(payload)

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return ResponseHelper.success(res, { user, accessToken })
    }

    /**
     * Refreshes the access token.
     * POST /auth/refresh
     */
    static async refresh(req: Request, res: Response) {
        const refreshToken = req.cookies?.refreshToken
        if (!refreshToken) {
            return ResponseHelper.unauthorized(res, 'Refresh token missing')
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await AuthService.refresh(refreshToken)

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        return ResponseHelper.success(res, { accessToken })
    }

    /**
     * Logs out a user.
     * POST /auth/logout
     */
    static async logout(_req: Request, res: Response) {
        res.clearCookie('refreshToken')
        return ResponseHelper.success(res, { message: 'Logged out' })
    }

    /**
     * Gets the authenticated user.
     * GET /auth/me
     */
    static async me(req: Request, res: Response) {
        const authenticatedRequest = req as unknown as AuthenticatedRequest

        return ResponseHelper.success(res, {
            user: authenticatedRequest.user,
        })
    }
}

export { AuthController }
