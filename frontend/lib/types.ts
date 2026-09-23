export interface UserPreferences {
    notificationChannels?: {
        email?: boolean
        webPush?: boolean
        whatsApp?: boolean
    }
    reminderDaysBefore?: number[]
}

export interface User {
    _id: string
    googleId?: string
    email: string
    name: string
    avatar?: string
    driveConnected?: boolean
    driveFolderId?: string
    preferences?: UserPreferences
    createdAt?: string
    updatedAt?: string
}

export interface Warranty {
    _id: string
    user: string
    productName: string
    category?: string
    brand?: string
    modelNumber?: string
    serialNumber?: string
    purchaseDate: string
    price?: number
    currency?: string
    retailer?: string
    warrantyMonths: number
    warrantyExpiryDate: string
    reminderDaysBefore?: number[]
    notificationChannels?: {
        email?: boolean
        whatsapp?: boolean
        webPush?: boolean
    }
    driveFileId?: string
    driveFileUrl?: string
    notes?: string
    ocrData?: Record<string, unknown>
    reminders?: Reminder[]
    createdAt?: string
    updatedAt?: string
}

export interface Reminder {
    _id: string
    user: string
    product: string | Warranty
    scheduledDate: string
    daysBeforeExpiry: number
    channel: "email" | "push" | "whatsapp" | "in_app"
    status: "pending" | "sent" | "failed"
    isRead?: boolean
    isDismissed?: boolean
    sentAt?: string
    createdAt?: string
    updatedAt?: string
}

export type NotificationItem = Reminder & {
    product: Warranty
}

export interface ApiResponse<T = unknown> {
    statusCode: number
    data: T
    message: string
    success: boolean
}
