/**
 * lib/hostEventTypes.ts
 * ───────────────────────
 * Display shape for a host's own event card on /host/dashboard, and the pure
 * helpers that build and style it from what /api/events/host/mine returns.
 */

/** Every EventStatus the backend can send (prisma enum EventStatus). */
export type HostEventStatus = 'draft' | 'live' | 'full' | 'past' | 'cancelled';

export interface HostEvent {
  id: string;
  slug: string;
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
  /** What the event's paid bookings actually collected, in rupees (from the API, not price x attendees). */
  revenue: number;
  isFree: boolean;
  /** ISO timestamp of the event start, for upcoming/past decisions. */
  startsAt: string | null;
  /** The raw status string. Unknown values are tolerated; see statusStyle(). */
  status: HostEventStatus | (string & {});
}

export interface StatusStyle {
  bg: string;
  text: string;
  label: string;
}

const STATUS_STYLES: Record<HostEventStatus, StatusStyle> = {
  live: { bg: 'bg-verified/10', text: 'text-verified', label: 'Live' },
  draft: { bg: 'bg-border', text: 'text-cream-dim', label: 'Draft' },
  full: { bg: 'bg-lime/10', text: 'text-lime', label: 'Full' },
  past: { bg: 'bg-border', text: 'text-cream-faint', label: 'Past' },
  cancelled: { bg: 'bg-coral/10', text: 'text-coral', label: 'Cancelled' },
};

const FALLBACK_STYLE: StatusStyle = { bg: 'bg-border', text: 'text-cream-dim', label: 'Unknown' };

/** Never undefined: a status the UI has not heard of gets a neutral badge instead of crashing the page. */
export function statusStyle(status: string | null | undefined): StatusStyle {
  if (status && Object.prototype.hasOwnProperty.call(STATUS_STYLES, status)) {
    return STATUS_STYLES[status as HostEventStatus];
  }
  return status ? { ...FALLBACK_STYLE, label: status.charAt(0).toUpperCase() + status.slice(1) } : FALLBACK_STYLE;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&fit=crop';

/** Shape one /api/events/host/mine row for the dashboard. `revenue` is the server's paid total. */
export function apiEventToHostEvent(ev: any): HostEvent {
  const d = ev.date ? new Date(ev.date) : null;
  return {
    id: ev.id,
    slug: ev.slug ?? ev.id,
    title: ev.title,
    category: ev.category ?? 'Event',
    image: ev.image ?? FALLBACK_IMAGE,
    status: ev.status ?? 'draft',
    attendees: ev.attendees ?? 0,
    capacity: ev.capacity ?? 30,
    date: d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dateShort: d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '',
    day: d ? d.getDate().toString() : '--',
    month: d ? d.toLocaleString('en-IN', { month: 'short' }) : '--',
    time: ev.time ?? '',
    revenue: typeof ev.revenue === 'number' ? ev.revenue : 0,
    isFree: Boolean(ev.isFree) || (ev.price ?? 0) === 0,
    startsAt: d ? d.toISOString() : null,
  };
}

/** Counts toward "upcoming": published (live or full), not cancelled, and still ahead. Drafts do not. */
export function isUpcoming(ev: Pick<HostEvent, 'status' | 'startsAt'>, now: Date = new Date()): boolean {
  if (ev.status !== 'live' && ev.status !== 'full') return false;
  return ev.startsAt !== null && new Date(ev.startsAt).getTime() >= now.getTime();
}

/** The dashboard's sidebar and bottom bar: each is a real page. */
export interface HostNavItem {
  id: string;
  label: string;
  href: string;
}

export const HOST_NAV: HostNavItem[] = [
  { id: 'overview', label: 'Overview', href: '/host/dashboard' },
  { id: 'events', label: 'My events', href: '/host/events' },
  { id: 'new', label: 'Create', href: '/host/events/new' },
  { id: 'planner', label: 'AI Planner', href: '/planner' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];

/** Which nav item the current path belongs to (longest matching href wins). */
export function activeHostNav(pathname: string): string {
  const match = HOST_NAV.filter((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.id ?? 'overview';
}
