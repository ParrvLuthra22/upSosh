import request from 'supertest';
jest.mock('../src/lib/email');
jest.mock('razorpay');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser, createEvent, createBooking, authHeader } from './helpers';
import { paymentsRefund } from '../__mocks__/razorpay';

beforeEach(async () => {
  await resetDb();
  paymentsRefund.mockReset();
});

afterAll(async () => {
  await prisma.$disconnect();
});

function bookingPayload(eventId: string) {
  return {
    eventId,
    guestName: 'Test Guest',
    guestEmail: 'guest@example.test',
    guestPhone: '9999999999',
  };
}

describe('POST /api/bookings — capacity', () => {
  it('rejects a booking on an event already at capacity', async () => {
    const { user: host } = await createUser();
    const { user: attendee } = await createUser();
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 1, attendees: 1 });

    const res = await request(app)
      .post('/api/bookings')
      .set(authHeader(attendee.id))
      .send(bookingPayload(event.id));

    expect(res.status).toBe(400);
  });

  it('concurrency: firing N+1 simultaneous bookings for the last seat lets exactly one succeed', async () => {
    const { user: host } = await createUser();
    const { user: attendee } = await createUser();
    const event = await createEvent({ userId: host.id, isFree: true, price: 0, capacity: 1, attendees: 0 });

    const N = 5; // N+1 concurrent requests for a single remaining seat
    const requests = Array.from({ length: N }, () =>
      request(app).post('/api/bookings').set(authHeader(attendee.id)).send(bookingPayload(event.id)),
    );

    const results = await Promise.all(requests);
    const succeeded = results.filter((r) => r.status === 201);
    const rejected = results.filter((r) => r.status === 400);

    expect(succeeded).toHaveLength(1);
    expect(rejected).toHaveLength(N - 1);

    const updatedEvent = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(updatedEvent.attendees).toBe(1); // not over-incremented by the losers

    const bookingCount = await prisma.booking.count({ where: { eventId: event.id } });
    expect(bookingCount).toBe(1);
  });
});

describe('PATCH /api/bookings/:id/cancel', () => {
  it('cancelling a paid Razorpay booking refunds it and frees the seat', async () => {
    const { user: host } = await createUser();
    const { user: attendee } = await createUser();
    const event = await createEvent({ userId: host.id, price: 500, capacity: 10, attendees: 1 });
    const booking = await createBooking({
      userId: attendee.id,
      eventId: event.id,
      ticketPrice: 500,
      platformFee: 25,
      totalAmount: 525,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'razorpay',
      paymentId: 'pay_to_refund_1',
    });

    paymentsRefund.mockResolvedValueOnce({ id: 'rfnd_1', amount: 52500 });

    const res = await request(app)
      .patch(`/api/bookings/${booking.id}/cancel`)
      .set(authHeader(attendee.id));

    expect(res.status).toBe(200);
    expect(paymentsRefund).toHaveBeenCalledWith('pay_to_refund_1', expect.objectContaining({ amount: 52500 }));

    const stored = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(stored.paymentStatus).toBe('refunded');
    expect(stored.status).toBe('cancelled');
    expect(stored.refundId).toBe('rfnd_1');

    const updatedEvent = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    expect(updatedEvent.attendees).toBe(0); // seat freed
  });
});
