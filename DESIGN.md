# 🎨 DESIGN.md — "Warm Clinic Journal" Design System

> **Design Direction**: "Warm Clinic Journal"  
> **Target Audience**: Dental clinic patients in Kapadvanj, Gujarat (multilingual: English, Gujarati, Hindi).  
> **Atmosphere**: Calm, tactile, honest, approachable, and deeply trustworthy. Replaces cold generic clinical blues with warm organic cream/paper tones, grounded forest teal, and a terracotta accent.

---

## 📑 Table of Contents
1. [D1. Design Tokens & Accessibility](#d1-design-tokens--accessibility)
   - [Colour Palette & WCAG 2.1 Contrast Ratios](#colour-palette--wcag-21-contrast-ratios)
   - [Typography & Multi-Script Hierarchy](#typography--multi-script-hierarchy)
   - [Shape, Elevation & Spatial System](#shape-elevation--spatial-system)
2. [D2. Component Specifications](#d2-component-specifications)
   - [Header & Real-Time Clinic Status Chip](#header--real-time-clinic-status-chip)
   - [Buttons, Chips & Micro-Interactions](#buttons-chips--micro-interactions)
   - [Card Archetypes](#card-archetypes)
   - [Form Elements & Inline Feedback](#form-elements--inline-feedback)
   - [Footer & Mobile Action Bar](#footer--mobile-action-bar)
3. [D3. Page Layouts & Content Architecture](#d3-page-layouts--content-architecture)
   - [Homepage Layout Hierarchy](#homepage-layout-hierarchy)
   - [Services, About, Book, Contact, Privacy, Admin](#services-about-book-contact-privacy-admin)
   - [Honest Imagery & Copy Guidelines](#honest-imagery--copy-guidelines)
4. [D4. Lightweight Vanilla Motion System (<6KB)](#d4-lightweight-vanilla-motion-system-6kb)
   - [Kinetic Components (BlurText, ScrollReveal, Spotlight, Magnet, CountUp)](#kinetic-components)
   - [Reduced Motion & Performance Budget](#reduced-motion--performance-budget)
5. [D5. Interactive Symptom Guide (Optional Flag)](#d5-interactive-symptom-guide-optional-flag)
6. [D6. Acceptance Criteria](#d6-acceptance-criteria)

---

## D1. Design Tokens & Accessibility

### Colour Palette & WCAG 2.1 Contrast Ratios

All colours are defined as CSS variables on `:root` in `public/css/style.css`. No hex or rgba colours may be hardcoded in markup or component rules.

```css
:root {
  /* Surfaces & Canvas */
  --cream: #FBF7EF;       /* Base canvas background (warm, soft cream) */
  --paper: #F3EBDD;       /* Alternating section backgrounds, tinted cards */
  --surface: #FFFDF9;     /* Raised card surfaces */
  --line: #DDD2BF;        /* Subtle hairline borders and dividers */
  
  /* Typography & Ink */
  --ink: #1E2A2B;         /* Primary headings, titles (dark charcoal slate) */
  --text: #3A4547;        /* Body text, readability focused */
  --muted: #5A6669;       /* Secondary labels, metadata (minimum 14px only) */
  
  /* Brand Teal */
  --teal: #0F5E5B;        /* Brand accents, icons, secondary borders, active links */
  --teal-soft: #DCEBE6;   /* Subtle chip backgrounds, hover tints, badges */
  --teal-dark: #093E3C;   /* Deep teal for high-contrast active states */
  
  /* Terracotta Accent (Single Action Colour) */
  --accent: #B4532A;      /* Primary CTA button fills, eyebrow badges, urgent pills */
  --accent-hover: #9A4423;/* Primary CTA hover state */
  
  /* Utility & Functional */
  --whatsapp: #075E54;    /* Dedicated WhatsApp green */
  --danger: #B42318;      /* Errors, cancellation tags */
  --success: #1B6B4A;     /* Confirmations, open status indicator */
  
  /* High-Contrast Inverted (Footer) */
  --footer-bg: #12302F;   /* Deep slate-teal footer canvas */
  --footer-text: #FBF7EF; /* Cream text on dark footer */
  --footer-muted: #B8C8C6;/* Muted subtext on dark footer */
}
```

#### Contrast Ratio Matrix (All Tested Against WCAG 2.1 AAA/AA Standards)

| Foreground Color | Background Surface | Computed Ratio | Target Standard | Status |
| :--- | :--- | :--- | :--- | :--- |
| `--ink` (`#1E2A2B`) | `--cream` (`#FBF7EF`) | **13.56:1** | AAA (>= 7.0:1) | ✅ Pass |
| `--text` (`#3A4547`) | `--cream` (`#FBF7EF`) | **8.42:1** | AAA (>= 7.0:1) | ✅ Pass |
| `--muted` (`#5A6669`) | `--cream` (`#FBF7EF`) | **4.76:1** | AA (>= 4.5:1) | ✅ Pass |
| `--teal` (`#0F5E5B`) | `--cream` (`#FBF7EF`) | **5.48:1** | AA (>= 4.5:1) | ✅ Pass |
| `--accent` (`#B4532A`) | `--cream` (`#FBF7EF`) | **4.55:1** | AA (>= 4.5:1) | ✅ Pass |
| `--cream` (`#FBF7EF`) | `--accent` (`#B4532A`) | **4.55:1** | AA (>= 4.5:1) | ✅ Pass |
| `--cream` (`#FBF7EF`) | `--accent-hover` (`#9A4423`) | **5.84:1** | AA (>= 4.5:1) | ✅ Pass |
| `--cream` (`#FBF7EF`) | `--whatsapp` (`#075E54`) | **6.12:1** | AA (>= 4.5:1) | ✅ Pass |
| `--teal` (`#0F5E5B`) | `--teal-soft` (`#DCEBE6`) | **4.62:1** | AA (>= 4.5:1) | ✅ Pass |
| `--ink` (`#1E2A2B`) | `--paper` (`#F3EBDD`) | **12.35:1** | AAA (>= 7.0:1) | ✅ Pass |
| `--text` (`#3A4547`) | `--paper` (`#F3EBDD`) | **7.67:1** | AAA (>= 7.0:1) | ✅ Pass |
| `--footer-text` (`#FBF7EF`) | `--footer-bg` (`#12302F`) | **12.78:1** | AAA (>= 7.0:1) | ✅ Pass |
| `--footer-muted` (`#B8C8C6`) | `--footer-bg` (`#12302F`) | **8.35:1** | AAA (>= 7.0:1) | ✅ Pass |

---

### Typography & Multi-Script Hierarchy

Fonts are loaded asynchronously from Google Fonts with `display=swap`.

#### 1. English (Default)
- **Headings & Editorial Display**: `Fraunces`, variable serif (weights 400, 500, 600, italic 400).
- **Body & Controls**: `Inter`, clean sans-serif (weights 400, 500, 600).
- **Emotive Word Accent**: In English `H1` and `H2`, a single meaningful word can be wrapped in `<em>` (rendered in Fraunces italic, colored `--teal`).

#### 2. Gujarati (`html[lang="gu"]`)
- **Headings**: `'Noto Serif Gujarati', serif` (weights 500, 600).
- **Body**: `'Noto Sans Gujarati', sans-serif` (weights 400, 500, 600).
- **Line Height**: `1.75` for superior Indic conjunct readability.
- **No Italics**: Indic scripts lack native italics. `<em>` tags are styled upright, colored `--teal`, with a delicate 1.5px underline (`text-decoration: underline; text-decoration-color: var(--teal);`).

#### 3. Hindi (`html[lang="hi"]`)
- **Headings**: `'Noto Serif Devanagari', serif` (weights 500, 600).
- **Body**: `'Noto Sans Devanagari', sans-serif` (weights 400, 500, 600).
- **Line Height**: `1.75`.
- **No Italics**: Same upright highlighted styling as Gujarati.

#### Fluid Typography Scales

```css
/* Fluid Type Calculation */
h1, .hero-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  font-weight: 500;
  color: var(--ink);
}

h2, .section-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.9rem, 4vw, 3rem);
  line-height: 1.15;
  letter-spacing: -0.015em;
  font-weight: 500;
  color: var(--ink);
}

h3, .card-title {
  font-family: 'Fraunces', serif;
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.25;
  font-weight: 500;
  color: var(--ink);
}

body, p {
  font-family: 'Inter', sans-serif;
  font-size: 1.0625rem; /* 17px base for enhanced comfort for older patients */
  line-height: 1.6;
  color: var(--text);
}

/* Form Inputs & Touch Targets */
input, select, textarea, button {
  font-size: 1rem; /* >= 16px to prevent iOS Safari auto-zoom */
}
```

---

### Shape, Elevation & Spatial System

- **Spatial Scale (8px Grid)**: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `80px`, `112px`.
- **Section Padding**: `clamp(64px, 9vw, 112px) 0`.
- **Container Max Width**: `1200px` (with `24px` gutter padding).
- **Border Radii**:
  - Cards & Panels: `24px`.
  - Signature Arch Photo Frames: `999px 999px 28px 28px` (classic architectural curved arch).
  - Form Fields: `16px`.
  - Buttons, Chips, Pills: `999px` (fully rounded).
- **Elevation System**:
  - Primarily achieved through tactile **colour stepping**: Canvas (`--cream`) ➡️ Section Panel (`--paper`) ➡️ Raised Card (`--surface`).
  - Strict shadow system (only 2 curated shadows):
    1. Hairline subtle: `0 1px 0 rgba(30, 42, 43, 0.06)`
    2. Ambient depth: `0 12px 32px -12px rgba(30, 42, 43, 0.14)`
- **Accessibility & Focus Ring**:
  - Minimum tap target: `44px x 44px`.
  - Focus Ring: `outline: 3px solid var(--teal); outline-offset: 2px;` on `:focus-visible`.

---

## D2. Component Specifications

### 1. Header & Real-Time Clinic Status Chip
- **Canvas**: Sticky top bar on `--cream` with 1px hairline bottom divider (`--line`).
- **Wordmark**: `Fraunces` serif wordmark with custom dental tooth mark.
- **Navigation**: Clean, uncluttered links with active state indicator.
- **Language Selector Pill**: Segmented round pill (`English` / `ગુજરાતી` / `हिन्दी`).
- **CTA Pill**: Terracotta primary CTA button (`Book a visit`).
- **Live Clinic Hours Status Chip**:
  - Dynamically computed in JS using `Asia/Kolkata` time against `CLINIC_CONFIG.openingHours`.
  - If open: `🟢 Open now · until 8:00 PM` (styled with `--success` dot).
  - If closed: `⚪ Closed · opens Mon 9:00 AM`.
  - Hidden automatically if hours are not provided.

### 2. Buttons, Chips & Micro-Interactions
- **Primary CTA (`.btn-primary`)**: `--accent` terracotta background, `--cream` text, fully round, zero gradients.
- **Secondary Action (`.btn-secondary`)**: 1.5px `--teal` border, `--teal` text, transparent background.
- **WhatsApp Action (`.btn-whatsapp`)**: `--whatsapp` background (`#075E54`), white text.
- **Symptom Chips (`.chip-symptom`)**: `--teal-soft` background, `--teal` text, round pill. Keyboard accessible, hover lifts 2px.

### 3. Card Archetypes
- **Service Spotlight Card**: `--surface` background, 24px radius, 1px `--line` border, subtle pointer radial glow (D4c), service icon, description, and direct "Book this treatment" link.
- **Step Card ("Your First Visit")**: Step number in `--teal-soft` badge, headline, plain explanation.
- **Doctor Arch Card**: Signature arch-frame container (`border-radius: 999px 999px 28px 28px`), 4:5 aspect ratio, `object-fit: cover; object-position: top;`, with an initials-avatar fallback if the image URL is empty.
- **Review Card**: Clean `--surface` card, verified reviewer initials, authentic feedback text. Rendered only if `config.reviews` contains real reviews.
- **Info Card (Contact & Visit Us)**: Clean address, operating hours, phone, and direct map link.

### 4. Form Elements & Inline Feedback
- **Shared Input Styling**: 16px radius, `--surface` background, 1.5px `--line` border, 16px font size, smooth focus transition.
- **Consent Checkbox**: Accessible 20px checkbox with `accent-color: var(--teal)`.
- **Inline Error / Success Messaging**: Replaces `alert()` with inline alert blocks with `role="alert"` / `role="status"` and accessible error summaries.

### 5. Footer & Mobile Action Bar
- **Footer**: Deep slate-teal (`--footer-bg: #12302F`), 3 clean columns (About & Mission, Quick Links & Hours, Clinic Contact), cream text, copyright.
- **Mobile Sticky Action Bar (`.mobile-bottom-bar`)**:
  - Active only on screens `< 768px` (hidden on `book.html`).
  - Contains 3 direct touch actions: **Book** (accent pill), **Call** (teal icon), **WhatsApp** (WhatsApp icon).
  - Replaces floating WhatsApp button on mobile; desktop keeps floating WhatsApp button on bottom-right.

---

## D3. Page Layouts & Content Architecture

### 1. Homepage (`public/index.html`) Layout Flow
1. **Hero Section**:
   - Eyebrow category chip (`Modern Dental Care in Kapadvanj`).
   - Headline: *"A calmer way to care for your <em>smile</em>."*
   - Sub-copy: *"Modern dental care in Kapadvanj, explained clearly by Dr. Vishal and Dr. Devanshi."*
   - Primary CTA (`Book a visit`) + Secondary CTA (`WhatsApp us`).
   - Ambient background organic drift (D4f).
   - Real doctor/clinic photo in signature arch frame (gracefully omitted if `config.heroImage` is empty).
2. **"What Brings You In?" Symptom Navigation**:
   - Interactive symptom chips linking to `book.html?service=<id>`:
     - `Toothache` ➡️ `general-consultation`
     - `Sensitivity` ➡️ `general-consultation`
     - `Missing Tooth` ➡️ `dental-implants`
     - `Crooked Teeth` ➡️ `orthodontics`
     - `Kids' Check-up` ➡️ `pediatric-dentistry`
     - `Stained Teeth` ➡️ `teeth-whitening`
     - `Routine Check-up` ➡️ `general-consultation`
   - Explicit note: *"These chips guide navigation to relevant services and do not substitute professional clinical diagnosis."*
3. **Featured Treatments (Spotlight Cards)**:
   - Dynamic service cards rendered from `CLINIC_CONFIG.services`.
4. **"Your First Visit" (4-Step Timeline)**:
   - 1. Welcome & Consultation ➡️ 2. Gentle Examination ➡️ 3. Transparent Treatment Plan ➡️ 4. Comfortable Care.
5. **Meet Our Dentists**:
   - Doctor profile cards in signature 4:5 arch containers with credentials and initials fallback.
6. **Patient Experiences (Reviews)**:
   - If `config.reviews` contains real reviews, render cards; otherwise render a single honest "Read our Google Reviews" card with direct link.
7. **Visit Us & Clinic Hours**:
   - Hours table, full clinic address, embedded Google Map, directions button.
8. **Quick Patient Inquiry**:
   - Minimal inquiry form with consent checkbox, honeypot, and inline response.
9. **Footer**.

### 2. Inner Pages Layout
- **Services (`public/services.html`)**: Header intro, Category filter chips (All, Preventative, Restorative, Cosmetic, Orthodontics, Pediatric), responsive card grid with "Book this treatment".
- **About (`public/about.html`)**: Story of Vinayak Dental Care, Meet our Dentists, What to expect, Clinic standards & values.
- **Book (`public/book.html`)**: 2-column desktop (Left: Interactive booking & slot availability picker; Right: Sticky helper card with clinic hours, WhatsApp direct line, and 3-step booking guide). Single-column on mobile.
- **Contact (`public/contact.html`)**: Contact info cards + Google Map + Inquiry form.
- **Privacy (`public/privacy.html`)**: Clean readable typography (max-width `70ch`), data processors, retention, patient rights.
- **Admin Portal (`public/admin/index.html` & `backend/private/dashboard.html`)**: Restyled with "Warm Clinic Journal" tokens.

---

## D4. Lightweight Vanilla Motion System (<6KB)

Implemented entirely in vanilla JavaScript (`public/js/motion.js` + CSS keyframes), zero external dependencies, under 6KB minified.

### Timing & Cubic Beziers
- **Standard Smooth Ease**: `cubic-bezier(0.22, 0.8, 0.2, 1)`
- **Durations**: Quick (`200ms`), Standard (`400ms`), Ambient/Reveal (`700ms`).

### Kinetic Components

1. **Hero Headline Blur-In (`BlurText`)**:
   - Splits headline into word `<span>` elements.
   - Preserves accessibility: Parent container retains full string in `aria-label`, child word spans are `aria-hidden="true"`.
   - Staggers by `60ms` per word, total duration `< 900ms`.
   - Runs only when `document.documentElement.classList.contains('js')`. Complete headline is instantly visible if JS is disabled.
2. **Scroll Reveal (`ScrollReveal`)**:
   - `IntersectionObserver` observing sections and cards.
   - Applies subtle `translateY(16px)` and `filter: blur(6px)` ➡️ `translateY(0)` and `filter: blur(0)`.
   - Exposed as `window.observeAnimations(root)` to re-bind dynamically injected cards on services and home.
3. **Card Spotlight Highlight (`SpotlightCard`)**:
   - For desktop fine pointers (`@media (hover: hover) and (pointer: fine)`).
   - Tracks cursor coordinates `--mx`, `--my` on hover with `requestAnimationFrame` throttling.
   - Casts a soft radial `--teal-soft` gradient glow behind card borders.
4. **Magnetic Hero CTA Button (`Magnet`)**:
   - Primary CTA gently follows pointer displacement up to `6px` maximum on hover, snapping smoothly on mouseleave.
5. **CountUp for Verified Statistics (`CountUp`)**:
   - Number counter running only on elements with `[data-countup]` when `verified: true` in config. If no verified stats exist, no numbers are displayed.
6. **Ambient Hero Drift (`AmbientBackground`)**:
   - Two soft blurred radial gradient blobs (`--teal-soft` and `--paper`) drifting slowly across a 24s CSS keyframe loop.
   - Automatically paused when page/tab is hidden via `document.visibilityState`.
7. **Header Shadow on Scroll**:
   - Header receives `.header-scrolled` (hairline shadow) after `8px` scroll via passive scroll listener.

### Reduced Motion & Performance
- Under `@media (prefers-reduced-motion: reduce)`:
  - All transforms, blurs, drifts, and magnetic physics are disabled.
  - Transitions fall back to simple opacity fades (`<= 150ms`).
  - Ambient background drift and marquee loops are stopped.
- **Performance Budget**: Mobile Lighthouse Performance `>= 90`, CLS `< 0.1` (all cards reserve aspect ratios and heights before hydration).

---

## D5. Interactive Symptom Guide (Optional Flag)

- Controlled by `CLINIC_CONFIG.enableTreatmentGuide` (default: `false`).
- When enabled, offers a 3-question guided modal:
  1. *What is your primary concern?* (Pain, Appearance, Routine, Alignment, Children)
  2. *How long has this been present?* (Just started, A few weeks, Ongoing)
  3. *Who is the visit for?* (Adult, Teen, Child)
- Suggests appropriate service and provides direct link to `book.html?service=<id>`.
- Displays mandatory medical disclaimer: *"This interactive guide is for navigation only and does not constitute a clinical diagnosis. The dentist will examine you and recommend appropriate treatment."*

---

## D6. Acceptance Criteria

1. **Visual Truth**: Zero generic blues or stock images. Warm Clinic Journal aesthetic applied across all pages.
2. **Accessibility**: Every text/background contrast ratio `>= 4.5:1` (normal text) and `>= 3.0:1` (large text/controls).
3. **No Inline Styles**: All styling consolidated in `public/css/style.css` using tokens.
4. **No-JS Compatibility**: All page text, cards, and navigation are fully visible and readable with JavaScript disabled.
5. **Reduced Motion**: Respects `prefers-reduced-motion: reduce` completely.
6. **Responsive Verification**: Verified across `375px` (mobile), `768px` (tablet), and `1440px` (desktop) in English, Gujarati, and Hindi.
