import { oauth2Client } from "../config/googleOAuth.js"
import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}

/**
 * @desc    Redirect to Google OAuth 2.0 Consent Screen for Login
 * @route   GET /api/auth/google
 * @access  Public
 */
export const googleLoginRedirect = (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'online', // no refresh token needed for login-only
        scope: ['openid', 'email', 'profile'],
        redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI,
        prompt: "select_account"
    })
    res.redirect(url)
}

/**
 * @desc    Google OAuth 2.0 Login Callback Handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleLoginCallback = asyncHandler(async (req, res) => {
    const { code, error } = req.query

    // Handle user cancellation or access denied
    if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
        throw new ApiError(400, "Missing authorization code")
    }

    const { tokens } = await oauth2Client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI
    })

    const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload() // { sub, email, name, picture }

    let user = await User.findOne({ googleId: payload.sub })

    if (!user) {
        user = await User.findOne({ email: payload.email.toLowerCase() })
        if (user) {
            // auto-link existing email/password account
            user.googleId = payload.sub
            if (!user.avatar) user.avatar = payload.picture
            await user.save({ validateBeforeSave: false })
        } else {
            user = await User.create({
                googleId: payload.sub,
                email: payload.email.toLowerCase(),
                name: payload.name,
                avatar: payload.picture
            })
        }
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .redirect(`${process.env.FRONTEND_URL}/dashboard`)
})
