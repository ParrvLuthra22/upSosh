'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { mockEvents, MockEvent } from '@/lib/mockEvents';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import ImageReveal from '@/components/ui/ImageReveal';

// ─── Extended Mock Data ──────────────────────────────────────────────────────

interface ExtendedEventData {
  description: string;
  pullQuote: string;
  timeline: Array<{ time: string; title: string; desc: string }>;
  hostBio: string;
  hostRating: number;
  hostEvents: number;
  hostPhoto: string;
  attendees: Array<{ name: string; initials: string; color: string }>;
  duration: string;
}

const ACCENT_COLORS = ['#FF5A1F', '#1F5F3F', '#6B6B6B', '#0A0A0A', '#A8A29E'];

const DEFAULT_EXTENDED: ExtendedEventData = {
  description: `This is a curated, intimate experience designed for people who value real connections over large crowds. Every detail — from the venue to the guest list — is hand-picked to create something worth showing up for.\n\nWhether you're coming alone or with a friend, you'll leave with new perspectives, a few good conversations, and hopefully, people you'll actually stay in touch with.`,
  pullQuote: "\u201cThe best events aren\u2019t the biggest ones \u2014 they\u2019re the ones where everyone was glad they came.\u201d",
  timeline: [
    { time: '06:30', title: 'Arrival & Warm-up', desc: 'Meet your fellow participants. Light stretching, introductions, and a quick brief on the plan for the morning.' },
    { time: '07:00', title: 'Main Activity', desc: 'The heart of the experience — curated, led by your host, and designed to be memorable.' },
    { time: '08:30', title: 'Wind Down & Connect', desc: 'Grab a chai, swap numbers, and linger as long as you like. The best conversations often happen here.' },
  ],
  hostBio: 'A passionate community builder who has been running curated events across India for the past 3 years. Known for creating spaces where strangers become friends.',
  hostRating: 4.9,
  hostEvents: 8,
  hostPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&q=80',
  attendees: [
    { name: 'Priya S.', initials: 'PS', color: '#FF5A1F' },
    { name: 'Rahul K.', initials: 'RK', color: '#1F5F3F' },
    { name: 'Ananya M.', initials: 'AM', color: '#6B6B6B' },
    { name: 'Dev C.', initials: 'DC', color: '#0A0A0A' },
    { name: 'Shreya P.', initials: 'SP', color: '#A8A29E' },
    { name: 'Vikram R.', initials: 'VR', color: '#FF5A1F' },
    { name: 'Nisha T.', initials: 'NT', color: '#1F5F3F' },
    { name: 'Arjun B.', initials: 'AB', color: '#6B6B6B' },
  ],
  duration: '2 hours',
};

const EXTENDED_OVERRIDES: Partial<Record<string, Partial<ExtendedEventData>>> = {
  'evt-001': {
    description: `Lodhi Garden at dawn is something else. The light filters through the Mughal domes while the city is still waking up — and you're moving through it with a group of people who chose to be somewhere beautiful instead of in bed.\n\nThis run club is for all paces. We keep together as a group, no one gets left behind, and we finish at our favourite chai spot nearby for an optional cool-down.`,
    pullQuote: "\u201cRunning is the one hour of the day that\u2019s entirely yours.\u201d",
    timeline: [
      { time: '06:30', title: 'Meet at Gate 2', desc: 'Introductions, light dynamic stretching. Leave your ego at home — all paces welcome.' },
      { time: '06:45', title: '5K Loop', desc: "Group run through the garden\u2019s heritage paths. Pacers at front and back to keep everyone together." },
      { time: '07:30', title: 'Chai & Cool Down', desc: 'The real reason people come back. Street chai 200m from the gate. Stories are exchanged here.' },
    ],
    duration: '1.5 hours',
  },
  'evt-004': {
    description: `The Bombay Canteen is one of those rare spaces that earns its reputation quietly. We've reserved the private dining room for a gathering of 12 — founders, operators, and a few interesting wildcards.\n\nThis is not a networking dinner. There's no agenda, no pitches, no slide decks. Just good food, sharp conversation, and the kind of candour you only get at a small table.`,
    pullQuote: '"The most valuable connections in your career happen off the record."',
    timeline: [
      { time: '20:00', title: 'Welcome drinks', desc: 'Arrive to seasonal cocktails and introductions. Don\'t be late — the magic happens in the first half-hour.' },
      { time: '20:30', title: 'Dinner', desc: '5-course curated menu, wine pairings included. Chef\'s choice — allergies noted at booking.' },
      { time: '22:30', title: 'Open conversation', desc: 'The table stays open as long as you want it to. Some evenings run till midnight.' },
    ],
    duration: '3–4 hours',
    hostEvents: 14,
    hostRating: 5.0,
  },
};

