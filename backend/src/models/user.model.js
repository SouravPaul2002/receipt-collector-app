import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            sparse: true,
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
        password: {
            type: String,
            required: [function () { return !this.googleId }, 'Password is required']
        },
        avatar: {
            type: String,
            default: ''
        },
        refreshToken: {
            type: String
        },
        driveFolderId: {
            type: String
        },
        googleDriveRefreshToken: {
            type: String
        },
        driveConnected: {
            type: Boolean,
            default: false
        },
        preferences: {
            notificationChannels: {
                email: { type: Boolean , default: true},
                webPush: {type: Boolean, default: false},
                whatsApp: {type: Boolean, default: false}
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

// Pre-save hook to hash password before saving to DB
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return

    this.password = await bcrypt.hash(this.password, 10)
})

// Compare entered password with hashed password in DB
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false
    return await bcrypt.compare(password, this.password)
}

// Generate Access Token (Short-lived)
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d'
        }
    )
}

// Generate Refresh Token (Long-lived)
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d'
        }
    )
}

const User = mongoose.model('User', userSchema)
export default User
