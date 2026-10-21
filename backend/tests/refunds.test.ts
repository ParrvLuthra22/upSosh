import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { ordersCreate, ordersFetch, paymentsRefund } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  await prisma.notification.deleteMany();
  ordersCreate.mockReset();
  ordersFetch.mockReset();
  paymentsRefund.mockReset();
  paymentsRefund.mockResolvedValue({ id: 'rfnd_default' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

const attendeesOf = async (eventId: string) => (await prisma.event.findUniqueOrThrow({ where: { id: eventId } })).attendees;
const bookingOf = (id: string) => prisma.booking.findUniqueOrThrow({ where: { id } });
const cancel = (userId: string, bookingId: string) =>
  request(app).patch(`/api/bookings/${bookingId}/cancel`).set(authHeader(userId));

function signedWebhook(body: object) {
  const raw = JSON.stringify(body);
  const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest('hex');
  return request(app).post('/api/payments/webhook').set('Content-Type', 'application/json').set('x-razorpay-signature', sig).send(raw);
}

/** A confirmed, paid Razorpay booking holding `guestCount` of the event's seats. */
async function paidBooking(opts: { guestCount?: number; capacity?: number; eventId?: string; hostId?: string } = {}) {
  const host = opts.hostId ? { id: opts.hostId } : (await createUser({ role: 'host', hostStatus: 'verified' })).user;
  const { user } = await createUser();
  const guestCount = opts.guestCount ?? 2;
  const event = opts.eventId
    ? await prisma.event.findUniqueOrThrow({ where: { id: opts.eventId } })
    : await createEvent({ userId: host.id, price: 500, capacity: opts.capacity ?? 10, attendees: 0 });
  await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: guestCount } } });
  const paymentId = `pay_${crypto.randomBytes(4).toString('hex')}`;
  const booking = await createBooking({
    userId: user.id, eventId: event.id, guestCount, ticketPrice: 500 * guestCount,
    status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId,
    razorpayOrderId: `order_${crypto.randomBytes(4).toString('hex')}`,
  });
  return { host, user, event, booking, paymentId };
}

describe('Cancel: the booking is claimed before any refund', () => {
  it('refunds a paid booking once and releases all of its seats', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 3 });

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded', refundId: 'rfnd_default' });
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(paymentsRefund).toHaveBeenCalledWith(booking.paymentId, { amount: Math.round(booking.totalAmount * 100) });
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('double cancel: the second is refused and nothing is refunded or released twice', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 3 } } }); // other people's seats

    expect((await cancel(user.id, booking.id)).status).toBe(200);
    const second = await cancel(user.id, booking.id);

    expect(second.status).toBe(400);
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(await attendeesOf(event.id)).toBe(3);
  });

  it('concurrent cancels: exactly one refund and one seat release', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 3 } } });
    paymentsRefund.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 40));
      return { id: 'rfnd_slow' };
    });

    const results = await Promise.all([1, 2, 3, 4, 5].map(() => cancel(user.id, booking.id)));

    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.every((r) => [200, 400, 409].includes(r.status))).toBe(true);
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(await attendeesOf(event.id)).toBe(3);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
  });

  it('refund failure: stays cancelled-but-paid with the payment id, seats released once, 502', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 2 });
    paymentsRefund.mockRejectedValueOnce({ statusCode: 502, error: { description: 'gateway down' } });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(502);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'paid', paymentId: booking.paymentId });
    expect(await attendeesOf(event.id)).toBe(0);
    expect(errors.mock.calls.flat().join(' ')).toContain(booking.id);
    errors.mockRestore();
  });

  it('retrying after a refund failure completes the refund without releasing seats again', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 3 } } });
    paymentsRefund.mockRejectedValueOnce({ statusCode: 502, error: { description: 'gateway down' } });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    await cancel(user.id, booking.id);
    errors.mockRestore();

    const retry = await cancel(user.id, booking.id);

    expect(retry.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded', refundId: 'rfnd_default' });
    expect(paymentsRefund).toHaveBeenCalledTimes(2);
    expect(await attendeesOf(event.id)).toBe(3);
  });

  it('a refund another worker is making right now is not repeated', async () => {
    const { user, booking } = await paidBooking();
    // Cancelled, still paid, and touched just now: someone is mid-refund.
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(409);
    expect(paymentsRefund).not.toHaveBeenCalled();
  });

  it('a refund abandoned long ago (worker died) is picked up', async () => {
    const { user, event, booking } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { decrement: 2 } } }); // seats were released already
    await prisma.$executeRaw`UPDATE "Booking" SET "status" = 'cancelled', "updatedAt" = now() - interval '10 minutes' WHERE "id" = ${booking.id}`;

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(200);
    expect((await bookingOf(booking.id)).paymentStatus).toBe('refunded');
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('an unpaid booking is cancelled with no refund and no seat release', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, attendees: 4 });
    const booking = await createBooking({ userId: user.id, eventId: event.id, status: 'pending', paymentStatus: 'unpaid' });

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(paymentsRefund).not.toHaveBeenCalled();
    expect(await attendeesOf(event.id)).toBe(4);
  });

  it('a free booking is cancelled, its seats released, nothing refunded', async () => {
    const { user: host } = await createUser();
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 0, isFree: true, attendees: 5 });
    const booking = await createBooking({
      userId: user.id, eventId: event.id, guestCount: 2, ticketPrice: 0, platformFee: 0, totalAmount: 0,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'free',
    });

    const res = await cancel(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(paymentsRefund).not.toHaveBeenCalled();
    expect(await attendeesOf(event.id)).toBe(3);
  });

  it("someone else's booking cannot be cancelled", async () => {
    const { booking } = await paidBooking();
    const { user: stranger } = await createUser();
    expect((await cancel(stranger.id, booking.id)).status).toBe(403);
    expect(paymentsRefund).not.toHaveBeenCalled();
  });
});