function getExtended(id: string): ExtendedEventData {
  return { ...DEFAULT_EXTENDED, ...EXTENDED_OVERRIDES[id] };
}

function getEvent(slug: string): MockEvent {
  return (
    mockEvents.find((e) => e.id === slug || e.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') === slug) ??
    mockEvents[0]
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function CharReveal({ text, className }: { text: string; className?: string }) {
  // Split by words to keep spaces correct, then animate each character
  return (
    <h1 className={className} aria-label={text}>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 32, rotateX: -20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2 + i * 0.018,
            ease: EASE_VERCEL,
          }}
          style={{
            display: 'inline-block',
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char}
        </motion.span>
      ))}
    </h1>
  );
}

function MetaGrid({ event, extended }: { event: MockEvent; extended: ExtendedEventData }) {
  const items = [
    { label: 'Date', value: event.dateShort },
    { label: 'Time', value: event.time },
    { label: 'Location', value: event.location },
    { label: 'Duration', value: extended.duration },
  ];
  return (
    <motion.div
      className="grid grid-cols-2 gap-x-8 gap-y-6 mt-8 pt-8 border-t border-border"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5, ease: EASE_VERCEL }}
    >
      {items.map(({ label, value }) => (
        <div key={label}>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-1">{label}</p>
          <p className="font-sans text-[18px] text-ink-primary font-medium leading-snug">{value}</p>
        </div>
      ))}
    </motion.div>
  );
}

function TimelineSection({ items }: { items: ExtendedEventData['timeline'] }) {
  return (
    <div>
      <SectionEyebrow>What to expect</SectionEyebrow>
      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-8 mt-8">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE_VERCEL }}
            className="relative"
          >
            {/* Connector line */}
            {i < items.length - 1 && (
              <div className="absolute top-[11px] left-full w-8 h-px bg-border" style={{ width: 'calc(100% - 100% + 2rem)' }} />
            )}
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs text-accent">{item.time}</span>
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <div className="flex-1 h-px bg-border" />
            </div>
            <h3 className="font-display text-xl text-ink-primary mb-2">{item.title}</h3>
            <p className="font-sans text-sm text-ink-muted leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
      {/* Mobile: stacked with vertical line */}
      <div className="md:hidden mt-8 relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-8 pl-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: EASE_VERCEL }}
            >
              <div className="absolute left-[3px] w-4 h-4 rounded-full bg-bg-primary border-2 border-accent" style={{ marginTop: '2px' }} />
              <span className="font-mono text-xs text-accent">{item.time}</span>
              <h3 className="font-display text-lg text-ink-primary mt-1 mb-1">{item.title}</h3>
              <p className="font-sans text-sm text-ink-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.p>
  );
}

