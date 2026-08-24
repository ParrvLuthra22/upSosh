import { Router, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Prisma, User } from '@prisma/client';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl ?? null,
    bio: user.bio ?? null,
    role: user.role ?? 'user',
    hostStatus: user.hostStatus ?? 'none',
    city: user.city ?? null,
    onboardingComplete: user.onboardingComplete ?? false,
    interests: user.interests ?? '[]',
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

// PATCH /api/users/me — update profile fields
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const allowed = ['name', 'bio', 'photoUrl', 'city', 'groupSize', 'vibe', 'frequency',
      'wantsToHost', 'hostBio', 'hostExperience', 'hostCategories',
      'hostInstagram', 'hostLinkedin', 'hostWebsite', 'onboardingComplete', 'interests'] as const;

    const updateData: Prisma.UserUpdateInput = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        (updateData as Record<string, unknown>)[key] = req.body[key];
      }
    }

    if (updateData.name !== undefined) updateData.name = String(updateData.name).trim();
    if (updateData.bio !== undefined) updateData.bio = String(updateData.bio).trim().slice(0, 500);
    if (updateData.city !== undefined) updateData.city = String(updateData.city).trim();

    const user = Object.keys(updateData).length
      ? await prisma.user.update({ where: { id: req.user!.id }, data: updateData })
      : await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user: sanitizeUser(user) });
  } catch (err: unknown) {
    console.error('PATCH /users/me error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/users/me/password — change password (requires current password)
router.patch('/me/password', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(String(currentPassword), user.password);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(String(newPassword), 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });

    return res.json({ message: 'Password updated successfully' });
  } catch (err: unknown) {
    console.error('PATCH /users/me/password error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/users/me — soft delete: anonymize the account, cancel the
// user's own pending/confirmed bookings, keep the row (Bookings/Events/
// HostApplications still need a valid userId to point at).
router.delete('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user!.id;

    const activeBookings = await prisma.booking.findMany({
      where: { userId, status: { in: ['pending', 'confirmed'] } },
    });

    const anonEmail = `deleted-${userId}@deleted.upsosh.app`;
    const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);

    await prisma.$transaction([
      ...activeBookings.map((b) =>
        prisma.booking.update({ where: { id: b.id }, data: { status: 'cancelled' } })
      ),
      ...activeBookings
        .filter((b) => b.eventId)
        .map((b) =>
          prisma.event.update({ where: { id: b.eventId! }, data: { attendees: { decrement: 1 } } })
        ),
      prisma.user.update({
        where: { id: userId },
        data: {
          email: anonEmail,
          name: 'Deleted user',
          password: unusablePassword,
          photoUrl: null,
          bio: null,
          city: null,
          resetToken: null,
          resetTokenExpiry: null,
          deletedAt: new Date(),
        },
      }),
    ]);

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return res.json({ message: 'Account deleted' });
  } catch (err: unknown) {
    console.error('DELETE /users/me error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/users/me/avatar — upload avatar via Cloudinary
router.post(
  '/me/avatar',
  requireAuth,
  // multer's RequestHandler type resolves against a duplicate, mismatched
  // copy of @types/express-serve-static-core pulled in transitively via
  // @types/cookie-parser's `@types/express: "*"` peer dependency — a
  // workspace-level dependency conflict, not an untyped value. The cast is
  // narrowly scoped to just this line.
  upload.single('avatar') as unknown as RequestHandler,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file provided' });

      let photoUrl: string;

      const isCloudinaryConfigured = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (isCloudinaryConfigured) {
        const fileBuffer = req.file.buffer;
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'upsosh/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] },
            (err?: UploadApiErrorResponse, r?: UploadApiResponse) => {
              if (err || !r) reject(err ?? new Error('Cloudinary upload returned no result'));
              else resolve(r);
            },
          );
          stream.end(fileBuffer);
        });
        photoUrl = result.secure_url;
      } else {
        return res.status(503).json({ message: 'Image upload not configured' });
      }

      await prisma.user.update({ where: { id: req.user!.id }, data: { photoUrl } });
      return res.json({ photoUrl, avatarUrl: photoUrl });
    } catch (err: unknown) {
      console.error('POST /users/me/avatar error:', errorMessage(err));
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
);

// GET /api/users/:id — public user profile
router.get('/:id', async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, role: true, photoUrl: true, bio: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err: unknown) {
    console.error('GET /users/:id error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
