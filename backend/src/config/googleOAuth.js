import { google } from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
    // redirect_uri passed per-call instead, since we use two different ones
)
