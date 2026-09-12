import { Router } from 'express'
import { createWarranty } from '../controllers/warranty.controller.js'

const router = Router()

// POST /api/warranties -> create a new warranty
router.post('/', createWarranty)

export default router
