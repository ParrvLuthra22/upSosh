import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendBookingConfirmation } from '../lib/email';
import { notify } from '../lib/notify';

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

    // totalAmount = ticketPrice + platformFee, computed server-side in
    // POST /api/bookings. This is the only figure we will ever charge.
    const amountInPaise = Math.round(booking.totalAmount * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'Booking amount is not payable' });
    }

    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: bookingId,
    });

    // Persist the order id before returning it. /verify uses this to prove the
    // payment being verified belongs to this booking and no other.
    await prisma.booking.update({
      where: { id: bookingId },
      data: { razorpayOrderId: order.id },
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
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
    if (booking.paymentStatus !== 'unpaid') {
      return res.status(409).json({ message: `Cannot pay a booking in state "${booking.paymentStatus}"` });
    }

    // Conditional update — the WHERE clause is the last line of defence against
    // two concurrent verifications both marking the same booking paid. This is
    // also the seat reservation point for a paid booking (free events reserve
    // at creation instead — see POST /api/bookings) — an abandoned checkout
    // that never reaches here never held a seat.
    const { count } = await prisma.booking.updateMany({
      where: { id: bookingId, paymentStatus: 'unpaid' },
      data: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        status: 'confirmed',
        paymentMethod: 'razorpay',
        paidAt: new Date(),
      },
    });

    if (count === 0) {
      return res.status(409).json({ message: 'This booking is already paid' });
    }

    // Money is already captured by Razorpay at this point, so this increments
    // unconditionally rather than being capacity-gated like the free-event
    // path — refusing to seat a customer who has already been charged would
    // trade a rare last-seat race for a guaranteed billing dispute.
    if (booking.eventId) {
      await prisma.event.update({
        where: { id: booking.eventId },
        data: { attendees: { increment: 1 } },
      });
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
          // Prisma cuid — a Razorpay order id never equals one, so this
          // updateMany matched zero rows before razorpayOrderId existed).
          // The paymentStatus: 'unpaid' guard is what makes a duplicate
          // delivery of the same event a no-op instead of a double-write —
          // it also means this is a no-op on the (usual) path where
          // POST /verify already marked the booking paid; this webhook is
          // the recovery path for when /verify never ran at all (e.g. the
          // network dropped after Razorpay captured the payment but before
          // the client could call /verify).
          const { count } = await prisma.booking.updateMany({
            where: { razorpayOrderId: orderId, paymentStatus: 'unpaid' },
            data: { paymentStatus: 'paid', paymentId, status: 'confirmed', paymentMethod: 'razorpay', paidAt: new Date() },
          });
          console.log(`[Webhook] payment.captured matched ${count} booking(s) for order ${orderId}`);

          if (count > 0) {
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
            if (paidBooking?.eventId) {
              await prisma.event.update({
                where: { id: paidBooking.eventId },
                data: { attendees: { increment: 1 } },
              });
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
