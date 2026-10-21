import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { cancelBooking } from '../src/lib/refunds';
import { getRazorpayClient } from '../src/routes/payments';
import { refundCutoff, userRefundDecision, IST_OFFSET_MS } from '../src/lib/refundPolicy';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { paymentsRefund } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  await prisma.notification.deleteMany();
  paymentsRefund.mockReset();
  paymentsRefund.mockResolvedValue({ id: 'rfnd_default' });
});
afterAll(async () => {
  await prisma.$disconnect();
});

const DAY = 24 * 60 * 60 * 1000;
const attendeesOf = async (eventId: string) => (await prisma.event.findUniqueOrThrow({ where: { id: eventId } })).attendees;
const bookingOf = (id: string) => prisma.booking.findUniqueOrThrow({ where: { id } });
const cancelHttp = (userId: string, bookingId: string) => request(app).patch(`/api/bookings/${bookingId}/cancel`).set(authHeader(userId));

/** A paid, confirmed Razorpay booking for 2 guests on an event dated `date`. */
async function paidBookingOn(date: Date, hostId?: string) {
  const host = hostId ? { id: hostId } : (await createUser({ role: 'host', hostStatus: 'verified' })).user;
  const { user } = await createUser();
  const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 2, date });
  const booking = await createBooking({
    userId: user.id, eventId: event.id, guestCount: 2, ticketPrice: 1000,
    status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay',
    paymentId: `pay_${crypto.randomBytes(4).toString('hex')}`, razorpayOrderId: `order_${crypto.randomBytes(4).toString('hex')}`,
  });
  return { host, user, event, booking };
}

describe('the cutoff is the start of the event day in India time', () => {
  // Host-created events store the picked day at 00:00 UTC (05:30 IST that day).
  const day = new Date('2026-11-01T00:00:00Z');
  const istMidnight = new Date('2026-10-31T18:30:00Z');

  it('refundCutoff is IST midnight of the date’s IST calendar day, whatever time the date carries', () => {
    expect(IST_OFFSET_MS).toBe(5.5 * 60 * 60 * 1000);
    expect(refundCutoff(day)).toEqual(istMidnight);
    expect(refundCutoff(new Date('2026-11-01T18:29:59.999Z'))).toEqual(istMidnight); // 23:59:59 IST
    expect(refundCutoff(new Date('2026-11-01T18:30:00Z'))).toEqual(new Date('2026-11-01T18:30:00Z')); // 00:00 IST, next day
  });

  it('decides full / event_day / event_ended at the boundary', () => {
    expect(userRefundDecision(day, new Date(istMidnight.getTime() - 1))).toBe('full');
    expect(userRefundDecision(day, istMidnight)).toBe('event_day');
    expect(userRefundDecision(day, new Date(istMidnight.getTime() + DAY - 1))).toBe('event_day');
    expect(userRefundDecision(day, new Date(istMidnight.getTime() + DAY))).toBe('event_ended');
  });
});

describe('cancelling your own booking', () => {
  it('before the cutoff: full refund (ticket plus fee) and seats released', async () => {
    const { user, event, booking } = await paidBookingOn(new Date(Date.now() + 3 * DAY));

    const res = await cancelHttp(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(paymentsRefund).toHaveBeenCalledWith(booking.paymentId, { amount: Math.round(booking.totalAmount * 100) });
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
    expect(await attendeesOf(event.id)).toBe(0);
    expect(res.body.refunded).toBe(true);
  });

  it('on the event day: cancelled, seats released, no refund requested, and it says so', async () => {
    const { user, event, booking } = await paidBookingOn(new Date());

    const res = await cancelHttp(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(paymentsRefund).not.toHaveBeenCalled();
    expect(res.body.refunded).toBe(false);
    expect(res.body.message).toMatch(/no refund/i);
    const stored = await bookingOf(booking.id);
    expect(stored).toMatchObject({ status: 'cancelled', paymentStatus: 'paid', paymentId: booking.paymentId });
    expect(stored.refundId).not.toBeNull(); // marks "no refund owed", so it is not mistaken for a failed refund
    expect(await attendeesOf(event.id)).toBe(0);
  });

  it('after the event has ended: cancelled, no refund', async () => {
    const { user, booking } = await paidBookingOn(new Date(Date.now() - 3 * DAY));

    const res = await cancelHttp(user.id, booking.id);

    expect(res.status).toBe(200);
    expect(paymentsRefund).not.toHaveBeenCalled();
    expect(res.body.refunded).toBe(false);
    expect((await bookingOf(booking.id)).status).toBe('cancelled');
  });

  it('boundary: one millisecond before IST midnight refunds, at IST midnight does not', async () => {
    const date = new Date('2026-11-01T00:00:00Z');
    const before = await paidBookingOn(date);
    const at = await paidBookingOn(date);

    const early = await cancelBooking(getRazorpayClient, before.booking.id, { now: new Date('2026-10-31T18:29:59.999Z') });
    const late = await cancelBooking(getRazorpayClient, at.booking.id, { now: new Date('2026-10-31T18:30:00.000Z') });

    expect(early).toMatchObject({ outcome: 'cancelled', refund: 'done' });
    expect(late).toMatchObject({ outcome: 'cancelled', refund: 'none' });
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
  });

  it('double cancel after the cutoff: the second is refused and never turns into a refund', async () => {
    const { user, booking } = await paidBookingOn(new Date());

    expect((await cancelHttp(user.id, booking.id)).status).toBe(200);
    const second = await cancelHttp(user.id, booking.id);

    expect(second.status).toBe(400);
    expect(paymentsRefund).not.toHaveBeenCalled();
  });

  it('a refund that failed before the cutoff is still honoured when retried after it', async () => {
    const date = new Date('2026-11-01T00:00:00Z');
    const { booking } = await paidBookingOn(date);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    paymentsRefund.mockRejectedValueOnce({ statusCode: 502, error: { description: 'gateway down' } });

    const first = await cancelBooking(getRazorpayClient, booking.id, { now: new Date('2026-10-30T10:00:00Z') });
    expect(first).toMatchObject({ outcome: 'cancelled', refund: 'failed' });
    errors.mockRestore();

    const retry = await cancelBooking(getRazorpayClient, booking.id, { now: new Date('2026-11-01T10:00:00Z') });
    expect(retry).toMatchObject({ outcome: 'cancelled', refund: 'done' });
    expect(await bookingOf(booking.id)).toMatchObject({ paymentStatus: 'refunded' });
  });
});

describe('host cancellation is not affected by the user cutoff', () => {
  it('refunds a booking on an event happening today in full', async () => {
    const { host, event, booking } = await paidBookingOn(new Date());

    const res = await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    expect(res.status).toBe(200);
    expect(paymentsRefund).toHaveBeenCalledTimes(1);
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'cancelled', paymentStatus: 'refunded' });
  });
});
