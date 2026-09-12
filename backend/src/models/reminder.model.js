import mongoose, { Schema } from 'mongoose'

const reminderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true
        },
        scheduledDate: {
            type: Date,
            required: true,
            index: true
        },
        daysBeforeExpiry: {
            type: Number,
            required: true
        },
        channel: {
            type: String,
            enum: ['email', 'push', 'whatsapp'],
            default: 'email'
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
            index: true
        },
        sentAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
)

const Reminder = mongoose.model('Reminder', reminderSchema)
export default Reminder
