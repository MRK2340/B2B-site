# iWhistle B2B Partnership Portal — PRD

## Original Problem Statement
Recreate the "iWhistle B2B Partnership Portal" from a local zip file and iteratively add features: JWT auth, partner dashboard, e-signatures, admin dashboard, PDF certificate generation, refactored file structure, dark mode, multi-language i18n, admin reply for contact inquiries, and admin user management panel.

## Target Audience
- **Partners**: Sports organizations applying for the iWhistle partnership program
- **Admins**: iWhistle internal staff managing partnership applications

## Core Requirements (Static)
1. Public homepage with hero, metrics, pilot program info, partner spotlight
2. JWT-based authentication (Partner & Admin roles)
3. Protected partner dashboard (`/portal`) — view applications, submit new ones, view documents, program details, contact us
4. Protected admin dashboard (`/admin`) — manage all applications, update status, export CSV, view/reply to inquiries, manage partner users
5. E-signature capture on application form (react-signature-canvas)
6. Signature compliance metadata (IP, timestamp, user agent)
7. PDF certificate generation for signed agreements
8. Email notifications for new submissions (Resend integration — inactive pending API key)
9. Modular, scalable file structure (backend + frontend) — DONE
10. Dark Mode toggle (persisted in localStorage) — DONE
11. Multi-language support: English & Spanish (i18n) — DONE
12. Admin can reply to partner contact inquiries — DONE
13. Admin user management panel — DONE

## Tech Stack
- **Frontend**: React, react-router-dom, TailwindCSS, Framer Motion, jspdf, react-signature-canvas, Lucide React, i18next, react-i18next
- **Backend**: FastAPI, Pydantic, PyMongo, python-jose, passlib/bcrypt, reportlab
- **Database**: MongoDB (local, DB: `iwhistle_b2b`)
- **3rd Party**: Resend (email, inactive), jspdf (PDF generation)

## Architecture
```
/app/
├── backend/
│   ├── server.py         # Thin entrypoint → imports from main.py
│   ├── main.py           # FastAPI app factory, includes all routers
│   ├── database.py       # MongoDB connection (db object)
│   ├── models.py         # Pydantic models (UserRegister, UserLogin, PartnershipFormData, PartnershipStatusUpdate, ContactInquiry, ContactReply)
│   ├── routes/
│   │   ├── auth.py       # POST /api/auth/register, /login; GET /api/auth/me
│   │   ├── partners.py   # POST/GET /api/partnerships, POST /api/partnerships/{id}/pdf, GET/POST /api/contact
│   │   └── admin.py      # GET/PUT/DELETE /api/admin/partnerships, GET /api/admin/stats, GET/PUT /api/admin/contact, POST /api/admin/contact/{id}/reply, GET /api/admin/users
│   ├── utils/
│   │   ├── auth.py       # hash_password, verify_password, create_token, get_current_user, require_admin, seed_admin
│   │   └── email.py      # send_new_application_email (inactive without RESEND_API_KEY)
│   └── tests/
│       ├── test_auth_api.py
│       ├── test_phase5_features.py
│       ├── test_refactor_complete.py
│       ├── test_new_features.py
│       └── test_i18n_admin_features.py
└── frontend/
    └── src/
        ├── pages/          # Full-page components (default exports)
        │   ├── HomePage.js         # i18n: full coverage (EN/ES)
        │   ├── LoginPage.js        # i18n: full coverage
        │   ├── RegisterPage.js     # i18n: full coverage
        │   ├── PartnerDashboard.js # i18n: tabs, contact tab, dark mode toggle
        │   └── AdminDashboard.js   # i18n: inquiries, users, reply; dark mode toggle
        ├── sections/       # Page section components
        ├── components/
        │   ├── ProtectedRoute.js
        │   ├── DocumentViewer.js
        │   ├── SignaturePad.js
        │   ├── ScrollReveal.js
        │   ├── LanguageSwitcher.js  # EN/ES toggle button
        │   └── ui/
        ├── context/
        │   ├── AuthContext.js    # logout() redirects to '/'
        │   └── ThemeContext.js   # dark mode (localStorage 'iwhistle-theme')
        ├── i18n/
        │   ├── index.js          # i18next init, language detector
        │   └── locales/
        │       ├── en.json        # English translations
        │       └── es.json        # Spanish translations
        ├── data/documentContent.js
        ├── hooks/useCountUp.js, useScrollPosition.js
        └── utils/generateSignedPDF.js
```

## Key API Endpoints
- `GET /api/health` — health check
- `POST /api/auth/register` — partner registration
- `POST /api/auth/login` — login (partner + admin)
- `GET /api/auth/me` — get current user
- `POST /api/partnerships` — submit partnership application
- `GET /api/partnerships` — get logged-in partner's applications
- `POST /api/partnerships/{id}/pdf` — generate PDF certificate
- `GET /api/admin/partnerships` — list all applications (admin)
- `PUT /api/admin/partnerships/{id}/status` — update status (admin)
- `DELETE /api/admin/partnerships/{id}` — delete application (admin)
- `GET /api/admin/stats` — dashboard statistics (admin)
- `GET /api/admin/contact` — list all partner inquiries (admin)
- `PUT /api/admin/contact/{id}/read` — mark inquiry as read (admin)
- `POST /api/admin/contact/{id}/reply` — reply to inquiry (admin)
- `GET /api/admin/users` — list all partner accounts (admin)
- `GET /api/contact` — get logged-in partner's inquiries
- `POST /api/contact` — submit new inquiry (partner)

## DB Schema
- **users**: `{email, name, organization, password_hash, role, created_at}`
- **partnerships**: `{partnerOrgName, contactName, contactEmail, ..., signature (base64), signature_metadata: {ip_address, user_agent, signed_at}, status, submitted_by, created_at}`
- **contact_inquiries**: `{user_email, user_name, organization, category, subject, message, status, reply_text, replied_at, replied_by, created_at}`

## Test Credentials
- Admin: `admin@i-whistle.com` / `admin123`
- Partner: `test@test.com` / `partner123`

## Known Mocked / Inactive Features
- **Email Notifications**: Resend integration coded but inactive — needs `RESEND_API_KEY` in `backend/.env`

## Completed Work (Chronological)
- [Sessions 1-4] Initial portal recreation from zip, authentication, partner/admin dashboards, e-signatures, PDF generation, partner spotlight, program details tab
- [Session 5] Full backend + frontend file structure refactoring (2026-03-23)
- [Session 6] Dark Mode Toggle (global, localStorage-persisted), Contact Us Tab in partner portal (MongoDB-backed), Admin Notification Badge + Partner Inquiries panel (2026-03-23)
- [Session 7] Multi-language i18n (EN/ES) across all pages, Admin reply for contact inquiries, Admin user management panel, Logout redirect to '/' — Full regression tested (2026-04-10)

## Prioritized Backlog

### P1 — High Priority
- **Activate Email Notifications**: User must provide `RESEND_API_KEY` → add to `backend/.env` as `RESEND_API_KEY=<key>`

### P2 — Medium Priority
- (DONE) Multi-language Support

### P3 — Lower Priority
- (DONE) Dark Mode Toggle
- (DONE) Contact Us Tab
- (DONE) Logout redirect fix

### Future / Backlog
- Contact Us in admin: receive email when partner submits inquiry (needs Resend key)
- Pagination for admin partnerships table (currently shows all)
- Partner profile editing (update name, organization)
