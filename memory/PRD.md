# iWhistle B2B Partnership Portal — PRD

## Original Problem Statement
Recreate the "iWhistle B2B Partnership Portal" and iteratively add features: JWT auth, partner dashboard, e-signatures, admin dashboard, PDF certificate generation, and refactored file structure.

## Target Audience
- **Partners**: Sports organizations applying for the iWhistle partnership program
- **Admins**: iWhistle internal staff managing partnership applications

## Core Requirements (Static)
1. Public homepage with hero, metrics, pilot program info, partner spotlight
2. JWT-based authentication (Partner & Admin roles)
3. Protected partner dashboard (`/portal`) — view applications, submit new ones, view documents, program details
4. Protected admin dashboard (`/admin`) — manage all applications, update status, export CSV
5. E-signature capture on application form (react-signature-canvas)
6. Signature compliance metadata (IP, timestamp, user agent)
7. PDF certificate generation for signed agreements
8. Email notifications for new submissions (Resend integration — inactive pending API key)
9. Modular, scalable file structure (backend + frontend)

## Tech Stack
- **Frontend**: React, react-router-dom, TailwindCSS, Framer Motion, jspdf, react-signature-canvas, Lucide React
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
│   ├── models.py         # Pydantic models (UserRegister, UserLogin, PartnershipFormData, PartnershipStatusUpdate)
│   ├── routes/
│   │   ├── auth.py       # POST /api/auth/register, /login; GET /api/auth/me
│   │   ├── partners.py   # POST/GET /api/partnerships, POST /api/partnerships/{id}/pdf
│   │   └── admin.py      # GET/PUT/DELETE /api/admin/partnerships, GET /api/admin/stats
│   ├── utils/
│   │   ├── auth.py       # hash_password, verify_password, create_token, get_current_user, require_admin, seed_admin
│   │   └── email.py      # send_new_application_email (inactive without RESEND_API_KEY)
│   └── tests/
│       ├── test_auth_api.py
│       ├── test_phase5_features.py
│       └── test_refactor_complete.py
└── frontend/
    └── src/
        ├── pages/          # Full-page components (default exports)
        │   ├── HomePage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── PartnerDashboard.js
        │   └── AdminDashboard.js
        ├── sections/       # Page section components
        │   ├── AdminDashboard.js   # Re-export shim → pages/AdminDashboard
        │   ├── Hero.js, Navbar.js, Footer.js
        │   ├── PartnershipForm.js, PartnershipOverview.js
        │   ├── PilotProgram.js, SuccessMetrics.js
        │   ├── ContactCTA.js, Documents.js
        ├── components/     # Shared reusable components
        │   ├── ProtectedRoute.js
        │   ├── DocumentViewer.js
        │   ├── SignaturePad.js
        │   ├── ScrollReveal.js
        │   └── ui/         # shadcn components
        ├── context/AuthContext.js
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

## DB Schema
- **users**: `{email, name, organization, password_hash, role, created_at}`
- **partnerships**: `{partnerOrgName, contactName, contactEmail, ..., signature (base64), signature_metadata: {ip_address, user_agent, signed_at}, status, submitted_by, created_at}`

## Test Credentials
- Admin: `admin@i-whistle.com` / `admin123`
- Partner: `test@test.com` / `partner123`

## Known Mocked / Inactive Features
- **Email Notifications**: Resend integration coded but inactive — needs `RESEND_API_KEY` in `backend/.env`

## Completed Work (Chronological)
- [Session 1-4] Initial portal recreation from zip, authentication, partner/admin dashboards, e-signatures, PDF generation, partner spotlight, program details tab
- [Session 5] Full backend + frontend file structure refactoring (2026-03-23)
- [Session 6] Dark Mode Toggle (global, localStorage-persisted), Contact Us Tab in partner portal (MongoDB-backed), Admin Notification Badge + Partner Inquiries panel (2026-03-23)

## Prioritized Backlog

### P1 — High Priority
- **Activate Email Notifications**: User must provide `RESEND_API_KEY` → add to `backend/.env` as `RESEND_API_KEY=<key>`
- **Email contact inquiry notifications**: When a partner submits a contact form, notify admin via email (hook already in place, needs Resend key)

### P2 — Medium Priority
- **Multi-language Support**: i18n for the full application

### P3 — Lower Priority
- **Dark Mode Toggle**: UI toggle to switch themes
- **Contact Us Tab**: Add to partner dashboard — inquiry form that sends message to iWhistle team
- **Logout fix**: Logout currently redirects to `/login` instead of `/` (minor UX bug)
- **Routes consistency**: `routes/partners.py` uses inline `/api/` prefix instead of `prefix=` param (cosmetic, not a bug)
