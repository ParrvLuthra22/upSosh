'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBookingStore } from '@/lib/stores/booking';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconShieldCheck,
  IconLock,
  IconRefresh,
  IconRosetteDiscountCheck,
  IconStar,
  IconArrowRight,
  IconMinus,
  IconPlus,
  IconShare,
  IconBrandWhatsapp,
  IconLink,
} from '@tabler/icons-react';
import { type MockEvent } from '@/lib/eventTypes';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─── Constants & types ────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: 'spring', stiffness: 340, damping: 30 } as const;

interface ExtendedData {
  description: string;
  included: string[];
  hostBio: string;
  hostRating: number;
  hostEvents: number;
  hostPhoto: string;
  attendees: Array<{ name: string; initials: string; bg: string; fg: string; shared: number }>;
}

// ─── Extended mock data ───────────────────────────────────────────────────────

const DEFAULT_EXTENDED: ExtendedData = {
  description: `This is a curated, intimate experience designed for people who value real connections over large crowds. Every detail — from the venue to the guest list — is hand-picked to create something worth showing up for.\n\nWhether you're coming alone or with a friend, you'll leave with new perspectives, a few good conversations, and hopefully, people you'll actually stay in touch with.`,
  included: [
    'Chai and refreshments after the session',
    'Host-led welcome and introductions',
    'Digital entry ticket sent instantly',
    'Access to the post-event community group',
    'Personalised pace matching for run events',
  ],
  hostBio:
    'A passionate community builder who has been running curated events across India for the past 3 years. Known for creating spaces where strangers become friends.',
  hostRating: 4.9,
  hostEvents: 12,
  hostPhoto:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
  attendees: [
    { name: 'Priya S.', initials: 'PS', bg: '#D4FF3F', fg: '#0A0A0B', shared: 3 },
    { name: 'Rahul K.', initials: 'RK', bg: '#1C1C26', fg: '#F4F1EA', shared: 1 },
    { name: 'Ananya M.', initials: 'AM', bg: '#FF6F61', fg: '#F4F1EA', shared: 2 },
    { name: 'Dev C.', initials: 'DC', bg: '#34D399', fg: '#0A0A0B', shared: 0 },
    { name: 'Shreya P.', initials: 'SP', bg: '#1C1C26', fg: '#F4F1EA', shared: 1 },
    { name: 'Vikram R.', initials: 'VR', bg: '#D4FF3F', fg: '#0A0A0B', shared: 4 },
    { name: 'Nisha T.', initials: 'NT', bg: '#1C1C26', fg: '#F4F1EA', shared: 0 },
    { name: 'Arjun B.', initials: 'AB', bg: '#FF6F61', fg: '#F4F1EA', shared: 2 },
  ],
};

const EXTENDED_OVERRIDES: Partial<Record<string, Partial<ExtendedData>>> = {
  'evt-001': {
    description: `Lodhi Garden at dawn is something else. The light filters through the Mughal domes while the city is still waking up — and you're moving through it with a group of people who chose to be somewhere beautiful instead of in bed.\n\nThis run club is for all paces. We keep together as a group, no one gets left behind, and we finish at our favourite chai spot nearby.`,
    included: [
      'Warm-up led by the host',
      'Group run with front and back pacers',
      'Chai and snacks at the end',
      'Digital run certificate',
      'Access to the Delhi Runners WhatsApp group',
    ],
  },
  'evt-004': {
    description: `The Bombay Canteen is one of those rare spaces that earns its reputation quietly. We've reserved the private dining room for a gathering of 12 — founders, operators, and a few interesting wildcards.\n\nThis is not a networking dinner. There's no agenda, no pitches, no slide decks. Just good food, sharp conversation, and the kind of candour you only get at a small table.`,
    included: [
      '5-course curated menu by Chef Thomas Zacharias',
      'Wine and cocktail pairings',
      'Private dining room (no other guests)',
      'Curated guest list — vetted by the host',
    ],
    hostEvents: 14,
    hostRating: 5.0,
  },
};

