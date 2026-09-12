import asyncHandler from '../utils/asyncHandler.js'
import ApiResponse from '../utils/ApiResponse.js'

/**
 * @desc    Check server health status
 * @route   GET /api/health
 * @access  Public
 */
export const checkHealth = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, {
            status: "online",
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }, "Server is healthy and running")
    )
})
