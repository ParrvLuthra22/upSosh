import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/hosts/apply — submit host application (requireAuth)
router.post('/apply', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const {
      govIdUrl, selfieUrl, bio, experience, categories,
      instagram, linkedin, website, sampleEvent,
    } = req.body;

    if (!bio || !experience) {
      return res.status(400).json({ message: 'Bio and experience are required' });
    }

    const categoriesJson = Array.isArray(categories) ? JSON.stringify(categories) : (categories ?? '[]');

    const applicationData: any = {
      bio: String(bio).trim(),
      experience: String(experience),
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
      applicationData.sampleEventCapacity = sampleEvent.capacity ? Number(sampleEvent.capacity) : null;
      applicationData.sampleEventIsFree = Boolean(sampleEvent.isFree ?? true);
      applicationData.sampleEventPrice = sampleEvent.price ? Number(sampleEvent.price) : null;
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
  } catch (err: any) {
    console.error('POST /hosts/apply error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/application — current user's application status (requireAuth)
router.get('/application', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const application = await prisma.hostApplication.findUnique({
      where: { userId: req.user!.id },
    });

    if (!application) {
      return res.status(404).json({ message: 'No host application found' });
    }

    return res.json({ application });
  } catch (err: any) {
    console.error('GET /hosts/application error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/admin/applications — list all applications (admin only)
router.get('/admin/applications', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.query;
    const where: any = {};
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
  } catch (err: any) {
    console.error('GET /hosts/admin/applications error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/hosts/admin/applications/:id/approve
router.patch('/admin/applications/:id/approve', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
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
  } catch (err: any) {
    console.error('PATCH /hosts/admin/applications/:id/approve error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/hosts/admin/applications/:id/reject
router.patch('/admin/applications/:id/reject', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
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
  } catch (err: any) {
    console.error('PATCH /hosts/admin/applications/:id/reject error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts — list verified hosts (public, optional ?city=)
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { city } = req.query;

    const where: any = { verified: true };
    if (city) {
      // Hosts are in the Host model; city filter not directly on Host, skip or join via events
    }

    const hosts = await prisma.host.findMany({
      where,
      include: {
        events: {
          where: { status: 'live' },
          take: 3,
          orderBy: { date: 'asc' },
        },
      },
    });

    return res.json({ hosts });
  } catch (err: any) {
    console.error('GET /hosts error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/hosts/:id — get host profile (public)
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
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
  } catch (err: any) {
    console.error('GET /hosts/:id error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
