# Integration Guide

This document outlines how to transition SwitchUp from a mock environment to a fully integrated production application.

## 1. Backend Integration

Currently, the application uses `json-server` to mock API responses. To integrate a real backend (e.g., Supabase, Firebase, or a custom Node.js server):

1.  **Update API Client**:
    Modify `src/lib/api.ts` to point to your real API endpoints.
    ```typescript
    // src/lib/api.ts
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com';
    ```

2.  **Authentication**:
    - Replace the mock user state in `bookingStore.ts` with a real auth provider.
    - Recommended: [Supabase Auth](https://supabase.com/docs/guides/auth) or [NextAuth.js](https://next-auth.js.org/).

3.  **Database Schema**:
    Ensure your database matches the types defined in `src/types/index.ts` (Event, Booking, User).

## 2. Payment Integration (Stripe)

The current checkout uses `src/lib/mockPayment.ts`. To integrate Stripe:

1.  **Install Stripe SDK**:
    ```bash
    npm install @stripe/stripe-js
    ```

2.  **Create Payment Intent**:
    - On your backend, create an endpoint `/api/create-payment-intent`.
    - Call this endpoint when the user proceeds to checkout.

3.  **Replace Mock Logic**:
    - In `CheckoutModal.tsx`, replace `processPayment` with Stripe's `confirmCardPayment`.

    ```typescript
    // Example
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });
    ```

## 3. 3D Assets (Spline)

The 3D scenes are currently loaded from Spline's public viewer URL.

- **Production Optimization**:
    - Export the scene as a `.splinecode` file from the Spline editor.
    - Host it on your own CDN or in the `public/` folder for faster loading and version control.
    - Update `SplineScene.tsx` to point to the local/CDN file.

## 4. Email Notifications

- **Transactional Emails**:
    - Use a service like [Resend](https://resend.com/) or [SendGrid].
    - Trigger emails on the backend upon successful booking (confirmation) or host application.
