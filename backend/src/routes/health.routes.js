import { Router } from 'express'
import { checkHealth } from '../controllers/health.controller.js'

const router = Router()

// Detailed health check
router.get('/', checkHealth)

// Ultra lightweight ping endpoint
router.get('/ping', (req, res) => res.status(200).send('pong'))
router.head('/ping', (req, res) => res.status(200).end())

export default router

