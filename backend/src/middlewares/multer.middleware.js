import multer from 'multer'
import ApiError from '../utils/ApiError.js'

// Use in-memory buffer storage so files can be piped directly to Google Drive
const storage = multer.memoryStorage()

const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf'
]

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(
            new ApiError(
                400,
                `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, HEIC, PDF`
            ),
            false
        )
    }
}

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB file size limit
    },
    fileFilter
})
