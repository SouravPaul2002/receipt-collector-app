import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            required: [true, 'Google ID is required'],
            unique: true,
            index: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        avatar: {
            type: String
        },
        refreshToken: {
            type: String
        },
        driveFolderId: {
            type: String
        },
        preferences: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            reminderDaysBefore: {
                type: [Number],
                default: [30, 7, 1]
            }
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)
export default User
