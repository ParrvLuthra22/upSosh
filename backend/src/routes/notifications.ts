import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

// GET /api/notifications — most recent 30 for the current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return res.json({ notifications });
  } catch (err: unknown) {
    console.error('GET /notifications error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    return res.json({ message: 'All notifications marked read' });
  } catch (err: unknown) {
    console.error('PATCH /notifications/read-all error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
