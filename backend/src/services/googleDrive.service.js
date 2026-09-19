import { google } from 'googleapis'
import { Readable } from 'stream'
import { decrypt } from '../utils/crypto.js'
import User from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'

const FOLDER_NAME = 'Receipt Collector Vault'

/**
 * Creates an authenticated Google Drive client instance using decrypted user refresh token
 * @param {Object} user - User document from MongoDB
 * @returns {google.drive} Authenticated Google Drive API client
 */
export const getDriveClient = (user) => {
    if (!user || !user.googleDriveRefreshToken) {
        throw new ApiError(400, "Google Drive is not connected. Please connect your Drive first.")
    }

    try {
        const decryptedRefreshToken = decrypt(user.googleDriveRefreshToken)

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_DRIVE_REDIRECT_URI
        )

        auth.setCredentials({
            refresh_token: decryptedRefreshToken
        })

        return google.drive({ version: 'v3', auth })
    } catch (err) {
        throw new ApiError(401, "Failed to authenticate with Google Drive: " + (err.message || "Invalid credentials"))
    }
}

/**
 * Retrieves existing app folder or creates a new dedicated folder in user's Google Drive
 * @param {google.drive} drive - Authenticated Drive API client
 * @param {Object} user - User document
 * @returns {Promise<string>} Folder ID
 */
export const getOrCreateAppFolder = async (drive, user) => {
    // Check if user already has a saved folder ID and if it still exists
    if (user.driveFolderId) {
        try {
            const existingFolder = await drive.files.get({
                fileId: user.driveFolderId,
                fields: 'id, trashed'
            })
            if (existingFolder.data && !existingFolder.data.trashed) {
                return user.driveFolderId
            }
        } catch (err) {
            // Folder may have been deleted by user in Drive; fall through to search/recreate
        }
    }

    // Search for existing folder created by the app in user's Drive
    const searchRes = await drive.files.list({
        q: `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive'
    })

    if (searchRes.data.files && searchRes.data.files.length > 0) {
        const folderId = searchRes.data.files[0].id
        await User.findByIdAndUpdate(user._id, { driveFolderId: folderId })
        return folderId
    }

    // Create a new dedicated folder
    const folderMetadata = {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
    }

    const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
    })

    const newFolderId = folder.data.id
    await User.findByIdAndUpdate(user._id, { driveFolderId: newFolderId })
    return newFolderId
}

/**
 * Uploads a document buffer into the user's dedicated Google Drive folder
 * @param {Object} params
 * @param {Object} params.user - User document
 * @param {Buffer} params.fileBuffer - File binary buffer from multer memoryStorage
 * @param {string} params.fileName - Original file name
 * @param {string} params.mimeType - MIME type of the file
 * @returns {Promise<{fileId: string, fileName: string, webViewLink: string, webContentLink: string}>}
 */
export const uploadFileToDrive = async ({ user, fileBuffer, fileName, mimeType }) => {
    const drive = getDriveClient(user)
    const folderId = await getOrCreateAppFolder(drive, user)

    const fileMetadata = {
        name: fileName || `receipt_${Date.now()}`,
        parents: [folderId]
    }

    const media = {
        mimeType,
        body: Readable.from(fileBuffer)
    }

    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: 'id, name, webViewLink, webContentLink'
        })

        return {
            fileId: response.data.id,
            fileName: response.data.name,
            webViewLink: response.data.webViewLink,
            webContentLink: response.data.webContentLink
        }
    } catch (err) {
        throw new ApiError(500, "Google Drive upload failed: " + (err.message || "Unknown error"))
    }
}

/**
 * Deletes a file from Google Drive (used for rollback if MongoDB write fails)
 * @param {Object} params
 * @param {Object} params.user - User document
 * @param {string} params.fileId - Google Drive file ID
 * @returns {Promise<boolean>}
 */
export const deleteFileFromDrive = async ({ user, fileId }) => {
    if (!fileId) return false

    try {
        const drive = getDriveClient(user)
        await drive.files.delete({ fileId })
        return true
    } catch (err) {
        console.error(`[Drive Rollback Error] Failed to delete orphaned file ${fileId}:`, err.message)
        return false
    }
}
