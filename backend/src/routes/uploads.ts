import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Use memory storage — we stream the buffer straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowedMime = /^image\/(jpeg|jpg|png|gif|webp)$/i;
    if (allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  },
});

// POST /api/uploads — upload a file (requireAuth)
router.post(
  '/',
  requireAuth as any,
  upload.single('file') as any,
  async (req: AuthRequest, res): Promise<any> => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      let url: string;

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const fileBuffer = (req as any).file!.buffer;
        const result = await new Promise<any>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'upsosh',
              transformation: [
                { width: 1200, height: 840, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
              ],
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          (stream as any).end(fileBuffer);
        });
        url = result.secure_url;
      } else {
        // Fallback: return a placeholder if Cloudinary isn't configured
        console.warn('[Upload] Cloudinary not configured — returning placeholder URL');
        return res.status(503).json({
          message: 'Image upload service not configured. Please set CLOUDINARY_* environment variables.',
        });
      }

      await prisma.upload.create({
        data: {
          userId: req.user!.id,
          url,
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });

      return res.json({ url, filename: req.file.originalname });
    } catch (err: any) {
      console.error('Upload error:', err.message);
      return res.status(500).json({ message: err.message || 'Upload failed' });
    }
  },
);

export default router;
