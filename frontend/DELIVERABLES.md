# UpSosh Project Deliverables
This directory contains the final deliverables for the UpSosh launch package.

## 1. Project Overview
UpSosh is a premium event discovery platform built with Next.js, Tailwind CSS, and GSAP. It features a dual-mode interface (Formal/Informal), immersive 3D interactions, and a seamless booking flow.

## 2. Features Checklist
- [x] **Dual Mode Toggle**: Switch between Formal and Informal event themes.
- [x] **Event Discovery**: Search, filter by price/date/type, and view event details.
- [x] **Booking System**: Add to cart, manage quantities, and checkout with mock payment.
- [x] **Superhost Program**: Dedicated landing page for host verification.
- [x] **Dark Mode**: System-aware dark mode with manual toggle.
- [x] **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- [x] **SEO & Accessibility**: Metadata, structured data, and keyboard navigation.

## 3. Technical Implementation
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design tokens.
- **Animations**: GSAP for scroll and entrance animations.
- **3D**: Spline for hero interaction.
- **State**: Zustand for global cart and booking state.

## 4. Visual Fidelity
- **Glassmorphism**: Consistent use of backdrop blur and translucent surfaces.
- **Typography**: "Outfit" for headings, "Inter" for body text.
- **Colors**:
    - Primary: Violet/Purple gradients.
    - Surface: Dark/Light variants with subtle borders.

## 5. Known Limitations
- **Mock Data**: Events are currently loaded from a mock API (`json-server`).
- **Payment**: Stripe integration is simulated (`mockPayment.ts`).
- **3D Assets**: Using placeholder Spline scenes; requires custom export for production.

## 6. Future Enhancements
- **Real Backend**: Integrate Supabase or Node.js backend.
- **User Auth**: Implement real user authentication.
- **Live Payments**: Connect Stripe API.
- **Map View**: Add interactive map for event locations.

## 7. Handover Instructions
1.  **Unzip** the project file.
2.  **Install dependencies**: `npm install`.
3.  **Start development**: `npm run dev` & `npm run mock:api`.
4.  **Review Documentation**: See `README.md` and `docs/` folder.
