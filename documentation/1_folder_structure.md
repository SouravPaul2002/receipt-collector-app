# 1. Project Folder Structure & Architecture (`1_folder_structure.md`)

> **Note for Future Self**: This document maps out the physical folder tree of both the backend and frontend. It explains not just where files live, but *why* this architectural pattern was chosen and how data and control flow through each layer.

---

## 1. High-Level Architecture Overview

The repository is structured as a **Monorepo** containing decoupled backend and frontend applications:

```
receipt-collector/
├── backend/                  # Express.js (ESM) REST API & Business Logic
├── frontend/                 # Next.js React Client Application
│   └── rc-frontend/
└── documentation/            # Permanent Project Knowledge Base & Design Rationale
```

### Why Layered MVC / Separation of Concerns?
The backend uses a standard **Layered MVC (Model-View-Controller) / Service-Oriented Architecture**.
- **Routes Layer**: Only handles URL matching, HTTP methods, and attaches middleware pipelines.
- **Middlewares Layer**: Handles cross-cutting concerns (authentication verification, error interception, rate limiting, file upload handling).
- **Controllers Layer**: Coordinates request extraction, invokes validation and database models, and formats HTTP responses.
- **Models Layer**: Defines Mongoose database schemas, data types, indexes, and document lifecycle hooks.
- **Services Layer** *(Planned)*: Encapsulates external integrations (Google Drive API, OCR Engine, Email Dispatcher) so controllers stay thin and testable.
- **Utils Layer**: Reusable helper classes and functional wrappers (`ApiError`, `ApiResponse`, `asyncHandler`).

---

## 2. Complete Visual Directory Tree

```text
receipt-collector/
├── .gitignore                          # Global gitignore covering root, backend, and frontend
├── agent_read.md                       # Protocol instructions for AI coding assistants
├── build_log.md                        # Root implementation changelog
├── folder_structure.md                 # Root visual folder map
├── goal.md                             # Root original goal notes
├── planning.md                         # Root original tech stack & build order notes
├── progress.md                         # Master milestone progress tracker
├── working.md                          # Master file purpose & mechanism registry
│
├── documentation/                      # 📚 PERMANENT DOCUMENTATION SUITE
│   ├── 0_goal.md                       # Product vision, problem statement, feature breakdowns
│   ├── 1_folder_structure.md           # (This file) Folder architecture & layer explanations
│   ├── 2_tech_stack.md                 # Technology choices, trade-offs & architectural rationale
│   ├── 3_api_reference.md             # Complete REST API reference with design notes
│   └── 4_build_log.md                  # Chronological implementation log & debugging lessons
│
├── backend/                            # 🚀 BACKEND SERVER (Node.js + Express)
│   ├── index.js                        # Server entry point & Express bootstrap
│   ├── package.json                    # Backend dependencies and scripts (ES Modules)
│   ├── .env                            # Environment secrets (ignored by Git)
│   └── src/
│       ├── config/                     # Infrastructure configuration
│       │   ├── db.js                   # MongoDB Atlas Mongoose connection logic
│       │   └── googleOAuth.js          # Google OAuth 2.0 Client setup via googleapis
│       │
│       ├── controllers/                # Request handlers & response formatting
│       │   ├── auth.controller.js      # User registration, password login, logout, refresh tokens
│       │   ├── googleAuth.controller.js# Google OAuth login redirect & callback verification
│       │   ├── health.controller.js    # System health check handler
│       │   └── warranty.controller.js  # Warranty CRUD handlers with user isolation
│       │
│       ├── middlewares/                # Custom Express middlewares
│       │   ├── auth.middleware.js      # verifyJWT middleware for route protection
│       │   ├── errorHandler.js         # Global centralized error handler
│       │   └── multer.middleware.js    # In-memory multipart file upload middleware
│       │
│       ├── models/                     # Mongoose data schemas & DB methods
│       │   ├── product.model.js        # Warranty / Product item schema with pre-validate hook
│       │   ├── reminder.model.js       # Expiry reminder schedule schema
│       │   └── user.model.js           # User profile schema with bcrypt hashing & JWT methods
│       │
│       ├── routes/                     # API route declarations & pipeline binding
│       │   ├── auth.routes.js          # /api/auth routes (register, login, logout, me, refresh)
│       │   ├── googleAuth.routes.js    # /api/auth/google & Drive OAuth endpoints
│       │   ├── health.routes.js        # /api/health uptime check route
│       │   ├── index.js                # Main router aggregator mounting all sub-routes under /api
│       │   └── warranty.routes.js      # /api/warranties routes (protected with verifyJWT & multer)
│       │
│       ├── scripts/                    # Standalone diagnostic & DB maintenance scripts
│       │   ├── testCreateWarranty.js   # Script verifying warranty creation & expiry hook
│       │   └── testDbCollections.js    # Script checking live Atlas collections
│       │
│       ├── services/                   # External service integrations
│       │   ├── googleDrive.service.js  # Google Drive OAuth client, folder management, upload & rollback
│       │   ├── ocr.service.js          # (Planned) Receipt OCR text extraction pipeline
│       │   └── reminder.service.js     # (Planned) Scheduled cron job & notification dispatchers
│       │
│       └── utils/                      # Shared helper wrappers and classes
│           ├── ApiError.js             # Standardized operational Error class
│           ├── ApiResponse.js          # Standardized HTTP JSON success envelope
│           ├── asyncHandler.js         # Promise-based controller wrapper catching errors
│           └── crypto.js               # AES-256-GCM symmetric encryption helper
│
└── frontend/                           # 💻 FRONTEND APPLICATION
    └── rc-frontend/                    # Next.js 14+ App Router Project
        ├── next.config.mjs             # Next.js configuration
        ├── package.json                # Frontend dependencies (React, Next, Lucide icons, etc.)
        ├── postcss.config.mjs          # PostCSS configuration
        ├── jsconfig.json               # Path alias configuration (@/* -> src/*)
        └── src/
            └── app/                    # Next.js App Router directory
                ├── globals.css         # Global styling and CSS tokens
                ├── layout.js           # Root layout wrapper with font loading & metadata
                └── page.js             # Landing page / entry point component
```

