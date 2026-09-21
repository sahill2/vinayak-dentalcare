# Changelog & Verification Summary (`master-fixes`)

This document details all security, architectural, UX/UI, and test verification changes implemented on the `master-fixes` branch.

---

### **Phase 0: Production Unblocking & Architecture**
- **Cached DB Connection (`backend/config/db.js`)**:
  - Validates `mongoose.connection.readyState === 1` before reuse; handles reconnection transparently on serverless cold starts.
  - Standardized pool options: `maxPoolSize: 5`, `socketTimeoutMS: 20000`, `serverSelectionTimeoutMS: 8000`.
- **Health Check Endpoint (`GET /api/health`)**:
  - Registered as the first route; returns `{ ok: true, db: 'up' }` without leaking error details.
- **File System Isolation (`public/` & `backend/private/`)**:
  - Frontend assets moved to `public/`.
  - Sensitive administrative portal (`dashboard.html`) moved to `backend/private/` with protected authentication guard.
  - Direct requests to `/backend/server.js`, `/package.json`, and `/vercel.json` return 404.
- **Node 22 Engine Pinning**: Pinned `engines.node: "22.x"` in `package.json`.

---

### **Phase 1: Backend Security & Correctness**
- **Mongo-Backed Rate Limiting (`RateLimit` model & `rateLimiter.js`)**:
  - Enforced serverless-safe rate limiting:
    - Login: 5 requests / 15 min per IP and email.
    - Lookup: 5 requests / 15 min per IP and phone.
    - Appointments: 5 requests / hour per IP.
    - Inquiries: 5 requests / hour per IP.
  - Added hidden honeypot field (`website`) silently rejecting bots.
- **Account Lockout & Timing Attack Prevention (`authController.js`)**:
  - 5 failed login attempts trigger a 15-minute temporary lockout.
  - Constant-time dummy bcrypt comparison when user is not found.
  - Added `tokenVersion` check on JWT and session revocation.
- **Zod Booking Validation (`appointmentController.js`)**:
  - Validated patient name, 10-digit Indian phone (`[6-9]\d{9}`), allowed services list, valid Asia/Kolkata dates (no past dates, no Sundays, <= 60 days), and operating slot validation.
  - Cryptographic 6-character reference codes (`VDC-XXXXXX`).
  - Partial compound unique index `{ date: 1, timeSlot: 1 }` where `{ isActive: true }` preventing double bookings (409 Conflict).
- **Public Availability Endpoint (`GET /api/appointments/availability?date=...`)**:
  - Returns `{ date, takenSlots: [...] }` to power real-time slot disabling.

---

### **Phase 2 & Phase D: "Warm Clinic Journal" Design System & Motion**
- **Design Tokens (`public/css/style.css`)**:
  - Palette: `--cream` (`#FBF7EF`), `--paper` (`#F3EBDD`), `--surface` (`#FFFDF9`), `--line` (`#DDD2BF`), `--ink` (`#1E2A2B`), `--text` (`#3A4547`), `--teal` (`#0F5E5B`), and `--accent` (`#B4532A` terracotta).
  - Typography: *Fraunces* serif for editorial headings, *Plus Jakarta Sans* / *Inter* for body text.
- **Vanilla Motion Engine (`public/js/motion.js`)**:
  - Zero third-party animation libraries (< 6KB).
  - Features: `ScrollReveal`, `BlurText` word animation, `SpotlightCard` cursor glow, `Magnet` button physics, and live IST clinic status chip.
  - Added full `@media (prefers-reduced-motion: reduce)` support.

---

### **Phase 3: Booking Flow, Forms & Admin Dashboard**
- **Dynamic Booking (`public/book.html`)**:
  - Pre-selects service via `?service=...` query parameter.
  - Real-time slot availability fetching and disabled state.
  - Accessible form alerts (`role="alert"`), formatted confirmation dates, and copy reference code feedback.
- **Admin Dashboard (`backend/private/dashboard.html`)**:
  - Verifies `/api/auth/me` on load; redirects unauthenticated visitors to login.
  - Formula injection mitigation on CSV export (prefixing `=`, `+`, `-`, `@` with `'`).
  - Full DOM sanitization via `esc()`.

---

### **Phase 4 & 5: Content Honesty & Internationalization**
- Centralized clinic data in `public/js/config.js` with `TODO: OWNER` markers.
- Doctor profiles with initials avatar fallback when no real photos are loaded.
- Honest medical terminology in English, Gujarati (`gu`), and Hindi (`hi`).
- Comprehensive Privacy Policy at `public/privacy.html`.

---

### **Phase 6 & 7: SEO, Automated Testing & Verification**
- Configured `public/robots.txt` and `public/sitemap.xml`.
- Created automated integration test suite (`tests/api.test.js`) executed via `npm test` verifying 16 test assertions across auth, booking, rate limiting, and security constraints.
