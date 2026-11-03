import request from 'supertest';
import crypto from 'crypto';

const verifyIdToken = jest.fn();
jest.mock('google-auth-library', () => ({ OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })) }));
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { resetDb, createUser } from './helpers';

beforeAll(() => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.example.test';
});
beforeEach(async () => {
  await resetDb();
  verifyIdToken.mockReset();
});
afterAll(async () => {
  await prisma.$disconnect();
});

const asGoogleUser = (email: string, sub = `sub-${crypto.randomBytes(4).toString('hex')}`) =>
  verifyIdToken.mockResolvedValue({ getPayload: () => ({ email, sub, name: 'G User', email_verified: true }) });
const signIn = () => request(app).post('/api/auth/google').send({ credential: 'google-id-token' });

describe('AUTH-4: Google sign-in and existing password accounts', () => {
  it('does not link onto a password account that was never linked to Google', async () => {
    const { user } = await createUser();
    asGoogleUser(user.email, 'sub-victim');

    const res = await signIn();

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/password/i);
    expect(res.body.token).toBeUndefined();
    expect(res.headers['set-cookie']).toBeUndefined();
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).googleId).toBeNull();
  });

  it('still creates a new account for an email nobody has used', async () => {
    asGoogleUser('brand-new@example.test', 'sub-new');

    const res = await signIn();

    expect(res.status).toBe(200);
    const stored = await prisma.user.findUniqueOrThrow({ where: { email: 'brand-new@example.test' } });
    expect(stored).toMatchObject({ googleId: 'sub-new', password: null });
  });

  it('still signs in an account that is already linked to the same Google identity', async () => {
    const { user } = await createUser();
    await prisma.user.update({ where: { id: user.id }, data: { googleId: 'sub-linked' } });
    asGoogleUser(user.email, 'sub-linked');

    const res = await signIn();

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
  });

  it('still signs in a Google-only account (no password)', async () => {
    const { user } = await createUser();
    await prisma.user.update({ where: { id: user.id }, data: { password: null, googleId: 'sub-only' } });
    asGoogleUser(user.email, 'sub-only');

    expect((await signIn()).status).toBe(200);
  });
});
