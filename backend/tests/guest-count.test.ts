import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { PLATFORM_FEE_FLAT, MAX_GUESTS_PER_BOOKING, BOOKING_HOLD_MS } from '../src/lib/booking';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { ordersCreate, paymentsRefund } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  ordersCreate.mockReset();
  paymentsRefund.mockReset();
});

afterAll(async () => {
  await prisma.$disconnect();
});

function payload(eventId: string, extra: Record<string, unknown> = {}) {
  return {
    eventId,
    guestName: 'Test Guest',
    guestEmail: 'guest@example.test',
    guestPhone: '9999999999',
    ...extra,
  };
}

function book(userId: string, eventId: string, extra: Record<string, unknown> = {}) {
  return request(app).post('/api/bookings').set(authHeader(userId)).send(payload(eventId, extra));
}

async function attendeesOf(eventId: string): Promise<number> {
  return (await prisma.event.findUniqueOrThrow({ where: { id: eventId } })).attendees;
}

function verifySignature(orderId: string, paymentId: string): string {
  return crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest('hex');
}

function signedWebhook(body: object) {
  const raw = JSON.stringify(body);
  const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest('hex');
  return request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', sig).send(raw);
}

describe('POST /api/bookings — pricing', () => {
  it('defaults guestCount to 1: total = price + flat fee', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });

    const res = await book(user.id, event.id);

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({
      guestCount: 1,
      ticketPrice: 500,
      platformFee: PLATFORM_FEE_FLAT,
      totalAmount: 500 + PLATFORM_FEE_FLAT,
    });
  });

  it('4 guests charges price*4 + one flat fee — the fee is not multiplied by guests', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });

    const one = await book(user.id, event.id, { guestCount: 1 });
    const four = await book(user.id, event.id, { guestCount: 4 });

    expect(four.status).toBe(201);
    expect(four.body.booking).toMatchObject({
      guestCount: 4,
      ticketPrice: 2000,
      platformFee: 25,
      totalAmount: 2025,
    });
    expect(four.body.booking.totalAmount - one.body.booking.totalAmount).toBe(3 * 500);
  });

  it('create-order charges exactly the server-computed total for a multi-guest booking', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });
    const created = await book(user.id, event.id, { guestCount: 3 });

    ordersCreate.mockResolvedValueOnce({ id: 'order_gc_1', amount: 152500, currency: 'INR' });
    const res = await request(app)
      .post('/api/payments/create-order')
      .set(authHeader(user.id))
      .send({ bookingId: created.body.booking.id });

    expect(res.status).toBe(200);
    expect(ordersCreate).toHaveBeenCalledWith(expect.objectContaining({ amount: 3 * 500 * 100 + 2500 }));
  });

  it('ignores any price, fee or total the client sends', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10 });

    const res = await book(user.id, event.id, {
      guestCount: 2,
      price: 1,
      ticketPrice: 1,
      platformFee: 0,
      totalAmount: 1,
      amount: 1,
    });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ ticketPrice: 1000, platformFee: 25, totalAmount: 1025 });
  });

  it('free event: reserves guestCount seats, confirmed and paid immediately, no payment step', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 10, attendees: 1 });

    const res = await book(user.id, event.id, { guestCount: 3 });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({
      guestCount: 3,
      ticketPrice: 0,
      totalAmount: PLATFORM_FEE_FLAT, // unchanged pre-existing behaviour: the flat fee is recorded
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'free',
    });
    expect(await attendeesOf(event.id)).toBe(4);
  });

  it('paid event: creating the booking does not move attendees (seats are taken on payment)', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 2 });

    const res = await book(user.id, event.id, { guestCount: 3 });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ status: 'pending', paymentStatus: 'unpaid' });
    expect(await attendeesOf(event.id)).toBe(2);
  });
});

