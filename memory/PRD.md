# iWhistle B2B Partnership Portal - PRD

## Original Problem Statement
User requested to recreate a B2B site from a GitHub repository (MRK2340/B2B-site). The repository contained files for an iWhistle B2B Partnership Onboarding website - a basketball officiating education platform.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion + shadcn/ui (Radix UI) + jsPDF + React Router
- **Backend**: FastAPI (Python) + MongoDB + ReportLab (server-side PDF)
- **Deployment**: Kubernetes container with supervisor-managed services

## User Personas
- **B2B Partners**: Youth leagues, basketball camps, officiating organizations looking to partner with iWhistle
- **Administrators**: Organization leaders completing partnership agreements
- **Admin Users**: iWhistle staff reviewing and managing partnership applications

## Core Requirements
1. Marketing/landing page showcasing iWhistle's B2B partnership offering
2. Feature overview (AI Rules Engine, Video Training, Mental Wellness, etc.)
3. Pilot Program structure with pricing tiers (Track A & Track B)
4. Success metrics with animated counters
5. Partnership documents download section
6. Interactive partnership agreement form with save/preview/download
7. Contact CTA section
8. Responsive design with mobile navigation

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
- [x] **PDF Generation**: Client-side PDF generation using jsPDF with styled headers, section blocks, signature lines, and proper formatting. Available from both form and preview tabs
- [x] **Admin Dashboard**: Full dashboard at /admin with:
  - Stats cards (Total Applications, Pending Review, Approved, Total Value)
  - Partnership applications table with search and status filter
  - Detail modal with complete partnership information
  - Status management (Pending/Approved/Rejected)
  - Delete functionality with confirmation
  - Back to Site navigation
  - Refresh data capability
- [x] Backend admin APIs: GET /api/admin/partnerships, GET /api/admin/stats, PUT /api/admin/partnerships/{id}/status, DELETE /api/admin/partnerships/{id}
- [x] Form submission to backend with success/error feedback
- [x] Footer link to Admin Dashboard

## Testing Status
- Phase 1: 100% passed (backend, frontend, integration, mobile)
- Phase 2: 100% passed (form validation, PDF generation, admin dashboard, integration)

## Backlog / Future Enhancements
- P1: Server-side PDF generation endpoint (already built, needs frontend integration)
- P2: Email notification on form submission (SendGrid/Resend)
- P2: Admin authentication/login
- P3: Multi-language support
- P3: Dark mode toggle
- P3: Export partnerships to CSV
