import prisma from './prisma';

export type NotificationType = 'booking' | 'event' | 'host' | 'verification' | 'general';

const MAX_TITLE = 120;
const MAX_BODY = 500;

/** Bound user-supplied text. Notifications are plain text (the UI renders them as text), so nothing is HTML-escaped here. */
function clip(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/** Awaitable form, for callers that want to know it was written. Never throws. */
export async function createNotification(userId: string, type: NotificationType, title: string, body: string): Promise<void> {
  try {
    await prisma.notification.create({ data: { userId, type, title: clip(title, MAX_TITLE), body: clip(body, MAX_BODY) } });
  } catch (err: unknown) {
    console.error('[Notifications] create failed:', err instanceof Error ? err.message : String(err));
  }
}

/**
 * Creates a notification row for a user. Fire-and-forget by design — a
 * failed notification insert should never fail the booking/approval/etc.
 * request that triggered it, so callers don't need to await this or handle
 * its errors.
 */
export function notify(userId: string, type: NotificationType, title: string, body: string): void {
  void createNotification(userId, type, title, body);
}
