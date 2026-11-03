/**
 * Pure helpers for /my-bookings: how a booking is labelled, which tab it lives
 * in, whether it earns a QR code, and the calendar file it exports.
 */

export type BookingStatusKey = 'confirmed' | 'pending' | 'cancelled' | 'expired' | 'refunded' | 'unavailable';
export type BookingTab = 'upcoming' | 'past' | 'cancelled';

export interface DisplayBooking {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  guestCount?: number;
  event?: { title: string; date: string; time?: string | null; venue?: string | null; city?: string | null; slug?: string } | null;
}

/** One label per booking. A refund wins over whatever `status` still says. */
export function bookingStatusKey(b: Pick<DisplayBooking, 'status' | 'paymentStatus' | 'event'>): BookingStatusKey {
  if (!b.event) return 'unavailable';
  if (b.paymentStatus === 'refunded' || b.status === 'refunded') return 'refunded';
  if (b.status === 'confirmed' || b.status === 'pending' || b.status === 'cancelled' || b.status === 'expired') return b.status;
  return 'pending';
}

/** A QR (the door pass) only for a booking that is both confirmed and paid, for an event that exists. */
export function showQr(b: Pick<DisplayBooking, 'status' | 'paymentStatus' | 'event'>): boolean {
  return !!b.event && b.status === 'confirmed' && b.paymentStatus === 'paid';
}

/** Which tab a booking sits in. Cancelled, expired and refunded all count as "cancelled". */
export function bookingTab(b: DisplayBooking, now: Date = new Date()): BookingTab {
  const key = bookingStatusKey(b);
  if (key === 'cancelled' || key === 'expired' || key === 'refunded') return 'cancelled';
  const d = b.event?.date ? new Date(b.event.date) : null;
  return !d || d < now ? 'past' : 'upcoming';
}

/** The amount line on a row: say what actually happened to the money. */
export function amountLabel(b: Pick<DisplayBooking, 'status' | 'paymentStatus' | 'totalAmount' | 'event'>): { text: string; tone: 'free' | 'paid' | 'muted' } {
  const rupees = `₹${b.totalAmount.toLocaleString('en-IN')}`;
  if (b.totalAmount === 0) return { text: 'Free', tone: 'free' };
  if (b.paymentStatus === 'refunded') return { text: `${rupees} refunded`, tone: 'muted' };
  if (b.paymentStatus === 'paid') return { text: `${rupees} paid`, tone: 'paid' };
  if (b.status === 'expired') return { text: `${rupees} · not paid, expired`, tone: 'muted' };
  if (b.status === 'cancelled') return { text: `${rupees} · not paid`, tone: 'muted' };
  return { text: `${rupees} · payment pending`, tone: 'muted' };
}

/** What to show in place of the QR when there isn't one. */
export function noQrNotice(b: Pick<DisplayBooking, 'status' | 'paymentStatus' | 'event'>): string {
  switch (bookingStatusKey(b)) {
    case 'pending': return 'Your ticket appears here once your payment goes through.';
    case 'expired': return 'This booking expired before it was paid, so there is no ticket. Your spot was released.';
    case 'refunded': return 'This booking was refunded, so the ticket is no longer valid.';
    case 'cancelled': return 'This booking was cancelled, so the ticket is no longer valid.';
    default: return 'No ticket for this booking.';
  }
}

// ── Calendar (.ics) ──────────────────────────────────────────────────────────

/** Events carry only a start; assume two hours so calendars have a sensible block. */
export const DEFAULT_EVENT_HOURS = 2;
const EVENT_TZ = 'Asia/Kolkata';

/** RFC 5545 TEXT escaping: backslash, semicolon, comma and newlines. */
export function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n');
}

/** Fold a content line to 75 octets per RFC 5545 (continuation lines start with one space). */
export function foldIcsLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (curBytes + n > limit) {
      out.push(cur);
      cur = '';
      curBytes = 0;
      limit = 74; // the leading space of a continuation line counts too
    }
    cur += ch;
    curBytes += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/** "7:00 PM", "7 PM", "19:00", "6:30 am" -> [hours, minutes], or null if it isn't a time. */
export function parseEventTime(raw: string | null | undefined): [number, number] | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3]?.toLowerCase().replace(/\./g, '');
  if (min > 59) return null;
  if (mer) {
    if (h < 1 || h > 12) return null;
    if (mer === 'pm' && h !== 12) h += 12;
    if (mer === 'am' && h === 12) h = 0;
  } else if (h > 23) {
    return null;
  }
  return [h, min];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The event's calendar day (year, month, day) in the city's timezone. */
function eventDay(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: EVENT_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

const stamp = (y: number, mo: number, d: number, h: number, mi: number) => `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;

/** UTC timestamp for DTSTAMP, e.g. 20261101T120000Z. */
export function icsUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/**
 * The calendar file for one booking. Start is the event's day plus its `time`
 * text, written as floating local time (the same wall-clock hour wherever the
 * calendar is opened, which is right for an in-person event). If the time
 * can't be read, it is an all-day event rather than a made-up hour.
 * Lines end in CRLF, long lines are folded, and text is escaped.
 */
export function buildIcs(b: DisplayBooking, now: Date = new Date()): string {
  const ev = b.event;
  if (!ev) throw new Error('No event to add to a calendar');
  const day = eventDay(new Date(ev.date));
  const time = parseEventTime(ev.time);

  let dtstart: string;
  let dtend: string;
  if (time) {
    dtstart = `DTSTART:${stamp(day.y, day.m, day.d, time[0], time[1])}`;
    // Add the duration with real date arithmetic so it rolls over midnight and month ends correctly.
    const end = new Date(Date.UTC(day.y, day.m - 1, day.d, time[0] + DEFAULT_EVENT_HOURS, time[1]));
    dtend = `DTEND:${stamp(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes())}`;
  } else {
    const next = new Date(Date.UTC(day.y, day.m - 1, day.d + 1));
    dtstart = `DTSTART;VALUE=DATE:${day.y}${pad(day.m)}${pad(day.d)}`;
    dtend = `DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
  }

  const where = [ev.venue, ev.city].filter(Boolean).join(', ');
  const guests = b.guestCount && b.guestCount > 1 ? ` for ${b.guestCount} guests` : '';
  const description = `Your upSosh booking${guests}. Reference: UPSOSH-${b.id}`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//upSosh//Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.id}@upsosh.app`,
    `DTSTAMP:${icsUtcStamp(now)}`,
    dtstart,
    dtend,
    `SUMMARY:${escapeIcsText(ev.title)}`,
    ...(where ? [`LOCATION:${escapeIcsText(where)}`] : []),
    `DESCRIPTION:${escapeIcsText(description)}`,
    ...(ev.slug ? [`URL:https://www.upsosh.app/events/${ev.slug}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/** A filename that is safe on every OS. */
export function icsFilename(title: string): string {
  const base = title.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60);
  return `${base || 'event'}.ics`;
}
