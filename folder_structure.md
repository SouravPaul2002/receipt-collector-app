# Project Folder Structure

```text
receipt-collector/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & App configuration (MongoDB, env, OAuth)
│   │   │   └── db.js
│   │   ├── controllers/        # Request handlers & HTTP responses
│   │   │   └── health.controller.js
│   │   ├── middlewares/        # Custom Express middlewares
│   │   │   └── errorHandler.js
│   │   ├── models/             # Mongoose Schemas (User, Product, Warranty, etc.)
│   │   ├── routes/             # API Route definitions
│   │   │   ├── health.routes.js
│   │   │   └── index.js        # Main API router aggregator (/api/v1)
│   │   ├── services/           # Business logic & 3rd party APIs (Drive, OCR, Reminders)
│   │   └── utils/              # Helper utilities
│   │       ├── ApiError.js
│   │       ├── ApiResponse.js
│   │       └── asyncHandler.js
│   ├── .env                    # Environment configuration
│   ├── index.js                # Express app entry point
│   └── package.json            # Dependencies & scripts
└── frontend/                   # React / Next.js frontend application
```
