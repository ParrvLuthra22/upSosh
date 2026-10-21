import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { BOOKING_HOLD_MS } from '../src/lib/booking';
import { ordersCreate, ordersFetch, paymentsRefund, paymentsFetch } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  ordersCreate.mockReset();
  ordersFetch.mockReset();
  paymentsRefund.mockReset();
  paymentsFetch.mockReset();
  paymentsRefund.mockResolvedValue({ id: 'rfnd_default' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

function verifySignature(orderId: string, paymentId: string): string {
  return crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest('hex');
}

function signedWebhook(body: object) {
  const raw = JSON.stringify(body);
  const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest('hex');
  return request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', sig).send(raw);
}

const hook = (event: string, orderId: string, paymentId: string) =>
  signedWebhook({ event, payload: { payment: { entity: { id: paymentId, order_id: orderId } } } });

function verify(userId: string, bookingId: string, orderId: string, paymentId: string) {
  return request(app).post('/api/payments/verify').set(authHeader(userId)).send({
    bookingId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: verifySignature(orderId, paymentId),
  });
}

const attendeesOf = async (eventId: string) => (await prisma.event.findUniqueOrThrow({ where: { id: eventId } })).attendees;
const bookingOf = (id: string) => prisma.booking.findUniqueOrThrow({ where: { id } });

describe('PAY-1: a successful payment confirms a booking an earlier attempt marked failed', () => {
  async function failedBooking(opts: { guestCount?: number } = {}) {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });
    const orderId = `order_${crypto.randomBytes(4).toString('hex')}`;
    const booking = await createBooking({
      userId: user.id, eventId: event.id, razorpayOrderId: orderId,
      guestCount: opts.guestCount ?? 2, ticketPrice: 1000,
    });
    await hook('payment.failed', orderId, 'pay_first_attempt');
    expect((await bookingOf(booking.id)).paymentStatus).toBe('failed');
    return { user, event, booking, orderId };
  }

  it('webhook payment.captured after payment.failed confirms the booking and reserves its seats', async () => {
    const { event, booking, orderId } = await failedBooking();

    const res = await hook('payment.captured', orderId, 'pay_retry_ok');

    expect(res.status).toBe(200);
    const stored = await bookingOf(booking.id);
    expect(stored).toMatchObject({ paymentStatus: 'paid', status: 'confirmed', paymentId: 'pay_retry_ok' });
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('/verify after payment.failed confirms the booking', async () => {
    const { user, event, booking, orderId } = await failedBooking();

    const res = await verify(user.id, booking.id, orderId, 'pay_retry_ok');

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ paymentStatus: 'paid', status: 'confirmed' });
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('is idempotent: /verify then a duplicate webhook, and webhook then /verify, confirm exactly once', async () => {
    const a = await failedBooking();
    await verify(a.user.id, a.booking.id, a.orderId, 'pay_a');
    await hook('payment.captured', a.orderId, 'pay_a');
    await hook('payment.captured', a.orderId, 'pay_a');
    expect(await attendeesOf(a.event.id)).toBe(2);

    const b = await failedBooking();
    await hook('payment.captured', b.orderId, 'pay_b');
    const again = await verify(b.user.id, b.booking.id, b.orderId, 'pay_b');
    expect(again.status).toBe(409);
    expect(await attendeesOf(b.event.id)).toBe(2);
  });

  it('a late payment.failed does not undo a booking that is already paid', async () => {
    const { event, booking, orderId } = await failedBooking();
    await hook('payment.captured', orderId, 'pay_ok');
    await hook('payment.failed', orderId, 'pay_late_failure');

    expect(await bookingOf(booking.id)).toMatchObject({ paymentStatus: 'paid', status: 'confirmed' });
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('does not confirm a booking that was cancelled', async () => {
    const { user, event, booking, orderId } = await failedBooking();
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });

    await hook('payment.captured', orderId, 'pay_after_cancel');
    const res = await verify(user.id, booking.id, orderId, 'pay_after_cancel');

    expect(res.status).not.toBe(200);
    const stored = await bookingOf(booking.id);
    expect(stored.status).toBe('cancelled');
    expect(stored.paymentStatus).not.toBe('paid');
    expect(await attendeesOf(event.id)).toBe(0);
  });
});

describe('PAY-2: create-order reuses an open order instead of replacing it', () => {
  async function setup(opts: { razorpayOrderId?: string | null } = {}) {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, ticketPrice: 500, platformFee: 25,
      razorpayOrderId: opts.razorpayOrderId ?? null,
    });
    return { user, event, booking };
  }
  const createOrder = (userId: string, bookingId: string) =>
    request(app).post('/api/payments/create-order').set(authHeader(userId)).send({ bookingId });

  it('returns the existing order when it is unpaid and its amount matches', async () => {
    const { user, booking } = await setup({ razorpayOrderId: 'order_existing' });
    ordersFetch.mockResolvedValue({ id: 'order_existing', amount: 52500, currency: 'INR', status: 'created' });

    const res = await createOrder(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ orderId: 'order_existing', amount: 52500, currency: 'INR' });
    expect(ordersCreate).not.toHaveBeenCalled();
    expect((await bookingOf(booking.id)).razorpayOrderId).toBe('order_existing');
  });

  it('also reuses an order that already has a payment attempt on it', async () => {
    const { user, booking } = await setup({ razorpayOrderId: 'order_attempted' });
    ordersFetch.mockResolvedValue({ id: 'order_attempted', amount: 52500, currency: 'INR', status: 'attempted' });

    const res = await createOrder(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe('order_attempted');
    expect(ordersCreate).not.toHaveBeenCalled();
  });

  it('never replaces the order id of an order that has been paid', async () => {
    const { user, booking } = await setup({ razorpayOrderId: 'order_paid' });
    ordersFetch.mockResolvedValue({ id: 'order_paid', amount: 52500, currency: 'INR', status: 'paid' });

    const res = await createOrder(user.id, booking.id);

    expect(res.status).toBe(409);
    expect(ordersCreate).not.toHaveBeenCalled();
    expect((await bookingOf(booking.id)).razorpayOrderId).toBe('order_paid');
  });

  it('creates a replacement only when the existing order is for a different amount', async () => {
    const { user, booking } = await setup({ razorpayOrderId: 'order_stale' });
    ordersFetch.mockResolvedValue({ id: 'order_stale', amount: 100, currency: 'INR', status: 'created' });
    ordersCreate.mockResolvedValue({ id: 'order_fresh', amount: 52500, currency: 'INR' });

    const res = await createOrder(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe('order_fresh');
    expect((await bookingOf(booking.id)).razorpayOrderId).toBe('order_fresh');
  });

  it('does not touch the stored order when the existing one cannot be fetched', async () => {
    const { user, booking } = await setup({ razorpayOrderId: 'order_unknown' });
    ordersFetch.mockRejectedValue({ statusCode: 500, error: { description: 'upstream unavailable' } });

    const res = await createOrder(user.id, booking.id);

    expect(res.status).toBe(500);
    expect(ordersCreate).not.toHaveBeenCalled();
    expect((await bookingOf(booking.id)).razorpayOrderId).toBe('order_unknown');
  });

  it('simultaneous requests (double click, two tabs) all get the same order, and one payment confirms the booking once', async () => {
    const { user, event, booking } = await setup();
    let n = 0;
    const created = new Map<string, { id: string; amount: number; currency: string; status: string }>();
    ordersCreate.mockImplementation(async (args: { amount: number }) => {
      await new Promise((r) => setTimeout(r, 25));
      const order = { id: `order_${++n}`, amount: args.amount, currency: 'INR', status: 'created' };
      created.set(order.id, order);
      return order;
    });
    ordersFetch.mockImplementation(async (id: string) => created.get(id));

    const results = await Promise.all([1, 2, 3, 4].map(() => createOrder(user.id, booking.id)));

    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200]);
    const ids = new Set(results.map((r) => r.body.orderId));
    expect(ids.size).toBe(1);
    const stored = await bookingOf(booking.id);
    expect(stored.razorpayOrderId).toBe([...ids][0]);

    // Paying that one order confirms the booking exactly once.
    const orderId = [...ids][0] as string;
    await verify(user.id, booking.id, orderId, 'pay_single');
    await hook('payment.captured', orderId, 'pay_single');
    expect(await bookingOf(booking.id)).toMatchObject({ paymentStatus: 'paid', status: 'confirmed' });
    expect(await attendeesOf(event.id)).toBe(1);
  });
});

