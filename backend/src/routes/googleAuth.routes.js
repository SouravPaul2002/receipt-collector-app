import { Router } from 'express'
import { googleLoginCallback, googleLoginRedirect } from '../controllers/googleAuth.controller.js'

const router = Router()

// GET /api/auth/google -> Redirect to Google Consent Screen
router.get('/google', googleLoginRedirect)

// GET /api/auth/google/callback -> Handle Google OAuth Redirect & Token Exchange
router.get('/google/callback', googleLoginCallback)

export default router