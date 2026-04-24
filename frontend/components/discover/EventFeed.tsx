'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { EASE_VERCEL } from '@/lib/motion';
import type { MockEvent } from '@/lib/mockEvents';

interface EventFeedProps {
  events: MockEvent[];
  view: 'list' | 'grid';
}

function PriceBadge({ price }: { price: MockEvent['price'] }) {
  if (price === 'Free') {
    return (
      <span className="font-mono text-xs text-verified bg-verified/10 px-2 py-0.5 rounded-full">Free</span>
    );
  }
  return <span className="font-mono text-xs text-ink-primary">₹{price.toLocaleString()}</span>;
}

function HostBadge({ host }: { host: MockEvent['host'] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[9px] text-accent">{host.initials}</span>
      </div>
      <span className="font-sans text-xs text-ink-muted truncate max-w-[120px]">{host.name}</span>
      {host.superhost && (
        <span className="font-mono text-[9px] text-accent border border-accent/30 px-1.5 py-0.5 rounded-full flex-shrink-0">★</span>
      )}
      {host.verified && !host.superhost && (
        <span className="text-verified flex-shrink-0" title="Verified">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      )}
    </div>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted border border-border px-2 py-1 rounded-full">
      {category}
    </span>
  );
}

// ─── List Row ───────────────────────────────────────────────────────────────

function EventListRow({ event, index }: { event: MockEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_VERCEL, delay: index * 0.05 }}
    >
      {/* Desktop list row */}
      <Link
        href={`/events/${event.id}`}
        className="hidden md:flex items-center gap-6 py-5 border-t border-border group hover:bg-bg-secondary transition-colors duration-200 relative cursor-none px-6 md:px-10"
        data-cursor="VIEW EVENT"
      >
        {/* Left: title + date + location */}
        <div className="w-[40%] min-w-0">
          <h3 className="font-display text-xl md:text-2xl text-ink-primary leading-snug tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-200 truncate">
            {event.title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted">{event.dateShort} · {event.time}</span>
            <span className="w-1 h-1 rounded-full bg-border flex-shrink-0" />
            <span className="font-mono text-xs text-ink-muted flex items-center gap-1 truncate">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {event.location}
            </span>
          </div>
        </div>

        {/* Middle: category + host + going */}
        <div className="w-[30%] min-w-0 space-y-2">
          <CategoryTag category={event.category} />
          <HostBadge host={event.host} />
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted">{event.going} going</span>
            <span className="font-mono text-xs text-accent">{event.spotsLeft} left</span>
            <PriceBadge price={event.price} />
          </div>
        </div>

        {/* Right: image */}
        <div className="w-[30%] flex items-center justify-end gap-4">
          <div className="relative overflow-hidden rounded-xl w-[160px] h-[107px] flex-shrink-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
          </div>

          {/* Arrow slides in */}
          <motion.span
            className="text-ink-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-lg flex-shrink-0"
          >
            →
          </motion.span>
        </div>
      </Link>

      {/* Mobile simplified row */}
      <Link
        href={`/events/${event.id}`}
        className="flex md:hidden items-center gap-4 py-4 border-t border-border px-6 cursor-none"
        data-cursor="VIEW"
      >
        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-ink-primary leading-snug truncate mb-1">{event.title}</h3>
          <p className="font-mono text-[11px] text-ink-muted">{event.dateShort} · {event.time}</p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryTag category={event.category} />
            <PriceBadge price={event.price} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Grid Card ──────────────────────────────────────────────────────────────

function EventGridCard({ event, index }: { event: MockEvent; index: number }) {
  return (
    <Link href={`/events/${event.id}`}>
    <motion.article
      className="group rounded-2xl overflow-hidden border border-border bg-bg-primary hover:bg-bg-secondary transition-colors duration-200 cursor-none"
      data-cursor="VIEW"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_VERCEL, delay: index * 0.06 }}
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.12em] bg-bg-primary/90 text-ink-primary px-2.5 py-1 rounded-full">
          {event.category}
        </span>
        {event.featured && (
          <span className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-widest bg-accent text-white px-2 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="font-display text-xl text-ink-primary leading-snug tracking-tight line-clamp-2">
          {event.title}
        </h3>
        <HostBadge host={event.host} />
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <div>
            <p className="font-mono text-xs text-ink-primary">{event.dateShort}</p>
            <p className="font-mono text-xs text-ink-muted">{event.time} · {event.city}</p>
          </div>
          <div className="text-right">
            <PriceBadge price={event.price} />
            <p className="font-mono text-[11px] text-ink-muted mt-0.5">{event.spotsLeft} spots left</p>
          </div>
        </div>
      </div>
    </motion.article>
    </Link>
  );
}

// ─── Skeleton Loaders ───────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="hidden md:flex items-center gap-6 py-5 border-t border-border px-6 md:px-10 animate-pulse">
      <div className="w-[40%] space-y-2.5">
        <div className="h-6 bg-border/60 rounded-lg w-4/5" />
        <div className="h-3.5 bg-border/60 rounded-full w-1/2" />
      </div>
      <div className="w-[30%] space-y-2.5">
        <div className="h-5 bg-border/60 rounded-full w-1/3" />
        <div className="h-4 bg-border/60 rounded-full w-2/3" />
      </div>
      <div className="w-[30%] flex justify-end">
        <div className="w-[160px] h-[107px] bg-border/60 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-video bg-border/60" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-border/60 rounded-lg w-4/5" />
        <div className="h-4 bg-border/60 rounded-full w-1/2" />
        <div className="h-px bg-border/60" />
        <div className="flex justify-between">
          <div className="h-3.5 bg-border/60 rounded-full w-1/3" />
          <div className="h-3.5 bg-border/60 rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Feed ──────────────────────────────────────────────────────────────

const INITIAL_COUNT = 6;
const LOAD_MORE = 6;

export default function EventFeed({ events, view }: EventFeedProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (loading || visibleCount >= events.length) return;
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE, events.length));
      setLoading(false);
    }, 600);
  }, [loading, visibleCount, events.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset visible count when events change (filter applied)
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [events]);

  const visible = events.slice(0, visibleCount);

  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <p className="font-display text-4xl text-ink-light mb-3">No events found.</p>
        <p className="font-sans text-sm text-ink-muted">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Result count */}
      <div className="px-6 md:px-10 py-4 flex items-center justify-between border-b border-border">
        <p className="font-mono text-xs text-ink-muted">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </p>
        <p className="font-mono text-xs text-ink-light">Sorted by: Relevance</p>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {visible.map((event, i) => (
              <EventListRow key={event.id} event={event} index={i} />
            ))}
            {loading && [0, 1, 2].map((i) => <SkeletonRow key={`sk-${i}`} />)}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {visible.map((event, i) => (
              <EventGridCard key={event.id} event={event} index={i} />
            ))}
            {loading && [0, 1, 2].map((i) => <SkeletonCard key={`sk-${i}`} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8" />

      {/* All loaded */}
      {visibleCount >= events.length && events.length > INITIAL_COUNT && (
        <div className="py-12 text-center">
          <p className="font-mono text-xs text-ink-light tracking-wide">— All events loaded —</p>
        </div>
      )}
    </div>
  );
}
