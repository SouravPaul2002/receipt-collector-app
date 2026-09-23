import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

/**
 * Helper function to generate Access and Refresh tokens for a user
 */
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

/**
 * Cookie options for secure token storage
 */
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields (name, email, password) are required")
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists")
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    // accessToken,
                    // refreshToken
                },
                "User registered successfully"
            )
        )
})

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    // accessToken,
                    // refreshToken
                },
                "User logged in successfully"
            )
        )
})

/**
 * @desc    Logout logged in user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        { new: true }
    )

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

/**
 * @desc    Refresh Access Token using valid Refresh Token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: Refresh token missing")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid")
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

/**
 * @desc    Update current logged in user profile
 * @route   PATCH /api/auth/profile
 * @access  Private (Protected by verifyJWT)
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar, preferences, notificationChannels, reminderDaysBefore } = req.body

    const updateFields = {}

    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new ApiError(400, "Name cannot be empty")
        }
        updateFields.name = name.trim()
    }

    if (avatar !== undefined) {
        updateFields.avatar = avatar
    }

    // Handle nested preferences
    if (preferences && typeof preferences === 'object') {
        if (preferences.notificationChannels && typeof preferences.notificationChannels === 'object') {
            updateFields['preferences.notificationChannels'] = preferences.notificationChannels
        }
        if (Array.isArray(preferences.reminderDaysBefore)) {
            updateFields['preferences.reminderDaysBefore'] = preferences.reminderDaysBefore.map(Number)
        }
    }

    // Direct preferences aliases if passed at root level
    if (notificationChannels && typeof notificationChannels === 'object') {
        updateFields['preferences.notificationChannels'] = notificationChannels
    }

    if (Array.isArray(reminderDaysBefore)) {
        updateFields['preferences.reminderDaysBefore'] = reminderDaysBefore.map(Number)
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided for update")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).select("-password -refreshToken -googleDriveRefreshToken")

    if (!updatedUser) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    )
})

/**
 * @desc    Disconnect Google Drive integration
 * @route   POST /api/auth/drive/disconnect
 * @access  Private (Protected by verifyJWT)
 */
export const disconnectDrive = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { driveConnected: false },
            $unset: { googleDriveRefreshToken: 1 }
        },
        { new: true }
    ).select("-password -refreshToken -googleDriveRefreshToken")

    if (!updatedUser) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Google Drive disconnected successfully")
    )
})


