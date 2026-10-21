import request from 'supertest';
import express from 'express';
jest.mock('../src/lib/email');

// The limiters are created when src/index loads and read TRUST_PROXY_HOPS then,
// so each scenario loads its own copy of the app.
async function loadApp(hops?: string) {
  jest.resetModules();
  if (hops === undefined) delete process.env.TRUST_PROXY_HOPS;
  else process.env.TRUST_PROXY_HOPS = hops;
  const mod = await import('../src/index');
  const prismaMod = await import('../src/lib/prisma');
  return { app: mod.default, prisma: prismaMod.default };
}

afterEach(() => {
  delete process.env.TRUST_PROXY_HOPS;
});

const STRICT_POSTS = ['signin', 'login', 'signup', 'forgot-password', 'reset-password', 'google'];

describe('AUTH-1: which routes use the strict auth limiter', () => {
  it.each(STRICT_POSTS)('POST /api/auth/%s is limited to 10 per window', async (name) => {
    const { app, prisma } = await loadApp();
    const res = await request(app).post(`/api/auth/${name}`).set('X-Forwarded-For', '203.0.113.10').send({});
    expect(res.headers['ratelimit-limit']).toBe('10');
    await prisma.$disconnect();
  });

  it('the 11th sign-in attempt from one client is refused, another client is unaffected', async () => {
    const { app, prisma } = await loadApp();
    const attempt = (ip: string) =>
      request(app).post('/api/auth/signin').set('X-Forwarded-For', ip).send({ email: 'nobody@example.test', password: 'x' });

    const statuses: number[] = [];
    for (let i = 0; i < 11; i++) statuses.push((await attempt('203.0.113.20')).status);

    expect(statuses.slice(0, 10).every((s) => s !== 429)).toBe(true);
    expect(statuses[10]).toBe(429);
    expect((await attempt('203.0.113.21')).status).not.toBe(429);
    await prisma.$disconnect();
  });

  it('GET /api/auth/me is not under the strict limiter and has its own, larger limit', async () => {
    const { app, prisma } = await loadApp();
    const first = await request(app).get('/api/auth/me').set('X-Forwarded-For', '203.0.113.30');
    expect(Number(first.headers['ratelimit-limit'])).toBeGreaterThan(100);

    // Well past both the strict limit (10) and the general one (100).
    let limited = 0;
    for (let i = 0; i < 120; i++) {
      const res = await request(app).get('/api/auth/me').set('X-Forwarded-For', '203.0.113.30');
      if (res.status === 429) limited += 1;
    }
    expect(limited).toBe(0);
    await prisma.$disconnect();
  });

  it('signout and ordinary reads use the general limiter, not the strict one', async () => {
    const { app, prisma } = await loadApp();
    const out = await request(app).post('/api/auth/signout').set('X-Forwarded-For', '203.0.113.40');
    expect(out.headers['ratelimit-limit']).toBe('100');
    const events = await request(app).get('/api/events').set('X-Forwarded-For', '203.0.113.40');
    expect(events.headers['ratelimit-limit']).toBe('100');
    await prisma.$disconnect();
  });
});

describe('AUTH-1: how the limiter key is derived (TRUST_PROXY_HOPS)', () => {
  // A tiny app with the same `trust proxy` setting and the same key function the
  // real limiters use. The test client is the peer, i.e. the nearest "proxy".
  async function keyFor(hops: number, xForwardedFor?: string): Promise<string> {
    const { rateLimitKey } = await import('../src/lib/rateLimit');
    const probe = express();
    probe.set('trust proxy', hops);
    probe.get('/key', (req, res) => res.json({ key: rateLimitKey(req) }));
    const req = request(probe).get('/key');
    if (xForwardedFor !== undefined) req.set('X-Forwarded-For', xForwardedFor);
    return (await req).body.key;
  }

  const CHAIN = '203.0.113.7, 198.51.100.2'; // client, then the first proxy in front of us

  it('0 hops: X-Forwarded-For is ignored, everyone shares the peer address', async () => {
    const peer = await keyFor(0);
    expect(await keyFor(0, CHAIN)).toBe(peer);
    expect(await keyFor(0, '9.9.9.9')).toBe(peer);
  });

  it('1 hop: the right-most entry (what the nearest proxy saw) is the client', async () => {
    expect(await keyFor(1, CHAIN)).toBe('198.51.100.2');
    expect(await keyFor(1, '203.0.113.7')).toBe('203.0.113.7');
  });

  it('2 hops: the entry before it', async () => {
    expect(await keyFor(2, CHAIN)).toBe('203.0.113.7');
  });

  it('an address a client prepends itself does not choose its bucket when the hop count is right', async () => {
    // Client sends "6.6.6.6"; the proxy in front of us appends the real address.
    expect(await keyFor(1, '6.6.6.6, 203.0.113.7')).toBe('203.0.113.7');
    // Hop count too high for this chain: the forged entry is believed.
    expect(await keyFor(2, '6.6.6.6, 203.0.113.7')).toBe('6.6.6.6');
  });

  it('too few hops makes different clients share one bucket (the setting must match the chain)', async () => {
    const a = await keyFor(1, '203.0.113.1, 198.51.100.2');
    const b = await keyFor(1, '203.0.113.2, 198.51.100.2');
    expect(a).toBe(b);
  });

  it('an IPv6 client is keyed by its /64, so changing the low bits does not give a fresh bucket', async () => {
    const a = await keyFor(1, '2001:db8:1:2:aaaa:bbbb:cccc:dddd');
    const b = await keyFor(1, '2001:db8:1:2:1111:2222:3333:4444');
    expect(a).toBe(b);
  });
});

describe('AUTH-1: TRUST_PROXY_HOPS parsing', () => {
  it('defaults to 1 when unset or blank', async () => {
    const { parseTrustProxyHops } = await import('../src/lib/proxy');
    expect(parseTrustProxyHops(undefined)).toBe(1);
    expect(parseTrustProxyHops('')).toBe(1);
  });

  it('accepts whole numbers from 0 to 10', async () => {
    const { parseTrustProxyHops } = await import('../src/lib/proxy');
    expect(parseTrustProxyHops('0')).toBe(0);
    expect(parseTrustProxyHops('2')).toBe(2);
    expect(parseTrustProxyHops(' 3 ')).toBe(3);
  });

  it('falls back to the default (with a warning) on anything else', async () => {
    const { parseTrustProxyHops } = await import('../src/lib/proxy');
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    for (const bad of ['-1', '1.5', 'two', '11', 'true']) expect(parseTrustProxyHops(bad)).toBe(1);
    expect(warn).toHaveBeenCalledTimes(5);
    warn.mockRestore();
  });

  it('is applied to the real app: the key follows the configured hop count', async () => {
    const { app, prisma } = await loadApp('2');
    // With 2 hops the client is the first XFF entry; two requests that differ
    // only in the proxy entry share one strict-limiter bucket.
    const hit = (xff: string) => request(app).post('/api/auth/signin').set('X-Forwarded-For', xff).send({ email: 'x@example.test', password: 'x' });
    const remaining: number[] = [];
    for (const xff of ['203.0.113.50, 198.51.100.1', '203.0.113.50, 198.51.100.2', '203.0.113.50, 198.51.100.3']) {
      remaining.push(Number((await hit(xff)).headers['ratelimit-remaining']));
    }
    expect(remaining).toEqual([9, 8, 7]);
    await prisma.$disconnect();
  });
});
