import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { hostApplySchema } from '../lib/schemas';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

// POST /api/hosts/apply — submit host application (requireAuth)
router.post('/apply', requireAuth, validateBody(hostApplySchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      govIdUrl, selfieUrl, bio, experience, categories,
      instagram, linkedin, website, sampleEvent,
    } = req.body as z.infer<typeof hostApplySchema>;

    const categoriesJson = Array.isArray(categories) ? JSON.stringify(categories) : (categories ?? '[]');

    const applicationData: Omit<Prisma.HostApplicationUncheckedCreateInput, 'userId'> = {
      bio,
      experience,
      categories: categoriesJson,
      govIdUrl: govIdUrl ?? null,
      selfieUrl: selfieUrl ?? null,
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

    return res.status(201).json({ message: 'Host application submitted successfully', application });
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

    return res.json({ applications });
  } catch (err: unknown) {
    console.error('GET /hosts/admin/applications error:', errorMessage(err));
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

    return res.json({ message: 'Application approved', application: updatedApp });
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

    return res.json({ message: 'Application rejected', application: updatedApp });
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
