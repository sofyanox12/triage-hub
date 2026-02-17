import { Router } from 'express'
import { AuthController } from './auth.controller'
import { authenticate } from '@/middleware/auth'

const authRouter: ReturnType<typeof Router> = Router()

authRouter.post('/register', (req, res) => AuthController.register(req, res))
authRouter.post('/login', (req, res) => AuthController.login(req, res))
authRouter.post('/refresh', (req, res) => AuthController.refresh(req, res))
authRouter.post('/logout', (req, res) => AuthController.logout(req, res))
authRouter.get('/me', authenticate, (req, res) => AuthController.me(req, res))

export { authRouter }
