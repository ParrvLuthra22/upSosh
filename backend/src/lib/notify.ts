import prisma from './prisma';

export type NotificationType = 'booking' | 'event' | 'host' | 'verification' | 'general';

/**
 * Creates a notification row for a user. Fire-and-forget by design — a
 * failed notification insert should never fail the booking/approval/etc.
 * request that triggered it, so callers don't need to await this or handle
 * its errors.
 */
export function notify(userId: string, type: NotificationType, title: string, body: string): void {
  prisma.notification
    .create({ data: { userId, type, title, body } })
    .catch((err: unknown) => {
      console.error('[Notifications] create failed:', err instanceof Error ? err.message : String(err));
    });
}
