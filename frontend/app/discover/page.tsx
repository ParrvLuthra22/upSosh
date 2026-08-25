'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import {
  IconSearch,
  IconAdjustments,
  IconX,
  IconCheck,
} from '@tabler/icons-react';
import { type MockEvent } from '@/lib/eventTypes';
import { cn } from '@/lib/utils';
import type { EventCardProps } from '@/components/EventCard';

// ─── Lazy-import EventCard client component ───────────────────────────────────
// (avoids a circular dep from the server component tree)
import dynamic from 'next/dynamic';
const EventCard = dynamic(() => import('@/components/EventCard'), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: 'spring', stiffness: 340, damping: 30 } as const;

const CATEGORIES = [
  'All',
  'Run Clubs',
  'Creator Meetups',
  'Workshops',
  'Dinners',
  'Book Clubs',
  'Fitness',
  'Social',
] as const;

type CategoryLabel = (typeof CATEGORIES)[number];

// Map display label → MockEvent category value
const CATEGORY_MAP: Record<string, string> = {
  'Run Clubs':       'Run Club',
  'Creator Meetups': 'Meetup',
  'Workshops':       'Workshop',
  'Dinners':         'Dinner Club',
  'Book Clubs':      'Book Club',
  'Fitness':         'Fitness',
  'Social':          'Social',
};

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface FilterState {
  category: CategoryLabel;
  tonight: boolean;
  nearMe: boolean;
  priceMax: number;
  dateFilter: 'any' | 'today' | 'tomorrow' | 'weekend';
  verified: boolean;
  superhost: boolean;
  newHosts: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  category:   'All',
  tonight:    false,
  nearMe:     false,
  priceMax:   5000,
  dateFilter: 'any',
  verified:   false,
  superhost:  false,
  newHosts:   false,
};

// ─── Mock event → EventCard adapter ──────────────────────────────────────────

function toCardProps(ev: MockEvent): EventCardProps {
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

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(
  events: MockEvent[],
  filters: FilterState,
  query: string,
): MockEvent[] {
  return events.filter((ev) => {
    if (query) {
      const q = query.toLowerCase();
      const hay = [ev.title, ev.category, ev.location, ev.city, ...ev.tags]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.category !== 'All') {
      const mapped = CATEGORY_MAP[filters.category];
      if (mapped && ev.category !== mapped) return false;
    }
    if (ev.price !== 'Free' && (ev.price as number) > filters.priceMax) return false;
    if (filters.superhost && !ev.host.superhost) return false;
    if (filters.verified && !ev.host.verified) return false;
    if (filters.newHosts && !ev.host.newHost) return false;
    return true;
  });
}

// ─── Category pill bar ────────────────────────────────────────────────────────

function PillBar({
  active,
  onChange,
}: {
  active: CategoryLabel;
  onChange: (c: CategoryLabel) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-px">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              'relative flex-shrink-0 h-9 px-4 rounded-full font-sans text-[13px] border transition-colors duration-150 whitespace-nowrap',
              isActive
                ? 'border-transparent text-void'
                : 'border-border text-cream-dim hover:text-cream hover:border-border-strong bg-transparent',
            )}
          >
            {/* Sliding lime background */}
            {isActive && (
              <motion.span
                layoutId="activePill"
                className="absolute inset-0 rounded-full bg-lime"
                transition={SPRING}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Chip (Tonight / Near me) ─────────────────────────────────────────────────

function Chip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex-shrink-0 h-9 px-4 rounded-full font-sans text-[13px] border transition-colors duration-150',
        active
          ? 'bg-cream/10 border-cream/20 text-cream'
          : 'border-border text-cream-dim hover:text-cream hover:border-border-strong',
      )}
    >
      {label}
    </button>
  );
}

// ─── Filter drawer ────────────────────────────────────────────────────────────

