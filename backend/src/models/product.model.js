import mongoose, { Schema } from 'mongoose'

const productSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        productName: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ['Electronics', 'Appliances', 'Furniture', 'Vehicles', 'Clothing', 'Personal Care', 'Other'],
            default: 'Other'
        },
        brand: {
            type: String,
            trim: true
        },
        modelNumber: {
            type: String,
            trim: true
        },
        serialNumber: {
            type: String,
            trim: true
        },
        purchaseDate: {
            type: Date,
            required: [true, 'Purchase date is required']
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        },
        retailer: {
            type: String,
            trim: true
        },
        warrantyMonths: {
            type: Number,
            required: [true, 'Warranty period in months is required'],
            min: [0, 'Warranty months cannot be negative']
        },
        warrantyExpiryDate: {
            type: Date,
            required: true,
            index: true
        },
        driveFileId: {
            type: String
        },
        driveFileUrl: {
            type: String
        },
        ocrData: {
            rawText: String,
            extractedDate: Date,
            extractedAmount: Number,
            confidence: Number
        },
        notes: {
            type: String,
            trim: true
        },
        reminderDaysBefore: {
            type: [Number],
            default: [30, 7, 1]
        },
        notificationChannels: {
            email: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: false },
            webPush: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true
    }
)

// Pre-validate hook to calculate warranty expiry date if not explicitly set
productSchema.pre('validate', function () {
    if (this.purchaseDate && typeof this.warrantyMonths === 'number' && !this.warrantyExpiryDate) {
        const expiry = new Date(this.purchaseDate)
        expiry.setMonth(expiry.getMonth() + this.warrantyMonths)
        this.warrantyExpiryDate = expiry
    }
})

const Product = mongoose.model('Product', productSchema)
export default Product
