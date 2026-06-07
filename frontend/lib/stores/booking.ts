'use client';

/**
 * lib/stores/booking.ts
 * ──────────────────────
 * Global booking-flow state.
 *
 * Usage:
 *   const { open } = useBookingStore();
 *   open(event.id, event, 1);     // triggers the modal from any component
 */

import { create } from 'zustand';
import Cookies from 'js-cookie';

/** Get auth token for API calls */
function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return Cookies.get('upsosh_token') ?? localStorage.getItem('token') ?? '';
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Flexible event shape accepted by the store — works with both
 * `Event` (types/index.ts) and `MockEvent` (lib/mockEvents).
 */
export interface BookingEventData {
  id: string;
  title: string;
  image?: string;
  imageUrl?: string;
  date?: Date | string;
  dateShort?: string;
  time?: string;
  price: number | 'Free';
  currency?: string;
  spotsLeft?: number;
  isInstantBooking?: boolean;
  location?: string;
  category?: string;
}

export interface GuestDetails {
  name: string;
  phone: string;
  email: string;
}

export type PaymentMethod = 'instant' | 'manual';
export type BookingStep = 1 | 2 | 3;
export type SlideDirection = 1 | -1;   // 1 = forward, -1 = back

// ─── Store interface ──────────────────────────────────────────────────────────

interface BookingStore {
  // ── State ──
  isOpen: boolean;
  step: BookingStep;
  direction: SlideDirection;
  eventId: string | null;
  event: BookingEventData | null;
  guestCount: number;
  guestDetails: GuestDetails;
  paymentMethod: PaymentMethod | null;
  proofFile: File | null;
  bookingId: string | null;
  isProcessing: boolean;
  errorMessage: string | null;

  // ── Actions ──
  /** Open the booking modal for a given event */
  open: (eventId: string, event: BookingEventData, guestCount?: number) => void;
  /** Close and reset */
  close: () => void;
  /** Advance one step */
  next: () => void;
  /** Go back one step */
  back: () => void;
  /** Jump to a specific step (used after Razorpay success) */
  goTo: (step: BookingStep) => void;

  // ── Setters ──
  setGuestCount: (n: number) => void;
  setGuestDetails: (details: Partial<GuestDetails>) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setProofFile: (file: File | null) => void;
  setBookingId: (id: string) => void;
  setProcessing: (v: boolean) => void;
  setError: (msg: string | null) => void;

