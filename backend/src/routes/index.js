import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import googleAuthRoutes from './googleAuth.routes.js'
import warrantyRoutes from './warranty.routes.js'

const router = Router()

// Mount API routes
router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/auth', googleAuthRoutes)
router.use('/warranties', warrantyRoutes)

export default router

