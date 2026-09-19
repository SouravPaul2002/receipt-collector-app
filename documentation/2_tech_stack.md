# 2. Technology Stack & Architectural Decision Records (`2_tech_stack.md`)

> **Note for Future Self**: This document records every technology chosen in the project, the alternatives that were considered, the reasoning behind each choice, and the conscious trade-offs accepted. Read this to understand why the system is built the way it is.

---

## 1. Tech Stack Matrix

| Layer | Technology | Primary Alternative Considered | Why Chosen |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14+ (React)** | Vite + React SPA | Server-side rendering, App Router, built-in routing, and rapid UI development. |
| **Backend Framework** | **Express.js (Node.js ESM)** | FastAPI (Python) | High ecosystem maturity, full JavaScript stack consistency, and active learning fluency. |
| **Database** | **MongoDB Atlas (Mongoose)** | PostgreSQL (SQL) | Schema flexibility across diverse consumer product categories; JSON-native document model. |
| **Document Storage** | **Google Drive (BYOS)** | AWS S3 / Cloudinary | Zero platform storage fees, maximum user trust, and simplified document sovereignty. |
| **Authentication** | **JWT + Google OAuth 2.0** | Server-Side Sessions (Redis) | Stateless API scaling, secure token rotation, and 1-click Google sign-in. |
| **Google SDK** | **`googleapis`** | Passport.js (`passport-google-oauth20`) | Single unified SDK for both OAuth authentication and future Google Drive file API operations. |
| **OCR Pipeline** *(Planned)* | **AWS Textract / Google Vision** | Tesseract.js (Client-side) | Higher accuracy on distorted receipts, structured key-value extraction, and server reliability. |
| **Notification Engine** *(Planned)* | **Node-Cron + SES / SendGrid** | Redis BullMQ / Celery | Lightweight scheduling without requiring dedicated Redis infrastructure in MVP. |

---

## 2. Key Architectural Decisions (Deep-Dive)

---

### Decision 1: Google Drive "Bring Your Own Storage" (BYOS) vs. Dedicated S3 Bucket

#### The Decision
Receipt Collector does **not** store receipt images/PDFs on a centralized company S3 bucket. Instead, documents are uploaded directly into the **user's own Google Drive** using the Google Drive REST API.

#### Why We Made This Decision
1. **Zero Storage Cost Overhead**: High-resolution receipts and multi-page PDFs consume substantial storage and bandwidth. By having files saved in the user's Drive, storage costs are zero for the platform.
2. **The Trust Factor**: Users are hesitant to upload personal financial receipts, credit card slips, and invoices to an unknown third-party server. Saving files in their personal Google Drive gives them 100% data ownership.
3. **No Lock-In**: If a user stops using Receipt Collector, all their organized receipts remain in their Google Drive folder.

#### Scope Choice: Why `drive.file` instead of full `drive` scope
- **`https://www.googleapis.com/auth/drive.file`**: Grants access **only** to files and folders created or opened by Receipt Collector. It **cannot** read, list, or modify any existing private documents in the user's Drive.
- **Why This Matters**:
  - The Google consent screen displays a clear, non-intimidating prompt ("Create and edit files that this app creates").
  - It completely avoids Google's costly and lengthy **CASA (Cloud Application Security Assessment)** manual security audit required for broader restricted Drive scopes.

#### Token Security: AES-256-GCM Encryption in DB (`utils/crypto.js`)
Google Drive refresh tokens grant persistent authorization to upload and manage documents inside the user's Google Drive. Storing these tokens in plaintext in MongoDB is an unacceptable vulnerability in case of database leaks or backups being intercepted.

##### Why Two-Way Encryption (AES-256-GCM) instead of One-Way Hashing (`bcrypt`)?
- **Passwords use one-way hashing (`bcrypt`)**: The server only needs to verify if an incoming password matches the stored hash (`bcrypt.compare`). The server **never** needs to recover the original plaintext password.
- **Google Drive tokens require two-way encryption (`crypto.js`)**: To upload receipts to Google Drive on the user's behalf, the backend **must be able to decrypt the token back to its original plain text** so it can pass it to Google's OAuth API.

```
       Plain Text Token ──► [ encrypt() ] ──► Encrypted String (Saved in MongoDB)
                                                    │
                                                    ▼
(When uploading file) ──► [ decrypt() ] ◄── Read from MongoDB
                               │
                               ▼
                        Plain Text Token ──► Sent to Google Drive API
```

##### Why AES-256-GCM Specifically?
1. **AES-256 (256-bit Key)**: Military-grade symmetric encryption using a 32-byte hexadecimal secret key (`ENCRYPTION_KEY` in `.env`).
2. **GCM Mode (Authenticated Encryption / AEAD)**: Unlike legacy modes like CBC or ECB, GCM provides **both confidentiality (secrecy) and integrity (tamper detection)**.
3. **Authentication Tag (`authTag`)**: GCM produces a 16-byte cryptographic signature. If an attacker or malicious script tampers with even a single bit of the ciphertext in MongoDB, `decipher.setAuthTag()` detects the discrepancy and throws an error immediately, preventing padding oracle attacks and bit-flipping manipulation.
4. **Unique Random IV per Encryption**: Every call to `encrypt()` generates a fresh 12-byte random **Initialization Vector (IV)** (`crypto.randomBytes(12)`). Encrypting the same token twice produces completely different ciphertexts, preventing pattern recognition.

