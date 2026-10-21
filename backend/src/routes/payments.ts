import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../lib/email';
import { notify } from '../lib/notify';
import { eventClosedReason } from '../lib/booking';
import { confirmPaidBooking, refundRejectedPayment } from '../lib/confirmPayment';

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  // The Razorpay SDK doesn't throw Error instances — it rejects with
  // { statusCode, error: { code, description, ... } } (see
  // razorpay/dist/api.js's normalizeError), which the instanceof check above
  // misses entirely. Without this, every Razorpay API failure logged as the
  // useless literal string "[object Object]".
  if (err && typeof err === 'object' && 'error' in err) {
    const inner = (err as { error?: unknown }).error;
    if (inner && typeof inner === 'object' && 'description' in inner) {
      return String((inner as { description?: unknown }).description);
    }
  }
  return String(err);
}

const router = Router();

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * Constant-time signature comparison.
 *
 * `a !== b` on a hex digest short-circuits at the first differing character, so
 * how long it takes to fail leaks how much of the prefix was correct. That is a
 * usable oracle for forging a signature byte by byte. timingSafeEqual always
 * compares the full buffer.
 *
 * It throws when the two buffers differ in length, so the length check has to
 * come first — and that check is safe to short-circuit, since the length of a
 * SHA-256 hex digest is public knowledge.
 */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// POST /api/payments/create-order — create Razorpay order (requireAuth)
