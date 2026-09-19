# 3. Backend REST API Reference (`3_api_reference.md`)

> **Note for Future Self**: This document is the comprehensive API contract for the backend. It details every endpoint, request/response payload, authentication requirements, and the specific design choices behind each route.

---

## 1. Global Standards & Conventions

### Base URL
```
http://localhost:5000/api
```

### Standard Success Response Envelope (`ApiResponse`)
All successful controller responses follow this uniform JSON structure:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful",
  "success": true
}
```

### Standard Error Response Envelope (`ApiError`)
All errors intercepted by [`errorHandler.js`](file:///c:/receipt-collector/backend/src/middlewares/errorHandler.js) follow this format:
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": [],
  "success": false
}
```

### Authentication Header & Cookies
- **Protected routes** require either an `accessToken` HTTP-only cookie OR an `Authorization: Bearer <token>` header.
- The [`verifyJWT`](file:///c:/receipt-collector/backend/src/middlewares/auth.middleware.js) middleware decodes the token, fetches the user record (excluding password), and attaches it to `req.user`.

---

## 2. Authentication APIs (`/api/auth`)

---

### `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new user with email and password.
- **Request Body**:
  ```json
  {
    "name": "Alex Doe",
    "email": "alex@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "statusCode": 201,
    "data": {
      "user": {
        "_id": "66e4a1b2c3d4e5f6a7b8c9d0",
        "name": "Alex Doe",
        "email": "alex@example.com",
        "avatar": "",
        "preferences": {
          "emailNotifications": true,
          "reminderDaysBefore": [30, 7, 1]
        },
        "createdAt": "2026-09-19T10:00:00.000Z",
        "updatedAt": "2026-09-19T10:00:00.000Z"
      }
    },
    "message": "User registered successfully",
    "success": true
  }
  ```
- **Cookies Set**: `accessToken` (15m), `refreshToken` (7d).
- **Design Note**: Tokens are strictly sent via HTTP-only cookies and excluded from the JSON response body to prevent client-side JavaScript exposure (mitigates XSS token extraction).

---

### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates existing user with email and password.
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response** (`200 OK`): Returns sanitized user profile and sets updated `accessToken` and `refreshToken` cookies.

---

### `POST /api/auth/logout`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Logs out the authenticated user.
- **Request Body**: None
- **Response** (`200 OK`):
  ```json
  {
    "statusCode": 200,
    "data": {},
    "message": "User logged out successfully",
    "success": true
  }
  ```
- **Working Mechanism**: Clears `user.refreshToken` in MongoDB and clears both `accessToken` and `refreshToken` cookies with matching `cookieOptions`.

---

### `GET /api/auth/me`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Returns the authenticated user's profile based on the current session token.
- **Response** (`200 OK`): Returns `req.user`.

---

### `POST /api/auth/refresh-token`
- **Access**: Public (Requires incoming `refreshToken` cookie or body)
- **Description**: Validates incoming refresh token, checks it against the stored value in MongoDB, rotates tokens, and issues fresh `accessToken` and `refreshToken`.
- **Design Note**: **Refresh Token Rotation** guarantees that old refresh tokens become immediately invalid. If a token is compromised and used after rotation, the DB mismatch rejects the request.

---

## 3. Google OAuth 2.0 APIs (`/api/auth`)

---

### `GET /api/auth/google`
- **Access**: Public
- **Description**: Initiates Google OAuth 2.0 login by redirecting the user to Google's consent screen.
- **Query Parameters**: None
- **Working Mechanism**: Generates a consent URL with `scope: ['openid', 'email', 'profile']`, `access_type: 'online'`, `prompt: 'select_account'`, and redirects the browser.

---

### `GET /api/auth/google/callback`
- **Access**: Public (Callback destination from Google)
- **Description**: Exchanges Google authorization code for tokens, verifies Google ID token, auto-links or creates the user in MongoDB, sets JWT cookies, and redirects to frontend `/dashboard`.
- **Query Parameters**:
  - `code` (string): Authorization code from Google.
  - `error` (string, optional): Access denial or cancellation flag from Google.
- **Design Note**:
  - If `error` is returned (e.g., user cancelled prompt), it cleanly redirects to `${FRONTEND_URL}/login?error=access_denied`.
  - Auto-links Google accounts to existing email/password accounts if the email matches.

---

### `GET /api/auth/google/drive/connect`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Initiates the separate Google Drive storage authorization flow by redirecting the authenticated user to Google's consent screen.
- **Query Parameters**: None
- **Working Mechanism**: Generates an authorization URL with:
  - `scope: ['https://www.googleapis.com/auth/drive.file']` (only files the app creates)
  - `access_type: 'offline'` (requests refresh token)
  - `prompt: 'consent'` (forces Google to return a refresh token even on repeat authorizations)
  - `redirect_uri: process.env.GOOGLE_DRIVE_REDIRECT_URI`
  - `state: req.user._id` (binds the OAuth state to the authenticated user ID)

---

### `GET /api/auth/google/drive/callback`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Handles the redirect from Google after the user grants Drive permissions, exchanges the code for tokens, encrypts the `refresh_token` using AES-256-GCM, stores it on the user document in MongoDB, sets `driveConnected: true`, and redirects to frontend `${FRONTEND_URL}/dashboard?driveConnected=true`.
- **Query Parameters**:
  - `code` (string): Authorization code from Google.
  - `error` (string, optional): Access denial or cancellation flag from Google (redirects to `${FRONTEND_URL}/dashboard?driveError=...`).
- **Security Design Note**:
  - Protected by `verifyJWT` because Drive connection can only be linked to an already-logged-in user account.
  - The Drive `refresh_token` is never saved in plaintext; it is encrypted with [`crypto.js`](file:///c:/receipt-collector/backend/src/utils/crypto.js) before calling `user.save()`.

---

## 4. Warranty & Product Vault APIs (`/api/warranties`)

> **Security Rule**: All warranty endpoints are protected by `verifyJWT` at the router level (`router.use(verifyJWT)`). Every query is strictly isolated to `req.user._id`.

---

### `POST /api/warranties`
- **Access**: Private (Requires `verifyJWT`)
- **Content-Type**: `multipart/form-data` OR `application/json`
- **Description**: Creates a new product/warranty entry in the vault, with optional invoice/receipt file upload streamed directly to the user's personal Google Drive.
- **Form Fields**:
  - `productName` (string, required): Name of the item
  - `purchaseDate` (date string `YYYY-MM-DD`, required): Date of purchase
  - `warrantyMonths` (number, required): Coverage period in months
  - `category` (string, optional): E.g., 'Electronics', 'Appliances'
  - `brand` (string, optional): Manufacturer brand
  - `modelNumber` (string, optional): Product model
  - `serialNumber` (string, optional): Serial or IMEI
  - `price` (number, optional): Purchase amount
  - `currency` (string, optional): Default 'USD'
  - `retailer` (string, optional): Store / seller name
  - `notes` (string, optional): Miscellaneous coverage notes
  - `invoice` (file binary, **OPTIONAL**): Receipt/invoice image (JPEG, PNG, WEBP, HEIC) or PDF (max 10MB)
- **Response** (`201 Created`):
  ```json
  {
    "statusCode": 201,
    "data": {
      "_id": "66e4b2c3d4e5f6a7b8c9d011",
      "user": "66e4a1b2c3d4e5f6a7b8c9d0",
      "productName": "Sony WH-1000XM5 Headphones",
      "category": "Electronics",
      "brand": "Sony",
      "purchaseDate": "2026-01-15T00:00:00.000Z",
      "warrantyMonths": 24,
      "warrantyExpiryDate": "2028-01-15T00:00:00.000Z",
      "driveFileId": "1a2b3c4d5e6f7g8h9i0j",
      "driveFileUrl": "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view",
      "createdAt": "2026-09-19T10:05:00.000Z"
    },
    "message": "Warranty created successfully with receipt",
    "success": true
  }
  ```
- **Atomic Drive Upload & Rollback Design**:
  - If `req.file` is provided:
    1. Verifies `user.driveConnected === true`. If false, rejects with `400 "Connect Google Drive before uploading a document"`.
    2. Uploads the file buffer to Google Drive **FIRST**.
    3. Writes the document to MongoDB. If the DB write fails, it executes an automatic rollback (`deleteFileFromDrive()`) to prevent orphaned files in the user's Drive.
  - If `req.file` is not provided: Standard manual entry without Google Drive involvement.


---

### `GET /api/warranties`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Retrieves all warranty records owned by the authenticated user (`Product.find({ user: req.user._id })`).
- **Response** (`200 OK`): Array of warranty objects.

---

### `GET /api/warranties/:id`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Fetches a single warranty record by ID. Returns `404 Not Found` if the record does not exist or belongs to another user.

---

### `PUT /api/warranties/:id`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Updates an existing warranty item. If `purchaseDate` or `warrantyMonths` are modified, `warrantyExpiryDate` is recalculated before saving. Strips `req.body.user` to prevent unauthorized ownership transfer.

---

### `DELETE /api/warranties/:id`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Deletes a single warranty record owned by the authenticated user (`Product.findOneAndDelete({ _id: id, user: req.user._id })`).

---

### `DELETE /api/warranties`
- **Access**: Private (Requires `verifyJWT`)
- **Description**: Deletes all warranty records belonging to the authenticated user (`Product.deleteMany({ user: req.user._id })`).

---

## 5. Health Check API (`/api/health`)

---

### `GET /api/health`
- **Access**: Public
- **Description**: Verifies that the Express server is running and responsive.
- **Response** (`200 OK`):
  ```json
  {
    "statusCode": 200,
    "data": {
      "status": "active",
      "uptime": 128.45,
      "timestamp": "2026-09-19T10:10:00.000Z"
    },
    "message": "Server is healthy",
    "success": true
  }
  ```
