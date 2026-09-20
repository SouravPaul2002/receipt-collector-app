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
    driveFileId?: string
    driveFileUrl?: string
    notes?: string
    ocrData?: Record<string, unknown>
    createdAt?: string
    updatedAt?: string
}

export interface ApiResponse<T = unknown> {
    statusCode: number
    data: T
    message: string
    success: boolean
}
