# 4. Chronological Build Log & Debugging Case Studies (`4_build_log.md`)

> **Note for Future Self**: This document is the living engineering log of the project. It tracks what was built, in what exact order, why decisions were made, every major gotcha/bug encountered during development, and the exact solution implemented.

---

## 1. Chronological Implementation Timeline

---

### [2026-09-12] — Project Scoping & Core Architecture Setup
- **What Was Built**:
  - Scoped product requirements: Warranty Vault, Google Drive BYOS, Expiry Reminders, and OCR document processing.
  - Finalized technology stack: Node.js/Express (ES Modules), Next.js 14+ frontend, MongoDB Atlas database.
  - Established MVC directory structure inside `backend/src/`: `config/`, `controllers/`, `middlewares/`, `models/`, `routes/`, `scripts/`, `utils/`.
  - Created reusable backend utilities: [`asyncHandler.js`](file:///c:/receipt-collector/backend/src/utils/asyncHandler.js), [`ApiError.js`](file:///c:/receipt-collector/backend/src/utils/ApiError.js), [`ApiResponse.js`](file:///c:/receipt-collector/backend/src/utils/ApiResponse.js), and centralized [`errorHandler.js`](file:///c:/receipt-collector/backend/src/middlewares/errorHandler.js).

---

### [2026-09-12] — Database Schemas & Collection Initialization
- **What Was Built**:
  - Implemented initial Mongoose models:
    - [`user.model.js`](file:///c:/receipt-collector/backend/src/models/user.model.js): User profile, Google ID, hashed password, refresh token storage, and notification preferences.
    - [`product.model.js`](file:///c:/receipt-collector/backend/src/models/product.model.js): Vault product item with auto-calculated expiry date hook.
    - [`reminder.model.js`](file:///c:/receipt-collector/backend/src/models/reminder.model.js): Scheduled notification queue tracking.
  - Created [`testDbCollections.js`](file:///c:/receipt-collector/backend/src/scripts/testDbCollections.js) to connect to MongoDB Atlas and initialize live collections (`users`, `products`, `reminders`).

---

### [2026-09-12] — Warranty Creation & Expiry Calculation Hook
- **What Was Built**:
  - Implemented `POST /api/warranties` controller in [`warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js).
  - Configured pre-validation hook on `product.model.js` to compute `warrantyExpiryDate` from `purchaseDate` and `warrantyMonths`.
  - Created [`testCreateWarranty.js`](file:///c:/receipt-collector/backend/src/scripts/testCreateWarranty.js) verifying Atlas document insertion and date arithmetic.

---

### [2026-09-13] — Full Warranty CRUD APIs & Protocol Documentation
- **What Was Built**:
  - Implemented complete warranty CRUD routes:
    - `GET /api/warranties`: Fetch all warranties.
    - `GET /api/warranties/:id`: Fetch single warranty by ID.
    - `PUT /api/warranties/:id`: Update warranty with automatic expiry date recalculation.
    - `DELETE /api/warranties/:id`: Delete single warranty.
    - `DELETE /api/warranties`: Delete all warranties.
  - Created `agent_read.md` protocol to enforce documentation updates after every future task.

---

### [2026-09-13] — JWT Authentication & Token Security Refinements
- **What Was Built**:
  - Implemented user registration (`POST /api/auth/register`), login (`POST /api/auth/login`), logout (`POST /api/auth/logout`), profile (`GET /api/auth/me`), and token renewal (`POST /api/auth/refresh-token`).
  - Added bcrypt pre-save password hashing and `isPasswordCorrect` method on `user.model.js`.
  - Implemented `verifyJWT` authentication middleware in [`auth.middleware.js`](file:///c:/receipt-collector/backend/src/middlewares/auth.middleware.js).
  - Applied `router.use(verifyJWT)` in [`warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js) and scoped all database queries strictly to `req.user._id`.

---

### [2026-09-19] — Google OAuth 2.0 Login Integration & AES-256-GCM Token Encryption
- **What Was Built**:
  - Configured Google OAuth client using `googleapis` in [`googleOAuth.js`](file:///c:/receipt-collector/backend/src/config/googleOAuth.js).
  - Implemented `GET /api/auth/google` to redirect users to Google's consent screen.
  - Implemented `GET /api/auth/google/callback` to exchange authorization codes, verify ID tokens via Google's certificate endpoints, auto-link existing email accounts, generate JWT sessions, and set HTTP-only cookies.
  - Built AES-256-GCM symmetric encryption helper in [`crypto.js`](file:///c:/receipt-collector/backend/src/utils/crypto.js) for encrypting Google Drive refresh tokens.
  - Added `googleDriveRefreshToken` and `driveConnected` fields to [`user.model.js`](file:///c:/receipt-collector/backend/src/models/user.model.js).
  - Implemented `GET /api/auth/google/drive/connect` and `GET /api/auth/google/drive/callback` for connecting Google Drive storage with `drive.file` scope and `offline` access.
  - Generated secure 32-byte `ENCRYPTION_KEY` in `.env`.
  - Mounted routes in [`index.js`](file:///c:/receipt-collector/backend/src/routes/index.js) and established comprehensive project documentation in `/documentation`.

---

### [2026-09-19] — Atomic Google Drive Upload Pipeline with Rollback (Step 2 Completed)
- **What Was Built**:
  - Implemented [`multer.middleware.js`](file:///c:/receipt-collector/backend/src/middlewares/multer.middleware.js) using memory storage, 10MB limit, and MIME validation for JPEG, PNG, WEBP, HEIC, and PDF.
  - Implemented [`googleDrive.service.js`](file:///c:/receipt-collector/backend/src/services/googleDrive.service.js) handling decrypted OAuth clients, automated "Receipt Collector Vault" folder lookup/creation, direct buffer streaming to Drive API, and rollback deletion.
  - Updated `createWarranty` in [`warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js) with strict atomic integrity: upload to Drive first, write to MongoDB, and automatically delete the Drive file if MongoDB write fails.
  - Attached `upload.single('invoice')` to `POST /api/warranties` in [`warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js).

---

## 2. Gotchas, Bugs & Lessons Learned (Case Studies)

---

### Gotcha 1: Embedded Git Repository inside `frontend/rc-frontend`
- **Symptom**: When creating the Next.js app via `create-next-app`, Git treated `frontend/rc-frontend` as a nested submodule/embedded repository rather than a normal folder in the main monorepo. Changes inside the frontend folder were not tracked properly by the root Git index.
- **Root Cause**: `create-next-app` automatically runs `git init` inside new project folders by default.
- **Fix**: Removed the nested Git directory:
  ```bash
  rm -rf frontend/rc-frontend/.git
  git rm --cached frontend/rc-frontend
  git add frontend/rc-frontend
  ```
- **Lesson**: Always verify that scaffolded sub-projects do not contain nested `.git` folders when building monorepos.

---

### Gotcha 2: Root `.gitignore` Path Matching Across Subfolders
- **Symptom**: `node_modules` inside `backend/` and `frontend/rc-frontend/` were still being staged by Git despite having `.gitignore`.
- **Root Cause**: The initial `.gitignore` used leading slashes (e.g. `/node_modules`, `/.env`), which only match files located directly at the project root directory.
- **Fix**: Replaced leading slashes with universal wildcard glob patterns:
  ```gitignore
  **/node_modules/
  **/.env
  **/.env.*
  **/.next/
  **/build/
  **/dist/
  ```
- **Lesson**: In monorepos, use `**/` wildcard prefixes so ignore rules apply uniformly regardless of directory depth.

---

### Gotcha 3: Mongoose v9 Async Pre-Hook Callback Compatibility
- **Symptom**: Running tests on `Product.create()` threw `TypeError: next is not a function` during pre-validation hooks.
- **Root Cause**: In older Mongoose (v5 and below), middleware hooks used a callback parameter `function(next) { ... next(); }`. In modern Mongoose (v6+ and v9), async/synchronous hooks do not accept `next` unless explicitly declared as a callback function.
- **Fix**: Updated the pre-validate hook to use synchronous/promise syntax without the `next` parameter:
  ```javascript
  productSchema.pre('validate', function () {
      if (this.purchaseDate && typeof this.warrantyMonths === 'number') {
          const expiry = new Date(this.purchaseDate)
          expiry.setMonth(expiry.getMonth() + this.warrantyMonths)
          this.warrantyExpiryDate = expiry
      }
  })
  ```
- **Lesson**: Do not use legacy `next` callbacks in modern Mongoose pre-hooks.

---

### Gotcha 4: Returning Tokens in Both HTTP-Only Cookies AND Response JSON
- **Symptom**: Initial `/register` and `/login` controllers set HTTP-only cookies but ALSO returned `accessToken` and `refreshToken` inside the JSON response payload.
- **Root Cause**: Convenience during initial frontend development.
- **Security Flaw**: Returning tokens in JSON completely defeats the security benefits of HTTP-only cookies. If frontend JavaScript reads or stores the tokens, malicious XSS scripts can steal them.
- **Fix**: Removed tokens from the JSON body entirely. Tokens are delivered **strictly via HTTP-only cookies**:
  ```javascript
  return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { user: loggedInUser }, "Login successful"))
  ```
- **Lesson**: Never duplicate authentication tokens into JSON response bodies if using HTTP-only cookies.

---

### Gotcha 5: Missing `sameSite` Cookie Configuration for Cross-Origin Development
- **Symptom**: Cookies set by the backend (`localhost:5000`) were not automatically sent in cross-origin requests from the frontend (`localhost:3000`), or failed when deployed.
- **Root Cause**: Default browser cookie behavior restricts cross-site cookies unless `sameSite` is explicitly configured.
- **Fix**: Configured dynamic cookie settings based on environment:
  ```javascript
  const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
  ```
- **Lesson**: In development (`localhost`), use `sameSite: 'lax'` without `secure`. In production with cross-origin domains, use `sameSite: 'none'` with `secure: true` (HTTPS).

---

### Gotcha 6: Access Token Expiry Too Long
- **Symptom**: Access token fallback was set to `'1d'` (24 hours).
- **Security Flaw**: JWT Access Tokens are stateless and cannot be revoked without maintaining a centralized token blacklist. If a token is stolen, the attacker has 24 hours of access.
- **Fix**: Reduced access token lifetime to **15 minutes** (`ACCESS_TOKEN_EXPIRY=15m`), while keeping the refresh token at **7 days** (`REFRESH_TOKEN_EXPIRY=7d`) with database-backed token rotation.
- **Lesson**: Keep access tokens short-lived and rely on silent refresh flows.

---

### Gotcha 7: Unprotected Warranty Routes & Insecure Ownership Spoofing
- **Symptom**: `createWarranty` accepted `req.body.user`, and `getAllWarranties` called `Product.find()` without filtering by user ID.
- **Security Flaw**: Any user could view, update, or delete records belonging to any other user, or create warranties assigned to arbitrary user IDs (Insecure Direct Object Reference / IDOR).
- **Fix**:
  1. Applied `router.use(verifyJWT)` to [`warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js).
  2. Overrode `req.body.user` with `req.user._id` in `createWarranty`.
  3. Scoped all queries to `{ user: req.user._id }` in `find`, `findOne`, `findOneAndUpdate`, and `findOneAndDelete`.
- **Lesson**: Never trust a user ID passed in `req.body` or `req.params`. Always derive user identity from the verified JWT session (`req.user._id`).

---

### Gotcha 8: `googleapis` Named Import & Router Redeclaration Bugs
- **Symptom**: `googleOAuth.js` threw `TypeError: googleApis is not a function`, and `googleAuth.routes.js` threw `SyntaxError: Identifier 'express' has already been declared`.
- **Root Cause**: `googleapis` in ES Modules exports `{ google }` rather than a default callable function. `googleAuth.routes.js` had `const express = express()` which redeclared the imported module name.
- **Fix**:
  - In `googleOAuth.js`: `import { google } from 'googleapis'`.
  - In `googleAuth.routes.js`: `import { Router } from 'express'; const router = Router()`.
  - Added `.js` extensions to all relative imports and added missing `asyncHandler` and `ApiError` imports in `googleAuth.controller.js`.
- **Lesson**: Always run `node --check` across modified files to catch ES Module import and syntax errors before deploying.
