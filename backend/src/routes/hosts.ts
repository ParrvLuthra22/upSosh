import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { hostApplySchema } from '../lib/schemas';
import { notify } from '../lib/notify';
import { isPrivateRef, privateDocumentUrl, destroyDocument } from '../lib/cloudinary';
import { SIGNED_URL_TTL_SECONDS } from '../lib/idDocuments';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

/** An application as it may be shown: whether documents exist, never where they are. */
function publicApplication<T extends { govIdUrl: string | null; selfieUrl: string | null }>(application: T) {
  const { govIdUrl, selfieUrl, ...rest } = application;
  return { ...rest, hasGovId: !!govIdUrl, hasSelfie: !!selfieUrl };
}

// POST /api/hosts/apply — submit host application (requireAuth)
router.post('/apply', requireAuth, validateBody(hostApplySchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      govIdUrl, selfieUrl, bio, experience, categories,
      instagram, linkedin, website, sampleEvent,
    } = req.body as z.infer<typeof hostApplySchema>;

    // Documents must be private references this user uploaded themselves
    // (POST /api/uploads/private). A public URL, a blob: URL or someone else's
    // reference is refused, so an applicant cannot attach a file they do not own.
    const documents = [govIdUrl, selfieUrl].filter((v): v is string => !!v);
    if (documents.length > 0) {
      const owned = await prisma.upload.count({ where: { userId: req.user!.id, url: { in: documents } } });
      if (documents.some((d) => !isPrivateRef(d)) || owned !== new Set(documents).size) {
        return res.status(400).json({ message: 'Please upload your identity documents again.' });
      }
    }

    const categoriesJson = Array.isArray(categories) ? JSON.stringify(categories) : (categories ?? '[]');

    const applicationData: Omit<Prisma.HostApplicationUncheckedCreateInput, 'userId'> = {
      bio,
      experience,
      categories: categoriesJson,
      govIdUrl: govIdUrl || null,
      selfieUrl: selfieUrl || null,
      instagram: instagram ?? null,
      linkedin: linkedin ?? null,
      website: website ?? null,
    };

    if (sampleEvent) {
      applicationData.sampleEventTitle = sampleEvent.title ?? null;
      applicationData.sampleEventCategory = sampleEvent.category ?? null;
      applicationData.sampleEventDesc = sampleEvent.description ?? null;
      applicationData.sampleEventDate = sampleEvent.date ?? null;
      applicationData.sampleEventTime = sampleEvent.time ?? null;
      applicationData.sampleEventVenue = sampleEvent.venue ?? null;
      applicationData.sampleEventCity = sampleEvent.city ?? null;
      applicationData.sampleEventCapacity = sampleEvent.capacity ?? null;
      applicationData.sampleEventIsFree = sampleEvent.isFree ?? true;
      applicationData.sampleEventPrice = sampleEvent.price ?? null;
    }

    const previous = await prisma.hostApplication.findUnique({ where: { userId: req.user!.id }, select: { id: true, govIdUrl: true, selfieUrl: true } });

    const application = await prisma.hostApplication.upsert({
      where: { userId: req.user!.id },
      update: { ...applicationData, status: 'pending', reviewedAt: null, reviewNotes: null },
      create: { userId: req.user!.id, ...applicationData },
    });

    // Set user hostStatus to pending
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { hostStatus: 'pending' },
    });

    // Documents this application replaced are no longer needed: delete them.
    const kept = new Set([application.govIdUrl, application.selfieUrl]);
    for (const old of [previous?.govIdUrl, previous?.selfieUrl]) {
      if (!old || kept.has(old)) continue;
      try {
        await destroyDocument(old);
        await prisma.upload.deleteMany({ where: { url: old } });
      } catch (err: unknown) {
        console.error(`[IdDocuments] Could not delete a replaced document of application ${previous!.id}: ${errorMessage(err)}`);
      }
    }

    return res.status(201).json({ message: 'Host application submitted successfully', application: publicApplication(application) });
  } catch (err: unknown) {
    console.error('POST /hosts/apply error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/admin/applications — list all applications (admin only)
router.get('/admin/applications', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.query;
    const where: Prisma.HostApplicationWhereInput = {};
    if (status) where.status = String(status);

    const applications = await prisma.hostApplication.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ applications: applications.map(publicApplication) });
  } catch (err: unknown) {
    console.error('GET /hosts/admin/applications error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/admin/applications/:id/documents — short-lived links to the
// applicant's identity documents (admin only). The only place a document can
// be opened from; the links stop working after SIGNED_URL_TTL_SECONDS.
router.get('/admin/applications/:id/documents', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const application = await prisma.hostApplication.findUnique({
      where: { id: req.params.id },
      select: { govIdUrl: true, selfieUrl: true },
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const expiresAt = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS;
    // A private reference gets a signed link. A document saved before they were
    // private is already a plain URL and is returned as it is.
    const link = (stored: string | null) => (!stored ? null : isPrivateRef(stored) ? privateDocumentUrl(stored, expiresAt) : stored);
    return res.json({ govIdUrl: link(application.govIdUrl), selfieUrl: link(application.selfieUrl), expiresAt });
  } catch (err: unknown) {
    console.error('GET /hosts/admin/applications/:id/documents error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/hosts/admin/applications/:id/approve
router.patch('/admin/applications/:id/approve', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    const application = await prisma.hostApplication.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const [updatedApp] = await prisma.$transaction([
      prisma.hostApplication.update({
        where: { id },
        data: { status: 'approved', reviewedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: { hostStatus: 'verified', role: 'host' },
      }),
    ]);

    notify(
      application.userId,
      'host',
      "You're a verified host!",
      'Your host application was approved — you can now create events.',
    );

    return res.json({ message: 'Application approved', application: publicApplication(updatedApp) });
  } catch (err: unknown) {
    console.error('PATCH /hosts/admin/applications/:id/approve error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/hosts/admin/applications/:id/reject
router.patch('/admin/applications/:id/reject', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { reviewNotes } = req.body;

    const application = await prisma.hostApplication.findUnique({ where: { id } });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const [updatedApp] = await prisma.$transaction([
      prisma.hostApplication.update({
        where: { id },
        data: { status: 'rejected', reviewedAt: new Date(), reviewNotes: reviewNotes ?? null },
      }),
      prisma.user.update({
        where: { id: application.userId },
        data: { hostStatus: 'none' },
      }),
    ]);

    notify(
      application.userId,
      'host',
      'Host application update',
      reviewNotes ? `Your application wasn't approved this time: ${reviewNotes}` : "Your application wasn't approved this time.",
    );

    return res.json({ message: 'Application rejected', application: publicApplication(updatedApp) });
  } catch (err: unknown) {
    console.error('PATCH /hosts/admin/applications/:id/reject error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/:id — get host profile (public). Called by
// frontend/lib/api.ts's getHostById, used from EventCard/EventDetailsModal.
router.get('/:id', async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const host = await prisma.host.findUnique({
      where: { id },
      include: {
        events: {
          where: { status: { in: ['live', 'past'] } },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!host) return res.status(404).json({ message: 'Host not found' });

    return res.json({ host });
  } catch (err: unknown) {
    console.error('GET /hosts/:id error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
