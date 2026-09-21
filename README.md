# 🦷 Vinayak Dental Care — Full-Stack Clinic Portal & Management System

A modern, full-stack healthcare web application designed for **Vinayak Dental Care**. The platform features an interactive patient-facing portal for clinic information, services, appointment booking, and status tracking, combined with a secure administrative dashboard for clinic staff to manage appointments, inquiries, and schedules.

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Configuration](#-environment-configuration)
- [Default Admin Credentials](#-default-admin-credentials)
- [API Reference](#-api-reference)
- [Security Implementations](#-security-implementations)
- [Deployment & Production Tips](#-deployment--production-tips)
- [License](#-license)

---

## ✨ Features Overview

### 👤 Patient Portal
* **Homepage (`index.html`)**: Clinic introduction, highlight of dental specialties, patient testimonials, emergency contact banners, and quick booking access.
* **About Us (`about.html`)**: Doctor profiles, clinic mission, sterilization & hygiene standards, and modern diagnostic technologies.
* **Services (`services.html`)**: Detailed overview of dental services including Teeth Whitening, Root Canal Treatment (RCT), Dental Implants, Orthodontics/Aligners, Pediatric Care, and Routine Scaling/Cleaning.
* **Appointment Booking & Tracker (`book.html`)**:
  * Real-time slot and service selection.
  * Instant appointment submission.
  * **Live Appointment Tracker**: Patients can look up their appointment status using their phone number (statuses: *Pending Approval*, *Confirmed*, *Rescheduled*, *Completed*, *Cancelled*).
* **Contact & Inquiries (`contact.html`)**: Interactive contact form with automated recording of patient messages and clinic location details.

### 🛡️ Admin Management Portal
* **Protected Login (`admin/index.html`)**: Secure JWT-based authentication using HTTP-Only cookies.
* **Interactive Dashboard (`dashboard.html`)**:
  * **Real-time Metrics**: Total appointments, pending requests, confirmed visits, today's schedule, and total contact inquiries.
  * **Appointment Workflow**: Accept, reschedule (with custom date/time), mark completed, or cancel appointments.
  * **Search & Filter**: Filter appointments by status or search instantly by patient name, phone, or email.
  * **Inquiry Manager**: View, read, and delete patient contact inquiries.
  * **Credentials Manager**: Update administrator login email and password directly from the settings panel.
  * **Automated Email Alerts**: Automatic email notifications dispatched to patients when their appointment status changes.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18+) |
| **Backend Framework** | Express.js (v4.x) |
| **Database & ODM** | MongoDB with Mongoose |
| **Authentication** | JSON Web Tokens (JWT) stored in HTTP-Only, SameSite cookies |
| **Security Suite** | Helmet, Express Rate Limit, Express Mongo Sanitize, XSS-Clean, Bcrypt.js |
| **Email Delivery** | Nodemailer (SMTP integration) |
| **Frontend** | Semantic HTML5, Vanilla CSS3 (Custom Dental Theme & Responsive Grid/Flexbox), Vanilla JavaScript (Fetch API / Async-Await) |

---

## 📂 Project Structure

```text
dental/
├── admin/
│   ├── index.html              # Admin login page
│   └── indexadmin.html         # Admin login fallback/template
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB database connection configuration
│   ├── controllers/
│   │   ├── appointmentController.js # Appointment CRUD & status actions
│   │   ├── authController.js        # Admin login, logout & credentials update
│   │   └── inquiryController.js     # Patient inquiry submissions & management
│   ├── middleware/
│   │   └── auth.js             # JWT authentication & route protection middleware
│   ├── models/
│   │   ├── Admin.js            # Admin schema & password hashing methods
│   │   ├── Appointment.js      # Appointment schema
│   │   └── Inquiry.js          # Inquiry schema
│   ├── routes/
│   │   ├── appointmentRoutes.js# /api/appointments routes
│   │   ├── authRoutes.js       # /api/auth routes
│   │   └── inquiryRoutes.js    # /api/inquiries routes
│   ├── services/
│   │   └── emailService.js     # Nodemailer email notification service
│   ├── utils/
│   │   └── seed.js             # Default administrator account seeder
│   ├── .env                    # Environment variables (secret configuration)
│   ├── .env.example            # Sample environment variables template
│   └── server.js               # Express application entry point & middleware setup
├── css/
│   └── (custom styling files)  # Stylesheets for client & admin views
├── js/
│   └── script.js               # Frontend interactive scripts & API connectors
├── about.html                  # About Us page
├── book.html                   # Appointment booking & status lookup page
├── contact.html                # Contact Us & inquiry page
├── dashboard.html              # Protected Admin Dashboard
├── index.html                  # Clinic Homepage
├── services.html               # Dental Services catalog
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (version 18 or above recommended)
* [MongoDB](https://www.mongodb.com/) (Local MongoDB instance or MongoDB Atlas connection URI)
* [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/sahill2/vinayak-dentalcare.git
cd vinayak-dentalcare
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file inside the `backend/` directory by copying the sample template:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update the required values:

```env
# Server Port
PORT=5000

# MongoDB URI (Replace with your local URI or MongoDB Atlas connection string)
MONGODB_URI=mongodb://127.0.0.1:27017/vinayak_dental_care

# JWT Authentication Secret (Use a strong random string in production)
JWT_SECRET=vinayak_dental_secret_key_change_in_production

# Node Environment
NODE_ENV=development

# Nodemailer SMTP Configuration (Optional for local testing, required for email delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=admin@vinayakdentalcare.com
SMTP_PASS=your_email_app_password
EMAIL_FROM="Vinayak Dental Care" <admin@vinayakdentalcare.com>
```

### 5. Run the Application

#### Development Mode (with auto-reload using nodemon):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 6. Access the Application
- **Patient Portal**: [http://localhost:5000](http://localhost:5000)
- **Book Appointment**: [http://localhost:5000/book.html](http://localhost:5000/book.html)
- **Admin Login**: [http://localhost:5000/admin/index.html](http://localhost:5000/admin/index.html)
- **Admin Dashboard**: [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html) *(Requires Admin Login)*

---

## 🔐 Default Admin Credentials

Upon launching the server for the first time, an initial administrator account is automatically seeded into MongoDB if none exists:

* **Email:** `admin@vinayakdentalcare.com`
* **Password:** `Vinayak@123`

> ⚠️ **Important:** After logging in for the first time, navigate to the dashboard settings and update your email and password.

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates admin credentials and sets HTTP-Only JWT cookie. |
| `POST` | `/api/auth/logout` | Private (Admin) | Clears the authentication cookie. |
| `PUT` | `/api/auth/change-credentials` | Private (Admin) | Updates admin email and/or password (requires current password). |

### Appointments (`/api/appointments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | Public | Creates a new patient appointment request. |
| `GET` | `/api/appointments?phone={phone}` | Public | Looks up appointment history and live status for a patient by phone number. |
| `GET` | `/api/appointments` | Private (Admin) | Retrieves all patient appointments. |
| `GET` | `/api/appointments/:id` | Private (Admin) | Retrieves specific appointment details by numeric ID. |
| `PUT` | `/api/appointments/:id` | Private (Admin) | Updates appointment status (Confirmed, Rescheduled, Cancelled, Completed) or reschedule date/time. Triggers email notification. |
| `DELETE` | `/api/appointments/:id` | Private (Admin) | Permanently removes an appointment record. |

### Inquiries (`/api/inquiries`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/inquiries` | Public | Submits a new inquiry from the contact form. |
| `GET` | `/api/inquiries` | Private (Admin) | Retrieves all submitted patient inquiries. |
| `DELETE` | `/api/inquiries/:id` | Private (Admin) | Deletes an inquiry record by numeric ID. |

---

## 🛡️ Security Implementations

* **HTTP-Only Cookies**: JWT tokens are transmitted via `httpOnly`, `sameSite: 'strict'`, and SSL-secured cookies in production to mitigate XSS-based token theft.
* **Rate Limiting**: `express-rate-limit` prevents brute-force login and spam requests on API endpoints.
* **Header Protection**: `helmet` manages security headers to prevent common web vulnerabilities.
* **Data Sanitization**: `express-mongo-sanitize` scrubs user inputs to prevent MongoDB NoSQL query injection.
* **XSS Protection**: `xss-clean` sanitizes request payloads against Cross-Site Scripting.
* **Password Hashing**: `bcryptjs` with salt rounds protects stored administrator passwords.

---

## 🌐 Deployment & Production Tips

1. **Production Environment**: Set `NODE_ENV=production` in your `.env` so that cookies enforce `secure: true` (HTTPS).
2. **Reverse Proxy**: When deploying behind Nginx, Apache, or cloud load balancers (Render, Railway, AWS, DigitalOcean), enable `app.set('trust proxy', 1)` if utilizing rate limiting behind a proxy.
3. **Database Backup**: Use MongoDB Atlas automated snapshots or `mongodump` for routine backups of appointments and patient inquiries.
4. **Email SMTP**: Use a dedicated transactional email service (e.g., SendGrid, Brevo, AWS SES, or Gmail App Passwords) in `SMTP_*` variables for high email deliverability.

---

## 📄 License

This project is created for **Vinayak Dental Care**. All rights reserved.
