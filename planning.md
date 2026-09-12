## 2. Planning

### Tech Stack
- **Frontend:** React (Next.js)
- **Backend:** Express (Node.js)
- **Database:** MongoDB
- **Document Storage:** User's own Google Drive (via OAuth + Drive API, `drive.file` scope)
- **OCR:** TBD (AWS Textract / Google Vision / Tesseract)
- **Notifications:** Scheduled job (cron) + email service (e.g. SES/SendGrid) + push (FCM) + can be whatsapp
- **Auth:** Google OAuth 2.0

### Build Order
1. Auth (Google OAuth) + basic CRUD for products/warranties (manual entry, no OCR yet)
2. Google Drive upload integration (OAuth consent → backend token exchange → file upload → store `fileId`)
3. Expiry calculation + reminder engine (core differentiator — prioritize getting this solid)
4. OCR auto-extraction on uploaded invoices
5. Claim assistance content/checklists
6. Polish, analytics, monetization hooks

### Why this build order
- Auth + CRUD comes first because everything else depends on having products/warranties to attach documents and reminders to — no point building storage or reminders against fake data.
- Drive integration comes before OCR so uploads work end-to-end (even manual) before adding automation on top.
- The reminder engine is placed early and called out as a priority because it's the core differentiator — the whole point of the app is "don't forget," so this needs to be solid before anything else gets attention.
- OCR is deliberately after the manual flow works, since it's an enhancement (reduces friction) rather than a blocker — manual entry fallback covers users while OCR is still being tuned.
- Claim assistance and monetization are last since they build on top of a working core loop (add → track → get reminded) rather than being part of it.

### Open Decisions / To Figure Out
- OCR provider choice (accuracy vs. cost vs. self-hosted control)
- Notification delivery service choice
- MongoDB schema design (products, warranties, reminders, users) — how much to embed vs. reference
- Monetization: free tier item cap vs. paid tier (unlimited items, family sharing, extended warranty marketplace) — deferring this decision until the core product proves useful