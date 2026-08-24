/**
 * lib/hostEventTypes.ts
 * ───────────────────────
 * Display shape for a host's own event card on /host/dashboard.
 *
 * Extracted from lib/mockHostData.ts, which also held fabricated stats, a
 * fake activity feed, and fake revenue-by-day data — all deleted, along with
 * the /host/dashboard sections that rendered them (see git history for the
 * removed RevenueChart / ActivityFeed). This type describes the real events
 * /api/events/host/mine returns, via apiEventToHostEvent in
 * app/host/dashboard/page.tsx.
 */

export interface HostEvent {
  id: string;
  title: string;
  date: string;
  dateShort: string;
  day: string;
  month: string;
  time: string;
  category: string;
  image: string;
  attendees: number;
  capacity: number;
  revenue: number;
  status: 'live' | 'draft' | 'full' | 'past';
}