describe('PAY-3: a payment is only confirmed if the booking is live and seats remain', () => {
  const longAgo = () => new Date(Date.now() - BOOKING_HOLD_MS - 60_000);

  async function scenario(opts: {
    capacity?: number; attendees?: number; guestCount?: number;
    status?: 'pending' | 'cancelled' | 'expired'; paymentStatus?: 'unpaid' | 'failed';
    createdAt?: Date;
  } = {}) {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: opts.capacity ?? 10, attendees: opts.attendees ?? 0 });
    const orderId = `order_${crypto.randomBytes(4).toString('hex')}`;
    const guestCount = opts.guestCount ?? 1;
    const booking = await createBooking({
      userId: user.id, eventId: event.id, razorpayOrderId: orderId, guestCount,
      ticketPrice: 500 * guestCount,
      status: opts.status ?? 'expired', paymentStatus: opts.paymentStatus ?? 'unpaid',
      createdAt: opts.createdAt ?? longAgo(),
    });
    return { host, user, event, booking, orderId };
  }

  it('cancelled booking: not confirmed, refunded once, seats untouched', async () => {
    const { event, booking, orderId } = await scenario({ status: 'cancelled', guestCount: 2 });

    const res = await hook('payment.captured', orderId, 'pay_c1');

    expect(res.status).toBe(200);
    const stored = await bookingOf(booking.id);
    expect(stored).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded', refundId: 'rfnd_default', paymentId: 'pay_c1' });
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(paymentsRefund).toHaveBeenCalledWith('pay_c1', { amount: Math.round(booking.totalAmount * 100) });
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('/verify on a cancelled booking is refused and refunded', async () => {
    const { user, event, booking, orderId } = await scenario({ status: 'cancelled' });

    const res = await verify(user.id, booking.id, orderId, 'pay_c2');

    expect(res.status).toBe(409);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('expired hold with seats still available: confirmed', async () => {
    const { user, event, booking, orderId } = await scenario({ capacity: 5, attendees: 2, guestCount: 2 });

    const res = await verify(user.id, booking.id, orderId, 'pay_e1');

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(await attendeesOf(event.id)).toBe(4);
    expect(paymentsRefund).not.toHaveBeenCalled();
  });

  it('failed-then-retried payment on an expired hold with seats available: confirmed', async () => {
    const { event, booking, orderId } = await scenario({ capacity: 5, paymentStatus: 'failed' });

    await hook('payment.captured', orderId, 'pay_e2');

    expect(await bookingOf(booking.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(await attendeesOf(event.id)).toBe(1);
  });

  it('expired hold and the event is now full: not confirmed, refunded, attendees never exceed capacity', async () => {
    const { event, booking, orderId } = await scenario({ capacity: 3, attendees: 3 });

    const res = await hook('payment.captured', orderId, 'pay_f1');

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'refunded', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(3);
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
  });

  it('expired hold needing more seats than remain: not confirmed, refunded', async () => {
    const { user, event, booking, orderId } = await scenario({ capacity: 5, attendees: 3, guestCount: 3 });

    const res = await verify(user.id, booking.id, orderId, 'pay_f2');

    expect(res.status).toBe(409);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
    expect(await attendeesOf(event.id)).toBe(3);
  });

  it("another customer's live hold is respected when the payer's own hold has lapsed", async () => {
    const { host, event, booking, orderId } = await scenario({ capacity: 2, attendees: 1 });
    const { user: other } = await createUser();
    await createBooking({ userId: other.id, eventId: event.id, status: 'pending', paymentStatus: 'unpaid' });
    void host;

    await hook('payment.captured', orderId, 'pay_h1');

    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
    expect(await attendeesOf(event.id)).toBe(1);
  });

  it('a live hold is always honoured: it was counted when the booking was made', async () => {
    const { event, booking, orderId } = await scenario({ capacity: 2, guestCount: 2, status: 'pending', createdAt: new Date() });

    await hook('payment.captured', orderId, 'pay_live');

    expect(await bookingOf(booking.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(await attendeesOf(event.id)).toBe(2);
    expect(paymentsRefund).not.toHaveBeenCalled();
  });

  it('refund is idempotent: a repeated delivery does not refund twice', async () => {
    const { booking, orderId } = await scenario({ status: 'cancelled' });

    await hook('payment.captured', orderId, 'pay_i1');
    await hook('payment.captured', orderId, 'pay_i1');

    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
  });

  it("treats Razorpay's 'already refunded' answer as success", async () => {
    const { booking, orderId } = await scenario({ status: 'cancelled' });
    paymentsRefund.mockRejectedValue({ statusCode: 400, error: { description: 'The payment has been fully refunded already' } });

    const res = await hook('payment.captured', orderId, 'pay_i2');

    expect(res.status).toBe(200);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
  });

  it('refund failure: booking stays unconfirmed (payment id kept), webhook asks for a retry, retry completes the refund', async () => {
    const { event, booking, orderId } = await scenario({ capacity: 1, attendees: 1 });
    paymentsRefund.mockRejectedValueOnce({ statusCode: 502, error: { description: 'gateway down' } });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

    const first = await hook('payment.captured', orderId, 'pay_r1');

    expect(first.status).toBe(500);
    let stored = await bookingOf(booking.id);
    expect(stored).toMatchObject({ status: 'expired', paymentStatus: 'unpaid', paymentId: 'pay_r1' });
    expect(await attendeesOf(event.id)).toBe(1);
    expect(errors.mock.calls.flat().join(' ')).toContain(booking.id);
    expect(errors.mock.calls.flat().join(' ')).not.toContain(process.env.RAZORPAY_KEY_SECRET!);
    errors.mockRestore();

    const retry = await hook('payment.captured', orderId, 'pay_r1');
    expect(retry.status).toBe(200);
    stored = await bookingOf(booking.id);
    expect(stored.paymentStatus).toBe('refunded');
    expect(await attendeesOf(event.id)).toBe(1);
  });

  it('/verify reports a refund failure without confirming the booking', async () => {
    const { user, event, booking, orderId } = await scenario({ status: 'cancelled' });
    paymentsRefund.mockRejectedValue({ statusCode: 502, error: { description: 'gateway down' } });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await verify(user.id, booking.id, orderId, 'pay_r2');

    errors.mockRestore();
    expect(res.status).toBe(502);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('unpaid');
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('create-order refuses a cancelled booking', async () => {
    const { user, booking } = await scenario({ status: 'cancelled', paymentStatus: 'unpaid' });
    const res = await request(app).post('/api/payments/create-order').set(authHeader(user.id)).send({ bookingId: booking.id });
    expect(res.status).toBe(409);
    expect(ordersCreate).not.toHaveBeenCalled();
  });

  it('concurrency: many late payments for the last seats — attendees never exceeds capacity, the rest are refunded', async () => {
    const { user: host } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 3, attendees: 0 });
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const { user } = await createUser();
      const orderId = `order_c_${i}_${crypto.randomBytes(3).toString('hex')}`;
      const booking = await createBooking({
        userId: user.id, eventId: event.id, razorpayOrderId: orderId, status: 'expired', createdAt: longAgo(),
      });
      rows.push({ user, booking, orderId });
    }

    // Half arrive as webhooks, half through /verify, all at once.
    const responses = await Promise.all(rows.map((r, i) =>
      i % 2 === 0 ? hook('payment.captured', r.orderId, `pay_c_${i}`) : verify(r.user.id, r.booking.id, r.orderId, `pay_c_${i}`)));

    expect(responses.every((r) => [200, 409].includes(r.status))).toBe(true);
    const stored = await prisma.booking.findMany({ where: { eventId: event.id } });
    const confirmed = stored.filter((b) => b.paymentStatus === 'paid');
    const refunded = stored.filter((b) => b.paymentStatus === 'refunded');
    expect(await attendeesOf(event.id)).toBe(3);
    expect(confirmed).toHaveLength(3);
    expect(refunded).toHaveLength(5);
    expect(paymentsRefund).toHaveBeenCalledTimes(5);
  });

  it('concurrency: late payments racing new bookings for the same event never push attendees past capacity', async () => {
    const { user: host } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 4, attendees: 0 });
    const late = [];
    for (let i = 0; i < 4; i++) {
      const { user } = await createUser();
      const orderId = `order_m_${i}_${crypto.randomBytes(3).toString('hex')}`;
      const booking = await createBooking({
        userId: user.id, eventId: event.id, razorpayOrderId: orderId, guestCount: 2, ticketPrice: 1000,
        status: 'expired', createdAt: longAgo(),
      });
      late.push({ orderId });
    }
    const buyers = await Promise.all([1, 2, 3, 4].map(() => createUser()));

    await Promise.all([
      ...late.map((l, i) => hook('payment.captured', l.orderId, `pay_m_${i}`)),
      ...buyers.map(({ user }) => request(app).post('/api/bookings').set(authHeader(user.id)).send({
        eventId: event.id, guestName: 'G', guestEmail: 'g@example.test', guestPhone: '1', guestCount: 2,
      })),
    ]);

    const after = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    const holds = await prisma.booking.aggregate({
      where: { eventId: event.id, paymentStatus: 'unpaid', status: 'pending', createdAt: { gte: new Date(Date.now() - BOOKING_HOLD_MS) } },
      _sum: { guestCount: true },
    });
    expect(after.attendees).toBeLessThanOrEqual(after.capacity);
    // Whoever won each race, paid seats plus live holds still fit the event.
    expect(after.attendees + (holds._sum.guestCount ?? 0)).toBeLessThanOrEqual(after.capacity);
  });
});