function getExtended(id: string): ExtendedData {
  return { ...DEFAULT_EXTENDED, ...(EXTENDED_OVERRIDES[id] ?? {}) };
}

function apiEventToMock(raw: any): MockEvent {
  const d = raw.date ? new Date(raw.date) : null;
  const spotsLeft = (raw.capacity ?? 30) - (raw.attendees ?? 0);
  return {
    id:        raw.id,
    title:     raw.title,
    category:  raw.category ?? 'Social',
    host: {
      name:      raw.host?.name ?? raw.user?.name ?? 'Host',
      initials:  (raw.host?.name ?? raw.user?.name ?? 'H').slice(0, 2).toUpperCase(),
      verified:  raw.host?.verified ?? false,
      superhost: raw.isSuperhost ?? false,
      newHost:   false,
    },
    date:      d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dateShort: d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '',
    time:      raw.time ?? '',
    location:  raw.venue ?? '',
    city:      raw.city ?? '',
    price:     raw.isFree || raw.price === 0 ? 'Free' : (raw.price ?? 0),
    spots:     raw.capacity ?? 30,
    spotsLeft: Math.max(0, spotsLeft),
    going:     raw.attendees ?? 0,
    image:     raw.image ?? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&fit=crop',
    tags:      Array.isArray(raw.tags) ? raw.tags : [],
    featured:  false,
  };
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function fmtPrice(price: MockEvent['price']): string {
  if (price === 'Free' || price === 0) return 'Free';
  return `₹${(price as number).toLocaleString('en-IN')}`;
}

function numPrice(price: MockEvent['price']): number {
  if (price === 'Free') return 0;
  return price as number;
}

// ─── Section fade-up wrapper ──────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="label text-lime mb-4">{children}</p>
  );
}

// ─── Hero image with parallax ─────────────────────────────────────────────────

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y = useSpring(rawY, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-3xl"
      style={{ aspectRatio: '16/10' }}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: 1.08 }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ─── Host card ────────────────────────────────────────────────────────────────

function HostCard({
  event,
  ext,
}: {
  event: MockEvent;
  ext: ExtendedData;
}) {
  return (
    <FadeUp className="mt-10 bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0">
          <img
            src={ext.hostPhoto}
            alt={event.host.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 22, fontWeight: 400, color: '#F4F1EA', lineHeight: 1.2 }}>
            {event.host.name}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-1.5">
            {event.host.superhost && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-coral border border-coral/30 bg-coral/10 px-2 py-0.5 rounded-full">
                <IconStar size={9} /> Superhost
              </span>
            )}
            {event.host.verified && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-lime border border-lime/30 bg-lime/10 px-2 py-0.5 rounded-full">
                <IconRosetteDiscountCheck size={9} /> Verified
              </span>
            )}
          </div>

          <p className="font-sans text-[13px] text-cream-dim mt-2">
            {ext.hostEvents} events hosted · {ext.hostRating} rating
          </p>
        </div>

        {/* View profile */}
        <Link
          href={`/u/${encodeURIComponent(event.host.name.toLowerCase().replace(/\s+/g, '-'))}`}
          className="flex-shrink-0 h-9 px-4 rounded-xl border border-border font-sans text-[13px] text-cream-dim hover:text-cream hover:border-border-strong transition-colors inline-flex items-center"
        >
          View profile
        </Link>
      </div>

      {/* Bio */}
      <p className="font-sans text-[14px] text-cream-dim leading-relaxed mt-4 pt-4 border-t border-border">
        {ext.hostBio}
      </p>
    </FadeUp>
  );
}

// ─── Attendee mini-card ────────────────────────────────────────────────────────

function AttendeeCard({
  name,
  initials,
  bg,
  fg,
  shared,
}: ExtendedData['attendees'][0]) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: fg, fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>
          {initials}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-sans text-[13px] text-cream leading-none truncate">{name}</p>
        <p className="font-sans text-[11px] text-cream-faint mt-0.5">
          {shared > 0 ? `${shared} shared event${shared > 1 ? 's' : ''}` : 'New member'}
        </p>
      </div>
    </div>
  );
}

