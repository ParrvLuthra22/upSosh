import request from 'supertest';
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Authorization / IDOR', () => {
  it('GET /api/bookings/:id — user A cannot fetch user B\'s booking', async () => {
    const { user: userA } = await createUser();
    const { user: userB } = await createUser();
    const event = await createEvent({ userId: userB.id });
    const bookingB = await createBooking({ userId: userB.id, eventId: event.id });

    const res = await request(app)
      .get(`/api/bookings/${bookingB.id}`)
      .set(authHeader(userA.id));

    expect(res.status).toBe(403);
  });

  it('POST /api/payments/create-order — user A cannot create an order against user B\'s booking', async () => {
    const { user: userA } = await createUser();
    const { user: userB } = await createUser();
    const event = await createEvent({ userId: userB.id, price: 500 });
    const bookingB = await createBooking({ userId: userB.id, eventId: event.id, totalAmount: 525 });

    const res = await request(app)
      .post('/api/payments/create-order')
      .set(authHeader(userA.id))
      .send({ bookingId: bookingB.id });

    expect(res.status).toBe(403);
  });

  it('POST /api/events — a non-host (hostStatus !== verified) is refused', async () => {
    const { user } = await createUser({ hostStatus: 'none' });

    const res = await request(app)
      .post('/api/events')
      .set(authHeader(user.id))
      .send({
        title: 'A Perfectly Valid Event Title',
        type: 'Meetup',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Somewhere',
        description: 'A description long enough to pass validation.',
      });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/hosts/admin/applications/:id/approve — a non-admin is refused', async () => {
    const { user } = await createUser({ role: 'user' });
    const applicant = await createUser();
    const application = await prisma.hostApplication.create({
      data: {
        userId: applicant.user.id,
        bio: 'I host things.',
        experience: 'A few events.',
      },
    });

    const res = await request(app)
      .patch(`/api/hosts/admin/applications/${application.id}/approve`)
      .set(authHeader(user.id));

    expect(res.status).toBe(403);

    const stored = await prisma.hostApplication.findUniqueOrThrow({ where: { id: application.id } });
    expect(stored.status).toBe('pending');
  });
});
