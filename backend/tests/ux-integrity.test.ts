import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/events/:slug visibility', () => {
  async function setup(status: 'draft' | 'cancelled' | 'live') {
    const { user: owner } = await createUser({ role: 'host', hostStatus: 'verified' });
    const event = await createEvent({ userId: owner.id, status });
    return { owner, event };
  }

  it.each(['draft', 'cancelled'] as const)('hides a %s event from anonymous callers (404, by slug and by id)', async (status) => {
    const { event } = await setup(status);
    expect((await request(app).get(`/api/events/${event.slug}`)).status).toBe(404);
    expect((await request(app).get(`/api/events/${event.id}`)).status).toBe(404);
  });

  it('answers the same 404 body as a slug that does not exist (no existence leak)', async () => {
    const { event } = await setup('draft');
    const hidden = await request(app).get(`/api/events/${event.slug}`);
    const missing = await request(app).get('/api/events/no-such-event');
    expect(hidden.body).toEqual(missing.body);
  });

  it.each(['draft', 'cancelled'] as const)('hides a %s event from another signed-in user', async (status) => {
    const { event } = await setup(status);
    const { user: stranger } = await createUser();
    const res = await request(app).get(`/api/events/${event.slug}`).set(authHeader(stranger.id));
    expect(res.status).toBe(404);
  });

  it.each(['draft', 'cancelled'] as const)('shows a %s event to its owner', async (status) => {
    const { owner, event } = await setup(status);
    const res = await request(app).get(`/api/events/${event.slug}`).set(authHeader(owner.id));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(status);
  });

  it.each(['draft', 'cancelled'] as const)('shows a %s event to an admin', async (status) => {
    const { event } = await setup(status);
    const { user: admin } = await createUser({ role: 'admin' });
    const res = await request(app).get(`/api/events/${event.slug}`).set(authHeader(admin.id));
    expect(res.status).toBe(200);
  });

  it('ignores a garbage token and treats the caller as anonymous', async () => {
    const { event } = await setup('draft');
    const res = await request(app).get(`/api/events/${event.slug}`).set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(404);
  });

  it.each(['live', 'full', 'past'] as const)('still serves a %s event publicly', async (status) => {
    const { user: owner } = await createUser({ role: 'host', hostStatus: 'verified' });
    const event = await createEvent({ userId: owner.id, status });
    expect((await request(app).get(`/api/events/${event.slug}`)).status).toBe(200);
  });
});

describe("event 'included' field", () => {
  const body = (extra: object = {}) => ({
    title: 'Included field event',
    type: 'Social',
    date: new Date(Date.now() + 5 * 864e5).toISOString(),
    venue: 'Somewhere',
    description: 'What the host wrote',
    price: 0,
    ...extra,
  });

  it('is empty when the host gave none', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const res = await request(app).post('/api/events').set(authHeader(host.id)).send(body());
    expect(res.status).toBe(201);
    expect(res.body.included).toEqual([]);
  });

  it('stores trimmed items, drops blanks, and returns the description untouched', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const res = await request(app).post('/api/events').set(authHeader(host.id)).send(body({ included: ['  Chai ', '', 'Mat'] }));
    expect(res.status).toBe(201);
    expect(res.body.included).toEqual(['Chai', 'Mat']);
    expect(res.body.description).toBe('What the host wrote');
    const read = await request(app).get(`/api/events/${res.body.slug}`);
    expect(read.body.included).toEqual(['Chai', 'Mat']);
  });

  it('can be edited, and rejects more than 12 items or an item over 120 characters', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const created = await request(app).post('/api/events').set(authHeader(host.id)).send(body({ included: ['a'] }));
    const put = await request(app).put(`/api/events/${created.body.id}`).set(authHeader(host.id)).send({ included: ['x', 'y'] });
    expect(put.status).toBe(200);
    expect(put.body.included).toEqual(['x', 'y']);
    const tooMany = await request(app).put(`/api/events/${created.body.id}`).set(authHeader(host.id)).send({ included: Array(13).fill('a') });
    expect(tooMany.status).toBe(400);
    const tooLong = await request(app).put(`/api/events/${created.body.id}`).set(authHeader(host.id)).send({ included: ['a'.repeat(121)] });
    expect(tooLong.status).toBe(400);
  });
});

