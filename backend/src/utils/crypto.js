import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 12 bytes recommended for AES-GCM

/**
 * Retrieves and validates the 32-byte encryption key from environment variables
 * @returns {Buffer}
 */
const getEncryptionKey = () => {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
        throw new Error("ENCRYPTION_KEY is missing in environment variables")
    }

    const keyBuffer = Buffer.from(key, 'hex')
    if (keyBuffer.length !== 32) {
        throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)")
    }

    return keyBuffer
}

/**
 * Encrypts plaintext string using AES-256-GCM
 * @param {string} text - Plaintext to encrypt
 * @returns {string} Serialized string in format "iv:authTag:encryptedData" (hex)
 */
export const encrypt = (text) => {
    if (!text) return text

    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypts AES-256-GCM serialized string
 * @param {string} encryptedText - Encrypted string in format "iv:authTag:encryptedData"
 * @returns {string} Plaintext decrypted string
 */
export const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText

    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
        throw new Error("Invalid encrypted text format. Expected 'iv:authTag:encryptedData'")
    }

    const [ivHex, authTagHex, encryptedData] = parts
    const key = getEncryptionKey()
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
