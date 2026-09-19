import cron from 'node-cron'
import { processDueReminders } from '../services/reminder.service.js'

export const startReminderCron = () => {
    cron.schedule('0 * * * *', async () => { //hourly
        console.log('[reminder cron] running at', new Date().toISOString())
        await processDueReminders()
    })
}
