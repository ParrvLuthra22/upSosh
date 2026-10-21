import request from 'supertest';

// Cloudinary is replaced wholesale: nothing here talks to the network.
const uploadPrivateDocument = jest.fn();
const privateDocumentUrl = jest.fn();
const destroyDocument = jest.fn();
jest.mock('../src/lib/cloudinary', () => {
  const actual = jest.requireActual('../src/lib/cloudinary');
  return {
    ...actual,
    isCloudinaryConfigured: true,
    uploadPrivateDocument: (...a: unknown[]) => uploadPrivateDocument(...a),
    privateDocumentUrl: (...a: unknown[]) => privateDocumentUrl(...a),
    destroyDocument: (...a: unknown[]) => destroyDocument(...a),
  };
});
jest.mock('../src/lib/email');
import app from '../src/index';
import prisma from '../src/lib/prisma';
import { purgeExpiredDocuments, ID_DOCUMENT_RETENTION_DAYS, SIGNED_URL_TTL_SECONDS } from '../src/lib/idDocuments';
import { resetDb, createUser, authHeader } from './helpers';

const DAY = 24 * 60 * 60 * 1000;
let counter = 0;

beforeEach(async () => {
  await resetDb();
  await prisma.upload.deleteMany();
  await prisma.hostApplication.deleteMany();
  uploadPrivateDocument.mockReset();
  privateDocumentUrl.mockReset();
  destroyDocument.mockReset();
  uploadPrivateDocument.mockImplementation(async () => ({ ref: `private:upsosh-private/doc${++counter}.jpg` }));
  privateDocumentUrl.mockImplementation((ref: string) => `https://signed.example.test/${encodeURIComponent(ref)}?sig=abc`);
  destroyDocument.mockResolvedValue(undefined);
});
afterAll(async () => {
  await prisma.$disconnect();
});

const png = Buffer.from('89504e470d0a1a0a', 'hex');
async function uploadDoc(userId: string): Promise<string> {
  const res = await request(app).post('/api/uploads/private').set(authHeader(userId)).attach('file', png, { filename: 'id.png', contentType: 'image/png' });
  expect(res.status).toBe(200);
  return res.body.ref;
}
const application = (extra: object = {}) => ({ bio: 'I host things', experience: 'Some', categories: ['Meetup'], ...extra });
const apply = (userId: string, body: object) => request(app).post('/api/hosts/apply').set(authHeader(userId)).send(body);

async function submitted() {
  const { user } = await createUser();
  const id = await uploadDoc(user.id);
  const selfie = await uploadDoc(user.id);
  const res = await apply(user.id, application({ govIdUrl: id, selfieUrl: selfie }));
  expect(res.status).toBe(201);
  const app_ = await prisma.hostApplication.findUniqueOrThrow({ where: { userId: user.id } });
  return { user, id, selfie, app: app_ };
}