  /**
   * submit() drives the payment logic:
   *  - instant → POST /api/bookings, POST /api/payments/razorpay/order, open SDK
   *  - manual  → POST /api/bookings + POST /api/payments/manual-proof
   */
  submit: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const INITIAL_GUEST_DETAILS: GuestDetails = { name: '', phone: '', email: '' };

function unitPrice(price: BookingEventData['price']): number {
  if (price === 'Free') return 0;
  return price as number;
}

export const useBookingStore = create<BookingStore>()((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  isOpen:        false,
  step:          1,
  direction:     1,
  eventId:       null,
  event:         null,
  guestCount:    1,
  guestDetails:  INITIAL_GUEST_DETAILS,
  paymentMethod: null,
  proofFile:     null,
  bookingId:     null,
  isProcessing:  false,
  errorMessage:  null,

  // ── Open ──────────────────────────────────────────────────────────────────

  open: (eventId, event, guestCount = 1) =>
    set({
      isOpen:        true,
      step:          1,
      direction:     1,
      eventId,
      event,
      guestCount,
      guestDetails:  INITIAL_GUEST_DETAILS,
      paymentMethod: null,
      proofFile:     null,
      bookingId:     null,
      isProcessing:  false,
      errorMessage:  null,
    }),

  // ── Close ─────────────────────────────────────────────────────────────────

  close: () =>
    set({
      isOpen:       false,
      // keep event data briefly so exit animation looks good
      isProcessing: false,
      errorMessage: null,
    }),

  // ── Navigation ────────────────────────────────────────────────────────────

  next: () => {
    const { step } = get();
    if (step < 3) set({ step: (step + 1) as BookingStep, direction: 1 });
  },

  back: () => {
    const { step } = get();
    if (step > 1) set({ step: (step - 1) as BookingStep, direction: -1 });
  },

  goTo: (step) => {
    const { step: current } = get();
    set({ step, direction: step > current ? 1 : -1 });
  },

  // ── Setters ───────────────────────────────────────────────────────────────

  setGuestCount:    (n)       => set({ guestCount: n }),
  setGuestDetails:  (details) => set((s) => ({ guestDetails: { ...s.guestDetails, ...details } })),
  setPaymentMethod: (method)  => set({ paymentMethod: method }),
  setProofFile:     (file)    => set({ proofFile: file }),
  setBookingId:     (id)      => set({ bookingId: id }),
  setProcessing:    (v)       => set({ isProcessing: v }),
  setError:         (msg)     => set({ errorMessage: msg }),

  // ── Submit ────────────────────────────────────────────────────────────────

  submit: async () => {
    const { event, eventId, guestCount, guestDetails, paymentMethod, proofFile } = get();
    if (!event || !eventId || !paymentMethod) return;

    set({ isProcessing: true, errorMessage: null });

    try {
      // ── 1. Create the booking record ───────────────────────────────────────
      const bookingRes = await fetch('/api/bookings', {
        method:  'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          eventId,
          guestCount,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          paymentMethod,
          ticketPrice: unitPrice(event.price),
        }),
      });

      let bookingData: { id?: string; bookingId?: string; error?: string };
      try { bookingData = await bookingRes.json(); }
      catch { bookingData = {}; }

      if (!bookingRes.ok) {
        throw new Error(bookingData.error ?? `Booking failed (${bookingRes.status})`);
      }

      const returnedBookingId = bookingData.booking?.id || bookingData.bookingId || bookingData.id;
      if (!returnedBookingId) {
        throw new Error('Server did not return a valid booking ID');
      }

      set({ bookingId: returnedBookingId });

      // ── 2a. Instant payment → Razorpay ─────────────────────────────────────
      if (paymentMethod === 'instant') {
        const price = unitPrice(event.price);
        if (price > 0) {
          const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '';

          if (!razorpayKey) {
            // No key configured — skip payment and go straight to confirmation
            // so the UX works in demo/development environments.
            console.warn('[UpSosh] NEXT_PUBLIC_RAZORPAY_KEY_ID not set — skipping payment in demo mode');
            set({ isProcessing: false });
            get().goTo(3);
            return;
          }

          // 1. Create Razorpay order on backend
          const orderRes = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: authHeaders(),
            credentials: 'include',
            body: JSON.stringify({ bookingId: returnedBookingId, amount: price * guestCount }),
          });

          if (!orderRes.ok) {
            const err = await orderRes.json().catch(() => ({}));
            throw new Error((err as { message?: string }).message ?? 'Could not create payment order');
          }

          const orderData = await orderRes.json();
          const orderId: string = orderData.orderId ?? orderData.order_id ?? '';

          // 2. Load Razorpay SDK
          await loadRazorpayScript();

          // 3. Open checkout — resolves on success, rejects on dismiss/failure
          const paymentResult = await new Promise<{
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }>((resolve, reject) => {
            const rp = new (window as any).Razorpay({
              key:         razorpayKey,
              amount:      price * guestCount * 100, // paise
              currency:    event.currency ?? 'INR',
              name:        'UpSosh',
              description: event.title,
              order_id:    orderId,
              prefill: {
                name:    guestDetails.name,
                email:   guestDetails.email,
                contact: guestDetails.phone,
              },
              theme: { color: '#D4FF3F' },
              handler: (res: typeof paymentResult) => resolve(res),
              modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
            });
            rp.open();
          });

          // 4. Verify signature on backend
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: authHeaders(),
            credentials: 'include',
            body: JSON.stringify({
              bookingId: returnedBookingId,
              razorpay_order_id:   paymentResult.razorpay_order_id,
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_signature:  paymentResult.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            const err = await verifyRes.json().catch(() => ({}));
            throw new Error((err as { message?: string }).message ?? 'Payment verification failed');
          }
        }
      }

      // ── 2b. Manual → upload proof ─────────────────────────────────────────
      if (paymentMethod === 'manual' && proofFile) {
        const fd = new FormData();
        fd.append('bookingId', returnedBookingId);
        fd.append('file', proofFile);
        const manualToken = getAuthToken();
        // Fire-and-forget; don't block confirmation step
        fetch('/api/payments/manual-proof', {
          method: 'POST',
          credentials: 'include',
          headers: manualToken ? { Authorization: `Bearer ${manualToken}` } : {},
          body: fd,
        }).catch(() => {});
      }

      // ── 3. Advance to confirmation ─────────────────────────────────────────
      set({ isProcessing: false });
      get().goTo(3);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      set({ isProcessing: false, errorMessage: msg });
    }
  },
}));

// ─── Razorpay script loader ────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

// ─── .ics calendar download helper ────────────────────────────────────────────

export function downloadICS(event: BookingEventData): void {
  if (typeof window === 'undefined') return;

  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const dateStr = event.dateShort ?? (event.date instanceof Date
    ? event.date.toLocaleDateString('en-IN')
    : String(event.date ?? ''));

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UpSosh//Event//EN',
    'BEGIN:VEVENT',
    `DTSTAMP:${stamp}`,
    `UID:${event.id}@upsosh.app`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.title} on UpSosh`,
    `LOCATION:${event.location ?? ''}`,
    `DTSTART:${stamp}`,
    'DURATION:PT2H',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${event.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
