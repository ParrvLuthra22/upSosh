/**
 * Hosts event images may be loaded from. Keep in sync with
 * `images.remotePatterns` in next.config.js — next/image rejects any other
 * host, which is what used to leave blank cards behind.
 */
export const ALLOWED_IMAGE_HOSTS = ['images.unsplash.com', 'plus.unsplash.com', 'res.cloudinary.com'] as const;

/** Returns a user-facing error message, or null when the URL is acceptable (or empty). */
export function validateImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hint = 'Upload the file instead, or use an image hosted on Cloudinary or Unsplash.';
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return `That doesn't look like a valid URL. ${hint}`;
  }
  if (url.protocol !== 'https:') return `Image links must start with https://. ${hint}`;
  if (!(ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname)) {
    return `Images from ${url.hostname} aren't supported. ${hint}`;
  }
  return null;
}
