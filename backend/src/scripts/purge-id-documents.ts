/**
 * Deletes host identity documents that are no longer needed: those of
 * applications approved or rejected more than ID_DOCUMENT_RETENTION_DAYS (30)
 * ago, and those of deleted accounts. Pending applications are never touched.
 *
 * There is no scheduler in this project, so run it by hand, for example monthly:
 *
 *   npm run purge-id-documents               # dry run: only counts
 *   npm run purge-id-documents -- --apply    # deletes
 *
 * It runs against whatever DATABASE_URL points at (backend/.env is loaded) and
 * uses the CLOUDINARY_* credentials from the same place. It prints the database
 * host first, so check that it is the one you mean before using --apply. Safe to
 * re-run: a document Cloudinary fails to delete keeps its reference and is
 * retried next time.
 */
import '../lib/loadEnv';
import prisma from '../lib/prisma';
import { isCloudinaryConfigured } from '../lib/cloudinary';
import { purgeExpiredDocuments, ID_DOCUMENT_RETENTION_DAYS } from '../lib/idDocuments';

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');

  let host = 'unknown';
  try {
    host = new URL(process.env.DATABASE_URL ?? '').hostname || 'unknown';
  } catch { /* leave as unknown */ }
  console.log(`Database host: ${host}`);
  console.log(`Retention: ${ID_DOCUMENT_RETENTION_DAYS} days after review. Mode: ${apply ? 'APPLY (deleting)' : 'dry run (nothing is deleted)'}`);

  if (apply && !isCloudinaryConfigured) {
    console.error('CLOUDINARY_* is not configured; refusing to run with --apply.');
    process.exitCode = 1;
    return;
  }

  const summary = await purgeExpiredDocuments({ apply });
  console.log(`${summary.applications} application(s), ${summary.assets} document(s) ${apply ? 'processed' : 'due'}, ${summary.failed} failed.`);
  if (!apply && summary.assets > 0) console.log('Run again with --apply to delete them.');
  if (summary.failed > 0) process.exitCode = 1;
}

main()
  .catch((err: unknown) => {
    console.error('purge-id-documents failed:', err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
