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

## Testing Status
- Phase 1: 100% passed (backend, frontend, integration, mobile)
- Phase 2: 100% passed (form validation, PDF generation, admin dashboard)
- Phase 3: 100% passed (document viewer, responsive design, UX, content quality)

## Backlog / Future Enhancements
- P1: Admin authentication/login to protect dashboard
- P2: Email notification on form submission (SendGrid/Resend)
- P2: Export partnerships to CSV from admin
- P3: Multi-language support
- P3: Dark mode toggle
