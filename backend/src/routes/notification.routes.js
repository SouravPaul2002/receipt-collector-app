import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    clearAllNotifications,
} from '../controllers/notification.controller.js'

const router = Router()

// All notification routes are protected
router.use(verifyJWT)

router.route('/')
    .get(getUserNotifications)
    .delete(clearAllNotifications)

router.patch('/read-all', markAllNotificationsAsRead)

router.route('/:id')
    .delete(clearNotification)

router.patch('/:id/read', markNotificationAsRead)

export default router
