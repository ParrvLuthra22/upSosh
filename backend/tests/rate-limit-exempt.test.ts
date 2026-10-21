import request from 'supertest';
import crypto from 'crypto';
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('The general rate limiter never blocks the health check or the Razorpay webhook', () => {
  it('still answers /health and a signed webhook after the limiter has started refusing requests', async () => {
    let limited = false;
    for (let i = 0; i < 130 && !limited; i++) {
      limited = (await request(app).get('/')).status === 429;
    }
    expect(limited).toBe(true); // the limiter really is blocking this client now

    expect((await request(app).get('/health')).status).toBe(200);

    const raw = JSON.stringify({ event: 'some.unhandled.event', payload: {} });
    const sig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest('hex');
    const hook = await request(app).post('/api/payments/webhook')
      .set('Content-Type', 'application/json').set('x-razorpay-signature', sig).send(raw);
    expect(hook.status).toBe(200);

    // and other routes are still limited
    expect((await request(app).get('/')).status).toBe(429);
  });
});
