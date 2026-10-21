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

async function hostWithEvent() {
  const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
  const event = await createEvent({ userId: host.id, price: 500, capacity: 20, attendees: 0 });
  return { host, event };
}

/** A paid, confirmed Razorpay booking on `eventId`, holding its seats. */
async function paidOn(eventId: string, guestCount = 2, userId?: string) {
  const uid = userId ?? (await createUser()).user.id;
  await prisma.event.update({ where: { id: eventId }, data: { attendees: { increment: guestCount } } });
  const booking = await createBooking({
    userId: uid, eventId, guestCount, ticketPrice: 500 * guestCount,
    status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay',
    paymentId: `pay_${crypto.randomBytes(4).toString('hex')}`,
    razorpayOrderId: `order_${crypto.randomBytes(4).toString('hex')}`,
  });
  return booking;
}

describe('Host cancels an event: every paid booking is refunded', () => {
  it('DELETE refunds paid bookings, releases their seats, closes unpaid ones and notifies attendees', async () => {
    const { host, event } = await hostWithEvent();
    const a = await paidOn(event.id, 2);
    const b = await paidOn(event.id, 3);
    const { user: freeUser } = await createUser();
    await prisma.event.update({ where: { id: event.id }, data: { attendees: { increment: 1 } } });
    const free = await createBooking({
      userId: freeUser.id, eventId: event.id, guestCount: 1, ticketPrice: 0, platformFee: 0, totalAmount: 0,
      status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'free',
    });
    const { user: unpaidUser } = await createUser();
    const unpaid = await createBooking({ userId: unpaidUser.id, eventId: event.id, guestCount: 2, status: 'pending', paymentStatus: 'unpaid' });

    const res = await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    expect(res.status).toBe(200);
    expect(res.body.refunds).toMatchObject({ refunded: 2, failed: 0, remaining: 0 });
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).status).toBe('cancelled');
    expect(await bookingOf(a.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await bookingOf(b.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await bookingOf(free.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'paid' });
    expect(await bookingOf(unpaid.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'unpaid' });
    expect(paymentsRefund).toHaveBeenCalledTimes(2);
    expect(await attendeesOf(event.id)).toBe(0);

    const notified = await prisma.notification.findMany({ where: { userId: { in: [a.userId, b.userId, freeUser.id, unpaidUser.id] } } });
    expect(notified.map((n) => n.userId).sort()).toEqual([a.userId, b.userId, freeUser.id, unpaidUser.id].sort());
  });

  it('a refund failure is reported, leaves that booking cancelled-but-paid, and a re-run finishes only what is left', async () => {
    const { host, event } = await hostWithEvent();
    const a = await paidOn(event.id, 2);
    const b = await paidOn(event.id, 1);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    paymentsRefund.mockImplementation(async (paymentId: string) => {
      if (paymentId === b.paymentId) throw { statusCode: 502, error: { description: 'gateway down' } };
      return { id: 'rfnd_ok' };
    });

    const first = await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    expect(first.status).toBe(200);
    expect(first.body.refunds).toMatchObject({ refunded: 1, failed: 1, remaining: 1 });
    expect(await bookingOf(a.id)).toMatchObject({ paymentStatus: 'refunded' });
    expect(await bookingOf(b.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'paid', paymentId: b.paymentId });
    expect(await attendeesOf(event.id)).toBe(0);
    expect(errors.mock.calls.flat().join(' ')).toContain(b.id);
    expect(errors.mock.calls.flat().join(' ')).not.toContain(b.paymentId);
    errors.mockRestore();

    paymentsRefund.mockReset();
    paymentsRefund.mockResolvedValue({ id: 'rfnd_retry' });
    const second = await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    expect(second.body.refunds).toMatchObject({ refunded: 1, failed: 0, remaining: 0 });
    expect(paymentsRefund).toHaveBeenCalledTimes(1); // only the one left
    expect(paymentsRefund).toHaveBeenCalledWith(b.paymentId, expect.anything());
    expect(await bookingOf(b.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0); // not released twice
    const notes = await prisma.notification.findMany({ where: { userId: b.userId } });
    expect(notes).toHaveLength(1); // told once, when the refund went through
  });

  it('PUT with status=cancelled does the same and keeps its response shape', async () => {
    const { host, event } = await hostWithEvent();
    const a = await paidOn(event.id, 2);

    const res = await request(app).put(`/api/events/${event.id}`).set(authHeader(host.id)).send({ status: 'cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
    expect(res.body.refunds).toBeUndefined();
    expect(await bookingOf(a.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('PUT with another status refunds nobody', async () => {
    const { host, event } = await hostWithEvent();
    const a = await paidOn(event.id, 2);

    const res = await request(app).put(`/api/events/${event.id}`).set(authHeader(host.id)).send({ title: 'Renamed event' });

    expect(res.status).toBe(200);
    expect(await bookingOf(a.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
    expect(paymentsRefund).not.toHaveBeenCalled();
  });

  it('stops at its time budget and a re-run resumes', async () => {
    const { cancelEventBookings } = await import('../src/lib/refunds');
    const { getRazorpayClient } = await import('../src/routes/payments');
    const { event } = await hostWithEvent();
    const all = [await paidOn(event.id, 1), await paidOn(event.id, 1), await paidOn(event.id, 1)];
    await prisma.event.update({ where: { id: event.id }, data: { status: 'cancelled' } });
    paymentsRefund.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 60));
      return { id: 'rfnd_slow' };
    });

    const first = await cancelEventBookings(getRazorpayClient, event.id, { budgetMs: 80 });
    expect(first.remaining).toBeGreaterThan(0);
    expect(first.refunded).toBeLessThan(3);

    const second = await cancelEventBookings(getRazorpayClient, event.id, { budgetMs: 10_000 });
    expect(second.remaining).toBe(0);
    expect(first.refunded + second.refunded).toBe(3);
    expect(paymentsRefund).toHaveBeenCalledTimes(3);
    for (const b of all) expect(await bookingOf(b.id)).toMatchObject({ paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('concurrent runs never refund a booking twice', async () => {
    const { host, event } = await hostWithEvent();
    await paidOn(event.id, 2);
    await paidOn(event.id, 1);
    paymentsRefund.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 30));
      return { id: 'rfnd_x' };
    });

    await Promise.all([1, 2, 3].map(() => request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id))));

    expect(paymentsRefund).toHaveBeenCalledTimes(2);
    expect(await attendeesOf(event.id)).toBe(0);
  });
});

describe('Account deletion refunds the user’s paid bookings first', () => {
  it('refunds, releases seats and then anonymises', async () => {
    const { event } = await hostWithEvent();
    const { user } = await createUser();
    const a = await paidOn(event.id, 2, user.id);

    const res = await request(app).delete('/api/users/me').set(authHeader(user.id));

    expect(res.status).toBe(200);
    expect(await bookingOf(a.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).deletedAt).not.toBeNull();
  });

  it('a refund failure stops the deletion (account untouched); the re-run finishes it', async () => {
    const { event } = await hostWithEvent();
    const { user } = await createUser();
    const a = await paidOn(event.id, 2, user.id);
    const b = await paidOn(event.id, 1, user.id);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    paymentsRefund.mockImplementation(async (paymentId: string) => {
      if (paymentId === b.paymentId) throw { statusCode: 502, error: { description: 'gateway down' } };
      return { id: 'rfnd_ok' };
    });

    const first = await request(app).delete('/api/users/me').set(authHeader(user.id));

    expect(first.status).toBe(502);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).deletedAt).toBeNull();
    expect(await bookingOf(a.id)).toMatchObject({ paymentStatus: 'refunded' });
    expect(await bookingOf(b.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'paid' });
    errors.mockRestore();

    paymentsRefund.mockReset();
    paymentsRefund.mockResolvedValue({ id: 'rfnd_retry' });
    const second = await request(app).delete('/api/users/me').set(authHeader(user.id));

    expect(second.status).toBe(200);
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(await bookingOf(b.id)).toMatchObject({ paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).deletedAt).not.toBeNull();
  });
});
