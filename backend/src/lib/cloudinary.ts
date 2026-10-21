import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Memory storage — every caller streams the buffer straight to Cloudinary,
// nothing is ever written to disk.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
  },
});

export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: { folder: string; transformation: Record<string, unknown>[] },
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error || !result) reject(error ?? new Error('Cloudinary upload returned no result'));
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
}

// ─── Private identity documents ───────────────────────────────────────────────
//
// Host ID photos and selfies are uploaded with type "authenticated": Cloudinary
// refuses to serve them at any plain URL, so nothing public exists to leak. The
// database keeps only a reference ("private:<public_id>.<format>"); an admin
// reads a document through a signed, expiring download link (privateDocumentUrl).

const PRIVATE_REF = /^private:(.+)\.([A-Za-z0-9]+)$/;

export function isPrivateRef(value: string): boolean {
  return PRIVATE_REF.test(value);
}

export async function uploadPrivateDocument(buffer: Buffer): Promise<{ ref: string }> {
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'upsosh-private', type: 'authenticated', resource_type: 'image', unique_filename: true, use_filename: false },
      (error?: UploadApiErrorResponse, res?: UploadApiResponse) => {
        if (error || !res) reject(error ?? new Error('Cloudinary upload returned no result'));
        else resolve(res);
      },
    );
    stream.end(buffer);
  });
  return { ref: `private:${result.public_id}.${result.format}` };
}

/** A signed download link for a private document that stops working at `expiresAt` (Unix seconds). */
export function privateDocumentUrl(ref: string, expiresAt: number): string {
  const match = PRIVATE_REF.exec(ref);
  if (!match) throw new Error('Not a private document reference');
  return cloudinary.utils.private_download_url(match[1], match[2], {
    type: 'authenticated',
    resource_type: 'image',
    expires_at: expiresAt,
  });
}

/**
 * Deletes a stored document: a private reference, or a legacy public
 * Cloudinary URL saved before documents were private. Anything else (for
 * example a browser blob: URL) has nothing stored, so there is nothing to do.
 * "Not found" counts as deleted.
 */
export async function destroyDocument(refOrUrl: string): Promise<void> {
  const priv = PRIVATE_REF.exec(refOrUrl);
  if (priv) {
    await cloudinary.uploader.destroy(priv[1], { type: 'authenticated', resource_type: 'image', invalidate: true });
    return;
  }
  const legacy = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.[A-Za-z0-9]+(?:\?.*)?$/.exec(refOrUrl);
  if (legacy) {
    await cloudinary.uploader.destroy(legacy[1], { type: 'upload', resource_type: 'image', invalidate: true });
  }
}
