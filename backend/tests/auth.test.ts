import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import request from 'supertest';
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser } from './helpers';

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('hashes the password — the stored value is not plaintext, and bcrypt.compare succeeds', async () => {
    const plainPassword = 'a-real-password-123';

    const res = await request(app).post('/api/auth/signup').send({
      name: 'New Person',
      email: `signup-${Date.now()}@example.test`,
      password: plainPassword,
    });

    expect(res.status).toBe(201);

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: res.body.user.id } });
    // password is nullable on the model now (a Google-only account has
    // none) — a user created via this password-signup route always has
    // one, so a missing hash here is itself a real failure, not a type
    // formality to assert past.
    if (!stored.password) throw new Error('Expected a password hash for a password-signup user');
    expect(stored.password).not.toBe(plainPassword);
    expect(stored.password.startsWith('$2')).toBe(true); // bcrypt hash prefix
    await expect(bcrypt.compare(plainPassword, stored.password)).resolves.toBe(true);
  });
});

describe('POST /api/auth/signin — user enumeration', () => {
  it('returns the same generic message for a wrong password as for a nonexistent email', async () => {
    const { user, plainPassword } = await createUser();

    const wrongPassword = await request(app)
      .post('/api/auth/signin')
      .send({ email: user.email, password: `${plainPassword}-wrong` });

    const nonexistentEmail = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'nobody-by-this-email@example.test', password: 'whatever-password' });

    expect(wrongPassword.status).toBe(nonexistentEmail.status);
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.message).toBe(nonexistentEmail.body.message);
  });
});

describe('POST /api/auth/reset-password', () => {
  it('a reset token is single-use — reusing it fails', async () => {
    const { user } = await createUser();

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
    });

    const first = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'a-brand-new-password-1' });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'a-different-password-2' });
    expect(second.status).toBe(400);

    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.resetToken).toBeNull();
  });
});