describe('GET /api/users/me/stats', () => {
  it('requires auth', async () => {
    expect((await request(app).get('/api/users/me/stats')).status).toBe(401);
  });

  it('is all zeros for a user with no bookings', async () => {
    const { user } = await createUser();
    const res = await request(app).get('/api/users/me/stats').set(authHeader(user.id));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ eventsAttended: 0, upcomingCount: 0, totalPaid: 0, totalRefunded: 0, totalSpent: 0 });
  });

  it('counts attended and upcoming, and totals paid minus refunded', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const { user } = await createUser();
    const past = await createEvent({ userId: host.id, status: 'past', date: new Date(Date.now() - 3 * 864e5) });
    const future = await createEvent({ userId: host.id });
    const cancelledEvt = await createEvent({ userId: host.id, status: 'cancelled' });
    const paid = { status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay' } as const;
    await createBooking({ userId: user.id, eventId: past.id, ticketPrice: 475, totalAmount: 500, ...paid });
    await createBooking({ userId: user.id, eventId: future.id, ticketPrice: 975, totalAmount: 1000, ...paid });
    await createBooking({ userId: user.id, eventId: cancelledEvt.id, ticketPrice: 75, totalAmount: 100, ...paid });
    // refunded: money in and out, must not count as spend, attended or upcoming
    await createBooking({ userId: user.id, eventId: future.id, ticketPrice: 1975, totalAmount: 2000, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'razorpay' });
    // unpaid hold and an expired one never count
    await createBooking({ userId: user.id, eventId: future.id, totalAmount: 700, status: 'pending', paymentStatus: 'unpaid' });
    await createBooking({ userId: user.id, eventId: future.id, totalAmount: 800, status: 'expired', paymentStatus: 'unpaid' });

    const res = await request(app).get('/api/users/me/stats').set(authHeader(user.id));
    expect(res.status).toBe(200);
    expect(res.body.eventsAttended).toBe(1);
    expect(res.body.upcomingCount).toBe(1);
    expect(res.body.totalPaid).toBe(3600);
    expect(res.body.totalRefunded).toBe(2000);
    expect(res.body.totalSpent).toBe(1600);
  });

  it("does not include another user's bookings", async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const { user: a } = await createUser();
    const { user: b } = await createUser();
    const event = await createEvent({ userId: host.id });
    await createBooking({ userId: a.id, eventId: event.id, totalAmount: 900, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay' });
    const res = await request(app).get('/api/users/me/stats').set(authHeader(b.id));
    expect(res.body.totalSpent).toBe(0);
  });
});

describe('GET /api/events/host/mine revenue', () => {
  it('reports ticket revenue (ticketPrice of paid bookings): excludes platform fee, refunds, unpaid', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, attendees: 4 });
    await createBooking({ userId: user.id, eventId: event.id, ticketPrice: 500, platformFee: 25, totalAmount: 525, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'razorpay' });
    await createBooking({ userId: user.id, eventId: event.id, ticketPrice: 500, platformFee: 25, totalAmount: 525, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'razorpay' });
    await createBooking({ userId: user.id, eventId: event.id, ticketPrice: 500, platformFee: 25, totalAmount: 525, status: 'pending', paymentStatus: 'unpaid' });
    const idle = await createEvent({ userId: host.id, price: 500, attendees: 0 });

    const res = await request(app).get('/api/events/host/mine').set(authHeader(host.id));
    const row = res.body.events.find((e: { id: string }) => e.id === event.id);
    expect(row.revenue).toBe(500); // not 525: the platform fee is not the host's money
    expect(row.paidBookings).toBe(1);
    expect(res.body.events.find((e: { id: string }) => e.id === idle.id).revenue).toBe(0);
  });
});

describe('GET /api/events/host/stats upcoming count', () => {
  it('counts live and full events still ahead, not drafts, cancelled or past ones', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    await createEvent({ userId: host.id, status: 'live' });
    await createEvent({ userId: host.id, status: 'full' });
    await createEvent({ userId: host.id, status: 'draft' });
    await createEvent({ userId: host.id, status: 'cancelled' });
    await createEvent({ userId: host.id, status: 'live', date: new Date(Date.now() - 2 * 864e5) });
    const res = await request(app).get('/api/events/host/stats').set(authHeader(host.id));
    expect(res.status).toBe(200);
    expect(res.body.upcomingEvents).toBe(2);
    expect(res.body.eventsHosted).toBe(5);
  });
});
