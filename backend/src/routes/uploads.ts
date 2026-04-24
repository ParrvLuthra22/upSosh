import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    const allowedExt = /\.(jpeg|jpg|png|gif|webp)$/i;
    const allowedMime = /^image\/(jpeg|jpg|png|gif|webp)$/i;
    if (allowedExt.test(file.originalname) && allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  },
});

// Serve uploaded files statically
router.use('/files', express.static(UPLOAD_DIR));

// POST /api/uploads — upload a file (requireAuth)
router.post(
  '/',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requireAuth as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upload.single('file') as any,
  async (req: AuthRequest, res): Promise<any> => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    const url = `${backendUrl}/api/uploads/files/${req.file.filename}`;

    await prisma.upload.create({
      data: {
        userId: req.user!.id,
        url,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });

    return res.json({ url, filename: req.file.filename });
  } catch (err: any) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
  }
);

export default router;
