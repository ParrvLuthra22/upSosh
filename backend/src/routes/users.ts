import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

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

function sanitizeUser(user: any) {
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
router.patch('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const allowed = ['name', 'bio', 'photoUrl', 'city', 'groupSize', 'vibe', 'frequency',
      'wantsToHost', 'hostBio', 'hostExperience', 'hostCategories',
      'hostInstagram', 'hostLinkedin', 'hostWebsite', 'onboardingComplete', 'interests'];

    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (updateData.name !== undefined) updateData.name = String(updateData.name).trim();
    if (updateData.bio !== undefined) updateData.bio = String(updateData.bio).trim().slice(0, 500);
    if (updateData.city !== undefined) updateData.city = String(updateData.city).trim();

    const user = Object.keys(updateData).length
      ? await prisma.user.update({ where: { id: req.user!.id }, data: updateData })
      : await prisma.user.findUnique({ where: { id: req.user!.id } });

    return res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    console.error('PATCH /users/me error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/users/me/password — change password (requires current password)
router.patch('/me/password', requireAuth, async (req: AuthRequest, res: Response): Promise<any> => {
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
  } catch (err: any) {
    console.error('PATCH /users/me/password error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/users/me/avatar — upload avatar via Cloudinary
router.post(
  '/me/avatar',
  requireAuth as any,
  upload.single('avatar') as any,
  async (req: AuthRequest, res: Response): Promise<any> => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file provided' });

      let photoUrl: string;

      const isCloudinaryConfigured = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (isCloudinaryConfigured) {
        const fileBuffer = (req as any).file!.buffer;
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'upsosh/avatars', transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }] },
            (err: any, r: any) => { if (err) reject(err); else resolve(r); },
          );
          (stream as any).end(fileBuffer);
        });
        photoUrl = result.secure_url;
      } else {
        return res.status(503).json({ message: 'Image upload not configured' });
      }

      await prisma.user.update({ where: { id: req.user!.id }, data: { photoUrl } });
      return res.json({ photoUrl, avatarUrl: photoUrl });
    } catch (err: any) {
      console.error('POST /users/me/avatar error:', err.message);
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
);

// GET /api/users/:id — public user profile
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, role: true, photoUrl: true, bio: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err: any) {
    console.error('GET /users/:id error:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
