import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { ordersCreate } from '../__mocks__/razorpay';

function verifySignature(orderId: string, paymentId: string): string {
  return crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function webhookSignature(rawBody: string): string {
  return crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(rawBody).digest('hex');
}

beforeEach(async () => {
  await resetDb();
  ordersCreate.mockReset();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/payments/verify', () => {
  it('rejects a tampered signature — valid payload, wrong HMAC — and leaves the booking unpaid', async () => {
    const { user } = await createUser();
    const event = await createEvent({ userId: user.id });
    const booking = await createBooking({
      userId: user.id,
      eventId: event.id,
      razorpayOrderId: 'order_tamper_1',
      paymentStatus: 'unpaid',
    });

    const res = await request(app)
      .post('/api/payments/verify')
      .set(authHeader(user.id))
      .send({
        bookingId: booking.id,
        razorpay_order_id: 'order_tamper_1',
        razorpay_payment_id: 'pay_tamper_1',
        razorpay_signature: 'a'.repeat(64), // well-formed hex, but not the real HMAC
      });

    expect(res.status).toBe(400);

    const stored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(stored.paymentStatus).toBe('unpaid');
  });

  it('rejects a valid signature whose order_id belongs to a different booking (cross-booking replay)', async () => {
    const { user } = await createUser();
    const event = await createEvent({ userId: user.id });

    // Booking A is the one the order was actually created for.
    await createBooking({
      userId: user.id,
      eventId: event.id,
      razorpayOrderId: 'order_A',
      paymentStatus: 'unpaid',
    });
    // Booking B is a different, unrelated booking owned by the same user.
    const bookingB = await createBooking({
      userId: user.id,
      eventId: event.id,
      razorpayOrderId: 'order_B',
      paymentStatus: 'unpaid',
    });

    // A genuinely valid signature for order_A's payment...
    const signature = verifySignature('order_A', 'pay_replay_1');

    // ...replayed against booking B.
    const res = await request(app)
      .post('/api/payments/verify')
      .set(authHeader(user.id))
      .send({
        bookingId: bookingB.id,
        razorpay_order_id: 'order_A',
        razorpay_payment_id: 'pay_replay_1',
        razorpay_signature: signature,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/does not match this booking/i);

    const storedB = await prisma.booking.findUniqueOrThrow({ where: { id: bookingB.id } });
    expect(storedB.paymentStatus).toBe('unpaid');
  });

  it('is idempotent — replaying the same valid payload twice leaves exactly one paid booking', async () => {
    const { user } = await createUser();
    const event = await createEvent({ userId: user.id, capacity: 10, attendees: 0 });
    const booking = await createBooking({
      userId: user.id,
      eventId: event.id,
      razorpayOrderId: 'order_idem_1',
      paymentStatus: 'unpaid',
    });

    const signature = verifySignature('order_idem_1', 'pay_idem_1');
    const payload = {
      bookingId: booking.id,
      razorpay_order_id: 'order_idem_1',
      razorpay_payment_id: 'pay_idem_1',
      razorpay_signature: signature,
    };

    const first = await request(app).post('/api/payments/verify').set(authHeader(user.id)).send(payload);
    expect(first.status).toBe(200);

    const second = await request(app).post('/api/payments/verify').set(authHeader(user.id)).send(payload);
    expect(second.status).toBe(409);

    const paidCount = await prisma.booking.count({ where: { id: booking.id, paymentStatus: 'paid' } });
    expect(paidCount).toBe(1);

    // The atomic seat increment on /verify success must also have run
    // exactly once, not twice.
    const updatedEvent = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(updatedEvent.attendees).toBe(1);
  });
});

describe('POST /api/payments/create-order', () => {
  it('ignores a client-supplied amount and charges booking.totalAmount instead', async () => {
    const { user } = await createUser();
    const event = await createEvent({ userId: user.id, price: 4975 });
    const booking = await createBooking({
      userId: user.id,
      eventId: event.id,
      ticketPrice: 4975,
      platformFee: 25,
      totalAmount: 5000, // ₹5000
      paymentStatus: 'unpaid',
    });

    ordersCreate.mockResolvedValueOnce({ id: 'order_mock_1', amount: 500000, currency: 'INR' });

    const res = await request(app)
      .post('/api/payments/create-order')
      .set(authHeader(user.id))
      // The attacker's move: ask to be charged ₹1 instead of the real ₹5000.
      .send({ bookingId: booking.id, amount: 1 });

    expect(res.status).toBe(200);
    expect(ordersCreate).toHaveBeenCalledTimes(1);
    expect(ordersCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500000, currency: 'INR' }),
    );
  });
});

describe('POST /api/payments/webhook', () => {
  it('rejects an unsigned request', async () => {
    const payload = JSON.stringify({ event: 'payment.captured', payload: {} });

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(400);
  });

  it('flips the booking to paid on a validly signed payment.captured event', async () => {
    const { user } = await createUser();
    const event = await createEvent({ userId: user.id, capacity: 10, attendees: 0 });
    const booking = await createBooking({
      userId: user.id,
      eventId: event.id,
      razorpayOrderId: 'order_webhook_1',
      paymentStatus: 'unpaid',
    });

    const payloadObj = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_webhook_1', order_id: 'order_webhook_1' } } },
    };
    const rawBody = JSON.stringify(payloadObj);
    const signature = webhookSignature(rawBody);

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(rawBody);

    expect(res.status).toBe(200);

    const stored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(stored.paymentStatus).toBe('paid');

    const updatedEvent = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(updatedEvent.attendees).toBe(1);
  });
});
