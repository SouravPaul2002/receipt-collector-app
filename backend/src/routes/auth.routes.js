import { Router } from 'express'
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    updateProfile,
    disconnectDrive
} from '../controllers/auth.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Public Routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/refresh-token', refreshAccessToken)

// Protected Routes (Require JWT)
router.post('/logout', verifyJWT, logoutUser)
router.get('/me', verifyJWT, getCurrentUser)
router.patch('/profile', verifyJWT, updateProfile)
router.post('/drive/disconnect', verifyJWT, disconnectDrive)

export default router
