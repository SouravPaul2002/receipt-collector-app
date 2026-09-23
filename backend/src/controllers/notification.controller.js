import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import Reminder from '../models/reminder.model.js'
import Product from '../models/product.model.js'
import { generateRemindersForProduct } from '../services/reminder.service.js'

/**
 * @desc    Get all active in-app notifications/reminders for the logged-in user
 * @route   GET /api/notifications
 * @access  Private (Protected by verifyJWT)
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const now = new Date()

    // Fetch user reminders that are due (scheduledDate <= now) and not dismissed
    let reminders = await Reminder.find({
        user: userId,
        isDismissed: { $ne: true },
        scheduledDate: { $lte: now }
    })
        .populate('product')
        .sort({ scheduledDate: -1, createdAt: -1 })
        .lean()

    // Clean up any orphan reminders pointing to deleted products
    const validReminders = []
    const orphanIds = []

    for (const r of reminders) {
        if (!r.product) {
            orphanIds.push(r._id)
        } else {
            validReminders.push(r)
        }
    }

    if (orphanIds.length > 0) {
        await Reminder.deleteMany({ _id: { $in: orphanIds } })
    }

    const unreadCount = validReminders.filter((r) => !r.isRead).length

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notifications: validReminders,
                unreadCount
            },
            "Notifications fetched successfully"
        )
    )
})

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Protected by verifyJWT)
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params
    const reminder = await Reminder.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isRead: true },
        { new: true }
    ).populate('product')

    if (!reminder) {
        throw new ApiError(404, "Notification not found")
    }

    return res.status(200).json(
        new ApiResponse(200, reminder, "Notification marked as read")
    )
})

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private (Protected by verifyJWT)
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    await Reminder.updateMany(
        { user: req.user._id, isDismissed: { $ne: true } },
        { isRead: true }
    )

    return res.status(200).json(
        new ApiResponse(200, null, "All notifications marked as read")
    )
})

/**
 * @desc    Dismiss / Clear single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private (Protected by verifyJWT)
 */
export const clearNotification = asyncHandler(async (req, res) => {
    const { id } = req.params
    const reminder = await Reminder.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isDismissed: true },
        { new: true }
    )

    if (!reminder) {
        throw new ApiError(404, "Notification not found")
    }

    return res.status(200).json(
        new ApiResponse(200, { id }, "Notification cleared successfully")
    )
})

/**
 * @desc    Dismiss / Clear all notifications for user
 * @route   DELETE /api/notifications
 * @access  Private (Protected by verifyJWT)
 */
export const clearAllNotifications = asyncHandler(async (req, res) => {
    await Reminder.updateMany(
        { user: req.user._id },
        { isDismissed: true }
    )

    return res.status(200).json(
        new ApiResponse(200, null, "All notifications cleared successfully")
    )
})
