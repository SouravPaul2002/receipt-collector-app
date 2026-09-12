# Project Files Registry & Working Documentation (`working.md`)

This document serves as the master registry explaining the **purpose**, **necessity**, and **working mechanism** of every file in the Receipt Collector project. It is continuously updated as new files are added or existing files are modified.

---

## 1. Project Root Documentation & Configuration

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`goal.md`](file:///c:/receipt-collector/goal.md) | Outlines the core product goals, feature roadmap, target audience, and architecture rationale. | Defines the product vision (Warranty Vault, Google Drive integration, OCR, Reminders) and explains key technology trade-offs. |
| [`planning.md`](file:///c:/receipt-collector/planning.md) | Stores tech stack selections, step-by-step build order, and architectural decisions. | Acts as the implementation blueprint specifying step 1 (Auth + CRUD), step 2 (Drive Integration), step 3 (Reminders), etc. |
| [`folder_structure.md`](file:///c:/receipt-collector/folder_structure.md) | Maps out the directory and file tree of the backend and frontend. | Provides a high-level visual representation of how files are organized in the codebase. |
| [`working.md`](file:///c:/receipt-collector/working.md) | **(This file)** Master registry of every file's function, necessity, and operational details. | Serves as living documentation for developers and AI agents to quickly understand what every file does and why it exists. |
| [`build_log.md`](file:///c:/receipt-collector/build_log.md) | Logs historical build tasks, completed steps, and execution milestones. | Tracks project setup progress over time. |
| [`.gitignore`](file:///c:/receipt-collector/.gitignore) | Prevents sensitive or build-generated files (e.g. `node_modules/`, `.env`) from being committed to Git. | Specifies glob patterns ignored by Git version control. |

---

## 2. Backend Infrastructure (`/backend`)

### Root Backend Files

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/index.js`](file:///c:/receipt-collector/backend/index.js) | Server entry point for Express backend application. | Initializes Express app, configures CORS, JSON/urlencoded body parsers, cookie parser, mounts API routes under `/api`, attaches global 404 & error handlers, and connects to MongoDB before starting the HTTP server on port 5000. |
| [`backend/package.json`](file:///c:/receipt-collector/backend/package.json) | Manages Node.js project metadata, dependencies, scripts, and module settings. | Configured with `"type": "module"` (ESM), includes dependencies (`express`, `mongoose`, `dotenv`, `cors`, `cookie-parser`, `googleapis`), and defines dev script (`nodemon index.js`). |
| [`backend/.env`](file:///c:/receipt-collector/backend/.env) | Holds private environment variables (DB credentials, server port, secret keys). | Loaded into `process.env` at app start via `dotenv.config()`. Contains `PORT` and `DATABASE_URI`. |
| [`backend/database/db_config.js`](file:///c:/receipt-collector/backend/database/db_config.js) | *(Legacy)* Initial database connection file. | Replaced by `src/config/db.js` in the refactored architecture. |

### Configuration (`/backend/src/config`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/config/db.js`](file:///c:/receipt-collector/backend/src/config/db.js) | Manages database connection to MongoDB using Mongoose. | Exports `connectDB()` async function that connects to `process.env.DATABASE_URI` and logs connection status or terminates process on failure. |

### Models (`/backend/src/models`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/models/user.model.js`](file:///c:/receipt-collector/backend/src/models/user.model.js) | Mongoose schema and model for application users. | Defines user fields (`googleId`, `email`, `name`, `avatar`, `refreshToken`, `driveFolderId`, `preferences`) with unique constraints and indexing. |
| [`backend/src/models/product.model.js`](file:///c:/receipt-collector/backend/src/models/product.model.js) | Mongoose schema and model for products and warranties. | Stores product metadata (`productName`, `category`, `brand`, `purchaseDate`, `warrantyMonths`, `warrantyExpiryDate`, `driveFileId`, `ocrData`). Features a synchronous pre-validation hook auto-calculating `warrantyExpiryDate` from purchase date + warranty duration. |
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

### Middlewares (`/backend/src/middlewares`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/middlewares/errorHandler.js`](file:///c:/receipt-collector/backend/src/middlewares/errorHandler.js) | Centralized global error handling middleware for Express. | Intercepts all errors passed via `next(err)`. Normalizes non-ApiError instances into `ApiError` format and sends a uniform JSON response to the client. |

### Controllers (`/backend/src/controllers`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/controllers/health.controller.js`](file:///c:/receipt-collector/backend/src/controllers/health.controller.js) | Request handler for system health and status checks. | Exports `checkHealth` controller wrapped with `asyncHandler`, returning server uptime, current timestamp, and operational status in `ApiResponse` format. |
| [`backend/src/controllers/warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js) | Request handler for creating and managing product warranty records. | Exports `createWarranty` controller function wrapped with `asyncHandler`. Validates required inputs (`productName`, `purchaseDate`, `warrantyMonths`), creates new `Product` document in MongoDB Atlas, and returns standardized `ApiResponse(201, product)`. |

### Routes (`/backend/src/routes`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/routes/health.routes.js`](file:///c:/receipt-collector/backend/src/routes/health.routes.js) | Router definition for server health check endpoints. | Defines `GET /` route mapped to `checkHealth` controller. |
| [`backend/src/routes/warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js) | Router definition for warranty API endpoints. | Maps `POST /` to the `createWarranty` controller. |
| [`backend/src/routes/index.js`](file:///c:/receipt-collector/backend/src/routes/index.js) | Main Express router aggregator for all API endpoints under `/api`. | Imports and mounts individual feature routers (`/health`, `/warranties`). |

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
