import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function getRazorpayClient(): Razorpay {
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
router.post('/create-order', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
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
  } catch (err: any) {
    console.error('POST /payments/create-order error:', err.message);

    if (err.message?.includes('not configured')) {
      return res.status(503).json({ message: 'Payment service not configured' });
    }

    return res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// POST /api/payments/verify — verify Razorpay payment signature (requireAuth)
router.post('/verify', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
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
    // two concurrent verifications both marking the same booking paid.
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

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    return res.json({ success: true, booking: updatedBooking });
  } catch (err: any) {
    console.error('POST /payments/verify error:', err.message);
    return res.status(500).json({ message: 'Payment verification failed' });
  }
});

// POST /api/payments/webhook — Razorpay webhook (no auth, verify webhook signature)
router.post('/webhook', async (req: Request, res: Response): Promise<any> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const body = JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSig !== signature) {
        console.warn('[Webhook] Invalid signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    console.log('[Webhook] Received event:', event.event);

    switch (event.event) {
      case 'payment.captured': {
        const paymentId = event.payload?.payment?.entity?.id;
        const receipt = event.payload?.payment?.entity?.order_id;
        console.log(`[Webhook] Payment captured: ${paymentId}, order: ${receipt}`);

        if (receipt) {
          // Try to find booking by receipt (which we set as bookingId)
          await prisma.booking.updateMany({
            where: { id: receipt, paymentStatus: 'unpaid' },
            data: { paymentStatus: 'paid', paymentId, status: 'confirmed', paymentMethod: 'razorpay' },
          });
        }
        break;
      }
      case 'payment.failed': {
        console.log('[Webhook] Payment failed:', event.payload?.payment?.entity?.id);
        break;
      }
      case 'refund.processed': {
        console.log('[Webhook] Refund processed:', event.payload?.refund?.entity?.id);
        break;
      }
      default:
        console.log('[Webhook] Unhandled event:', event.event);
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// GET /api/payments/health — payment service health check
router.get('/health', (req: Request, res: Response) => {
  const keyIdSet = !!process.env.RAZORPAY_KEY_ID;
  const keySecretSet = !!process.env.RAZORPAY_KEY_SECRET;

  res.json({
    status: keyIdSet && keySecretSet ? 'configured' : 'not_configured',
    razorpayKeyId: keyIdSet,
    razorpayKeySecret: keySecretSet,
  });
});

export default router;