// ─── Google Maps embed ────────────────────────────────────────────────────────

function MapEmbed({ location }: { location: string }) {
  const mapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
  const openUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-border" style={{ aspectRatio: '2/1' }}>
      <iframe
        src={mapsUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Map of ${location}`}
      />
      <a
        href={openUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 mt-2 font-mono text-[11px] text-cream-faint hover:text-lime transition-colors uppercase tracking-wider"
      >
        <IconMapPin size={11} /> Open in Google Maps
      </a>
    </div>
  );
}

// ─── Share bar ────────────────────────────────────────────────────────────────

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const waText = encodeURIComponent(`Check out this event: ${title} — ${typeof window !== 'undefined' ? window.location.href : ''}`);

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="font-mono text-[11px] text-cream-faint uppercase tracking-wider mr-1">Share</span>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-cream-dim hover:text-lime hover:border-lime/40 transition-colors"
        title="Share on WhatsApp"
      >
        <IconBrandWhatsapp size={16} />
      </a>
      <button
        onClick={copyLink}
        className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-cream-dim hover:text-lime hover:border-lime/40 transition-colors"
        title="Copy link"
      >
        {copied ? <IconCheck size={14} className="text-lime" strokeWidth={2.5} /> : <IconLink size={15} />}
      </button>
    </div>
  );
}

// ─── Booking card (desktop) ───────────────────────────────────────────────────

function BookingCard({
  event,
  onBook,
}: {
  event: MockEvent;
  onBook: (guests: number) => void;
}) {
  const [guests, setGuests] = useState(1);
  const maxGuests = Math.min(event.spotsLeft, 10);
  const unitPrice = numPrice(event.price);
  const subtotal = unitPrice * guests;
  const serviceFee = Math.round(subtotal * 0.1);
  const total = subtotal + serviceFee;
  const isFree = unitPrice === 0;

  return (
    <motion.div
      className="bg-surface-2 border border-border-strong rounded-3xl p-7"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={SPRING}
    >
      {/* Price */}
      <div className="flex items-baseline gap-2 mb-6">
        <span
          style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 40, fontWeight: 400, color: '#D4FF3F', lineHeight: 1 }}
        >
          {isFree ? 'Free' : `₹${unitPrice.toLocaleString('en-IN')}`}
        </span>
        {!isFree && (
          <span className="font-sans text-[14px] text-cream-dim">/person</span>
        )}
      </div>

      {/* Date + time */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 font-sans text-[14px] text-cream-dim">
          <IconCalendar size={15} className="text-lime flex-shrink-0" />
          {event.dateShort}
        </div>
        <div className="flex items-center gap-3 font-sans text-[14px] text-cream-dim">
          <IconClock size={15} className="text-lime flex-shrink-0" />
          {event.time}
        </div>
        <div className="flex items-center gap-3 font-sans text-[14px] text-cream-dim">
          <IconMapPin size={15} className="text-lime flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      <div className="border-t border-border my-5" />

      {/* Guest stepper */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-sans text-[14px] text-cream">Guests</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            disabled={guests <= 1}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-cream-dim hover:text-cream hover:border-border-strong disabled:opacity-30 transition-colors"
          >
            <IconMinus size={14} />
          </button>
          <motion.span
            key={guests}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 24, fontWeight: 400, color: '#F4F1EA', minWidth: 24, textAlign: 'center', display: 'inline-block' }}
          >
            {guests}
          </motion.span>
          <button
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            disabled={guests >= maxGuests}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-cream-dim hover:text-cream hover:border-border-strong disabled:opacity-30 transition-colors"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>

      {/* Total breakdown */}
      {!isFree && (
        <div className="bg-cream/5 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between font-sans text-[13px] text-cream-dim">
            <span>Subtotal ({guests} × ₹{unitPrice.toLocaleString('en-IN')})</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-sans text-[13px] text-cream-dim">
            <span>Service fee (10%)</span>
            <span>₹{serviceFee.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-border pt-2 mt-2">
            <span className="font-sans text-[14px] text-cream font-medium">Total</span>
            <motion.span
              key={total}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 26, fontWeight: 400, color: '#D4FF3F' }}
            >
              ₹{total.toLocaleString('en-IN')}
            </motion.span>
          </div>
        </div>
      )}

      {/* Spots urgency */}
      {event.spotsLeft > 0 && event.spotsLeft <= 3 && (
        <motion.p
          className="font-mono text-[12px] text-coral text-center mb-4 uppercase tracking-wider"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          Only {event.spotsLeft} spot{event.spotsLeft > 1 ? 's' : ''} left
        </motion.p>
      )}

      {/* CTA */}
      <motion.button
        onClick={() => onBook(guests)}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-full font-sans font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        style={{ height: 56, backgroundColor: '#D4FF3F', color: '#0A0A0B', fontSize: 16 }}
      >
        Book now
        <IconArrowRight size={16} strokeWidth={2.5} />
      </motion.button>

      {/* Trust row */}
      <div className="flex items-center justify-around border-t border-border mt-5 pt-5">
        {[
          { Icon: IconShieldCheck, label: 'Secure' },
          { Icon: IconLock,        label: 'Private' },
          { Icon: IconRefresh,     label: 'Free cancel' },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon size={16} className="text-cream-faint" />
            <span className="font-sans text-[11px] text-cream-faint">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Mobile bottom bar — triggers the global BookingFlow modal ───────────────

function MobileBar({ event, onOpen }: { event: MockEvent; onOpen: () => void }) {
  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 border-t border-border"
      style={{ backgroundColor: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div>
        <span style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 26, fontWeight: 400, color: '#D4FF3F' }}>
          {fmtPrice(event.price)}
        </span>
        {event.price !== 'Free' && event.price !== 0 && (
          <span className="font-sans text-[13px] text-cream-dim ml-1">/person</span>
        )}
      </div>
      <button
        onClick={onOpen}
        className="h-12 px-7 rounded-full font-sans font-semibold flex items-center gap-2"
        style={{ backgroundColor: '#D4FF3F', color: '#0A0A0B', fontSize: 15 }}
      >
        Book now <IconArrowRight size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-void pb-24 lg:pb-0 animate-pulse">
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="lg:grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="w-full rounded-3xl bg-surface" style={{ aspectRatio: '16/10' }} />
            <div className="space-y-3 mt-12">
              <div className="h-3 bg-surface rounded w-1/4" />
              <div className="h-12 bg-surface rounded w-3/4" />
            </div>
            <div className="h-28 bg-surface rounded-2xl" />
          </div>
          <div className="hidden lg:block lg:col-span-4">
            <div className="h-96 bg-surface rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);

  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const [eventNotFound, setEventNotFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/events/${slug}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setEvent(apiEventToMock(data));
          return;
        }
      } catch {
        // fall through to not-found
      }
      setEventNotFound(true);
    }
    fetchEvent().finally(() => setLoading(false));
  }, [slug]);

  const ext = getExtended(event?.id ?? slug);
  const openBooking = useBookingStore((s) => s.open);

  function handleBook(guests: number) {
    if (!event) return;
    openBooking(event.id, {
      id:          event.id,
      title:       event.title,
      image:       event.image,
      dateShort:   event.dateShort,
      time:        event.time,
      price:       event.price,
      currency:    'INR',
      spotsLeft:   event.spotsLeft,
      location:    event.location,
      category:    event.category,
    }, guests);
  }

  // notFound() must be called during render (not inside the async effect
  // above) so Next's error-boundary machinery actually catches the thrown
  // NEXT_NOT_FOUND signal and renders the nearest not-found.tsx.
  if (eventNotFound) notFound();
  if (loading) return <PageSkeleton />;
  if (!event) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-void pb-24 lg:pb-0">

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="lg:grid lg:grid-cols-12 gap-12">

          {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
          <div className="lg:col-span-8">

            {/* 1 — Hero image with parallax */}
            <HeroImage src={event.image} alt={event.title} />

            {/* 2 — Pill row + H1 + Share */}
            <FadeUp className="mt-12" delay={0.05}>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream-dim bg-cream/8 px-3 py-1.5 rounded-full border border-border">
                  {event.category}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cream-dim bg-cream/8 px-3 py-1.5 rounded-full border border-border">
                  {event.dateShort} · {event.time}
                </span>
                {event.host.superhost && (
                  <span className="font-mono text-[11px] uppercase tracking-wider text-coral bg-coral/10 border border-coral/25 px-3 py-1.5 rounded-full">
                    Superhost event
                  </span>
                )}
              </div>

              <h1
                className="display-lg text-cream text-balance"
                style={{ maxWidth: '90%' }}
              >
                {event.title}
              </h1>

              <ShareBar title={event.title} />
            </FadeUp>

            {/* 3 — Host card */}
            <HostCard event={event} ext={ext} />

            {/* Divider */}
            <div className="border-t border-border my-16" />

            {/* 4 — About */}
            <FadeUp>
              <Label>01 — about</Label>
              <h3
                className="text-cream mt-3 mb-5"
                style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 32, fontWeight: 400, lineHeight: 1.15 }}
              >
                What you're signing up for
              </h3>
              <div className="space-y-4">
                {(event.tags?.length ? event.tags.join('. ') + '.' : ext.description).split('\n\n').map((para, i) => (
                  <p
                    key={i}
                    className="text-cream-dim max-w-2xl"
                    style={{ fontFamily: 'var(--font-geist, sans-serif)', fontSize: 17, lineHeight: 1.8 }}
                  >
                    {para}
                  </p>
                ))}
                {/* Always show ext.description for the full experience text */}
                {ext.description.split('\n\n').map((para, i) => (
                  <p
                    key={`ext-${i}`}
                    className="text-cream-dim max-w-2xl"
                    style={{ fontFamily: 'var(--font-geist, sans-serif)', fontSize: 17, lineHeight: 1.8 }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </FadeUp>

            {/* 5 — What's included */}
            <FadeUp className="mt-16" delay={0.05}>
              <Label>02 — included</Label>
              <ul className="mt-4 space-y-3">
                {ext.included.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
                  >
                    <IconCheck size={16} className="text-lime flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span
                      className="text-cream"
                      style={{ fontFamily: 'var(--font-geist, sans-serif)', fontSize: 16 }}
                    >
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </FadeUp>

            {/* 6 — Where */}
            <FadeUp className="mt-16">
              <Label>03 — where</Label>
              <p
                className="text-cream mt-3"
                style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 28, fontWeight: 400 }}
              >
                {event.location.split(',')[0]}
              </p>
              <p
                className="text-cream-dim mt-1"
                style={{ fontFamily: 'var(--font-geist, sans-serif)', fontSize: 15 }}
              >
                {event.location}
              </p>
              <MapEmbed location={event.location} />
            </FadeUp>

            {/* 7 — Who's coming */}
            <FadeUp className="mt-16">
              <Label>04 — who's coming</Label>
              <p
                className="text-cream mt-3 mb-6"
                style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 28, fontWeight: 400 }}
              >
                {event.going} attending
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {ext.attendees.map((a, i) => (
                  <motion.div
                    key={a.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, ease: EASE, delay: i * 0.06 }}
                  >
                    <AttendeeCard {...a} />
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* ── RIGHT COLUMN — sticky booking card ─────────────────────────── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <BookingCard event={event} onBook={handleBook} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom bar — opens global BookingFlow ──────────────────── */}
      <MobileBar event={event} onOpen={() => handleBook(1)} />
    </div>
  );
}
