import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Product from '../models/product.model.js'
import { uploadFileToDrive, deleteFileFromDrive } from '../services/googleDrive.service.js'
import { generateRemindersForProduct } from '../services/reminder.service.js'


/**
 * @desc    Create a new warranty / product entry (supports optional receipt file upload to Google Drive)
 * @route   POST /api/warranties
 * @access  Private (Protected by verifyJWT)
 */
export const createWarranty = asyncHandler(async (req, res) => {
    const {
        productName,
        category,
        brand,
        modelNumber,
        serialNumber,
        purchaseDate,
        price,
        currency,
        retailer,
        warrantyMonths,
        notes,
        reminderDaysBefore,
        notificationChannels,
        notifications
    } = req.body

    // Validation for mandatory fields
    if (!productName || !purchaseDate || warrantyMonths === undefined) {
        throw new ApiError(400, "productName, purchaseDate, and warrantyMonths are required")
    }

    // Parse reminderDaysBefore
    let parsedReminderDays = [30, 7, 1]
    const rawReminderDays = reminderDaysBefore || req.body.reminderDays
    if (rawReminderDays !== undefined) {
        if (Array.isArray(rawReminderDays)) {
            parsedReminderDays = rawReminderDays.map(Number)
        } else if (typeof rawReminderDays === 'string') {
            try {
                const parsed = JSON.parse(rawReminderDays)
                parsedReminderDays = Array.isArray(parsed) ? parsed.map(Number) : rawReminderDays.split(',').map(Number)
            } catch {
                parsedReminderDays = rawReminderDays.split(',').map(Number)
            }
        }
    }

    // Parse notification channels
    let parsedNotificationChannels = { email: true, whatsapp: false, webPush: false }
    const rawNotifications = notificationChannels || notifications
    if (rawNotifications !== undefined) {
        if (typeof rawNotifications === 'string') {
            try {
                parsedNotificationChannels = JSON.parse(rawNotifications)
            } catch {
                parsedNotificationChannels = { email: true, whatsapp: false, webPush: false }
            }
        } else if (typeof rawNotifications === 'object' && rawNotifications !== null) {
            parsedNotificationChannels = rawNotifications
        }
    }

    // Build base warranty data payload once
    const warrantyPayload = {
        user: req.user._id,
        productName,
        category,
        brand,
        modelNumber,
        serialNumber,
        purchaseDate: new Date(purchaseDate),
        price: price ? Number(price) : undefined,
        currency,
        retailer,
        warrantyMonths: Number(warrantyMonths),
        notes,
        reminderDaysBefore: parsedReminderDays,
        notificationChannels: parsedNotificationChannels
    }

    let uploadedFile = null

    // IF req.file exists: upload to Google Drive FIRST with DB rollback protection
    if (req.file) {
        // Use req.user directly (already populated by verifyJWT middleware)
        if (!req.user.driveConnected || !req.user.googleDriveRefreshToken) {
            throw new ApiError(400, "Connect Google Drive before uploading a document")
        }

        // 1. Upload to Drive first before touching MongoDB
        uploadedFile = await uploadFileToDrive({
            user: req.user,
            fileBuffer: req.file.buffer,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype
        })

        warrantyPayload.driveFileId = uploadedFile.fileId
        warrantyPayload.driveFileUrl = uploadedFile.webViewLink
    }

    // 2. Attempt to create Product document in MongoDB (single unified call)
    try {
        const warranty = await Product.create(warrantyPayload)

        try {
            await generateRemindersForProduct(warranty, req.user)
        } catch (reminderError) {
            console.error('Failed to generate reminders for product', warranty._id, reminderError)
        }

        return res.status(201).json(
            new ApiResponse(
                201,
                warranty,
                uploadedFile
                    ? "Warranty created successfully with receipt"
                    : "Warranty created successfully"
            )
        )
    } catch (dbError) {
        // ROLLBACK: Delete the just-uploaded Drive file if DB write fails
        if (uploadedFile?.fileId) {
            await deleteFileFromDrive({ user: req.user, fileId: uploadedFile.fileId })
        }
        throw dbError
    }
})

/**
 * @desc    Get all warranty / product entries for logged-in user
 * @route   GET /api/warranties
 * @access  Private (Protected by verifyJWT)
 */
export const getAllWarranties = asyncHandler(async (req, res) => {
    const warranties = await Product.find({ user: req.user._id })

    return res.status(200).json(
        new ApiResponse(200, warranties, "User warranties fetched successfully")
    )
})

/**
 * @desc    Get single warranty / product by ID
 * @route   GET /api/warranties/:id
 * @access  Private (Protected by verifyJWT)
 */
export const getWarrantyById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const warranty = await Product.findOne({ _id: id, user: req.user._id })

    if (!warranty) {
        throw new ApiError(404, "Warranty not found")
    }

    return res.status(200).json(
        new ApiResponse(200, warranty, "Warranty fetched successfully")
    )
})

/**
 * @desc    Delete all warranty / product entries for logged-in user
 * @route   DELETE /api/warranties
 * @access  Private (Protected by verifyJWT)
 */
export const deleteAllWarranties = asyncHandler(async (req, res) => {
    const result = await Product.deleteMany({ user: req.user._id })

    return res.status(200).json(
        new ApiResponse(200, { deletedCount: result.deletedCount }, "All user warranties deleted successfully")
    )
})

/**
 * @desc    Delete single warranty / product by ID
 * @route   DELETE /api/warranties/:id
 * @access  Private (Protected by verifyJWT)
 */
export const deleteWarrantyById = asyncHandler(async (req, res) => {
    const { id } = req.params
    const warranty = await Product.findOneAndDelete({ _id: id, user: req.user._id })

    if (!warranty) {
        throw new ApiError(404, "Warranty not found")
    }

    return res.status(200).json(
        new ApiResponse(200, warranty, "Warranty deleted successfully")
    )
})

/**
 * @desc    Update single warranty / product by ID
 * @route   PUT /api/warranties/:id
 * @access  Private (Protected by verifyJWT)
 */
export const updateWarrantyById = asyncHandler(async (req, res) => {
    const { id } = req.params

    const existingWarranty = await Product.findOne({ _id: id, user: req.user._id })
    if (!existingWarranty) {
        throw new ApiError(404, "Warranty not found")
    }

    // Recalculate warrantyExpiryDate if purchaseDate or warrantyMonths are provided in update body
    const purchaseDate = req.body.purchaseDate ? new Date(req.body.purchaseDate) : existingWarranty.purchaseDate
    const warrantyMonths = req.body.warrantyMonths !== undefined ? req.body.warrantyMonths : existingWarranty.warrantyMonths

    if (purchaseDate && typeof warrantyMonths === 'number') {
        const expiry = new Date(purchaseDate)
        expiry.setMonth(expiry.getMonth() + warrantyMonths)
        req.body.warrantyExpiryDate = expiry
    }

    // Prevent overriding user ownership
    delete req.body.user

    if (req.body.notifications && !req.body.notificationChannels) {
        req.body.notificationChannels = req.body.notifications
    }

    if (req.body.reminderDaysBefore && typeof req.body.reminderDaysBefore === 'string') {
        try {
            req.body.reminderDaysBefore = JSON.parse(req.body.reminderDaysBefore)
        } catch {
            req.body.reminderDaysBefore = req.body.reminderDaysBefore.split(',').map(Number)
        }
    }

    const updatedWarranty = await Product.findOneAndUpdate(
        { _id: id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedWarranty, "Warranty updated successfully")
    )
})