function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: <K extends keyof FilterState>(k: K, v: FilterState[K]) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const DATE_OPTIONS = [
    { id: 'any',      label: 'Any time' },
    { id: 'today',    label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'weekend',  label: 'Weekend' },
  ] as const;

  function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center justify-between py-2.5 w-full"
      >
        <span className="font-sans text-[14px] text-cream-dim">{label}</span>
        <span
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center transition-all',
            checked ? 'bg-lime border-lime' : 'border-border',
          )}
        >
          {checked && <IconCheck size={11} className="text-void" strokeWidth={3} />}
        </span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-surface-2 border-l border-border-strong flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <p className="font-display text-[20px] text-cream">Filters</p>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

              {/* Price range */}
              <div>
                <p className="label text-cream-faint mb-4">Price range</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[13px] text-cream-dim">₹0</span>
                  <span className="font-mono text-[13px] text-cream">
                    {filters.priceMax >= 5000 ? '₹5,000+' : `₹${filters.priceMax.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={filters.priceMax}
                  onChange={(e) => onChange('priceMax', Number(e.target.value))}
                  className="w-full accent-lime"
                />
              </div>

              {/* Date */}
              <div>
                <p className="label text-cream-faint mb-3">Date</p>
                <div className="grid grid-cols-2 gap-2">
                  {DATE_OPTIONS.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => onChange('dateFilter', id)}
                      className={cn(
                        'h-9 rounded-lg font-sans text-[13px] border transition-colors',
                        filters.dateFilter === id
                          ? 'bg-lime/10 border-lime/30 text-lime'
                          : 'border-border text-cream-dim hover:text-cream',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Host type */}
              <div>
                <p className="label text-cream-faint mb-1">Host type</p>
                <div className="divide-y divide-border">
                  <CheckRow label="Verified hosts" checked={filters.verified}  onToggle={() => onChange('verified', !filters.verified)} />
                  <CheckRow label="Superhost"       checked={filters.superhost} onToggle={() => onChange('superhost', !filters.superhost)} />
                  <CheckRow label="New hosts"       checked={filters.newHosts}  onToggle={() => onChange('newHosts', !filters.newHosts)} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border flex gap-3">
              <button
                onClick={onClear}
                className="flex-1 h-11 rounded-xl border border-border text-cream-dim font-sans text-[14px] hover:text-cream hover:bg-cream/5 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={onApply}
                className="flex-1 h-11 rounded-xl bg-lime text-void font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center text-center py-32 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* Spotlight SVG */}
      <svg
        viewBox="0 0 200 160"
        className="w-40 h-32 mb-8"
        fill="none"
        aria-hidden="true"
      >
        {/* Cone */}
        <path d="M100 18 L55 148 L145 148 Z" fill="rgba(212,255,63,0.05)" />
        {/* Cone edges */}
        <line x1="100" y1="26" x2="56" y2="148" stroke="var(--lime)" strokeWidth="1" opacity="0.15" />
        <line x1="100" y1="26" x2="144" y2="148" stroke="var(--lime)" strokeWidth="1" opacity="0.15" />
        {/* Stage floor */}
        <rect x="30" y="148" width="140" height="3" rx="1.5" fill="rgba(244,241,234,0.06)" />
        {/* Lamp */}
        <circle cx="100" cy="14" r="10" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <motion.circle
          cx="100" cy="14" r="5"
          fill="var(--lime)"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Inner cone glow */}
        <ellipse cx="100" cy="148" rx="35" ry="4" fill="var(--lime)" opacity="0.06" />
      </svg>

      <h3 className="font-display text-[32px] text-cream leading-tight mb-3">
        The lights are still warming up.
      </h3>
      <p className="font-sans text-[15px] text-cream-dim max-w-md leading-relaxed mb-8">
        We're curating the first batch of events in your city.
        Want to be the first to know?
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/become-a-host"
          className="h-11 px-6 bg-lime text-void rounded-full font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors inline-flex items-center"
        >
          Become a host
        </Link>
      </div>

      {/* Ghost placeholder cards */}
      <div className="mt-14 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 opacity-50">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-dashed border-cream/15 bg-cream/[0.03] overflow-hidden"
            style={{ filter: 'blur(1px)' }}
          >
            <div className="aspect-[4/5] bg-surface" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-surface rounded w-4/5" />
              <div className="h-3 bg-surface rounded w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center py-32 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <h3 className="font-display text-[32px] text-cream leading-tight mb-3">
        Couldn't load events.
      </h3>
      <p className="font-sans text-[15px] text-cream-dim max-w-md leading-relaxed mb-8">
        Something went wrong reaching the server. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="h-11 px-6 bg-lime text-void rounded-full font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors"
      >
        Try again
      </button>
    </motion.div>
  );
}

// ─── Masonry grid of cards ────────────────────────────────────────────────────

function EventGrid({ events }: { events: MockEvent[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' });

  if (events.length === 0) return <EmptyState />;

  return (
    <div
      ref={ref}
      className="columns-1 sm:columns-2 lg:columns-3 gap-5"
    >
      {events.map((ev, i) => (
        <motion.div
          key={ev.id}
          className="break-inside-avoid mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
        >
          <EventCard {...toCardProps(ev)} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── API normalise ────────────────────────────────────────────────────────────

function normaliseApiEvent(raw: any): MockEvent {
  const d = raw.date ? new Date(raw.date) : null;
  return {
    id:        raw.id ?? raw._id,
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
    location:  raw.location ?? '',
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [query, setQuery]           = useState('');
  const [filters, setFilters]       = useState<FilterState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [events, setEvents]         = useState<MockEvent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/events?limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
      const data = await res.json();
      const raw: any[] = data.events ?? data.data ?? [];
      setEvents(raw.map(normaliseApiEvent));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  function updateFilter<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [k]: v }));
  }

  const filtered = useMemo(
    () => applyFilters(events, filters, query),
    [events, filters, query],
  );

  // Active filter count for drawer button badge
  const activeFilterCount = [
    filters.priceMax < 5000,
    filters.dateFilter !== 'any',
    filters.verified,
    filters.superhost,
    filters.newHosts,
    filters.tonight,
    filters.nearMe,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-void">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-16 pb-10 px-6 max-w-7xl mx-auto">
        <motion.p
          className="label text-lime mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          [ DISCOVER ]
        </motion.p>
        <motion.h1
          className="display-lg text-cream text-balance mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
        >
          Events worth showing up to.
        </motion.h1>

        {/* Search bar */}
        <motion.div
          className="relative max-w-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.18 }}
        >
          <IconSearch
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-faint pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, hosts, locations…"
            className="w-full h-12 bg-surface border border-border rounded-2xl pl-10 pr-4 font-sans text-[15px] text-cream placeholder:text-cream-faint outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
          />
        </motion.div>
      </div>

      {/* ── Sticky filter bar ───────────────────────────────────────────────── */}
      <div className="sticky top-18 z-40 backdrop-blur-xl bg-void/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          {/* Category pills — scrollable */}
          <div className="flex-1 min-w-0">
            <PillBar
              active={filters.category}
              onChange={(c) => updateFilter('category', c)}
            />
          </div>

          {/* Right chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Chip label="Tonight" active={filters.tonight} onToggle={() => updateFilter('tonight', !filters.tonight)} />
            <Chip label="Near me" active={filters.nearMe}  onToggle={() => updateFilter('nearMe', !filters.nearMe)} />

            {/* Filters drawer trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                'flex-shrink-0 h-9 px-4 rounded-full font-sans text-[13px] border flex items-center gap-2 transition-colors',
                activeFilterCount > 0
                  ? 'border-lime/40 text-lime bg-lime/10'
                  : 'border-border text-cream-dim hover:text-cream',
              )}
            >
              <IconAdjustments size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-lime text-void text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Results count ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <p className="font-mono text-[12px] text-cream-faint uppercase tracking-wider">
          {loading ? 'Loading…' : error ? 'Couldn’t load events' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Masonry grid ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          // Skeleton placeholders
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-5 bg-surface border border-border rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-surface-2 rounded w-1/3" />
                  <div className="h-5 bg-surface-2 rounded w-4/5" />
                  <div className="h-3 bg-surface-2 rounded w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={loadEvents} />
        ) : (
          <EventGrid events={filtered} />
        )}
      </div>

      {/* ── Filter drawer ────────────────────────────────────────────────────── */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={updateFilter}
        onApply={() => setDrawerOpen(false)}
        onClear={() => { setFilters(DEFAULT_FILTERS); setDrawerOpen(false); }}
      />
    </div>
  );
}
