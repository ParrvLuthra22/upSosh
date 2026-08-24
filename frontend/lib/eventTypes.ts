/**
 * lib/eventTypes.ts
 * ───────────────────
 * Display shape for an event card / detail page.
 *
 * Extracted from lib/mockEvents.ts, which also held 12 fabricated events used
 * as a fallback whenever the real API was unavailable — on /discover, that
 * meant a backend hiccup silently showed a convincing fake grid; on
 * /events/[slug], a missing event silently showed a fake one instead of a
 * real not-found page. Both fallbacks were removed. This file keeps only the
 * type — real API responses are still mapped into this same shape (see
 * normaliseApiEvent in app/discover/page.tsx and apiEventToMock in
 * app/events/[slug]/page.tsx), so it isn't "mock" anymore, just a display
 * type named after where it used to live.
 */

export type EventCategory = 'Run Club' | 'Meetup' | 'Workshop' | 'Dinner Club' | 'Book Club' | 'Fitness' | 'Social';

export interface MockEvent {
  id: string;
  title: string;
  category: EventCategory;
  host: {
    name: string;
    initials: string;
    verified: boolean;
    superhost?: boolean;
    newHost?: boolean;
  };
  date: string;
  dateShort: string;
  time: string;
  location: string;
  city: string;
  price: number | 'Free';
  spots: number;
  spotsLeft: number;
  going: number;
  image: string;
  tags: string[];
  featured?: boolean;
}