//
// The amount is NEVER taken from the request. It is read from the booking row
// the server itself created. Trusting a client-supplied amount here previously
// allowed anyone to pay ₹1 for any event.
router.post('/create-order', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({ message: 'This booking is already paid' });
    }
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      return res.status(409).json({ message: 'This booking was cancelled and can no longer be paid' });
    }

    // No new payment for an event that is cancelled, unpublished or over.
    if (booking.eventId) {
      const event = await prisma.event.findUnique({ where: { id: booking.eventId } });
      const closedReason = event ? eventClosedReason(event) : null;
      if (closedReason) return res.status(409).json({ message: closedReason });
    }

    // totalAmount = ticketPrice + platformFee, computed server-side in
    // POST /api/bookings. This is the only figure we will ever charge.
    const amountInPaise = Math.round(booking.totalAmount * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'Booking amount is not payable' });
    }

    const razorpay = getRazorpayClient();
    const respond = (order: { id: string; amount: number | string; currency: string }) =>
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });

    // The order id is what /verify and the webhook match a payment to, so it
    // is only ever replaced by compare-and-set against the value just read.
    // An open order for the same amount is reused (a repeated request must not
    // orphan the checkout the customer already has open), and an order that
    // has been paid is never replaced.
    let currentOrderId = booking.razorpayOrderId;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (currentOrderId) {
        const existing = await razorpay.orders.fetch(currentOrderId);
        if (existing.status === 'paid') {
          return res.status(409).json({ message: 'Payment for this booking was already received and is being confirmed' });
        }
        if (Number(existing.amount) === amountInPaise && existing.currency === 'INR') {
          return respond(existing);
        }
      }

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: bookingId,
      });

      const { count } = await prisma.booking.updateMany({
        where: { id: bookingId, razorpayOrderId: currentOrderId },
        data: { razorpayOrderId: order.id },
      });
      if (count === 1) return respond(order);

      // A concurrent request stored its order first; re-read and reuse that one.
      const latest = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!latest) return res.status(404).json({ message: 'Booking not found' });
      if (latest.paymentStatus === 'paid') {
        return res.status(409).json({ message: 'This booking is already paid' });
      }
      currentOrderId = latest.razorpayOrderId;
    }

    return res.status(409).json({ message: 'Another payment request is in progress — please try again' });
  } catch (err: unknown) {
    const message = errorMessage(err);
    console.error('POST /payments/create-order error:', message);

    if (message.includes('not configured')) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    return res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify — verify Razorpay payment signature (requireAuth)
router.post('/verify', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing required payment verification fields' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    // ── 1. Verify the signature ──────────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (!signaturesMatch(expectedSignature, String(razorpay_signature))) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ── 2. Prove the payment belongs to THIS booking ─────────────────────────
    // A signature only proves Razorpay issued the order/payment pair — not that
    // it was for this booking. Without this check a valid triple from a cheap
    // booking could be replayed against any other booking the user owns.
    if (!booking.razorpayOrderId || booking.razorpayOrderId !== razorpay_order_id) {
      console.warn(
        `[Payments] Order mismatch on booking ${bookingId}: ` +
        `expected ${booking.razorpayOrderId ?? 'none'}, got ${razorpay_order_id}`,
      );
      return res.status(400).json({ message: 'Payment does not match this booking' });
    }

    // ── 3. Refuse to re-confirm an already-paid booking ──────────────────────
    if (booking.paymentStatus === 'paid') {
      return res.status(409).json({ message: 'This booking is already paid' });
    }
    // An earlier attempt on the same order may have been recorded as 'failed';
    // a later successful attempt must still confirm the booking.
    if (booking.paymentStatus !== 'unpaid' && booking.paymentStatus !== 'failed') {
      return res.status(409).json({ message: `Cannot pay a booking in state "${booking.paymentStatus}"` });
    }

    // Seat reservation for a paid booking happens here (free events reserve at
    // creation). confirmPaidBooking locks the event row and re-checks the
    // booking and the seats, so a payment that arrives after the booking was
    // cancelled, or after its seats went elsewhere, is refunded instead of
    // being seated over capacity.
    const result = await confirmPaidBooking({ id: bookingId }, razorpay_payment_id);

    if (result.outcome === 'rejected') {
      try {
        await refundRejectedPayment(getRazorpayClient(), result.booking, razorpay_payment_id);
      } catch {
        return res.status(502).json({
          message: 'We could not confirm this booking, and the automatic refund did not complete. ' +
            `Please contact support and quote payment ${razorpay_payment_id}.`,
        });
      }
      notify(
        booking.userId,
        'booking',
        'Payment refunded',
        result.reason === 'cancelled'
          ? 'Your booking had been cancelled, so your payment was refunded.'
          : 'The event filled up before your payment completed, so your payment was refunded.',
      );
      return res.status(409).json({
        message: result.reason === 'cancelled'
          ? 'This booking was cancelled, so your payment has been refunded.'
          : 'This event filled up before your payment completed, so your payment has been refunded.',
        refunded: true,
      });
    }
    if (result.outcome !== 'confirmed') {
      return res.status(409).json({ message: 'This booking is already paid' });
    }

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    sendBookingConfirmation({
      guestName: updatedBooking!.guestName,
      guestEmail: updatedBooking!.guestEmail,
      eventTitle: updatedBooking!.event?.title ?? 'your event',
      eventDate: updatedBooking!.event?.date
        ? new Date(updatedBooking!.event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        : '',
      eventTime: updatedBooking!.event?.time ?? '',
      eventVenue: updatedBooking!.event?.venue ?? '',
      bookingId: updatedBooking!.id,
      totalAmount: updatedBooking!.totalAmount,
      qrCode: updatedBooking!.qrCode ?? updatedBooking!.id,
      isFree: false,
    }).catch(() => {});

    notify(
      booking.userId,
      'booking',
      "You're in!",
      `Your spot for "${updatedBooking!.event?.title ?? 'the event'}" is confirmed.`,
    );

    return res.json({ success: true, booking: updatedBooking });
  } catch (err: unknown) {
    console.error('POST /payments/verify error:', errorMessage(err));
    return res.status(500).json({ message: 'Payment verification failed' });
  }
});

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string } };
    refund?: { entity?: { id?: string; payment_id?: string } };
  };
}

