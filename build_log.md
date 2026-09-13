# Build Log (`build_log.md`)

This log tracks what has been implemented in the codebase. Entries are factual records of completed features, schema implementations, and architecture refactoring.

---

### Implementation Entries

- **[2026-09-12]** — Project scoped. Finalized tech stack: Next.js (frontend), Express (backend), MongoDB (database), Google Drive OAuth integration.
- **[2026-09-12]** — Refactored backend folder structure into clean MVC + Layered Service layout inside `src/`. Created `src/config/db.js`, `src/utils/asyncHandler.js`, `src/utils/ApiError.js`, `src/utils/ApiResponse.js`, and `src/middlewares/errorHandler.js`.
- **[2026-09-12]** — Implemented Mongoose models (`User`, `Product`, `Reminder`) in `src/models/`. Created `src/scripts/testDbCollections.js` which initialized `users`, `products`, and `reminders` collections live in MongoDB Atlas.
- **[2026-09-12]** — Implemented warranty creation API controller (`createWarranty` in `src/controllers/warranty.controller.js`) and router (`src/routes/warranty.routes.js`). Fixed Mongoose v9 hook compatibility in `product.model.js`. Mounted API routes under `/api/warranties`.
- **[2026-09-13]** — Created `agent_read.md` protocol checklist and `progress.md` milestone tracker to enforce continuous updates to `working.md`, `build_log.md`, `folder_structure.md`, and `progress.md` after every task completion.
- **[2026-09-13]** — Implemented `GET /api/warranties` controller function (`getAllWarranties` in `src/controllers/warranty.controller.js`) and mounted route in `src/routes/warranty.routes.js`.
- **[2026-09-13]** — Implemented `GET /api/warranties/:id` controller function (`getWarrantyById` in `src/controllers/warranty.controller.js`) with 404 error handling via `ApiError(404)` and mounted route in `src/routes/warranty.routes.js`.
- **[2026-09-13]** — Implemented `DELETE /api/warranties` (`deleteAllWarranties`) and `DELETE /api/warranties/:id` (`deleteWarrantyById`) controller functions with 404 error checks and `findByIdAndDelete` in `src/controllers/warranty.controller.js`.
- **[2026-09-13]** — Implemented `PUT /api/warranties/:id` (`updateWarrantyById`) controller function in `src/controllers/warranty.controller.js` with `findByIdAndUpdate`, automatic `warrantyExpiryDate` recalculation, 404 error checks, and mounted route in `src/routes/warranty.routes.js`.
- **[2026-09-13]** — Implemented JWT Authentication system (`jsonwebtoken`, `bcryptjs`). Updated `user.model.js` with bcrypt password hashing hook, `isPasswordCorrect`, `generateAccessToken`, and `generateRefreshToken` methods. Created `verifyJWT` middleware (`src/middlewares/auth.middleware.js`), auth controller (`src/controllers/auth.controller.js` for `/register`, `/login`, `/logout`, `/me`, `/refresh-token`), and mounted auth router (`src/routes/auth.routes.js`) under `/api/auth`.
- **[2026-09-13]** — Updated [`auth.controller.js`](file:///c:/receipt-collector/backend/src/controllers/auth.controller.js) to exclude `accessToken` and `refreshToken` from the response JSON body for `registerUser` and `loginUser`, ensuring tokens are transmitted solely via secure HTTP-only cookies.
- **[2026-09-13]** — Protected all warranty endpoints in [`warranty.routes.js`](file:///c:/receipt-collector/backend/src/routes/warranty.routes.js) with `verifyJWT` middleware (`router.use(verifyJWT)`). Updated all CRUD operations in [`warranty.controller.js`](file:///c:/receipt-collector/backend/src/controllers/warranty.controller.js) to scope queries and mutations strictly to `req.user._id` for user data isolation.

