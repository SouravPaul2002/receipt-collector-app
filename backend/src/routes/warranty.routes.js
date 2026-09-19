import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import {
    createWarranty,
    getAllWarranties,
    getWarrantyById,
    deleteAllWarranties,
    deleteWarrantyById,
    updateWarrantyById
} from '../controllers/warranty.controller.js'

const router = Router()

// Apply authentication middleware to all warranty endpoints
router.use(verifyJWT)

// POST /api/warranties -> create a new warranty (supports optional multipart invoice file upload)
router.post('/', upload.single('invoice'), createWarranty)


// GET /api/warranties -> fetch all warranties for authenticated user
router.get('/', getAllWarranties)

// DELETE /api/warranties -> delete all warranties for authenticated user
router.delete('/', deleteAllWarranties)

// GET /api/warranties/:id -> fetch single warranty by ID
router.get('/:id', getWarrantyById)

// DELETE /api/warranties/:id -> delete single warranty by ID
router.delete('/:id', deleteWarrantyById)

// PUT /api/warranties/:id -> update single warranty by ID
router.put('/:id', updateWarrantyById)

export default router
