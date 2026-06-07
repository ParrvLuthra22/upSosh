---
name: project-upsosh
description: upSosh — India-focused curated micro-events platform (run clubs, dinner circles, creator meetups). Monorepo with Next.js 14 frontend and Express+Prisma+PostgreSQL backend.
metadata:
  type: project
---

upSosh is a curated event discovery and booking platform for India targeting intimate micro-events (run clubs, dinner circles, workshops, book clubs).

**Why:** Building a real-world startup for launch.

**Stack:**
- Frontend: Next.js 14, Tailwind, Framer Motion, Zustand auth store, Sonner toasts
- Backend: Express.js, Prisma, PostgreSQL (Neon), JWT auth in httpOnly cookies
- Payments: Razorpay (test mode key in .env)
- Deployment: Backend on Railway (railway.toml), Frontend likely on Vercel
- Email: Resend (`RESEND_API_KEY` — needs to be filled in backend/.env)
- Images: Cloudinary (`CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` — needs to be filled in backend/.env)

**Key routes:**
- `GET /api/events` — list events with filters
- `GET /api/events/:slug` — single event by slug or id
- `GET /api/events/host/mine` — host's own events (auth required)
- `POST /api/bookings` — create booking (sends Resend confirmation email)
- `POST /api/auth/forgot-password` — sends reset email via Resend
- `POST /api/auth/reset-password` — reset with token
- `POST /api/uploads` — Cloudinary image upload
- `POST /api/payments/create-order` / `verify` / `webhook` — Razorpay flow

**What was done in session (2026-06-07):**
- Wired event detail page to real API (was 100% mock)
- Wired host dashboard to real API (was 100% mock)
- Added Google Maps iframe embed on event detail
- Added social sharing (WhatsApp + copy link) on event detail
- Added Resend email for booking confirmations and password resets
- Added Cloudinary for image uploads (replaced disk storage)
- Fixed forgot-password page (was calling non-existent api.resetPassword)
- Fixed reset-password page (was fake setTimeout, now calls real API)
- Added image upload to event creation form (file + URL fallback)
- Added page skeleton loading states

**How to apply:** Reference this for any feature work on upSosh to understand the stack, endpoints, and what's already wired up.
