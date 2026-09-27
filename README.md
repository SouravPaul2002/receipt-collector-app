# Receipt Collector — Warranty & Receipt Vault

A full-stack web application that lets you securely back up purchase receipts directly into your own Google Drive, track warranty expiry dates, and get automatically reminded before they run out — so you never lose a receipt or miss a claim window again.

**🔗 Live demo:** [https://receipt-collector-app.vercel.app](#)
**📹 Repo:** [github.com/SouravPaul2002/receipt-collector-app](https://github.com/SouravPaul2002/receipt-collector-app)

---

## Features

- **Google OAuth authentication** — sign in with Google, with automatic account linking if you'd previously signed up with email/password
- **BYOS document storage (Bring Your Own Storage)** — receipts and invoices upload directly into your own Google Drive, in a dedicated auto-managed folder, using a scoped `drive.file` permission (the app can only ever see files it created — never your full Drive)
- **Automated expiry reminders** — configurable intervals (30/7/1 days before expiry) delivered via email and an in-app notification center, powered by a background scheduler
- **Warranty dashboard** — search, filter, grid/list views, and real-time expiry status (Active / Expiring Soon / Expired)
- **Detailed warranty view** — full specs, serial numbers, store details, and a direct link to the receipt in Google Drive
- **Profile management** — update your name, toggle notification channels, and disconnect Google Drive access at any time

---

## Architecture

**Frontend:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Sonner · ShadCN

**Backend:** Node.js · Express · MongoDB (Mongoose) · JWT (access + refresh token rotation) · Google OAuth 2.0 & Drive API · AES-256-GCM encryption · node-cron · Nodemailer

**Deployment:** Frontend on Vercel, backend on Render, database on MongoDB Atlas

---

## Key engineering decisions

A few things worth knowing about *why* this is built the way it is, beyond the feature list:

- **Two separate OAuth flows, not one.** Login (identity) and Google Drive access are requested as two distinct consent flows, triggered at different times — login at sign-up, Drive access only when a user actually tries to upload their first receipt. This avoids forcing Drive permissions on someone just to create an account, and keeps the `drive.file` scope narrow enough to skip Google's costly manual security review entirely.
- **No document can exist without its file, and vice versa.** File uploads follow a strict order: the file is uploaded to Google Drive *first*, and only after that succeeds does the database write happen. If the database write fails for any reason, the just-uploaded file is automatically deleted from Drive — so it's structurally impossible for a warranty record to reference a receipt that doesn't actually exist.
- **Encrypted credential storage.** Google Drive refresh tokens are encrypted (AES-256-GCM) before being stored — even a full database leak wouldn't hand out standing access to users' Google Drives.
- **Silent token refresh.** Access tokens are short-lived (15 minutes) and refreshed automatically and invisibly on the frontend when they expire — users are never unexpectedly logged out mid-session.
- **A real background job, not a toy cron.** The reminder engine pre-computes individual, trackable reminder records at warranty-creation time (rather than recalculating on every run), processes them on an hourly schedule, and isolates failures per-reminder so one bad email doesn't block the rest of the batch.

---

## Getting started locally

### Prerequisites
- Node.js 18+
- A MongoDB instance (local, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- A [Google Cloud Console](https://console.cloud.google.com) project with OAuth credentials and the Drive API enabled

### 1. Clone the repo
```bash
git clone https://github.com/SouravPaul2002/receipt-collector-app.git
cd receipt-collector-app
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 4. Environment variables

**`backend/.env`**


**`frontend/.env.local`**


A full working template for both files is included in the repo as `backend/.env.example` and `frontend/.env.local.example` — copy and fill in your own values.

---

## API overview

Full endpoint reference is in [`/documentation/3_api_reference.md`](./documentation/3_api_reference.md). Quick summary:

| Resource | Routes |
|---|---|
| Auth | register, login, logout, refresh-token, current user, profile update, Google login, Google Drive connect/disconnect |
| Warranties | full CRUD, scoped per-user, with Drive file upload on create |
| Notifications | list, mark read, mark all read, delete, clear all |
| Health | uptime check |

---

## Project documentation

This repo includes a full internal documentation set under [`/documentation`](./documentation), written as a running log of design decisions, architecture, and debugging notes throughout development — useful if you want to see the actual reasoning behind the build, not just the finished code.

---

## Roadmap

- [ ] OCR-based auto-extraction from uploaded receipts
- [ ] Claim assistance (manufacturer contact info + claim checklists)
- [ ] Web push notification channel
- [ ] AI-powered product Q&A / recommendations