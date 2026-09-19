# Project Folder Structure

```text
receipt-collector/
├── agent_read.md               # Mandatory Agent Operating Protocol & Checklist
├── build_log.md                # Chronological implementation execution log
├── folder_structure.md         # Visual directory tree documentation
├── goal.md                     # Product goals, features, and architecture decisions
├── planning.md                 # Tech stack and step-by-step build roadmap
├── progress.md                 # Master progress tracker (completed vs pending steps)
├── working.md                  # Registry of every file's function, purpose & mechanism
├── backend/
│   ├── src/
│   │   ├── config/             # DB & App configuration (MongoDB connection, Google OAuth)
│   │   │   ├── db.js
│   │   │   └── googleOAuth.js
│   │   ├── controllers/        # Request handlers & HTTP responses
│   │   │   ├── auth.controller.js
│   │   │   ├── googleAuth.controller.js
│   │   │   ├── health.controller.js
│   │   │   └── warranty.controller.js
│   │   ├── middlewares/        # Custom Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/             # Mongoose Schemas & MongoDB models
│   │   │   ├── product.model.js
│   │   │   ├── reminder.model.js
│   │   │   └── user.model.js
│   │   ├── routes/             # API Route definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── googleAuth.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── index.js        # Main API router aggregator (/api)
│   │   │   └── warranty.routes.js
│   │   ├── scripts/            # Diagnostic & test scripts
│   │   │   ├── testCreateWarranty.js
│   │   │   └── testDbCollections.js
│   │   ├── services/           # Business logic & 3rd party APIs (Drive, OCR)
│   │   └── utils/              # Helper utilities
│   │       ├── ApiError.js
│   │       ├── ApiResponse.js
│   │       ├── asyncHandler.js
│   │       └── crypto.js       # AES-256-GCM encryption/decryption helper
│   ├── .env                    # Environment configuration
│   ├── index.js                # Express app entry point
│   └── package.json            # Dependencies & scripts
└── frontend/                   # React / Next.js frontend application
```
