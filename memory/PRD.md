# iWhistle B2B Partnership Portal - PRD

## Original Problem Statement
User requested to recreate a B2B site from a GitHub repository (MRK2340/B2B-site). The repository contained files for an iWhistle B2B Partnership Onboarding website - a basketball officiating education platform.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion + shadcn/ui components (Radix UI)
- **Backend**: FastAPI (Python) + MongoDB
- **Deployment**: Kubernetes container with supervisor-managed services

## User Personas
- **B2B Partners**: Youth leagues, basketball camps, officiating organizations looking to partner with iWhistle
- **Administrators**: Organization leaders completing partnership agreements
- **Decision Makers**: Evaluating pilot programs and pricing

## Core Requirements
1. Marketing/landing page showcasing iWhistle's B2B partnership offering
2. Feature overview (AI Rules Engine, Video Training, Mental Wellness, etc.)
3. Pilot Program structure with pricing tiers (Track A & Track B)
4. Success metrics with animated counters
5. Partnership documents download section
6. Interactive partnership agreement form with save/preview/download
7. Contact CTA section
8. Responsive design with mobile navigation

## What's Been Implemented (Jan 2026)
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

## Testing Status
- Backend: 100% passed
- Frontend: 100% passed
- Integration: 100% passed
- Mobile Responsive: 100% passed

## Backlog / Future Enhancements
- P1: Actual PDF document generation (currently text file download)
- P1: Form validation with error messages
- P2: Admin dashboard to view submitted partnerships
- P2: Email notification on form submission
- P3: Multi-language support
- P3: Dark mode toggle