describe('uploading identity documents', () => {
  it('stores them privately and hands back a reference, never a URL', async () => {
    const { user } = await createUser();

    const res = await request(app).post('/api/uploads/private').set(authHeader(user.id)).attach('file', png, { filename: 'id.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.ref).toMatch(/^private:/);
    expect(JSON.stringify(res.body)).not.toMatch(/https?:/);
    expect(uploadPrivateDocument).toHaveBeenCalledTimes(1);
    expect(await prisma.upload.count({ where: { userId: user.id, url: res.body.ref } })).toBe(1);
  });

  it('requires a signed-in user', async () => {
    const res = await request(app).post('/api/uploads/private').attach('file', png, { filename: 'id.png', contentType: 'image/png' });
    expect(res.status).toBe(401);
  });
});

describe('submitting an application', () => {
  it('accepts references the applicant uploaded, and does not echo them back', async () => {
    const { user, id } = await submitted();

    const stored = await prisma.hostApplication.findUniqueOrThrow({ where: { userId: user.id } });
    expect(stored.govIdUrl).toBe(id);
    const res = await apply(user.id, application({ govIdUrl: id }));
    expect(res.status).toBe(201);
    expect(res.body.application).not.toHaveProperty('govIdUrl');
    expect(res.body.application).not.toHaveProperty('selfieUrl');
    expect(res.body.application.hasGovId).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('private:');
  });

  it('refuses a reference someone else uploaded, a public URL, and a blob URL', async () => {
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    const ownersRef = await uploadDoc(owner.id);

    for (const govIdUrl of [ownersRef, 'https://res.cloudinary.example.test/image/upload/v1/upsosh/id.jpg', 'blob:http://localhost:3000/abc']) {
      const res = await apply(other.id, application({ govIdUrl }));
      expect(res.status).toBe(400);
    }
    expect(await prisma.hostApplication.count({ where: { userId: other.id } })).toBe(0);
  });

  it('deletes the documents it replaces when someone re-applies', async () => {
    const { user, id, selfie } = await submitted();
    const newId = await uploadDoc(user.id);

    const res = await apply(user.id, application({ govIdUrl: newId, selfieUrl: selfie }));

    expect(res.status).toBe(201);
    expect(destroyDocument).toHaveBeenCalledTimes(1);
    expect(destroyDocument).toHaveBeenCalledWith(id);
  });
});

describe('who can see the documents', () => {
  it('the admin list shows that documents exist but never their references', async () => {
    await submitted();
    const { user: admin } = await createUser({ role: 'admin' });

    const res = await request(app).get('/api/hosts/admin/applications').set(authHeader(admin.id));

    expect(res.status).toBe(200);
    const [a] = res.body.applications;
    expect(a).not.toHaveProperty('govIdUrl');
    expect(a).not.toHaveProperty('selfieUrl');
    expect(a).toMatchObject({ hasGovId: true, hasSelfie: true });
    expect(JSON.stringify(res.body)).not.toContain('private:');
  });

  it('a non-admin cannot get a document link, not even the applicant', async () => {
    const { user, app: a } = await submitted();
    const { user: stranger } = await createUser();

    for (const who of [user, stranger]) {
      const res = await request(app).get(`/api/hosts/admin/applications/${a.id}/documents`).set(authHeader(who.id));
      expect(res.status).toBe(403);
      expect(JSON.stringify(res.body)).not.toMatch(/signed\.example|private:/);
    }
    expect(privateDocumentUrl).not.toHaveBeenCalled();
  });

  it('an admin gets short-lived signed links', async () => {
    const { app: a, id } = await submitted();
    const { user: admin } = await createUser({ role: 'admin' });
    const before = Math.floor(Date.now() / 1000);

    const res = await request(app).get(`/api/hosts/admin/applications/${a.id}/documents`).set(authHeader(admin.id));

    expect(res.status).toBe(200);
    expect(res.body.govIdUrl).toContain('https://signed.example.test/');
    expect(res.body.selfieUrl).toContain('https://signed.example.test/');
    const [ref, expiresAt] = privateDocumentUrl.mock.calls[0];
    expect(ref).toBe(id);
    expect(SIGNED_URL_TTL_SECONDS).toBeLessThanOrEqual(600);
    expect(expiresAt).toBeGreaterThanOrEqual(before + SIGNED_URL_TTL_SECONDS - 5);
    expect(expiresAt).toBeLessThanOrEqual(before + SIGNED_URL_TTL_SECONDS + 5);
  });

  it('approve and reject responses do not carry the references', async () => {
    const { app: a } = await submitted();
    const { app: b } = await submitted();
    const { user: admin } = await createUser({ role: 'admin' });

    const ok = await request(app).patch(`/api/hosts/admin/applications/${a.id}/approve`).set(authHeader(admin.id));
    const no = await request(app).patch(`/api/hosts/admin/applications/${b.id}/reject`).set(authHeader(admin.id)).send({ reviewNotes: 'no' });

    for (const res of [ok, no]) {
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toContain('private:');
    }
  });
});

describe('deleting the documents', () => {
  const reviewedDaysAgo = async (id: string, status: 'approved' | 'rejected', days: number) =>
    prisma.hostApplication.update({ where: { id }, data: { status, reviewedAt: new Date(Date.now() - days * DAY) } });

  it('uses a 30 day retention by default', () => {
    expect(ID_DOCUMENT_RETENTION_DAYS).toBe(30);
  });

  it('removes documents of applications reviewed longer ago than the retention period, and nothing else', async () => {
    const old = await submitted();
    const recent = await submitted();
    const pending = await submitted();
    await reviewedDaysAgo(old.app.id, 'approved', ID_DOCUMENT_RETENTION_DAYS + 1);
    await reviewedDaysAgo(recent.app.id, 'rejected', ID_DOCUMENT_RETENTION_DAYS - 1);
    await prisma.hostApplication.update({ where: { id: pending.app.id }, data: { createdAt: new Date(Date.now() - 90 * DAY) } });

    const summary = await purgeExpiredDocuments({ apply: true });

    expect(summary).toMatchObject({ applications: 1, assets: 2, failed: 0 });
    expect(destroyDocument).toHaveBeenCalledWith(old.id);
    expect(destroyDocument).toHaveBeenCalledWith(old.selfie);
    const gone = await prisma.hostApplication.findUniqueOrThrow({ where: { id: old.app.id } });
    expect(gone).toMatchObject({ govIdUrl: null, selfieUrl: null });
    expect(await prisma.upload.count({ where: { url: { in: [old.id, old.selfie] } } })).toBe(0);
    expect((await prisma.hostApplication.findUniqueOrThrow({ where: { id: recent.app.id } })).govIdUrl).toBe(recent.id);
    expect((await prisma.hostApplication.findUniqueOrThrow({ where: { id: pending.app.id } })).govIdUrl).toBe(pending.id);
  });

  it('also removes the documents of a deleted account, whatever the application status', async () => {
    const s = await submitted();
    await prisma.user.update({ where: { id: s.user.id }, data: { deletedAt: new Date() } });

    const summary = await purgeExpiredDocuments({ apply: true });

    expect(summary.applications).toBe(1);
    expect((await prisma.hostApplication.findUniqueOrThrow({ where: { id: s.app.id } })).govIdUrl).toBeNull();
  });

  it('does nothing without apply (dry run)', async () => {
    const s = await submitted();
    await reviewedDaysAgo(s.app.id, 'approved', 60);

    const summary = await purgeExpiredDocuments({ apply: false });

    expect(summary).toMatchObject({ applications: 1, assets: 2 });
    expect(destroyDocument).not.toHaveBeenCalled();
    expect((await prisma.hostApplication.findUniqueOrThrow({ where: { id: s.app.id } })).govIdUrl).toBe(s.id);
  });

  it('keeps the reference when Cloudinary fails, so a re-run retries', async () => {
    const s = await submitted();
    await reviewedDaysAgo(s.app.id, 'approved', 60);
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    destroyDocument.mockRejectedValueOnce(new Error('cloudinary down')).mockResolvedValue(undefined);

    const first = await purgeExpiredDocuments({ apply: true });

    expect(first.failed).toBe(1);
    const row = await prisma.hostApplication.findUniqueOrThrow({ where: { id: s.app.id } });
    expect(row.govIdUrl).toBe(s.id); // the one that failed
    expect(row.selfieUrl).toBeNull(); // the one that succeeded
    expect(errors.mock.calls.flat().join(' ')).not.toContain('private:');
    errors.mockRestore();

    const second = await purgeExpiredDocuments({ apply: true });
    expect(second.failed).toBe(0);
    expect((await prisma.hostApplication.findUniqueOrThrow({ where: { id: s.app.id } })).govIdUrl).toBeNull();
  });
});