##### Serialized Format & Step-by-Step Mechanics
The encrypted token is serialized as a colon-separated string:
$$\text{iv} : \text{authTag} : \text{encryptedData}$$
*(Example: `23f2ca... : 62a196... : 1b270d...`)*

- **`encrypt(text)`**: Generates 12-byte IV $\rightarrow$ Encrypts payload with `aes-256-gcm` $\rightarrow$ Extracts 16-byte Auth Tag $\rightarrow$ Returns `iv:authTag:encryptedData`.
- **`decrypt(encryptedText)`**: Splits `encryptedText` by `:` $\rightarrow$ Attaches Auth Tag to decipher $\rightarrow$ Reconstructs plaintext. If the key or ciphertext was modified, decryption fails securely.

#### Offline Access & Google Cloud Status Gotcha
- While an app is in **"Testing"** status in the Google Cloud Console, OAuth refresh tokens expire after **7 days**, regardless of activity.
- Before public release, the OAuth consent screen must be published to **"In Production"** so refresh tokens remain valid indefinitely until revoked.

---

### Decision 2: Two Separate Google OAuth Flows (Login vs. Drive Connect)

#### The Decision
Google OAuth is strictly split into **two distinct flows**:
1. **Login Flow (`/api/auth/google`)**:
   - Scope: `['openid', 'email', 'profile']`
   - Access Type: `'online'` (no refresh token required; used purely for authentication and profile data).
2. **Drive-Connect Flow (`/api/auth/google/drive/connect`)** *(Step 2)*:
   - Scope: `['https://www.googleapis.com/auth/drive.file']`
   - Access Type: `'offline'`, `prompt: 'consent'` (forces Google to issue a long-lived refresh token).
   - Triggered **only** when the user attempts their first receipt upload or manually connects Drive in Settings.

#### Why Split Instead of One Combined Flow?
- **Reduces Signup Friction**: Asking for Google Drive permissions during initial account registration scares away new users who just want to try the app.
- **Separation of Concerns**: Authentication identity should never be tightly coupled to storage permissions. If a user only wants to use manual warranty entry without Drive storage, they can do so freely.

---

### Decision 3: Express.js (Node.js ESM) vs. FastAPI (Python)

#### The Decision
We chose Express.js with ES Modules (`"type": "module"`) over Python FastAPI.

#### Why We Made This Decision
- **Developer Velocity & Fluency**: Focuses on mastery of Node.js / Express backend patterns without switching languages between frontend (JavaScript) and backend.
- **How Machine Learning Fits Later**: If ML-based recommendations or warranty analysis are introduced in V2, ML does **not** need to run inside the Express monolith. It will be built as an independent Python microservice that Express communicates with over private HTTP endpoints.

---

### Decision 4: MongoDB (Mongoose) vs. Relational SQL (PostgreSQL)

#### The Decision
We chose MongoDB Atlas with Mongoose ODM.

#### Why We Made This Decision
- **Varying Schema Shapes**: Product warranty data varies greatly across categories:
  - *Electronics*: Model number, IMEI, serial number, battery warranty vs. device warranty.
  - *Appliances*: Installation date, compressor warranty, service contact.
  - *Furniture / Tools*: Lifetime frame warranty, proof of purchase receipt.
- A flexible document model accommodates category-specific JSON fields naturally without requiring dozens of sparse SQL columns or complex polymorphic join tables.

#### Accepted Trade-offs
- MongoDB transactions and joins (`$lookup`) are more complex than native SQL relational joins.
- **Mitigation**: Data models are carefully structured with embedded metadata where appropriate (e.g., `preferences`, `ocrData`) and clean references for relations (`user` $\rightarrow$ `products` $\rightarrow$ `reminders`).

---

### Decision 5: JWT Access + Refresh Token Rotation & HTTP-Only Cookies vs. Sessions

#### The Decision
We implemented a dual-token JWT architecture stored strictly in **HTTP-Only, SameSite cookies**.

#### How It Works
```
Client Request ──► [AccessToken (15m)] valid? ──► Execute Controller
                         │ (Expired)
                         ▼
                   POST /api/auth/refresh-token
                         │
        [RefreshToken (7d)] matches DB? ──► Rotate Tokens in DB & Cookies
```

#### Why We Made This Decision
1. **Short-Lived Access Token (~15 mins)**: Cannot be revoked individually, so keeping its lifespan short limits the window of exposure if intercepted.
2. **Long-Lived Refresh Token (7 days) with DB Rotation**: Stored in the database (`user.refreshToken`). Every time a new access token is requested, the refresh token is rotated (old one invalidated). If a leaked refresh token is reused, the mismatch alerts the system.
3. **HTTP-Only Cookies (No Tokens in JSON Body)**: Storing tokens in `localStorage` or returning them in API JSON bodies exposes them to **XSS (Cross-Site Scripting)** attacks. HTTP-Only cookies are inaccessible to browser JavaScript.

---

### Decision 6: Decoupling Reminders & ML from Google Drive Tokens

1. **Reminders Are Independent of OAuth**:
   - Scheduled expiration reminder emails do **not** touch Google Drive. They read `warrantyExpiryDate` and `user.email` from MongoDB and dispatch via an independent transactional email service (SES/SendGrid). A revoked Google Drive token will never prevent a user from receiving their expiry reminder.
2. **ML & OCR Do Not Re-Fetch From Drive**:
   - When a receipt is uploaded, OCR extraction runs **immediately** in memory. The structured result is saved directly into `product.ocrData` in MongoDB.
   - Future ML features read from the local `ocrData` field, avoiding slow Google Drive API network calls.
