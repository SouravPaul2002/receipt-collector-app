import Reminder from '../models/reminder.model.js'

const DEFAULT_INTERVALS = [30, 7, 1] // days before expiry

export const generateRemindersForProduct = async (product, user) => {
    const enabledChannels = []
    const notificationChannels = user.preferences?.notificationChannels || user.notificationChannels || {}
    if (notificationChannels.email) enabledChannels.push('email')
    // webPush and whatsApp intentionally not added yet — not implemented

    if (enabledChannels.length === 0) return // user has notifications off entirely

    const userIntervals = user.preferences?.reminderDaysBefore || user.reminderDaysBefore
    const intervals = userIntervals?.length ? userIntervals : DEFAULT_INTERVALS

    const reminderDocs = []
    for (const daysBefore of intervals) {
        const scheduledDate = new Date(product.warrantyExpiryDate)
        scheduledDate.setDate(scheduledDate.getDate() - daysBefore)

        // skip for dates already in the past
        if (scheduledDate < new Date()) continue

        for (const channel of enabledChannels) {
            reminderDocs.push({
                user: user._id,
                product: product._id,
                scheduledDate,
                daysBeforeExpiry: daysBefore,
                channel,
                status: 'pending'
            })
        }
    }

    if (reminderDocs.length > 0) {
        await Reminder.insertMany(reminderDocs)
    }
}