// POST /api/payments/webhook — Razorpay webhook (no requireAuth: this is
// called by Razorpay's servers, not a logged-in user. Trust is established
// entirely by the signature check below, which is why it is unconditional.)
//
// req.body is a raw Buffer here (see the express.raw() mount in index.ts) —
// Razorpay signs the exact bytes it sent, and re-serializing a parsed object
// with JSON.stringify does not reliably reproduce them (whitespace, unicode
// escaping), which silently broke this check even with the correct secret.
router.post('/webhook', async (req: Request, res: Response): Promise<Response> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Unconditional: an unset secret used to mean "skip verification", which
    // let anyone on the internet POST a fake payment.captured event and mark
    // any booking paid for free. Fail closed instead.
    if (!webhookSecret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not set — refusing all webhook deliveries');
      return res.status(500).json({ message: 'Webhook not configured' });
    }
    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({ message: 'Missing webhook signature' });
    }

    const rawBody: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!signaturesMatch(expectedSig, signature)) {
      console.warn('[Webhook] Invalid signature');
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event: RazorpayWebhookPayload = JSON.parse(rawBody.toString('utf8'));
    console.log('[Webhook] Received event:', event.event);

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload?.payment?.entity?.id;
        const orderId = event.payload?.payment?.entity?.order_id;
        console.log(`[Webhook] Payment captured: ${paymentId}, order: ${orderId}`);

        if (orderId) {
          // Bound to the order id persisted at order-creation time (not the
          // Prisma cuid). confirmPaidBooking is idempotent — a duplicate
          // delivery, or one that arrives after POST /verify already confirmed
          // the booking, is a no-op — so this is the recovery path for when
          // /verify never ran (e.g. the network dropped after Razorpay captured
          // the payment). It applies the same cancelled / seats-left rules as
          // /verify; a payment it cannot honour is refunded.
          const result = await confirmPaidBooking({ razorpayOrderId: orderId }, paymentId ?? '');
          console.log(`[Webhook] payment.captured for order ${orderId}: ${result.outcome}`);

          if (result.outcome === 'rejected') {
            // Throws on refund failure -> 500 below, so Razorpay redelivers.
            await refundRejectedPayment(getRazorpayClient(), result.booking, paymentId ?? '');
            notify(
              result.booking.userId,
              'booking',
              'Payment refunded',
              result.reason === 'cancelled'
                ? 'Your booking had been cancelled, so your payment was refunded.'
                : 'The event filled up before your payment completed, so your payment was refunded.',
            );
          }

          if (result.outcome === 'confirmed') {
            const paidBooking = await prisma.booking.findUnique({ where: { razorpayOrderId: orderId }, include: { event: true } });
            if (paidBooking) {
              // This booking never got a confirmation email from POST /verify,
              // because /verify never ran — that's what put it on this
              // recovery path in the first place.
              sendBookingConfirmation({
                guestName: paidBooking.guestName,
                guestEmail: paidBooking.guestEmail,
                eventTitle: paidBooking.event?.title ?? 'your event',
                eventDate: paidBooking.event?.date
                  ? new Date(paidBooking.event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  : '',
                eventTime: paidBooking.event?.time ?? '',
                eventVenue: paidBooking.event?.venue ?? '',
                bookingId: paidBooking.id,
                totalAmount: paidBooking.totalAmount,
                qrCode: paidBooking.qrCode ?? paidBooking.id,
                isFree: false,
              }).catch(() => {});

              notify(
                paidBooking.userId,
                'booking',
                "You're in!",
                `Your spot for "${paidBooking.event?.title ?? 'the event'}" is confirmed.`,
              );
            }
          }
        }
        break;
      }
      case 'payment.failed': {
        const orderId = event.payload?.payment?.entity?.order_id;
        console.log('[Webhook] Payment failed for order:', orderId);

        if (orderId) {
          await prisma.booking.updateMany({
            where: { razorpayOrderId: orderId, paymentStatus: 'unpaid' },
            data: { paymentStatus: 'failed' },
          });
        }
        break;
      }
      case 'refund.processed': {
        const refundId = event.payload?.refund?.entity?.id;
        const paymentId = event.payload?.refund?.entity?.payment_id;
        console.log('[Webhook] Refund processed:', refundId, 'for payment', paymentId);

        if (paymentId) {
          await prisma.booking.updateMany({
            where: { paymentId, paymentStatus: 'paid' },
            data: { paymentStatus: 'refunded', refundId },
          });
        }
        break;
      }
      default:
        console.log('[Webhook] Unhandled event:', event.event);
    }

    return res.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook error:', errorMessage(err));
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