describe('POST /api/bookings — guestCount validation', () => {
  it.each([
    ['zero', 0],
    ['negative', -2],
    ['non-integer', 1.5],
    ['a string', '2'],
    ['null', null],
    [`above the max of ${MAX_GUESTS_PER_BOOKING}`, MAX_GUESTS_PER_BOOKING + 1],
  ])('rejects guestCount that is %s', async (_label, value) => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 50 });

    const res = await book(user.id, event.id, { guestCount: value });

    expect(res.status).toBe(400);
    expect(await prisma.booking.count()).toBe(0);
  });

  it('rejects guestCount above the remaining capacity, with how many are left', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 5, attendees: 3 });

    const tooMany = await book(user.id, event.id, { guestCount: 3 });
    expect(tooMany.status).toBe(400);
    expect(tooMany.body.message).toBe('Only 2 spots left for this event');

    const fits = await book(user.id, event.id, { guestCount: 2 });
    expect(fits.status).toBe(201);
  });

  it('counts other people\'s unexpired pending bookings as taken seats', async () => {
    const { user: host } = await createUser();
    const { user: other } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 5, attendees: 1 });
    await createBooking({ userId: other.id, eventId: event.id, guestCount: 3 }); // pending + unpaid, holds 3

    const res = await book(user.id, event.id, { guestCount: 2 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only 1 spot left for this event');
  });

  it('a pending booking older than the hold window no longer holds seats, and nothing is released twice', async () => {
    const { user: host } = await createUser();
    const { user: other } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 3, attendees: 0 });
    await createBooking({
      userId: other.id,
      eventId: event.id,
      guestCount: 3,
      createdAt: new Date(Date.now() - BOOKING_HOLD_MS - 60_000),
    });

    const res = await book(user.id, event.id, { guestCount: 3 });

    expect(res.status).toBe(201);
    expect(await attendeesOf(event.id)).toBe(0); // expiry never touched the counter
  });

  it('a failed payment frees the held seats without touching attendees', async () => {
    const { user: host } = await createUser();
    const { user: other } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 2, attendees: 0 });
    await createBooking({ userId: other.id, eventId: event.id, guestCount: 2, razorpayOrderId: 'order_fail_1' });

    expect((await book(user.id, event.id, { guestCount: 2 })).status).toBe(400); // held

    const res = await signedWebhook({
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_x', order_id: 'order_fail_1' } } },
    });
    expect(res.status).toBe(200);

    expect((await book(user.id, event.id, { guestCount: 2 })).status).toBe(201);
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('a retry by the same user is not blocked by their own abandoned booking', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 2, attendees: 0 });

    expect((await book(user.id, event.id, { guestCount: 2 })).status).toBe(201);
    const retry = await book(user.id, event.id, { guestCount: 2 });

    expect(retry.status).toBe(201);
    const statuses = await prisma.booking.findMany({ select: { status: true } });
    expect(statuses.map((b) => b.status).sort()).toEqual(['expired', 'pending']);
  });
});

describe('POST /api/bookings — concurrency', () => {
  it('free event: simultaneous bookings for the last seats — exactly one wins, attendees never exceeds capacity', async () => {
    const { user: host } = await createUser();
    const users = await Promise.all(Array.from({ length: 6 }, () => createUser()));
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 3, attendees: 0 });

    const results = await Promise.all(users.map(({ user }) => book(user.id, event.id, { guestCount: 2 })));

    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 400)).toHaveLength(5);
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('paid event: simultaneous bookings for the last seats — held seats never exceed capacity', async () => {
    const { user: host } = await createUser();
    const users = await Promise.all(Array.from({ length: 6 }, () => createUser()));
    const event = await createEvent({ userId: host.id, price: 500, capacity: 3, attendees: 0 });

    const results = await Promise.all(users.map(({ user }) => book(user.id, event.id, { guestCount: 2 })));

    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    const held = await prisma.booking.aggregate({
      where: { eventId: event.id, status: 'pending', paymentStatus: 'unpaid' },
      _sum: { guestCount: true },
    });
    expect(held._sum.guestCount).toBe(2);
  });
});

