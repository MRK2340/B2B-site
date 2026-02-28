# iWhistle B2B Partnership Portal - PRD

## Original Problem Statement
User requested to recreate a B2B site from a GitHub repository (MRK2340/B2B-site). The repository contained files for an iWhistle B2B Partnership Onboarding website - a basketball officiating education platform.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion + shadcn/ui (Radix UI) + jsPDF + React Router
- **Backend**: FastAPI (Python) + MongoDB + ReportLab (server-side PDF) + python-jose (JWT) + passlib (bcrypt) + resend
- **Deployment**: Kubernetes container with supervisor-managed services

## User Personas
- **B2B Partners**: Youth leagues, basketball camps, officiating organizations looking to partner with iWhistle
- **Admin Users**: iWhistle staff reviewing and managing partnership applications

## Routes
- `/` - Public homepage (basic info + login/register CTAs)
- `/login` - Login page
- `/register` - Partner registration page
- `/portal` - Protected partner portal (all site sections, requires login)
- `/admin` - Protected admin dashboard (requires admin role)

## Auth
- JWT-based authentication (python-jose, passlib/bcrypt)
- Two roles: `admin` and `partner`
- Admin seed: admin@i-whistle.com / admin123
- Token stored in localStorage as `iwhistle_token`
- Protected routes via `ProtectedRoute` component with `adminOnly` prop

## Core Requirements
1. Marketing/landing page showcasing iWhistle's B2B partnership offering (gated behind login)
2. Feature overview (AI Rules Engine, Video Training, Mental Wellness, etc.)
3. Pilot Program structure with pricing tiers (Track A & Track B)
4. Success metrics with animated counters
5. Partnership documents with inline viewing and PDF download
6. Interactive partnership agreement form with validation, save/preview/download
7. Contact CTA section
8. Admin dashboard for managing partnership applications
9. Responsive design with mobile navigation

## What's Been Implemented

### Phase 1 - Site Recreation (Jan 2026)
- [x] Full-stack React + FastAPI application
- [x] Navbar with scroll-aware sticky behavior + mobile hamburger menu
- [x] Hero section with gradient animation + hero image + CTAs
- [x] Partnership Overview with 6 feature cards and hover animations
- [x] Pilot Program with Track A/B pricing cards + investment scenarios table
- [x] Success Metrics with animated count-up counters (4 metrics)
- [x] Documents section (4 document cards) with dark theme
- [x] Partnership Agreement Form with Fill Form/Preview tabs
- [x] Form saves to localStorage + generates downloadable agreement
- [x] Contact CTA with gradient background
- [x] Footer with quick links, resources, contact info
- [x] Backend API: health check, partnership CRUD endpoints
- [x] MongoDB integration for partnership form submissions
- [x] Scroll-reveal animations using Framer Motion

### Phase 2 - Feature Enhancements (Jan 2026)
- [x] **Form Validation**: Inline error messages for all required fields, email/phone format validation, date ordering, min officials (10), price validation, validation summary banner, auto-scroll to first error
- [x] **PDF Generation**: Client-side PDF generation using jsPDF with styled headers, section blocks, signature lines, and proper formatting
- [x] **Admin Dashboard**: Full dashboard at /admin with stats cards, partnerships table, detail modal, status management, search/filter, delete functionality
- [x] Backend admin APIs for partnership management

### Phase 3 - Inline Document Viewer (Jan 2026)
- [x] **Document Viewer**: Slide-in panel from right with backdrop blur overlay
- [x] **Full Content**: Complete legal content for all 4 documents (Pilot Program Agreement 12 sections, DPA 9 sections, TOS 12 sections, Privacy Policy 11 sections)
- [x] **Navigation**: Sticky header with scrollable TOC pills that highlight active section
- [x] **Actions**: Print button, PDF download button, close button in viewer header
- [x] **Formatting**: Section headings, subsections with blue left border, clean typography
- [x] **UX**: Back-to-top button, smooth scrolling, responsive design (desktop/tablet/mobile)
- [x] **Download**: Direct PDF download from card without opening viewer
- [x] Documents include GDPR, CCPA, encryption, data retention, breach notification content

