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
│   │   ├── jobs/               # Background cron workers
│   │   │   └── reminder.job.js # Scheduled reminder worker via node-cron
│   │   ├── middlewares/        # Custom Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── multer.middleware.js # In-memory file upload middleware
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
│   │   ├── services/           # Business logic & 3rd party APIs
│   │   │   ├── email.service.js       # Transactional email sender via Nodemailer
│   │   │   ├── googleDrive.service.js # Google Drive client, folder creation & file upload/deletion
│   │   │   └── reminder.service.js    # Multi-channel reminder generator & batch processor
│   │   └── utils/              # Helper utilities
│   │       ├── ApiError.js
│   │       ├── ApiResponse.js
│   │       ├── asyncHandler.js
│   │       └── crypto.js       # AES-256-GCM encryption/decryption helper

│   ├── .env                    # Environment configuration
│   ├── index.js                # Express app entry point
│   └── package.json            # Dependencies & scripts
└── frontend/                   # Next.js 16 + React 19 + Tailwind v4 + TypeScript app
    ├── app/
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── public/
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    └── tsconfig.json
```

