import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Product from '../models/product.model.js'

/**
 * @desc    Create a new warranty / product entry
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
        driveFileId,
        driveFileUrl,
        notes
    } = req.body

    // Validation for mandatory fields
    if (!productName || !purchaseDate || warrantyMonths === undefined) {
        throw new ApiError(400, "productName, purchaseDate, and warrantyMonths are required")
    }

    // Create new warranty/product document in MongoDB bound to req.user._id
    const warranty = await Product.create({
        user: req.user._id,
        productName,
        category,
        brand,
        modelNumber,
        serialNumber,
        purchaseDate: new Date(purchaseDate),
        price,
        currency,
        retailer,
        warrantyMonths,
        driveFileId,
        driveFileUrl,
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