### Phase 4 - Authentication, Gated Portal & CSV Export (Feb 2026)
- [x] **Public Homepage**: New `/` route with about section, key selling points, stats, login/register CTAs
- [x] **JWT Authentication**: python-jose + passlib/bcrypt, 24hr tokens, stored in localStorage
- [x] **Two-Role Auth**: `admin` and `partner` roles with role-based access control
- [x] **Login Page**: Email/password form at `/login` with error handling, password toggle
- [x] **Register Page**: Partner registration at `/register` with name, org, email, password + strength indicator
- [x] **Protected Routes**: `ProtectedRoute` component redirects unauthenticated to `/login`, non-admin to `/portal`
- [x] **Gated Portal**: All site content moved to `/portal`, requires authentication
- [x] **Auth-aware Navbar**: Shows user name, logout button, and Admin link for admin users
- [x] **Admin Dashboard Protection**: All admin API endpoints require admin JWT token
- [x] **CSV Export**: "Export CSV" button in admin dashboard generates and downloads partnership data
- [x] **Email Notifications**: Resend integration ready (silent no-op when RESEND_API_KEY not set)
- [x] Admin seed user created on startup

### Phase 5 - Partner Dashboard, Spotlight & E-Signature (Feb 2026)
- [x] **Partner Dashboard**: Complete dashboard at `/portal` with sidebar navigation replacing scrollable portal
  - Overview tab: Welcome card, 4 stats cards, 3 quick action cards
  - My Applications tab: Table of user's applications with status badges + detail modal + empty state
  - Documents tab: 4 document cards with View (DocumentViewer) and Download buttons
  - Apply tab: Full partnership form embedded in dashboard
- [x] **Partner Application Status Tracking**: Real-time status from backend in My Applications tab
- [x] **Partner Spotlight Section**: 3 testimonial cards on public homepage with star ratings, quotes, metrics
- [x] **In-App Signature Pad**: react-signature-canvas drawn signature added to partnership form
  - Required validation before submission
  - Signature stored as base64 PNG in database
  - Displayed in application detail modal
- [x] **Mobile Dashboard**: Bottom navigation bar for mobile + slide-out sidebar
- [x] **Backend**: GET /api/partnerships now returns `id` field + signature field in PartnershipFormData
- Phase 1: 100% passed
- Phase 2: 100% passed
- Phase 3: 100% passed
- Phase 4: 100% passed (16/16 features, minor logout redirect bug fixed)

## API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - Partner registration
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user (auth required)
- `POST /api/partnerships` - Submit partnership application (auth required)
- `GET /api/partnerships` - Get user's own applications (auth required)
- `GET /api/admin/partnerships` - Get all applications (admin required)
- `PUT /api/admin/partnerships/{id}/status` - Update status (admin required)
- `DELETE /api/admin/partnerships/{id}` - Delete application (admin required)
- `GET /api/admin/stats` - Dashboard stats (admin required)
- `POST /api/partnerships/{id}/pdf` - Generate PDF (auth required)

## DB Schema
### users
`{ name, organization, email, password_hash, role, created_at }`

### partnerships
`{ partnerOrgName, partnerEntityType, partnerState, partnerAddress, partnerCity, partnerZip, contactName, contactTitle, contactEmail, contactPhone, termStructure, startDate, endDate, numOfficials, orgType, championName, championTitle, championEmail, championPhone, signerName, signerTitle, signatureDate, perUserRate, pilotDiscount, created_at, status, submitted_by }`

## Environment Variables
### backend/.env
- `MONGO_URL` - MongoDB connection string
- `DB_NAME` - Database name
- `SECRET_KEY` - JWT signing secret
- `RESEND_API_KEY` - Resend API key (empty = email notifications disabled)
- `SENDER_EMAIL` - From email for notifications
- `ADMIN_NOTIFICATION_EMAIL` - Admin email for new submission alerts

## Backlog / Future Enhancements
- P1: Activate Resend email notifications (need RESEND_API_KEY from user)
- P1: Real-time Chat Widget for instant partner support
- P2: E-Signature metadata (timestamp, IP) for legal compliance
- P3: Program details tabs in dashboard (PilotProgram, SuccessMetrics sections)
- P3: Multi-language support
- P3: Dark mode toggle
