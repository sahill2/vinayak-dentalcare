# 🦷 Vinayak Dental Care — Full-Stack Dental Clinic Platform

A modern, production-ready full-stack healthcare web portal and management system designed for **Vinayak Dental Care**. Built with high-performance Vanilla JavaScript, HTML5, CSS3, and Node.js / Express with MongoDB Mongoose. Deployed seamlessly on Vercel with serverless function support.

---

## 📋 Table of Contents

- [Key Highlights](#-key-highlights)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Environment Configuration](#-environment-configuration)
- [Security & Production Hardening](#-security--production-hardening)
- [API Reference](#-api-reference)
- [Vercel Serverless Deployment](#-vercel-serverless-deployment)
- [Owner Configuration Guide](#-owner-configuration-guide)
- [Changelog](#-changelog)
- [License](#-license)

---

## ✨ Key Highlights

### 👤 Patient Experience
- **Interactive Multi-Language Portal (`js/i18n.js`)**: Real-time language switching across **English**, **Gujarati (ગુજરાતી)**, and **Hindi (हिन्दी)** with persistent browser storage (`localStorage`).
- **Single Source of Truth Catalog (`js/config.js`)**: Dynamic rendering of clinical services, emergency numbers, clinic hours, and social media handles.
- **Smart Appointment Booking (`book.html`)**:
  - Live pre-selection from homepage/services links (e.g. `book.html?service=rct`).
  - Validation restricting past dates and Sundays (clinic weekly holiday).
  - Indian phone format enforcement (`[6-9]\d{9}`).
  - Double-booking prevention via MongoDB compound unique indices.
  - Mandatory DPDP/privacy consent before submission.
- **Reference Code Tracking (`VDC-XXXX`)**: Instant privacy-preserving status lookup (`POST /api/appointments/lookup`) showing live appointment status, date, time slot, and service without exposing phone numbers or emails.
- **Post-Booking Action Card**: Displays confirmed appointment details and 1-click WhatsApp message dispatch prefilled with reference code.
- **Mobile-First Experience**: Sticky bottom quick-action bar (`Call Clinic` & `WhatsApp Consultation`), click-to-call, and interactive Google Maps directions.

### 🛡️ Secure Admin Portal (`/admin/index.html` & `dashboard.html`)
- **JWT Authentication via HTTP-Only Cookies**: Secure session management protected from client-side script inspection.
- **Brute-Force Login Rate Limiting**: Strict threshold (5 attempts per 15 minutes per IP) with automatic lockout and remaining attempt counters.
- **Rich Dashboard Management**:
  - **Metrics**: Total bookings, Pending reviews, Confirmed visits, Today's schedule, Inquiries count.
  - **Filters & Search**: Multi-field search (Name, Phone, Email, Reference Code, Service) + Status dropdown + Date Range filter (From / To) + **"Today's Schedule"** quick toggle.
  - **Server-side Pagination**: High-performance paginated queries (20 records per page).
  - **Export to CSV**: Client-side CSV generator with date, time, status, reference code, and patient contact details.
  - **Audit Trail & Activity Log**: Automatic logging of all appointment status updates and rescheduling actions with staff timestamp.
  - **Inquiry Manager & Account Settings**: Manage patient contact form inquiries and update admin login credentials.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Semantic HTML5, Vanilla CSS3 (Custom Dental Palette, Glassmorphism, Responsive Grid/Flexbox), Vanilla JS (ES6+ Modules, Fetch API, i18n engine) |
| **Backend Runtime** | Node.js (v18+) & Express.js (v4.x) |
| **Database & ODM** | MongoDB with Mongoose (with cached connection for Serverless environments) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + HTTP-Only, `SameSite=Lax/Strict`, Secure Cookies |
| **Security Middleware** | `helmet`, `express-rate-limit`, `express-mongo-sanitize`, Custom HTML Escaping Sanitizers |
| **Email Delivery** | `nodemailer` (SMTP notifications for status updates and rescheduling) |
| **Deployment** | Vercel Serverless Functions (`api/index.js` + `vercel.json`) |

---

## 📂 Project Directory Structure

```text
dental/
├── admin/
│   └── index.html              # Dedicated admin login (noindex, nofollow)
├── api/
│   └── index.js                # Vercel serverless entry point wrapping Express app
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection with serverless connection caching
│   ├── controllers/
│   │   ├── appointmentController.js # Appointment booking, lookup, pagination & logs
│   │   ├── authController.js        # Admin login, logout & credentials update
│   │   └── inquiryController.js     # Patient contact inquiries
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & admin route protection
│   │   └── validator.js        # Input validation (phone, date, time slot, sanitization)
│   ├── models/
│   │   ├── ActivityLog.js      # Audit trail schema for admin status updates
│   │   ├── Admin.js            # Admin schema with bcrypt password hashing
│   │   ├── Appointment.js      # Appointment schema with compound unique index & VDC ref code
│   │   └── Inquiry.js          # Patient inquiry schema
│   ├── routes/
│   │   ├── appointmentRoutes.js# /api/appointments endpoints
│   │   ├── authRoutes.js       # /api/auth endpoints with rate limiter
│   │   └── inquiryRoutes.js    # /api/inquiries endpoints
│   ├── services/
│   │   └── emailService.js     # Nodemailer email notification service
│   ├── utils/
│   │   └── seed.js             # Environment-driven admin account seeder
│   ├── .env.example            # Sample environment variables template
│   └── server.js               # Express application configuration & routes
├── css/
│   └── style.css               # Core styling, responsive layouts, accessibility & sticky bar
├── js/
│   ├── config.js               # Central clinic configuration & TODO placeholders
│   ├── i18n.js                 # Multi-language dictionary (EN, GU, HI) & selector
│   └── script.js               # Client frontend scripts (booking, tracking, dynamic DOM)
├── 404.html                    # Branded 404 error page
├── about.html                  # About the clinic & doctor profiles
├── book.html                   # Appointment booking & privacy lookup
├── contact.html                # Contact info, inquiry form & embedded map
├── dashboard.html              # Admin management dashboard
├── index.html                  # Main homepage with structured JSON-LD data
├── privacy.html                # Privacy policy & data protection terms
├── robots.txt                  # Search engine crawling rules
├── sitemap.xml                 # XML Sitemap for search indexing
├── services.html               # Dental services catalog
├── vercel.json                 # Vercel serverless deployment routing config
├── package.json                # Project dependencies & scripts
├── CHANGES.md                  # Comprehensive changelog of improvements
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local MongoDB Community instance or MongoDB Atlas cluster URI)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/sahill2/vinayak-dentalcare.git
cd vinayak-dentalcare

# Switch to the improve-site branch
git checkout improve-site

# Install backend dependencies
npm install
```

### 3. Setup Environment Variables
Create your local `.env` file in the `backend/` folder:
```bash
cp backend/.env.example backend/.env
```
Fill in the necessary keys (see [Environment Configuration](#-environment-configuration)).

### 4. Run the Application

#### Development Mode:
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 5. Accessing URLs
- **Patient Homepage**: [http://localhost:5000](http://localhost:5000)
- **Book Appointment**: [http://localhost:5000/book.html](http://localhost:5000/book.html)
- **Admin Login**: [http://localhost:5000/admin/](http://localhost:5000/admin/)
- **Admin Dashboard**: [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html) *(Requires admin login)*

---

## 🔐 Environment Configuration

Place your environment variables in `backend/.env` for local development and in the **Vercel Project Settings > Environment Variables** for production.

```env
# Server Port & Mode
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas URI or Local MongoDB)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/vinayak_dental_care?retryWrites=true&w=majority

# JWT Authentication Secret (Use a strong random string >= 32 characters)
JWT_SECRET=replace_with_a_secure_random_jwt_secret_min_32_chars

# Administrator Initial Account (Optional for auto-seeding on first run, min 10 chars)
ADMIN_EMAIL=admin@vinayakdentalcare.com
ADMIN_PASSWORD=SetAStrongPasswordMin10Chars!

# Nodemailer SMTP settings (Optional for local dev, required for patient email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="Vinayak Dental Care" <info@vinayakdentalcare.com>
```

> ⚠️ **Security Notice**: If `.env` credentials were ever committed in past git history, ensure you rotate the MongoDB password, JWT secret, and SMTP app passwords in your production database and email providers.

---

## 🛡️ Security & Production Hardening

1. **Strict Input Validation**:
   - Phone numbers validated for Indian standard (10 digits starting with 6, 7, 8, or 9).
   - Booking dates must be strictly today or in the future and cannot be on Sundays.
   - Time slots must fall within legitimate operational clinic hours (09:00 AM – 08:00 PM).
2. **Double Booking Prevention**:
   - Partial compound unique index on MongoDB: `{ date: 1, timeSlot: 1 }` (active for non-cancelled bookings).
   - Returns clean HTTP `409 Conflict` if two users attempt to book the exact same slot concurrently.
3. **Privacy Protection**:
   - Live status lookup (`POST /api/appointments/lookup`) requires the unique Reference Code (`VDC-XXXX`) or matching Phone + Reference Code.
   - Rate-limited to 10 requests per 15 minutes per IP.
   - Responses return only necessary status fields (`status`, `date`, `timeSlot`, `service`), never exposing patient contact details or PII.
4. **Injection & XSS Protection**:
   - NoSQL query injection prevention using `express-mongo-sanitize`.
   - String sanitization and HTML entity escaping on all user-supplied text payloads.
   - HTTP response header protection via `helmet`.
5. **Admin Access Security**:
   - Authentication endpoint rate-limited to 5 attempts / 15 min.
   - Admin pages tagged with `<meta name="robots" content="noindex, nofollow">` and excluded from `robots.txt` and `sitemap.xml`.

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Rate Limit | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | 5 req / 15 min | Public | Authenticates admin credentials and sets HTTP-Only cookie. |
| `POST` | `/api/auth/logout` | None | Private (Admin) | Clears the session cookie. |
| `PUT` | `/api/auth/change-credentials` | None | Private (Admin) | Updates admin email and password. |

### Appointments (`/api/appointments`)

| Method | Endpoint | Rate Limit | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | 20 req / 15 min | Public | Submits a new appointment booking. |
| `POST` | `/api/appointments/lookup` | 10 req / 15 min | Public | Secure status tracker by reference code (`VDC-XXXX`). |
| `GET` | `/api/appointments` | None | Private (Admin) | Paginated appointment list with search, status, and date filters. |
| `GET` | `/api/appointments/activity/logs` | None | Private (Admin) | Retrieves audit log history of admin status updates. |
| `GET` | `/api/appointments/:id` | None | Private (Admin) | Retrieves specific appointment details. |
| `PUT` | `/api/appointments/:id` | None | Private (Admin) | Updates status (Confirmed, Cancelled, Completed, Rescheduled). |
| `DELETE`| `/api/appointments/:id` | None | Private (Admin) | Deletes an appointment record. |

### Inquiries (`/api/inquiries`)

| Method | Endpoint | Rate Limit | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/inquiries` | 10 req / 15 min | Public | Submits a patient contact inquiry. |
| `GET` | `/api/inquiries` | None | Private (Admin) | Retrieves list of all submitted inquiries. |
| `DELETE`| `/api/inquiries/:id` | None | Private (Admin) | Deletes an inquiry record. |

---

## 🌐 Vercel Serverless Deployment

This project is configured out-of-the-box for serverless deployment on Vercel:

1. **Serverless Entrypoint (`api/index.js`)**: Exports the Express application instance as a Vercel serverless function.
2. **Routing Configuration (`vercel.json`)**:
   - Routes `/api/*` requests to `/api/index.js`.
   - Serves static HTML, CSS, and JS files directly.
3. **Database Connection Caching (`backend/config/db.js`)**: Reuses active Mongoose connections across serverless function invocations to prevent exhausting connection pools.

### Deploying to Vercel
1. Push the branch to your GitHub repository.
2. Import the project in [Vercel Dashboard](https://vercel.com).
3. Under **Settings > Environment Variables**, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
   - `NODE_ENV=production`
4. Click **Deploy**.

---

## 📝 Owner Configuration Guide

All clinic contact information, hours, addresses, and service catalogs are centralized in [`js/config.js`](file:///c:/SAHIL/New%20folder/dental/js/config.js). 

To customize the clinic details for production, update the fields marked with `TODO: OWNER`:
- `clinicName`: Full business name.
- `phone` & `emergencyPhone`: Clinic front-desk telephone number.
- `whatsappNumber`: WhatsApp business number (digits with country code).
- `email`: Public clinic contact email.
- `address`: Physical clinic street address, city, and pincode.
- `googleMapsUrl` & `googleMapsEmbedUrl`: Google Maps listing links.
- `googleReviewUrl`: Direct link for patients to leave a 5-star Google Review.
- `socialLinks`: Instagram, Facebook, and YouTube profile URLs.
- `services`: Service catalog descriptions, icons, and pricing/duration tags.

---

## 📄 Changes & Audit History

For a complete breakdown of all architectural, security, and UI enhancements made across all phases, see [`CHANGES.md`](file:///c:/SAHIL/New%20folder/dental/CHANGES.md).

---

## ⚖️ License

Copyright © 2026 **Vinayak Dental Care**. All rights reserved.
