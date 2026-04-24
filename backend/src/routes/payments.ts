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

// POST /api/payments/create-order — create Razorpay order (requireAuth)
router.post('/create-order', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ message: 'bookingId and amount are required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      receipt: bookingId,
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

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        status: 'confirmed',
        paymentMethod: 'razorpay',
      },
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