describe('seat release uses guestCount, exactly once', () => {
  it('cancelling a paid 3-guest booking releases 3 seats; cancelling again releases nothing more', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 10, attendees: 5 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, guestCount: 3, ticketPrice: 0,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'free',
    });

    const first = await request(app).patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(user.id));
    expect(first.status).toBe(200);
    expect(await attendeesOf(event.id)).toBe(2);

    const second = await request(app).patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(user.id));
    expect(second.status).toBe(400);
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('simultaneous cancels of the same booking release the seats once', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 10, attendees: 5 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, guestCount: 3, ticketPrice: 0,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'free',
    });

    const results = await Promise.all(
      Array.from({ length: 4 }, () => request(app).patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(user.id))),
    );

    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('cancelling a paid Razorpay booking refunds the full total and releases guestCount seats', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 4 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, guestCount: 4, ticketPrice: 2000, platformFee: 25, totalAmount: 2025,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_gc_refund',
    });
    paymentsRefund.mockResolvedValueOnce({ id: 'rfnd_gc', amount: 202500 });

    const res = await request(app).patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(user.id));

    expect(res.status).toBe(200);
    expect(paymentsRefund).toHaveBeenCalledWith('pay_gc_refund', expect.objectContaining({ amount: 202500 }));
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('cancelling an unpaid booking releases no seats (it never took any)', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 5 });
    const booking = await createBooking({ userId: user.id, eventId: event.id, guestCount: 3 });

    const res = await request(app).patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(user.id));

    expect(res.status).toBe(200);
    expect(await attendeesOf(event.id)).toBe(5);
  });

  it('deleting an account releases guestCount seats for paid bookings only', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 5 });
    await createBooking({
      userId: user.id, eventId: event.id, guestCount: 2,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: 'pay_del',
    });
    await createBooking({ userId: user.id, eventId: event.id, guestCount: 3 }); // unpaid, never held seats

    const res = await request(app).delete('/api/users/me').set(authHeader(user.id));

    expect(res.status).toBe(200);
    expect(await attendeesOf(event.id)).toBe(3);
  });
});

describe('payment success reserves guestCount seats, once', () => {
  it('/verify adds guestCount seats and a replay adds nothing', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 1 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, guestCount: 3, razorpayOrderId: 'order_v_gc',
    });
    const body = {
      bookingId: booking.id,
      razorpay_order_id: 'order_v_gc',
      razorpay_payment_id: 'pay_v_gc',
      razorpay_signature: verifySignature('order_v_gc', 'pay_v_gc'),
    };

    const first = await request(app).post('/api/payments/verify').set(authHeader(user.id)).send(body);
    const replay = await request(app).post('/api/payments/verify').set(authHeader(user.id)).send(body);

    expect(first.status).toBe(200);
    expect(replay.status).toBe(409);
    expect(await attendeesOf(event.id)).toBe(4);
  });

  it('the webhook adds guestCount seats, and a duplicate delivery adds nothing', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 1 });
    await createBooking({ userId: user.id, eventId: event.id, guestCount: 3, razorpayOrderId: 'order_w_gc' });
    const hook = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_w_gc', order_id: 'order_w_gc' } } },
    };

    expect((await signedWebhook(hook)).status).toBe(200);
    expect((await signedWebhook(hook)).status).toBe(200);

    expect(await attendeesOf(event.id)).toBe(4);
  });

  it('/verify and the webhook racing for the same booking add the seats once', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 0 });
    const booking = await createBooking({ userId: user.id, eventId: event.id, guestCount: 2, razorpayOrderId: 'order_r_gc' });

    await Promise.all([
      request(app).post('/api/payments/verify').set(authHeader(user.id)).send({
        bookingId: booking.id,
        razorpay_order_id: 'order_r_gc',
        razorpay_payment_id: 'pay_r_gc',
        razorpay_signature: verifySignature('order_r_gc', 'pay_r_gc'),
      }),
      signedWebhook({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_r_gc', order_id: 'order_r_gc' } } } }),
    ]);

    expect(await attendeesOf(event.id)).toBe(2);
  });
});
