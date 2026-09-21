# Vinayak Dental Care — Clinic Owner Action Items (TODO)

Welcome to the newly upgraded **Vinayak Dental Care** platform. To finalize your live clinic deployment and replace all temporary placeholders with your authentic details, please review and complete the checklist below.

---

## 1. Clinic Contact & Communication (`public/js/config.js`)
Open `public/js/config.js` and provide your real contact details:

- [ ] **`clinicPhone`**: Formatted phone number displayed across the website (e.g. `"+91 98765 43210"`).
- [ ] **`clinicPhoneRaw`**: Raw phone format used for tap-to-call links (e.g. `"+919876543210"`).
- [ ] **`whatsappNumber`**: WhatsApp number with country code, digits only (e.g. `"919876543210"`).
  - *Note:* If left blank, WhatsApp buttons and floating actions automatically hide so patients are not sent to broken links.
- [ ] **`clinicEmail`**: Clinic reception email (e.g. `"contact@vinayakdentalcare.com"`).
- [ ] **`mapUrl`**: Direct link to your Google Maps clinic listing.
- [ ] **`mapEmbedUrl`**: Google Maps iframe embed URL for the Contact page map.
- [ ] **`reviewUrl`**: Direct Google Business review link (e.g. `https://g.page/r/.../review`).
- [ ] **`instagramUrl`**: Clinic Instagram page link.

---

## 2. Doctor Profiles & Photography
- [ ] **Doctor Portraits**:
  - Save real high-resolution photos of Dr. Vishal and Dr. Devanshi in `public/images/` (e.g. `public/images/dr-vishal.webp`).
  - Update `image: "/images/dr-vishal.webp"` in `public/js/config.js`.
  - *(The website currently displays initials badges "DV" and "DD" until real photos are supplied).*
- [ ] **Doctor Credentials & Specializations**:
  - Review degrees and roles in `doctorsList` in `public/js/config.js` to match exact licenses and dental council registrations.

---

## 3. Patient Reviews & Clinical Cases
- [ ] **Google Reviews**:
  - Add verified patient reviews to the `reviews` array in `public/js/config.js`.
  - Set `reviewsAreVerified: true` once authentic reviews are populated.
- [ ] **Before/After Clinical Photography**:
  - Add real patient-consented case studies before publishing clinical transformation galleries.

---

## 4. Multi-Language Translations (`public/js/i18n.js`)
- [ ] **Native Language Review**:
  - Have a native Gujarati and Hindi speaker review the translated treatment names and instructions in `public/js/i18n.js` to align with local terminology preferred in Kapadvanj.

---

## 5. Deployment & Vercel Environment Configuration
Configure these environment variables in your **Vercel Project Dashboard** (`Settings` -> `Environment Variables`):

| Variable Name | Description | Example / Rule |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| `JWT_SECRET` | Strong cryptographic secret | At least 32 random characters (never use defaults) |
| `ADMIN_EMAIL` | Administrator login email | e.g. `admin@vinayakdentalcare.com` |
| `ADMIN_PASSWORD` | Administrator login password | Strong password, minimum 10 characters |
| `SMTP_HOST` | *(Optional)* SMTP mail server | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional)* SMTP port | `587` |
| `SMTP_USER` | *(Optional)* SMTP username | e.g. `admin@vinayakdentalcare.com` |
| `SMTP_PASS` | *(Optional)* SMTP App Password | Generated Google App Password |
| `EMAIL_FROM` | *(Optional)* Outgoing email display | `"Vinayak Dental Care" <admin@vinayakdentalcare.com>` |

---

## 6. Seeding Admin Account in MongoDB Atlas
After configuring your environment variables in `.env` locally or in Vercel:

1. **Seed initial admin account:**
   ```bash
   npm run seed
   ```
2. **Reset existing admin password at any time:**
   ```bash
   npm run seed:reset
   ```
3. **Login to Admin Portal:**
   - Navigate to `/admin/index.html` on your live site.
   - Enter your `ADMIN_EMAIL` and `ADMIN_PASSWORD` to access the clinic dashboard (`/dashboard.html`).
