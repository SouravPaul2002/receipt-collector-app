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
| [`backend/src/middlewares/multer.middleware.js`](file:///c:/receipt-collector/backend/src/middlewares/multer.middleware.js) | In-memory multipart/form-data upload middleware using `multer`. | Uses `multer.memoryStorage()`, enforces 10MB limit, filters for images (JPEG, PNG, WEBP, HEIC) and PDF files, and attaches `req.file` for streaming directly to Google Drive. |

### Services (`/backend/src/services`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/services/googleDrive.service.js`](file:///c:/receipt-collector/backend/src/services/googleDrive.service.js) | Google Drive API integration for file and folder management. | Provides `getDriveClient` (decrypts user refresh token), `getOrCreateAppFolder` (creates/locates dedicated "Receipt Collector Vault" folder), `uploadFileToDrive` (streams in-memory file buffer to Drive), and `deleteFileFromDrive` (deletes file on MongoDB rollback). |
| [`backend/src/services/reminder.service.js`](file:///c:/receipt-collector/backend/src/services/reminder.service.js) | Expiry calculation & automated multi-channel reminder generation service. | Calculates scheduled notification dates based on warranty expiration date and user preferences (`preferences.reminderDaysBefore`, `preferences.notificationChannels`), skips past dates, batch inserts pending reminder records into MongoDB via `Reminder.insertMany`, and queries/dispatches due reminders via `processDueReminders`. |
| [`backend/src/services/email.service.js`](file:///c:/receipt-collector/backend/src/services/email.service.js) | Transactional email notification delivery service via Nodemailer. | Creates a reusable Nodemailer Gmail transporter (`EMAIL_USER`, `EMAIL_APP_PASSWORD`) and exports `sendReminderEmail` to format and dispatch warranty expiry notices to users. |

### Background Jobs (`/backend/src/jobs`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/jobs/reminder.job.js`](file:///c:/receipt-collector/backend/src/jobs/reminder.job.js) | Scheduled cron job runner for automated reminder checks. | Uses `node-cron` to schedule an hourly check (`0 * * * *`) that triggers `processDueReminders()` to find and send all pending notifications whose scheduled date has arrived. |

### Controllers (`/backend/src/controllers`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/controllers/health.controller.js`](file:///c:/receipt-collector/backend/src/controllers/health.controller.js) | Request handler for system health and status checks. | Exports `checkHealth` controller wrapped with `asyncHandler`, returning server uptime, current timestamp, and operational status in `ApiResponse` format. |
| [`backend/src/controllers/auth.controller.js`](file:///c:/receipt-collector/backend/src/controllers/auth.controller.js) | Request handler for User Authentication & Token management. | Handles `registerUser`, `loginUser`, `logoutUser`, `getCurrentUser`, and `refreshAccessToken`. Generates Access/Refresh tokens, sets HTTP-only cookies, and returns sanitized user data (tokens are excluded from the JSON response body for enhanced security). |
| [`backend/src/controllers/googleAuth.controller.js`](file:///c:/receipt-collector/backend/src/controllers/googleAuth.controller.js) | Request handler for Google OAuth 2.0 authentication and Google Drive connection flows. | Handles `googleLoginRedirect` & `googleLoginCallback` (login flow, ID token verification, JWT issuance) and `googleDriveConnectRedirect` & `googleDriveConnectCallback` (Drive storage consent flow, offline access, AES-256-GCM encryption of Drive refresh token). |
| [`backend/src/controllers/warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js) | Request handler for full CRUD operations on product warranty records with user data isolation. | Handles `createWarranty` (supports optional file upload to Google Drive with automatic rollback on DB write failure), `getAllWarranties`, `getWarrantyById`, `updateWarrantyById`, `deleteAllWarranties`, and `deleteWarrantyById`. All queries scoped strictly to `req.user._id`. |

### Routes (`/backend/src/routes`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`backend/src/routes/health.routes.js`](file:///c:/receipt-collector/backend/src/routes/health.routes.js) | Router definition for server health check endpoints. | Defines `GET /` route mapped to `checkHealth` controller. |
| [`backend/src/routes/auth.routes.js`](file:///c:/receipt-collector/backend/src/routes/auth.routes.js) | Router definition for authentication API endpoints. | Maps `/register`, `/login`, `/logout` (protected), `/me` (protected), and `/refresh-token` endpoints. |
| [`backend/src/routes/googleAuth.routes.js`](file:///c:/receipt-collector/backend/src/routes/googleAuth.routes.js) | Router definition for Google OAuth 2.0 and Drive connection endpoints. | Maps public `GET /google` & `GET /google/callback` for login, and protected `GET /google/drive/connect` & `GET /google/drive/callback` (wrapped with `verifyJWT`) for connecting user's Google Drive. |
| [`backend/src/routes/warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js) | Router definition for warranty API endpoints with JWT authentication protection. | Applies `verifyJWT` middleware across all routes (`router.use(verifyJWT)`) and maps `POST /`, `GET /`, `DELETE /`, `GET /:id`, `PUT /:id`, and `DELETE /:id` to warranty controllers. |
| [`backend/src/routes/index.js`](file:///c:/receipt-collector/backend/src/routes/index.js) | Main Express router aggregator for all API endpoints under `/api`. | Imports and mounts individual feature routers (`/health`, `/auth`, `/auth` [googleAuth], `/warranties`). |

---

## 3. Frontend Application (`/frontend`)

| File Path | Necessity / Purpose | Working Mechanism |
| :--- | :--- | :--- |
| [`frontend/package.json`](file:///c:/receipt-collector/frontend/package.json) | Frontend project dependencies and scripts for Next.js app. | Manages Next.js 16, React 19, TailwindCSS v4, TypeScript dependencies; defines scripts (`dev`, `build`, `start`, `lint`). |
| [`frontend/tsconfig.json`](file:///c:/receipt-collector/frontend/tsconfig.json) | TypeScript configuration options & module path aliases. | Configures `@/*` alias pointing to `./*` for clean imports. |
| [`frontend/lib/types.ts`](file:///c:/receipt-collector/frontend/lib/types.ts) | TypeScript interface definitions for data models and API contracts. | Defines `User`, `UserPreferences`, `Warranty`, and `ApiResponse<T>` interfaces for type-safe state and data handling. |
| [`frontend/lib/utils.ts`](file:///c:/receipt-collector/frontend/lib/utils.ts) | ClassName concatenation & Tailwind CSS conflict resolution utility (`cn`). | Combines `clsx` and `tailwind-merge` to dynamically merge base styles with parent-provided class props (`className`, `leftContainerClassName`, `rightContentClassName`, etc.). |
| [`frontend/lib/cn.ts`](file:///c:/receipt-collector/frontend/lib/cn.ts) | Direct alias export for the `cn` utility helper. | Re-exports `cn` and `ClassValue` for clean imports from `@/lib/cn`. |
| [`frontend/lib/api.ts`](file:///c:/receipt-collector/frontend/lib/api.ts) | Reusable type-safe API client utility. | Wraps native `fetch` with `credentials: 'include'` for cross-origin JWT cookie transmission, dynamic headers (supporting FormData and JSON), concurrency-safe silent Access Token refresh interceptor via `/api/auth/refresh-token`, automatic single-retry on 401, and generic `ApiResponse<T>` resolution. |

| [`frontend/app/layout.tsx`](file:///c:/receipt-collector/frontend/app/layout.tsx) | Root HTML layout component with typography configuration. | Configures Google Font **Plus Jakarta Sans** with clean weights (400-800) and JetBrains Mono, applying global CSS and page metadata. |
| [`frontend/app/globals.css`](file:///c:/receipt-collector/frontend/app/globals.css) | Global design system & theme variables. | Configures TailwindCSS v4 with `@theme inline` mapping `--font-sans` to Plus Jakarta Sans and setting up light/dark mode color tokens. |
| [`frontend/app/page.tsx`](file:///c:/receipt-collector/frontend/app/page.tsx) | Root application router redirect. | Redirects `/` to `/dashboard`. |
| [`frontend/app/login/page.tsx`](file:///c:/receipt-collector/frontend/app/login/page.tsx) | Google OAuth authentication page. | Displays brand value proposition, BYOS highlights, dark mode theme toggle synced with local storage, 1-click Google sign-in redirecting to `/api/auth/google`, and navigation link to `/signup`. |
| [`frontend/app/signup/page.tsx`](file:///c:/receipt-collector/frontend/app/signup/page.tsx) | 2-step user registration wizard page. | Step 1 features Google signup or manual name, email, password fields with Shadcn `<Field>` & `<Checkbox>` for Terms & Conditions. Step 2 features additional profile fields, individual notification channel switches (Email [ON by default], WhatsApp, Web Push), and reminder schedule chips. |
| [`frontend/app/dashboard/page.tsx`](file:///c:/receipt-collector/frontend/app/dashboard/page.tsx) | Main Warranty Vault dashboard page. | Displays overview metrics, search bar, toolbar controls (Add Item, Filter with tooltip, ViewToggle for Grid/List), responsive card grid (`CustomCard`), data-table list (`CustomTable`), Google Drive connection status, and user profile `CustomDropdown` modal. |
| [`frontend/components/common/CustomDropdown.tsx`](file:///c:/receipt-collector/frontend/components/common/CustomDropdown.tsx) | Reusable and flexible dropdown menu wrapper component built on shadcn UI primitives. | Supports 3-part item structure (`leftIcon` optional, `label`, `rightContent` optional such as toggles/switches/badges/buttons) with full external CSS class customization (`className`, `leftIconClassName`, `labelClassName`, `rightContentClassName`, `triggerClassName`). |
| [`frontend/components/common/CustomNavbar.tsx`](file:///c:/receipt-collector/frontend/components/common/CustomNavbar.tsx) | Reusable top navigation header bar component. | Encapsulates app brand identity, Google Drive connection status indicator/connect button, and the user profile `CustomDropdown` menu. |
| [`frontend/components/common/CustomCard.tsx`](file:///c:/receipt-collector/frontend/components/common/CustomCard.tsx) | Reusable and clickable warranty card component. | Displays brand, status badge (beside brand), product name, category, retailer, price, purchase date, expiry date, days remaining, and an ellipsis vertical `CustomDropdown` action menu (Edit, Delete). |
| [`frontend/components/ui/tooltip.tsx`](file:///c:/receipt-collector/frontend/components/ui/tooltip.tsx) | Shadcn Tooltip primitive wrapper components (`Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`). | Provides animated accessible floating hover tooltips for UI elements. |
| [`frontend/components/ui/table.tsx`](file:///c:/receipt-collector/frontend/components/ui/table.tsx) | Shadcn Table primitive components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`). | Accessible responsive HTML table components. |
| [`frontend/components/common/ViewToggle.tsx`](file:///c:/receipt-collector/frontend/components/common/ViewToggle.tsx) | Reusable view switcher component. | Renders 2 icon buttons (`LayoutGrid` and `List`) with floating tooltips ("Grid view", "List view") to toggle between card grid and data-table views. |
| [`frontend/components/common/CustomTable.tsx`](file:///c:/receipt-collector/frontend/components/common/CustomTable.tsx) | Reusable warranty list data-table component. | Displays all warranty metadata (Brand, Name, Category, Retailer, Price, Purchase date, Expiry date, Days left, Status badge) plus an Action column with an ellipsis vertical `CustomDropdown` (Edit, Delete). |
| [`frontend/components/common/WarrantyFormDrawer.tsx`](file:///c:/receipt-collector/frontend/components/common/WarrantyFormDrawer.tsx) | Reusable right-side slide-in drawer form wizard component for creating and editing warranties. | Features a wide right-side slide-in layout (`sm:580px md:680px lg:740px`), 2-step wizard flow (Step 1: AI OCR info & drag-and-drop file upload with animated Shadcn `<Progress />`; Step 2: Form fields using Shadcn `<Field>`, `<FieldGroup>`, `<FieldLabel>`, `<Input>` with auto-computed expiry preview badge), and customizable title / initial data props. |
| [`frontend/components/ui/drawer.tsx`](file:///c:/receipt-collector/frontend/components/ui/drawer.tsx) | Shadcn Drawer primitives (`Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose`) powered by `@base-ui/react/drawer`. | Accessible slide-in sheet/drawer component supporting custom swipe directions (e.g. `right`), backdrop overlays, and animations. |
| [`frontend/components/ui/field.tsx`](file:///c:/receipt-collector/frontend/components/ui/field.tsx) | Shadcn Field layout primitives (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldSet`, `FieldLegend`). | Accessible structured form field containers with label and helper text formatting. |
| [`frontend/components/ui/input.tsx`](file:///c:/receipt-collector/frontend/components/ui/input.tsx) | Shadcn Input primitive component. | Styled accessible text, number, date, and email input component. |
| [`backend/src/controllers/notification.controller.js`](file:///c:/receipt-collector/backend/src/controllers/notification.controller.js) | Request handler for fetching, marking as read, and clearing in-app warranty reminders and notifications. | Handles `getUserNotifications`, `markNotificationAsRead`, `markAllNotificationsAsRead`, `clearNotification`, and `clearAllNotifications`. |
| [`backend/src/routes/notification.routes.js`](file:///c:/receipt-collector/backend/src/routes/notification.routes.js) | Router definition for in-app notification endpoints with JWT authentication. | Maps `GET /`, `DELETE /`, `PATCH /read-all`, `PATCH /:id/read`, and `DELETE /:id` to notification controller handlers. |
| [`frontend/components/common/NotificationDropdown.tsx`](file:///c:/receipt-collector/frontend/components/common/NotificationDropdown.tsx) | Interactive top navbar notification bell dropdown component. | Shows live unread count badge (`1, 2, 3... 9+`), auto-polls updates, lists all notifications with channel badges (Email, WhatsApp, Push, In-App), supports single dismiss & clear all, and opens the quick-view modal on click. |
| [`frontend/components/common/WarrantyQuickViewModal.tsx`](file:///c:/receipt-collector/frontend/components/common/WarrantyQuickViewModal.tsx) | Brief preview modal dialog for warranty notifications. | Displays product name, category, live expiry status countdown, key specs (purchase date, expiry date, retailer, price, serial/model), reminder channels, and direct link button to the full warranty detail page. |





