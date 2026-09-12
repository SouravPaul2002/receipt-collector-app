## 1. Goal

This project is a consumer-focused SaaS product built to eliminate the hassle of lost invoices and missed warranty claims. It helps users digitally store warranties, track expiry dates, and stay claim-ready through automated reminders and secure document management.

Built with a startup mindset — focused on simplicity, scalability, and trust — it turns a common everyday pain point (losing receipts, forgetting warranty windows) into a reliable digital solution.

### Features

**Warranty / Product Vault**
- Add a product: name, category, purchase date, retailer, price, invoice/receipt photo
- Upload invoice (PDF/image); OCR auto-extracts purchase date, product name, amount, warranty period
- Manual entry fallback when OCR fails or isn't used

**Expiry Tracking & Reminders**
- Auto-calculate expiry from purchase date + warranty duration
- Email/push/whatsapp notifications at configurable intervals (e.g. 30/7/1 days before expiry)
- Dashboard views: Expiring Soon / Active / Expired

**Document Storage (Google Drive integration)**
- User logs in via Google OAuth 2.0
- App requests `drive.file` scope consent (access limited only to files the app creates — not the user's whole Drive)
- Backend uses authorization code flow — exchanges code for access + refresh tokens, stores them encrypted server-side
- Invoice/receipt uploads go: browser → backend → Google Drive API (not direct browser-to-Drive)
- App stores the returned Drive `fileId` + metadata in its own DB
- Handles edge cases: revoked access, deleted file in Drive → "file unavailable" state

**Claim Assistance**
- Store manufacturer support contact / claim process info per category
- "Start a claim" checklist (required documents, links to manufacturer portal)
- Claim history log

**Auth & User Management**
- Google OAuth login (doubles as auth + Drive consent)
- Basic account settings, notification preferences

### Future (not MVP)
- ML-based recommendations (e.g. extended warranty suggestions)
- Browser extension / email parsing for auto-detecting purchases
- Family/shared accounts
- Barcode/receipt scanning via mobile camera
- Marketplace order-history import (Amazon etc.)

### Reasoning / How we arrived here

- **Why Google Drive for storage instead of our own cloud bucket:** avoids storage costs, and gives users a trust angle — their documents stay in their own Drive, not on a third-party server. This is a known "bring your own storage" pattern.
- **Why `drive.file` scope specifically:** it only grants access to files the app itself creates, not the user's entire Drive. This makes the consent screen less intimidating and avoids Google's costly, time-consuming CASA security assessment that's required for broader "sensitive" scopes.
- **Why server-side (authorization code) OAuth flow instead of client-side:** keeps access/refresh tokens off the browser entirely, which is safer and lets the backend refresh tokens silently without frontend involvement.
- **Why Express over FastAPI for backend:** already learning Express and want to build fluency there, even though FastAPI was the original pick. Decided the ML angle doesn't require Python on the main backend.
- **How ML fits in later despite an Express backend:** ML (e.g. recommendations) doesn't need to live in the main backend. It can be added later as a separate Python microservice that the Express backend calls over HTTP — a common pattern that keeps ML fully decoupled from the core app, so switching to Express now doesn't block ML later.
- **Why MongoDB:** chosen partly to learn it, and it fits reasonably well since product/warranty data varies in shape across categories (electronics vs. furniture vs. appliances) — a flexible document model handles that more naturally than a rigid relational schema. Some trade-offs (weaker joins/transactions) are acceptable at this stage.
- **Why v2+ features are deferred:** keeping MVP scope tight (vault, tracking, storage, claims, auth only) so the core loop — add a product, get reminded before it expires — is solid before adding complexity like ML, sharing, or scanning.