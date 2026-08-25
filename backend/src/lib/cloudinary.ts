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
