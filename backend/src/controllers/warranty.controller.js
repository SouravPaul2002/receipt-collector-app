import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import Product from '../models/product.model.js'

/**
 * @desc    Create a new warranty / product entry
 * @route   POST /api/warranties
 * @access  Public / Private (once auth middleware is added)
 */
export const createWarranty = asyncHandler(async (req, res) => {
    const {
        user,
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

    // Create new warranty/product document in MongoDB
    const warranty = await Product.create({
        user: user || req.user?._id,
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