function AttendeeStack({ attendees, total }: { attendees: ExtendedEventData['attendees']; total: number }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-4 mt-6">
      <div className="flex">
        {attendees.slice(0, 8).map((a, i) => (
          <div
            key={a.name}
            className="relative"
            style={{ marginLeft: i === 0 ? 0 : '-10px', zIndex: attendees.length - i }}
            onMouseEnter={() => setHovered(a.name)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-9 h-9 rounded-full border-2 border-bg-primary flex items-center justify-center cursor-default"
              style={{ background: a.color }}
            >
              <span className="font-mono text-[9px] text-white font-medium">{a.initials}</span>
            </div>
            <AnimatePresence>
              {hovered === a.name && (
                <motion.div
                  className="absolute -top-9 left-1/2 -translate-x-1/2 bg-ink-primary text-bg-primary font-sans text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none z-50"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {a.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-ink-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      {total > 8 && (
        <span className="font-mono text-xs text-ink-muted">+ {total - 8} others</span>
      )}
    </div>
  );
}

function BookingCard({
  event,
  extended,
  onReserve,
  reserving,
}: {
  event: MockEvent;
  extended: ExtendedEventData;
  onReserve: () => void;
  reserving: boolean;
}) {
  const capacityPct = ((event.spots - event.spotsLeft) / event.spots) * 100;

  return (
    <motion.div
      className="bg-bg-primary border border-border rounded-3xl p-6 shadow-xl shadow-ink-primary/5"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: EASE_VERCEL }}
    >
      {/* Price */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[2.5rem] text-ink-primary leading-none">
            {event.price === 'Free' ? 'Free' : `₹${event.price.toLocaleString()}`}
          </span>
          {event.price !== 'Free' && (
            <span className="font-mono text-xs text-ink-muted">per person</span>
          )}
        </div>
      </div>

      {/* Capacity meter */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider">Spots</span>
          <span className="font-mono text-[11px] text-accent">{event.spotsLeft} left of {event.spots}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${capacityPct}%` }}
            transition={{ delay: 0.9, duration: 0.8, ease: EASE_VERCEL }}
          />
        </div>
      </div>

      {/* Reserve button */}
      <MagneticButton strength={6} radius={60} className="w-full">
        <motion.button
          onClick={onReserve}
          disabled={reserving}
          className="w-full bg-ink-primary text-bg-primary font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 relative overflow-hidden"
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {reserving ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <motion.span
                  className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Reserving…
              </motion.span>
            ) : (
              <motion.span
                key="reserve"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Reserve your spot →
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </MagneticButton>

      {/* Fine print */}
      <p className="font-mono text-[10px] text-ink-light text-center mt-3 leading-relaxed">
        Free cancellation up to 48h before · No hidden fees
      </p>

      {/* Event quick meta */}
      <div className="mt-5 pt-5 border-t border-border space-y-2.5">
        {[
          { icon: '📅', text: event.dateShort },
          { icon: '⏰', text: event.time },
          { icon: '📍', text: event.location },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2.5">
            <span className="text-base">{icon}</span>
            <span className="font-sans text-sm text-ink-muted">{text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MobileBookingBar({
  event,
  onReserve,
  reserving,
}: {
  event: MockEvent;
  onReserve: () => void;
  reserving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: EASE_VERCEL }}
    >
      {/* Expand overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-[-1]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className="bg-bg-primary border-t border-border">
        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="px-6 pt-6 pb-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_VERCEL }}
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Date', value: event.dateShort },
                  { label: 'Time', value: event.time },
                  { label: 'Location', value: event.city },
                  { label: 'Spots left', value: `${event.spotsLeft}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">{label}</p>
                    <p className="font-sans text-sm text-ink-primary">{value}</p>
                  </div>
                ))}
              </div>
              {/* Capacity bar */}
              <div className="h-0.5 bg-border rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${((event.spots - event.spotsLeft) / event.spots) * 100}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always-visible bar */}
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => setExpanded((v) => !v)} className="flex-1 text-left">
            <span className="font-display text-2xl text-ink-primary">
              {event.price === 'Free' ? 'Free' : `₹${event.price.toLocaleString()}`}
            </span>
            <p className="font-mono text-[10px] text-ink-muted">{expanded ? 'Tap to collapse' : 'Tap for details'}</p>
          </button>
          <button
            onClick={onReserve}
            disabled={reserving}
            className="bg-ink-primary text-bg-primary font-sans text-sm font-medium px-6 py-3.5 rounded-2xl flex items-center gap-2 flex-shrink-0"
          >
            {reserving ? (
              <motion.span
                className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              'Reserve →'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const router = useRouter();
  const [reserving, setReserving] = useState(false);

  const event = getEvent(slug);
  const extended = getExtended(event.id);

  const handleReserve = async () => {
    setReserving(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push(`/events/${slug}/book`);
  };

  const descParagraphs = extended.description.split('\n\n').filter(Boolean);

  return (
    <motion.div
      className="min-h-screen bg-bg-primary pb-32 lg:pb-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.4, ease: EASE_VERCEL }}
    >
      {/* ── Back nav ──────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-24 pb-2">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: EASE_VERCEL }}
        >
          <Link
            href="/discover"
            className="font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            Back to discover
          </Link>
        </motion.div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 pt-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-start">
            {/* Left */}
            <div>
              {/* Category eyebrow */}
              <motion.p
                className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: EASE_VERCEL }}
              >
                {event.category}
              </motion.p>

              {/* Title */}
              <CharReveal
                text={event.title}
                className="font-display text-[clamp(2.5rem,5.5vw,5.5rem)] text-ink-primary leading-[1.02] tracking-[-0.03em] mb-6"
              />

              {/* Host line */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4, ease: EASE_VERCEL }}
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono text-[9px] text-accent">{event.host.initials}</span>
                </div>
                <span className="font-sans text-sm text-ink-muted">
                  Hosted by{' '}
                  <span className="text-ink-primary font-medium">{event.host.name}</span>
                </span>
                {event.host.verified && (
                  <span className="font-mono text-[10px] text-verified border border-verified/20 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {event.host.superhost && (
                  <span className="font-mono text-[10px] text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                    ★ Superhost
                  </span>
                )}
              </motion.div>

              {/* Meta grid */}
              <MetaGrid event={event} extended={extended} />
            </div>

            {/* Right: image */}
            <div className="relative lg:pt-4 order-first lg:order-last">
              <ImageReveal direction="bottom" delay={0.3} duration={1} className="w-full aspect-[4/5] rounded-3xl overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </ImageReveal>

              {/* Spots badge */}
              <motion.div
                className="absolute top-4 left-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.4, ease: EASE_VERCEL }}
              >
                <div className="bg-bg-primary/90 backdrop-blur-sm border border-border rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[11px] text-ink-primary">
                    {event.spotsLeft} of {event.spots} spots left
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content + Sticky card ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_360px] gap-16">

          {/* Left: content */}
          <div className="space-y-20">

            {/* About */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
            >
              <SectionEyebrow>About this event</SectionEyebrow>
              <div className="mt-6 space-y-5 max-w-[640px]">
                {descParagraphs.map((para, i) => (
                  <p key={i} className="font-sans text-[18px] text-ink-primary leading-[1.7]">
                    {para}
                  </p>
                ))}
              </div>
              {/* Pull quote */}
              <blockquote className="mt-10 pl-5 border-l-2 border-accent">
                <p className="font-display text-2xl text-ink-muted italic leading-snug">
                  {extended.pullQuote}
                </p>
              </blockquote>
            </motion.section>

            {/* Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
            >
              <TimelineSection items={extended.timeline} />
            </motion.section>

            {/* Host */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
            >
              <SectionEyebrow>The host</SectionEyebrow>
              <div className="mt-6 flex gap-6 items-start">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-border">
                  <img
                    src={extended.hostPhoto}
                    alt={event.host.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display text-2xl text-ink-primary">{event.host.name}</h3>
                    {event.host.superhost && (
                      <span className="font-mono text-[9px] text-accent border border-accent/20 px-1.5 py-0.5 rounded-full">★ Superhost</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-xs text-ink-muted">
                      {extended.hostEvents} events hosted
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="font-mono text-xs text-ink-muted">
                      {extended.hostRating} ★ rating
                    </span>
                  </div>
                  <p className="font-sans text-sm text-ink-muted leading-relaxed mb-4">{extended.hostBio}</p>
                  <button className="font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors underline underline-offset-4">
                    See host's profile →
                  </button>
                </div>
              </div>
            </motion.section>

            {/* Attendees */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
              className="pb-16"
            >
              <SectionEyebrow>Who's going</SectionEyebrow>
              <AttendeeStack
                attendees={extended.attendees}
                total={event.going}
              />
              <p className="font-mono text-[10px] text-ink-light mt-3">
                Names revealed after you book
              </p>
            </motion.section>
          </div>

          {/* Right: sticky booking card (desktop only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingCard
                event={event}
                extended={extended}
                onReserve={handleReserve}
                reserving={reserving}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile booking bar */}
      <MobileBookingBar event={event} onReserve={handleReserve} reserving={reserving} />
    </motion.div>
  );
}
