import { Router } from 'express'
import {
    createWarranty,
    getAllWarranties,
    getWarrantyById,
    deleteAllWarranties,
    deleteWarrantyById,
    updateWarrantyById
} from '../controllers/warranty.controller.js'

const router = Router()

// POST /api/warranties -> create a new warranty
router.post('/', createWarranty)

// GET /api/warranties -> fetch all warranties
router.get('/', getAllWarranties)

// DELETE /api/warranties -> delete all warranties
router.delete('/', deleteAllWarranties)

// GET /api/warranties/:id -> fetch single warranty by ID
router.get('/:id', getWarrantyById)

// DELETE /api/warranties/:id -> delete single warranty by ID
router.delete('/:id', deleteWarrantyById)

// PUT /api/warranties/:id -> update single warranty by ID
router.put('/:id', updateWarrantyById)

export default router
