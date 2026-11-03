import crypto from 'crypto';
import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
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

describe('deleting an account', () => {
  it('is blocked (409) while the user hosts an upcoming event with paid bookings, and nothing changes', async () => {
    const { host, event, booking } = await paidBookingOn(new Date(Date.now() + 5 * DAY));

    const res = await request(app).delete('/api/users/me').set(authHeader(host.id));

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/cancel/i);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: host.id } })).deletedAt).toBeNull();
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).status).toBe('live');
    expect(await bookingOf(booking.id)).toMatchObject({ status: 'confirmed', paymentStatus: 'paid' });
  });

  it('is allowed once the host has cancelled that event (which refunded the attendees)', async () => {
    const { host, event, booking } = await paidBookingOn(new Date(Date.now() + 5 * DAY));
    await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    const res = await request(app).delete('/api/users/me').set(authHeader(host.id));

    expect(res.status).toBe(200);
    expect(await bookingOf(booking.id)).toMatchObject({ paymentStatus: 'refunded' });
  });

  it('is allowed when the hosted events are past, empty, or have only unpaid bookings', async () => {
    const { host, event: past } = await paidBookingOn(new Date(Date.now() - 5 * DAY));
    await createEvent({ userId: host.id, price: 500, date: new Date(Date.now() + 5 * DAY) }); // upcoming, no bookings
    const upcoming = await createEvent({ userId: host.id, price: 500, date: new Date(Date.now() + 6 * DAY) });
    const { user: buyer } = await createUser();
    await createBooking({ userId: buyer.id, eventId: upcoming.id, status: 'pending', paymentStatus: 'unpaid' });

    const res = await request(app).delete('/api/users/me').set(authHeader(host.id));

    expect(res.status).toBe(200);
    expect(past.id).toBeTruthy();
  });

  it('as an attendee after the cutoff: allowed, and the no-refund booking does not hold it up', async () => {
    const { user, booking } = await paidBookingOn(new Date());

    const res = await request(app).delete('/api/users/me').set(authHeader(user.id));

    expect(res.status).toBe(200);
    expect(paymentsRefund).not.toHaveBeenCalled();
    expect((await bookingOf(booking.id)).status).toBe('cancelled');
  });
});
