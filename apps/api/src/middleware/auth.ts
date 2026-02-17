import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '@/config/env'
import { UnauthorizedException } from '@/lib/exception'
import { UserType } from '@triage/shared'

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    console.log('[DEBUG] Auth Header:', authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException(
            'Missing or invalid authorization header'
        )
    }

    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as {
            sub: string
            type: string
        }

        req.user = {
            id: payload.sub,
            type: payload.type as UserType,
        }

        next()
    } catch {
        throw new UnauthorizedException('Invalid or expired token')
    }
}

export { authenticate }