describe('refund.processed from the Razorpay dashboard', () => {
  const refundHook = (paymentId: string, refundId: string, amountPaise?: number) =>
    signedWebhook({
      event: 'refund.processed',
      payload: { refund: { entity: { id: refundId, payment_id: paymentId, ...(amountPaise === undefined ? {} : { amount: amountPaise }) } } },
    });

  it('a full refund made in the dashboard cancels the booking and releases its seats exactly once', async () => {
    const { event, booking, paymentId } = await paidBooking({ guestCount: 3 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 4 } } });

    const res = await refundHook(paymentId, 'rfnd_dash', Math.round(booking.totalAmount * 100));

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded', refundId: 'rfnd_dash' });
    expect(await attendeesOf(event.id)).toBe(4);
  });

  it('a duplicate delivery releases nothing more', async () => {
    const { event, booking, paymentId } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 5 } } });

    await refundHook(paymentId, 'rfnd_dash', Math.round(booking.totalAmount * 100));
    await refundHook(paymentId, 'rfnd_dash', Math.round(booking.totalAmount * 100));
    await Promise.all([1, 2, 3].map(() => refundHook(paymentId, 'rfnd_dash', Math.round(booking.totalAmount * 100))));

    expect(await attendeesOf(event.id)).toBe(5);
  });

  it('a refund our own cancel started does not release seats a second time', async () => {
    const { user, event, booking, paymentId } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 5 } } });

    // Razorpay reports the refund our cancel asked for, before and after our own write.
    paymentsRefund.mockImplementation(async () => {
      await refundHook(paymentId, 'rfnd_own', Math.round(booking.totalAmount * 100));
      return { id: 'rfnd_own' };
    });
    const res = await cancel(user.id, booking.id);
    await refundHook(paymentId, 'rfnd_own', Math.round(booking.totalAmount * 100));

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(5);
  });

  it('closes out a cancel whose refund was made but never recorded, without releasing seats again', async () => {
    const { event, booking, paymentId } = await paidBooking({ guestCount: 2 });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 3 } } });
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { decrement: 2 } } }); // already released
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });

    await refundHook(paymentId, 'rfnd_late', Math.round(booking.totalAmount * 100));

    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded', refundId: 'rfnd_late' });
    expect(await attendeesOf(event.id)).toBe(3);
  });

  it('a partial refund leaves the booking and its seats alone', async () => {
    const { event, booking, paymentId } = await paidBooking({ guestCount: 2 });

    await refundHook(paymentId, 'rfnd_part', 5000);

    expect(await bookingOf(booking.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(await attendeesOf(event.id)).toBe(2);
  });

  it('an unknown payment is acknowledged and ignored', async () => {
    const res = await refundHook('pay_unknown', 'rfnd_x', 1000);
    expect(res.status).toBe(200);
  });
});
