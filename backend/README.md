# Receipt Collector — Backend API

Express + MongoDB REST API server with Google Drive Vault integration and automated warranty expiry reminders.

## Tech Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Auth**: JWT (Access & Refresh tokens in HTTP-only cookies) + Google OAuth 2.0
- **Storage**: Google Drive API (BYOS — Bring Your Own Storage) with AES-256-GCM token encryption
- **Reminders**: Node-cron hourly scheduler + Nodemailer email delivery

## Setup & Running
```bash
npm install
npm start
```
