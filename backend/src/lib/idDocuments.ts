import prisma from './prisma';
import { destroyDocument } from './cloudinary';

/** How long identity documents are kept after an application is approved or rejected. */
export const ID_DOCUMENT_RETENTION_DAYS = 30;

/** How long an admin's signed document link works. */
export const SIGNED_URL_TTL_SECONDS = 300;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PurgeSummary {
  /** Applications that had documents due for deletion. */
  applications: number;
  /** Individual documents due for deletion (deleted, when apply is true). */
  assets: number;
  /** Documents Cloudinary could not delete this time; their references are kept for the next run. */
  failed: number;
}

/**
 * Deletes identity documents that are no longer needed: those of applications
 * reviewed (approved or rejected) more than ID_DOCUMENT_RETENTION_DAYS ago, and
 * of accounts that have been deleted. Pending applications are left alone.
 *
 * Without `apply` it only counts. Each document is deleted from Cloudinary
 * first and its reference cleared afterwards, so a failure leaves the
 * reference in place and the next run retries it. Failures are logged by
 * application id only.
 */
export async function purgeExpiredDocuments(options: { apply: boolean; now?: Date }): Promise<PurgeSummary> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now.getTime() - ID_DOCUMENT_RETENTION_DAYS * DAY_MS);

  const due = await prisma.hostApplication.findMany({
    where: {
      AND: [
        { OR: [{ govIdUrl: { not: null } }, { selfieUrl: { not: null } }] },
        {
          OR: [
            { status: { in: ['approved', 'rejected'] }, reviewedAt: { lt: cutoff } },
            { user: { deletedAt: { not: null } } },
          ],
        },
      ],
    },
    select: { id: true, govIdUrl: true, selfieUrl: true },
  });

  const summary: PurgeSummary = { applications: due.length, assets: 0, failed: 0 };
  for (const application of due) {
    for (const field of ['govIdUrl', 'selfieUrl'] as const) {
      const ref = application[field];
      if (!ref) continue;
      summary.assets += 1;
      if (!options.apply) continue;
      try {
        await destroyDocument(ref);
        await prisma.hostApplication.update({ where: { id: application.id }, data: { [field]: null } });
        await prisma.upload.deleteMany({ where: { url: ref } });
      } catch (err: unknown) {
        summary.failed += 1;
        console.error(`[IdDocuments] Could not delete the ${field} of application ${application.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return summary;
}
