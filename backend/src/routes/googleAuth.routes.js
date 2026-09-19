import { Router } from 'express'
import {
    googleLoginRedirect,
    googleLoginCallback,
    googleDriveConnectRedirect,
    googleDriveConnectCallback
} from '../controllers/googleAuth.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Public Google Login Flow
router.get('/google', googleLoginRedirect)
router.get('/google/callback', googleLoginCallback)

// Protected Google Drive Connection Flow (Requires Authenticated User)
router.get('/google/drive/connect', verifyJWT, googleDriveConnectRedirect)
router.get('/google/drive/callback', verifyJWT, googleDriveConnectCallback)

export default router
