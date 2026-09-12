import { Router } from 'express'
import healthRoutes from './health.routes.js'
import warrantyRoutes from './warranty.routes.js'

const router = Router()

// Mount API routes
router.use('/health', healthRoutes)
router.use('/warranties', warrantyRoutes)

export default router
