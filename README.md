# Receipt Collector — Warranty & Receipt Vault

A full-stack web application to securely back up purchase receipts directly into your personal Google Drive and receive automated multi-channel warranty expiration reminders.

## Features
- **BYOS (Bring Your Own Storage)**: Receipt and invoice documents upload directly into your personal Google Drive Vault.
- **Automated Expiry Reminders**: Configurable notification intervals (30 days, 7 days, 1 day before expiry) via Email and in-app Notification Center.
- **Warranty Dashboard**: Search, filter, category tabs, and real-time expiration countdowns.
- **Detailed Warranty Vault**: Specifications, serial identifiers, store details, and direct Drive viewers.

## Architecture
- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS v4, TypeScript, Lucide Icons, Sonner.
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), Google OAuth 2.0 & Drive APIs, AES-256-GCM encryption.
