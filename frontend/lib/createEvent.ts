// Pure model for the host "Create event" form: defaults, validation and the
// request payload. The payload is deliberately identical to what the previous
// page sent to POST /api/events.

import { parseIncludedLines } from '@/lib/eventContent';

export const CATEGORIES = ['Run Club', 'Meetup', 'Workshop', 'Dinner Club', 'Book Club', 'Fitness', 'Social', 'Other'] as const;

export interface CreateEventForm {
  title: string;
  description: string;
  included: string; // one item per line
  category: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM (24h)
  location: string;
  capacity: number;
  price: number | '';
  isFree: boolean;
  image: string;
}

export const DEFAULT_TIME = '18:00'; // 6:00 PM

/** Tomorrow's calendar date in India (the form's timezone), as YYYY-MM-DD. */
export function tomorrowIST(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const [y, m, d] = parts.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + 1));
  return t.toISOString().slice(0, 10);
}

export function defaultForm(now: Date = new Date()): CreateEventForm {
  return {
    title: '',
    description: '',
    included: '',
    category: 'Meetup',
    date: tomorrowIST(now),
    time: DEFAULT_TIME,
    location: '',
    capacity: 20,
    price: '',
    isFree: true,
    image: '',
  };
}

export type RequiredField = 'title' | 'date' | 'location';
const LABELS: Record<RequiredField, string> = { title: 'event name', date: 'date', location: 'location' };

/** Which required fields are still empty (same three the old page required). */
export function missingFields(f: Pick<CreateEventForm, RequiredField>): RequiredField[] {
  return (['title', 'date', 'location'] as const).filter((k) => !f[k].trim());
}

export function missingSummary(missing: RequiredField[]): string {
  if (!missing.length) return '';
  const names = missing.map((m) => LABELS[m]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
  return `Add ${list} to continue`;
}

/** "18:00" -> "6:00 PM" */
export function formatTime12(time: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!m) return time;
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** The exact body POSTed to /api/events (unchanged from the previous page). */
export function buildPayload(form: CreateEventForm, draft: boolean) {
  const { location, ...rest } = form;
  return {
    ...rest,
    included: parseIncludedLines(form.included),
    type: form.category,
    venue: location,
    price: form.isFree ? 0 : Number(form.price) || 0,
    status: draft ? 'draft' : 'live',
  };
}
