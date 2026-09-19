import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Product from '../models/product.model.js'
import User from '../models/user.model.js'
import { uploadFileToDrive, deleteFileFromDrive } from '../services/googleDrive.service.js'

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
        notes
    } = req.body

    // Validation for mandatory fields
    if (!productName || !purchaseDate || warrantyMonths === undefined) {
        throw new ApiError(400, "productName, purchaseDate, and warrantyMonths are required")
    }

    let driveFileId = undefined
    let driveFileUrl = undefined

    // IF req.file exists: upload to Google Drive FIRST with DB rollback protection
    if (req.file) {
        const user = await User.findById(req.user._id)
        if (!user || !user.driveConnected || !user.googleDriveRefreshToken) {
            throw new ApiError(400, "Connect Google Drive before uploading a document")
        }

        // 1. Upload to Drive first before touching MongoDB
        const uploadedFile = await uploadFileToDrive({
            user,
            fileBuffer: req.file.buffer,
            fileName: req.file.originalname,
            mimeType: req.file.mimetype
        })

        driveFileId = uploadedFile.fileId
        driveFileUrl = uploadedFile.webViewLink

        // 2. Attempt to create Product document in MongoDB
        try {
            const warranty = await Product.create({
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
                driveFileId,
                driveFileUrl,
                notes
            })

            return res.status(201).json(
                new ApiResponse(201, warranty, "Warranty created successfully with receipt")
            )
        } catch (dbError) {
            // ROLLBACK: Delete the just-uploaded Drive file so no orphan file remains
            await deleteFileFromDrive({ user, fileId: driveFileId })
            throw dbError
        }
    }

    // IF req.file does NOT exist: manual entry without Drive upload
    const warranty = await Product.create({
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
        notes
    })

    return res.status(201).json(
        new ApiResponse(201, warranty, "Warranty created successfully")
    )
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

    const updatedWarranty = await Product.findOneAndUpdate(
        { _id: id, user: req.user._id },
        req.body,
        { new: true, runValidators: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedWarranty, "Warranty updated successfully")
    )
})