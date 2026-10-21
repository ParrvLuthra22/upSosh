import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { createNotification } from '../src/lib/notify';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { paymentsRefund } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  await prisma.notification.deleteMany();
  paymentsRefund.mockReset();
  paymentsRefund.mockResolvedValue({ id: 'rfnd_x' });
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe('Notifications carry user-supplied text safely', () => {
  it('keeps markup as plain text (the UI renders it as text) but bounds its length', async () => {
    const { user } = await createUser();
    await createNotification(user.id, 'general', '<b>t</b>'.repeat(100), '<img src=x onerror=alert(1)>'.repeat(100));

    const [n] = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(n.title.length).toBeLessThanOrEqual(120);
    expect(n.body.length).toBeLessThanOrEqual(500);
    expect(n.body.startsWith('<img src=x')).toBe(true); // not entity-escaped: React escapes on render
  });

  it('a host-cancellation notice with a very long, markup-filled event title stays short and keeps the refund message', async () => {
    const { user: host } = await createUser({ role: 'host', hostStatus: 'verified' });
    const { user } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 1 });
    await prisma.event.update({ where: { id: event.id }, data: { title: `<script>alert(1)</script>${'x'.repeat(2000)}` } });
    await createBooking({
      userId: user.id, eventId: event.id, guestCount: 1, ticketPrice: 500, status: 'confirmed', paymentStatus: 'paid',
      paymentMethod: 'razorpay', paymentId: 'pay_n1', razorpayOrderId: 'order_n1',
    });

    await request(app).delete(`/api/events/${event.id}`).set(authHeader(host.id));

    const [n] = await prisma.notification.findMany({ where: { userId: user.id } });
    expect(n.body.length).toBeLessThanOrEqual(500);
    expect(n.body).toMatch(/refunded in full/);
  });
});
