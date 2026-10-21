import request from 'supertest';
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, authHeader } from './helpers';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const newEvent = (extra: object = {}) => ({
  title: 'A Perfectly Valid Event Title',
  type: 'Meetup',
  date: new Date(Date.now() + 7 * 864e5).toISOString(),
  venue: 'Somewhere',
  description: 'A description long enough to pass validation.',
  ...extra,
});

describe('AZ-1: isSuperhost is admin-only', () => {
  it('a host cannot create an event as superhost', async () => {
    const { user } = await createUser({ role: 'host', hostStatus: 'verified' });

    const res = await request(app).post('/api/events').set(authHeader(user.id)).send(newEvent({ isSuperhost: true }));

    expect(res.status).toBe(201);
    const stored = await prisma.event.findUniqueOrThrow({ where: { id: res.body.id } });
    expect(stored.isSuperhost).toBe(false);
  });

  it('a host cannot set it on update, and cannot clear an admin-granted one', async () => {
    const { user } = await createUser({ role: 'host', hostStatus: 'verified' });
    const plain = await createEvent({ userId: user.id });
    const granted = await createEvent({ userId: user.id });
    await prisma.event.update({ where: { id: granted.id }, data: { isSuperhost: true } });

    const up = await request(app).put(`/api/events/${plain.id}`).set(authHeader(user.id)).send({ isSuperhost: true, venue: 'New venue' });
    const down = await request(app).put(`/api/events/${granted.id}`).set(authHeader(user.id)).send({ isSuperhost: false });

    expect(up.status).toBe(200);
    expect(down.status).toBe(200);
    const stored = await prisma.event.findUniqueOrThrow({ where: { id: plain.id } });
    expect(stored).toMatchObject({ isSuperhost: false, venue: 'New venue' });
    expect((await prisma.event.findUniqueOrThrow({ where: { id: granted.id } })).isSuperhost).toBe(true);
  });

  it('an admin can set it on create and update', async () => {
    const { user: admin } = await createUser({ role: 'admin', hostStatus: 'verified' });

    const created = await request(app).post('/api/events').set(authHeader(admin.id)).send(newEvent({ isSuperhost: true }));
    expect((await prisma.event.findUniqueOrThrow({ where: { id: created.body.id } })).isSuperhost).toBe(true);

    const off = await request(app).put(`/api/events/${created.body.id}`).set(authHeader(admin.id)).send({ isSuperhost: false });
    expect(off.status).toBe(200);
    expect((await prisma.event.findUniqueOrThrow({ where: { id: created.body.id } })).isSuperhost).toBe(false);
  });
});

describe('AZ-2: a booking needs an event', () => {
  it('POST /api/bookings without eventId is refused and creates nothing', async () => {
    const { user } = await createUser();

    const res = await request(app).post('/api/bookings').set(authHeader(user.id))
      .send({ guestName: 'G', guestEmail: 'g@example.test', guestPhone: '123' });

    expect(res.status).toBe(400);
    expect(await prisma.booking.count()).toBe(0);
  });
});
