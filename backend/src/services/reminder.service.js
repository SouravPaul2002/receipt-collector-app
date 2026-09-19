import Reminder from '../models/reminder.model.js'
import { sendReminderEmail } from './email.service.js'

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

export const processDueReminders = async () => {
    const dueReminders = await Reminder.find({
        status: 'pending',
        scheduledDate: { $lte: new Date() }
    })
        .populate('product', 'productName warrantyExpiryDate')
        .populate('user', 'email')

    console.log(`[reminder cron] found ${dueReminders.length} due reminder(s)`)

    for (const reminder of dueReminders) {
        try {
            if (!reminder.user || !reminder.product) {
                console.warn(`[reminder cron] skipping reminder ${reminder._id}: associated user or product no longer exists`)
                reminder.status = 'failed'
                await reminder.save()
                continue
            }

            if (reminder.channel === 'email') {
                await sendReminderEmail({
                    to: reminder.user.email,
                    productName: reminder.product.productName,
                    daysBeforeExpiry: reminder.daysBeforeExpiry,
                    expiryDate: reminder.product.warrantyExpiryDate
                })
            }
            // 'push' and 'whatsapp' channels intentionally skipped — not implemented yet

            reminder.status = 'sent'
            reminder.sentAt = new Date()
            await reminder.save()
        } catch (err) {
            console.error(`[reminder cron] failed to send reminder ${reminder._id}:`, err.message)
            reminder.status = 'failed'
            await reminder.save()
        }
    }
}