import { Router, Response, RequestHandler } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { imageUpload, isCloudinaryConfigured, uploadBufferToCloudinary, uploadPrivateDocument } from '../lib/cloudinary';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const router = Router();

// POST /api/uploads — upload a file (requireAuth)
router.post(
  '/',
  requireAuth,
  // multer's RequestHandler type resolves against a duplicate, mismatched
  // copy of @types/express-serve-static-core pulled in transitively via
  // @types/cookie-parser's `@types/express: "*"` peer dependency — a
  // workspace-level dependency conflict, not an untyped value. The cast is
  // narrowly scoped to just this line.
  imageUpload.single('file') as unknown as RequestHandler,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

      if (!isCloudinaryConfigured) {
        console.warn('[Upload] Cloudinary not configured — returning placeholder URL');
        return res.status(503).json({
          message: 'Image upload service not configured. Please set CLOUDINARY_* environment variables.',
        });
      }

      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'upsosh',
        transformation: [
          { width: 1200, height: 840, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      });
      const url = result.secure_url;

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
    } catch (err: unknown) {
      console.error('Upload error:', errorMessage(err));
      return res.status(500).json({ message: errorMessage(err) || 'Upload failed' });
    }
  },
);

// POST /api/uploads/private — upload an identity document (requireAuth).
// Stored as a private Cloudinary asset. The response is a reference, not a URL:
// nothing the uploader (or anyone else) receives can open the file. Only an
// admin can get a short-lived link to it (GET /api/hosts/admin/applications/:id/documents).
router.post(
  '/private',
  requireAuth,
  imageUpload.single('file') as unknown as RequestHandler,
  async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      if (!isCloudinaryConfigured) {
        return res.status(503).json({ message: 'Image upload service not configured.' });
      }

      const { ref } = await uploadPrivateDocument(req.file.buffer);
      await prisma.upload.create({
        data: { userId: req.user!.id, url: ref, filename: 'identity-document', mimeType: req.file.mimetype, size: req.file.size },
      });
      return res.json({ ref });
    } catch (err: unknown) {
      console.error('Private upload error:', errorMessage(err));
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
);

export default router;
