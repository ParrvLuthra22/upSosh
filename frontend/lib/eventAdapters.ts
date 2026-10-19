/**
 * lib/eventAdapters.ts
 * ─────────────────────
 * Maps a raw GET /api/events item into the display shape (MockEvent) and then
 * into EventCard props. Shared by /discover and the homepage's FeaturedEvents
 * so both render the same API data identically.
 */

import type { MockEvent } from '@/lib/eventTypes';
import type { EventCardProps } from '@/components/EventCard';

export function normaliseApiEvent(raw: any): MockEvent {
  const d = raw.date ? new Date(raw.date) : null;
  return {
    id:        raw.id ?? raw._id,
    slug:      raw.slug,
    title:     raw.title,
    category:  raw.category ?? 'Social',
    host: {
      name:      raw.hostName ?? raw.host?.name ?? 'Host',
      initials:  (raw.hostName ?? raw.host?.name ?? 'H').slice(0, 2).toUpperCase(),
      verified:  raw.host?.verified ?? raw.hostVerified ?? false,
      superhost: raw.host?.superhost ?? raw.isSuperhost ?? false,
      newHost:   raw.host?.newHost ?? false,
    },
    date:      d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dateShort: d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '',
    time:      raw.time ?? '',
    location:  raw.location ?? raw.venue ?? '',
    city:      raw.city ?? raw.location?.split(',').pop()?.trim() ?? '',
    price:     raw.price === 0 || raw.isFree ? 'Free' : (raw.price ?? 'Free'),
    spots:     raw.capacity ?? 30,
    spotsLeft: raw.spotsLeft ?? (raw.capacity ?? 30) - (raw.bookingsCount ?? 0),
    going:     raw.bookingsCount ?? 0,
    image:     raw.image ?? raw.coverImage ?? 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=560&fit=crop&q=80',
    tags:      raw.tags ?? [],
    featured:  raw.featured ?? false,
  };
}

export function toCardProps(ev: MockEvent): EventCardProps {
  // Try to build an ISO-ish date string from dateShort, e.g. "Sun 24 Nov"
  const dateStr = ev.dateShort || ev.date;
  return {
    id:            ev.id,
    title:         ev.title,
    host:          ev.host.name,
    hostAvatar:    undefined,
    date:          dateStr,
    time:          ev.time,
    price:         ev.price === 'Free' ? 'Free' : (ev.price as number),
    currency:      '₹',
    category:      ev.category,
    imageUrl:      ev.image,
    attendeeCount: ev.going,
    spotsLeft:     ev.spotsLeft,
    isVerified:    ev.host.verified,
    isSuperhost:   ev.host.superhost ?? false,
    location:      ev.location,
  };
}
