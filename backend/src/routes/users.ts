import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};

function sanitizeUser(user: any) {
  const role = user.role ?? 'user';
  const hostStatus = user.hostStatus ?? (role === 'host' ? 'verified' : 'none');

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    bio: user.bio ?? null,
    role,
    hostStatus,
    onboardingComplete: user.onboardingComplete ?? false,
    interests: user.interests ?? '[]',
    city: user.city ?? null,
    groupSize: user.groupSize ?? null,
    vibe: user.vibe ?? null,
    frequency: user.frequency ?? null,
    wantsToHost: user.wantsToHost ?? false,
    hostBio: user.hostBio ?? null,
    hostExperience: user.hostExperience ?? null,
    hostCategories: user.hostCategories ?? '[]',
    hostInstagram: user.hostInstagram ?? null,
    hostLinkedin: user.hostLinkedin ?? null,
    hostWebsite: user.hostWebsite ?? null,
    createdAt: user.createdAt,
  };
}

// PATCH /api/users/me — update onboarding + profile fields
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const updateData: Record<string, any> = {};

    const { name } = req.body;
    if (name !== undefined) updateData.name = String(name).trim();

    const user = Object.keys(updateData).length
      ? await prisma.user.update({
          where: { id: req.user!.id },
          data: updateData,
          select: USER_SELECT,
        })
      : await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: USER_SELECT,
        });

    return res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('PATCH /users/me error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/:id — public user profile
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user });
  } catch (err: any) {
    console.error('GET /users/:id error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