---

## 3. Deep-Dive: Backend Folder Responsibilities

### `/backend/src/config/`
- **Purpose**: Holds singletons and configuration initializers for database connections, third-party SDKs, and cloud clients.
- **Why Separate**: Centralizes credentials, retry configurations, and environment checks. If MongoDB connection parameters or Google OAuth settings need adjustments, they are modified in one file without touching application logic.

### `/backend/src/routes/`
- **Purpose**: Defines HTTP endpoints (verb + URI) and connects them to middleware and controllers.
- **Why Separate**: Keeps route definitions clean and declarative. Routers act like a table of contents for the API. They do not contain business logic or database queries.

### `/backend/src/controllers/`
- **Purpose**: Acts as the orchestrator for individual HTTP requests. It parses incoming parameters (`req.body`, `req.params`, `req.query`), invokes database models or external services, and responds using `ApiResponse`.
- **Why Separate**: Decouples HTTP request handling from business rules and database schemas. Controllers remain lightweight and focus solely on request validation and response lifecycle.

### `/backend/src/middlewares/`
- **Purpose**: Intercepts requests before they hit controllers or catches errors thrown down the pipeline.
- **Why Separate**: Reusable security and operational pipelines. For instance, `verifyJWT` can be applied to any route or entire router without duplicating token parsing logic. `errorHandler` catches unhandled exceptions globally and formats them into uniform JSON responses.

### `/backend/src/models/`
- **Purpose**: Defines Mongoose schemas, field data types, validations, default values, compound indexes, and lifecycle hooks.
- **Why Separate**: Encapsulates data integrity at the database layer. Hooks like auto-calculating `warrantyExpiryDate` on `Product` or hashing passwords on `User` run automatically whenever a document is saved or updated.

### `/backend/src/utils/`
- **Purpose**: Houses pure utility classes, security helpers, and higher-order functions used across the entire backend.
- **Why Separate**: Standardizes operational patterns and security functions across every route:
  - `asyncHandler`: Eliminates hundreds of repetitive `try/catch` blocks.
  - `ApiError` & `ApiResponse`: Guarantee consistent client-facing payloads and centralized error handling.
  - `crypto.js`: Encapsulates AES-256-GCM symmetric encryption/decryption logic, ensuring sensitive credentials (like Google Drive refresh tokens) are encrypted before reaching the database layer.

### `/backend/src/services/` *(Planned)*
- **Purpose**: Houses domain logic and heavy third-party integrations (Google Drive REST API, OCR extraction, Scheduled cron jobs, Email dispatch).
- **Why Separate**: Controllers should not directly execute complex multi-step external API calls. Isolating integrations into services makes them testable, mockable, and swappable without altering route handlers.
