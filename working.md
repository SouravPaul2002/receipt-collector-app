# Project Files Registry & Working Documentation (`working.md`)

This document serves as the master registry explaining the **purpose**, **necessity**, and **working mechanism** of every file in the Receipt Collector project. It is continuously updated as new files are added or existing files are modified.

---

## 1. Project Root Documentation & Configuration

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`goal.md`](file:///c:/receipt-collector/goal.md) | Outlines the core product goals, feature roadmap, target audience, and architecture rationale. | Defines the product vision (Warranty Vault, Google Drive integration, OCR, Reminders) and explains key technology trade-offs. |
| [`planning.md`](file:///c:/receipt-collector/planning.md) | Stores tech stack selections, step-by-step build order, and architectural decisions. | Acts as the implementation blueprint specifying step 1 (Auth + CRUD), step 2 (Drive Integration), step 3 (Reminders), etc. |
| [`progress.md`](file:///c:/receipt-collector/progress.md) | **Master task progress tracker** listing all completed milestones, step-by-step progress, and next immediate tasks. | Provides a breakdown of what has been built so far across backend, database, APIs, and documentation. |
| [`agent_read.md`](file:///c:/receipt-collector/agent_read.md) | **Mandatory Agent Operating Protocol** for AI pair programmers (e.g. Antigravity). | Contains mandatory pre-task review steps and post-task update checklists (`working.md`, `build_log.md`, `progress.md`, `folder_structure.md`). |
| [`folder_structure.md`](file:///c:/receipt-collector/folder_structure.md) | Maps out the directory and file tree of the backend and frontend. | Provides a high-level visual representation of how files are organized in the codebase. |
| [`working.md`](file:///c:/receipt-collector/working.md) | **(This file)** Master registry of every file's function, necessity, and operational details. | Serves as living documentation for developers and AI agents to quickly understand what every file does and why it exists. |
| [`build_log.md`](file:///c:/receipt-collector/build_log.md) | Logs historical build tasks, completed steps, and execution milestones. | Tracks project implementation progress over time. |
| [`documentation/0_goal.md`](file:///c:/receipt-collector/documentation/0_goal.md) | Comprehensive product vision, problem statement, and feature-by-feature rationale. | Explains why Receipt Collector exists, user pain points solved, core feature mechanics, and why future features are deferred. |
| [`documentation/1_folder_structure.md`](file:///c:/receipt-collector/documentation/1_folder_structure.md) | Architectural layout and folder layer responsibilities. | Explains the Monorepo structure, MVC layer separation of concerns (routes, controllers, models, middlewares, utils, services), and frontend hierarchy. |
| [`documentation/2_tech_stack.md`](file:///c:/receipt-collector/documentation/2_tech_stack.md) | Technology choices, alternatives considered, and Architectural Decision Records (ADRs). | Documents why Google Drive BYOS, `drive.file` scope, Express over FastAPI, MongoDB, JWT cookies, and `googleapis` were selected along with trade-offs. |
| [`documentation/3_api_reference.md`](file:///c:/receipt-collector/documentation/3_api_reference.md) | Complete REST API contract, request/response formats, and design decisions. | Documents every endpoint across Auth, Google Auth, Warranties, and Health with design rationale. |
| [`documentation/4_build_log.md`](file:///c:/receipt-collector/documentation/4_build_log.md) | Living chronological implementation log and debugging case studies. | Records every completed implementation step along with in-depth gotchas, root causes, and fixes. |


---

## 2. Backend Infrastructure (`/backend`)

### Root Backend Files

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/index.js`](file:///c:/receipt-collector/backend/index.js) | Server entry point for Express backend application. | Initializes Express app, configures CORS, JSON/urlencoded body parsers, cookie parser, mounts API routes under `/api`, attaches global 404 & error handlers, and connects to MongoDB before starting the HTTP server on port 5000. |
| [`backend/package.json`](file:///c:/receipt-collector/backend/package.json) | Manages Node.js project metadata, dependencies, scripts, and module settings. | Configured with `"type": "module"` (ESM), includes dependencies (`express`, `mongoose`, `dotenv`, `cors`, `cookie-parser`, `jsonwebtoken`, `bcryptjs`, `googleapis`), and defines dev script (`nodemon index.js`). |
| [`backend/.env`](file:///c:/receipt-collector/backend/.env) | Holds private environment variables (DB credentials, server port, secret keys). | Loaded into `process.env` at app start via `dotenv.config()`. Contains `PORT`, `DATABASE_URI`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`, and `CORS_ORIGIN`. |
| [`backend/database/db_config.js`](file:///c:/receipt-collector/backend/database/db_config.js) | *(Legacy)* Initial database connection file. | Replaced by `src/config/db.js` in the refactored architecture. |

### Configuration (`/backend/src/config`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/config/db.js`](file:///c:/receipt-collector/backend/src/config/db.js) | Manages database connection to MongoDB using Mongoose. | Exports `connectDB()` async function that connects to `process.env.DATABASE_URI` and logs connection status or terminates process on failure. |
| [`backend/src/config/googleOAuth.js`](file:///c:/receipt-collector/backend/src/config/googleOAuth.js) | Configures Google OAuth 2.0 client via `googleapis`. | Exports `oauth2Client` instance configured with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for handling OAuth redirects and token verification. |

### Models (`/backend/src/models`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/models/user.model.js`](file:///c:/receipt-collector/backend/src/models/user.model.js) | Mongoose schema and model for application users. | Defines user fields (`googleId`, `email`, `name`, `password`, `avatar`, `refreshToken`, `driveFolderId`, `googleDriveRefreshToken`, `driveConnected`, `preferences`). Uses `bcryptjs` pre-save hook for password hashing and provides instance methods: `isPasswordCorrect`, `generateAccessToken`, and `generateRefreshToken`. |
| [`backend/src/models/product.model.js`](file:///c:/receipt-collector/backend/src/models/product.model.js) | Mongoose schema and model for products and warranties. | Stores product metadata (`productName`, `category`, `brand`, `purchaseDate`, `warrantyMonths`, `warrantyExpiryDate`, `driveFileId`, `ocrData`). Features a pre-validation hook auto-calculating `warrantyExpiryDate` from purchase date + warranty duration. |
| [`backend/src/models/reminder.model.js`](file:///c:/receipt-collector/backend/src/models/reminder.model.js) | Mongoose schema and model for scheduled warranty reminders. | Tracks upcoming reminder notifications (`user`, `product`, `scheduledDate`, `daysBeforeExpiry`, `channel`, `status`, `sentAt`). |

### Scripts (`/backend/src/scripts`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/scripts/testDbCollections.js`](file:///c:/receipt-collector/backend/src/scripts/testDbCollections.js) | Diagnostic script to verify database connection and inspect/initialize collections in MongoDB Atlas. | Connects to MongoDB Atlas, calls `listCollections()`, triggers `.init()` on User, Product, and Reminder models to ensure collections exist, and prints current database status. |
| [`backend/src/scripts/testCreateWarranty.js`](file:///c:/receipt-collector/backend/src/scripts/testCreateWarranty.js) | Validation script for product creation and pre-validate hooks. | Tests document creation in MongoDB Atlas and verifies automatic `warrantyExpiryDate` calculation. |

### Utilities (`/backend/src/utils`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/utils/asyncHandler.js`](file:///c:/receipt-collector/backend/src/utils/asyncHandler.js) | High-order wrapper for async Express route controllers to catch errors automatically. | Wraps async controller functions in a `Promise.resolve().catch(next)` block, eliminating repetitive `try-catch` blocks across all routes. |
| [`backend/src/utils/ApiError.js`](file:///c:/receipt-collector/backend/src/utils/ApiError.js) | Custom JavaScript Error class for standardized error formatting. | Extends `Error` class with `statusCode`, `message`, `errors` array, and stack trace to ensure consistent error objects across API routes. |
| [`backend/src/utils/ApiResponse.js`](file:///c:/receipt-collector/backend/src/utils/ApiResponse.js) | Standardized response formatter for successful API calls. | Standardizes success responses with `statusCode`, `data`, `message`, and boolean `success` flag (`statusCode < 400`). |
| [`backend/src/utils/crypto.js`](file:///c:/receipt-collector/backend/src/utils/crypto.js) | AES-256-GCM symmetric encryption and decryption helper. | Exports `encrypt(text)` and `decrypt(encryptedText)` using `ENCRYPTION_KEY` from environment variables, returning serialized `iv:authTag:encryptedData` for secure storage of Google Drive refresh tokens. |

### Middlewares (`/backend/src/middlewares`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/middlewares/errorHandler.js`](file:///c:/receipt-collector/backend/src/middlewares/errorHandler.js) | Centralized global error handling middleware for Express. | Intercepts all errors passed via `next(err)`. Normalizes non-ApiError instances into `ApiError` format and sends a uniform JSON response to the client. |
| [`backend/src/middlewares/auth.middleware.js`](file:///c:/receipt-collector/backend/src/middlewares/auth.middleware.js) | JWT Token verification middleware (`verifyJWT`). | Extracts JWT Access Token from `cookies` or `Authorization: Bearer` header, verifies signature using `ACCESS_TOKEN_SECRET`, finds user in MongoDB, and attaches `req.user`. |

### Controllers (`/backend/src/controllers`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/controllers/health.controller.js`](file:///c:/receipt-collector/backend/src/controllers/health.controller.js) | Request handler for system health and status checks. | Exports `checkHealth` controller wrapped with `asyncHandler`, returning server uptime, current timestamp, and operational status in `ApiResponse` format. |
| [`backend/src/controllers/auth.controller.js`](file:///c:/receipt-collector/backend/src/controllers/auth.controller.js) | Request handler for User Authentication & Token management. | Handles `registerUser`, `loginUser`, `logoutUser`, `getCurrentUser`, and `refreshAccessToken`. Generates Access/Refresh tokens, sets HTTP-only cookies, and returns sanitized user data (tokens are excluded from the JSON response body for enhanced security). |
| [`backend/src/controllers/googleAuth.controller.js`](file:///c:/receipt-collector/backend/src/controllers/googleAuth.controller.js) | Request handler for Google OAuth 2.0 authentication flow. | Handles `googleLoginRedirect` (generates OAuth URL) and `googleLoginCallback` (exchanges code, verifies ID token, auto-links/creates user, issues JWT cookies, and redirects to frontend dashboard). |
| [`backend/src/controllers/warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js) | Request handler for full CRUD operations on product warranty records with user data isolation. | Exports `createWarranty` (`POST`), `getAllWarranties` (`GET`), `getWarrantyById` (`GET /:id`), `updateWarrantyById` (`PUT /:id`), `deleteAllWarranties` (`DELETE`), and `deleteWarrantyById` (`DELETE /:id`). All queries are scoped strictly to `req.user._id`. |

### Routes (`/backend/src/routes`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/routes/health.routes.js`](file:///c:/receipt-collector/backend/src/routes/health.routes.js) | Router definition for server health check endpoints. | Defines `GET /` route mapped to `checkHealth` controller. |
| [`backend/src/routes/auth.routes.js`](file:///c:/receipt-collector/backend/src/routes/auth.routes.js) | Router definition for authentication API endpoints. | Maps `/register`, `/login`, `/logout` (protected), `/me` (protected), and `/refresh-token` endpoints. |
| [`backend/src/routes/googleAuth.routes.js`](file:///c:/receipt-collector/backend/src/routes/googleAuth.routes.js) | Router definition for Google OAuth 2.0 endpoints. | Maps `GET /google` (redirect to Google consent) and `GET /google/callback` (OAuth callback and token exchange). |
| [`backend/src/routes/warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js) | Router definition for warranty API endpoints with JWT authentication protection. | Applies `verifyJWT` middleware across all routes (`router.use(verifyJWT)`) and maps `POST /`, `GET /`, `DELETE /`, `GET /:id`, `PUT /:id`, and `DELETE /:id` to warranty controllers. |
| [`backend/src/routes/index.js`](file:///c:/receipt-collector/backend/src/routes/index.js) | Main Express router aggregator for all API endpoints under `/api`. | Imports and mounts individual feature routers (`/health`, `/auth`, `/auth` [googleAuth], `/warranties`). |

---

## 3. Frontend Application (`/frontend/rc-frontend`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`frontend/rc-frontend/package.json`](file:///c:/receipt-collector/frontend/rc-frontend/package.json) | Frontend project dependencies and scripts for Next.js app. | Manages React, Next.js, and CSS dependencies; defines scripts (`dev`, `build`, `start`, `lint`). |
| [`frontend/rc-frontend/next.config.mjs`](file:///c:/receipt-collector/frontend/rc-frontend/next.config.mjs) | Next.js configuration options. | Customizes Next.js build settings, headers, redirects, or image optimization configs. |
| [`frontend/rc-frontend/postcss.config.mjs`](file:///c:/receipt-collector/frontend/rc-frontend/postcss.config.mjs) | PostCSS configuration file. | Configures CSS plugins (e.g. TailwindCSS or Autoprefixer). |
| [`frontend/rc-frontend/eslint.config.mjs`](file:///c:/receipt-collector/frontend/rc-frontend/eslint.config.mjs) | ESLint configuration for code quality & formatting rules. | Extends `next/core-web-vitals` rules. |
| [`frontend/rc-frontend/jsconfig.json`](file:///c:/receipt-collector/frontend/rc-frontend/jsconfig.json) | JavaScript project configuration & module path aliases. | Configures `@/*` alias pointing to `./src/*` for clean imports. |
| [`frontend/rc-frontend/src/app/layout.js`](file:///c:/receipt-collector/frontend/rc-frontend/src/app/layout.js) | Root HTML layout component for Next.js App Router. | Wraps all pages with html/body elements, fonts (Geist), global CSS, and page metadata. |
| [`frontend/rc-frontend/src/app/page.js`](file:///c:/receipt-collector/frontend/rc-frontend/src/app/page.js) | Landing page component (`/`). | Renders the primary user landing page interface. |
| [`frontend/rc-frontend/src/app/globals.css`](file:///c:/receipt-collector/frontend/rc-frontend/src/app/globals.css) | Global CSS styles & font variables. | Declares global Tailwind directives, custom CSS properties, and font definitions. |
