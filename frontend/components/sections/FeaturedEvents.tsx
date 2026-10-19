'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { EventCard } from '@/components/EventCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { normaliseApiEvent, toCardProps } from '@/lib/eventAdapters';
import { useReducedMotion } from '@/lib/motion';
import type { MockEvent } from '@/lib/eventTypes';

const EVENT_LIMIT = 6;

// Shared by the real slides and the skeleton slides so the layout doesn't jump.
const SLIDE = 'shrink-0 snap-start w-[78%] sm:w-[320px] lg:w-[340px]';

const ACTION =
  'inline-flex items-center justify-center rounded-full px-5 py-3 min-h-[44px] font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-void';
const ACTION_PRIMARY = `${ACTION} bg-lime text-void hover:bg-lime/90`;
const ACTION_SECONDARY = `${ACTION} border border-border text-cream hover:border-border-strong`;

type Status = 'loading' | 'error' | 'ready';

export default function FeaturedEvents() {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const trackRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  const load = useCallback(async (signal?: AbortSignal) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/events?limit=${EVENT_LIMIT}&sort=date`, {
        credentials: 'include',
        signal,
      });
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data = await res.json();
      const raw: any[] = data.events ?? data.data ?? [];
      setEvents(raw.map(normaliseApiEvent));
      setStatus('ready');
    } catch (err) {
      if (signal?.aborted) return;
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const step = (slide?.offsetWidth ?? 320) + 20; // card width + gap-5
    track.scrollBy({ left: direction * step, behavior: reduced ? 'auto' : 'smooth' });
  }

  const hasEvents = status === 'ready' && events.length > 0;

  return (
    <section
      aria-labelledby="featured-events-heading"
      className="bg-void border-t border-border py-24 md:py-32 px-6 md:px-16"
    >
      {/* Heading */}
      <div className="flex items-end justify-between gap-6 mb-12 md:mb-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream-dim mb-5">
            [ 02 — FEATURED ]
          </p>
          <h2
            id="featured-events-heading"
            className="display-lg text-cream leading-[1.0] tracking-tight"
          >
            Upcoming events.
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {hasEvents && (
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Previous events"
                className="w-11 h-11 rounded-full border border-border text-cream flex items-center justify-center hover:border-border-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                <IconArrowLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Next events"
                className="w-11 h-11 rounded-full border border-border text-cream flex items-center justify-center hover:border-border-strong transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-void"
              >
                <IconArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}
          <Link
            href="/discover"
            className="hidden md:block font-sans text-sm text-cream-dim hover:text-cream transition-colors"
          >
            See all events →
          </Link>
        </div>
      </div>

      {status === 'loading' && <LoadingState />}

      {status === 'error' && (
        <StatePanel
          title="We couldn't load events right now."
          body="Something went wrong on our side. Check your connection and try again."
        >
          <button type="button" onClick={() => load()} className={ACTION_PRIMARY}>
            Try again
          </button>
          <Link href="/discover" className={ACTION_SECONDARY}>
            Browse events
          </Link>
        </StatePanel>
      )}

      {status === 'ready' && events.length === 0 && (
        <StatePanel
          title="No upcoming events yet."
          body="New events land here as soon as hosts publish them. Be the first to put something on the calendar."
        >
          <Link href="/become-a-host" className={ACTION_PRIMARY}>
            Host an event
          </Link>
          <Link href="/discover" className={ACTION_SECONDARY}>
            Browse events
          </Link>
        </StatePanel>
      )}

      {hasEvents && (
        // role=region + tabIndex lets keyboard users scroll the slider with the
        // arrow keys; tabbing through the cards also scrolls each into view.
        <div
          role="region"
          aria-label="Upcoming events"
          tabIndex={0}
          className="-mx-6 md:-mx-16 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
        >
          <ul
            ref={trackRef}
            className="flex items-stretch gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth overscroll-x-contain px-6 md:px-16 pb-4 scroll-px-6 md:scroll-px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {events.map((ev) => (
              <li key={ev.id} className={`${SLIDE} flex [&>div]:w-full [&>div]:h-full`}>
                {/* Link to the slug (the API resolves slug or id); fall back to id. */}
                <EventCard {...toCardProps(ev)} id={ev.slug ?? ev.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/discover"
        className="md:hidden mt-6 inline-block font-sans text-sm text-cream-dim hover:text-cream transition-colors"
      >
        See all events →
      </Link>
    </section>
  );
}

function LoadingState() {
  return (
    <div aria-busy="true">
      <span role="status" className="sr-only">
        Loading upcoming events
      </span>
      <div className="-mx-6 md:-mx-16 flex gap-5 overflow-hidden px-6 md:px-16 pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`${SLIDE} rounded-2xl border border-border bg-surface overflow-hidden`}
            aria-hidden="true"
          >
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-6 w-6 rounded-full" circle />
              <Skeleton className="h-6 w-4/5" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-1/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatePanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-14 md:py-20 text-center"
    >
      <h3
        className="text-[26px] md:text-[32px] text-cream leading-tight text-balance"
        style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
      >
        {title}
      </h3>
      <p className="mt-3 mx-auto max-w-md font-sans text-sm text-cream-dim text-balance">{body}</p>
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}
