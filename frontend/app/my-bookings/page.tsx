'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { EASE_VERCEL, useReducedMotion } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';
import { useEscapeKey } from '@/lib/a11y';
import { IconTicketOff } from '@tabler/icons-react';
import { EmptyState } from '@/components/ui/EmptyState';

type TabType = 'upcoming' | 'past' | 'cancelled';

interface Booking {
  id: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: string;
  totalAmount: number;
  ticketPrice: number;
  platformFee: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  qrCode?: string;
  notes?: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    image: string;
    category: string;
    isFree: boolean;
    slug: string;
  } | null;
}

// ─── Status styles ────────────────────────────────────────────────────────────

const STATUS = {
  confirmed:   { label: 'Confirmed',   bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  pending:     { label: 'Pending',     bg: 'bg-lime/10',        text: 'text-lime',        dot: 'bg-lime' },
  cancelled:   { label: 'Cancelled',   bg: 'bg-cream/8',        text: 'text-cream-dim',   dot: 'bg-cream-faint' },
  unavailable: { label: 'Unavailable', bg: 'bg-cream/8',        text: 'text-cream-dim',   dot: 'bg-cream-faint' },
} as const;

// ─── Booking row ──────────────────────────────────────────────────────────────

function BookingRow({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const ev = booking.event;
  const title = ev?.title ?? 'Event unavailable';
  const date = ev?.date ? new Date(ev.date) : null;
  const s = !ev ? STATUS.unavailable : (STATUS[booking.status] ?? STATUS.pending);

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 sm:p-5 border border-border rounded-2xl bg-surface hover:bg-surface-2 transition-colors group text-left"
      whileHover={{ x: 3, transition: { duration: 0.15 } }}
    >
      {/* Event image or date block */}
      {ev?.image ? (
        <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden">
          <Image src={ev.image} alt={title} fill sizes="56px" className="object-cover" />
        </div>
      ) : ev ? (
        <div className="flex-shrink-0 w-14 h-14 bg-surface-2 border border-border rounded-xl flex flex-col items-center justify-center">
          <p className="font-display text-xl text-cream leading-none">{date?.getDate() ?? '?'}</p>
          <p className="font-mono text-[9px] text-cream-dim uppercase tracking-wider">
            {date?.toLocaleString('en-IN', { month: 'short' }) ?? ''}
          </p>
        </div>
      ) : (
        <div className="flex-shrink-0 w-14 h-14 bg-surface-2 border border-border rounded-xl flex items-center justify-center">
          <IconTicketOff size={20} className="text-cream-faint" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-[16px] text-cream truncate mb-0.5">{title}</p>
        <p className="font-mono text-[11px] text-cream-dim truncate">
          {!ev
            ? 'This listing is no longer available'
            : date
              ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
              : 'Date TBD'}
          {ev?.time ? ` · ${ev.time}` : ''}
          {ev?.venue ? ` · ${ev.venue}` : ''}
        </p>
        {booking.totalAmount > 0 && (
          <p className="font-mono text-[11px] text-cream-dim mt-0.5">
            ₹{booking.totalAmount.toLocaleString('en-IN')} paid
          </p>
        )}
        {booking.totalAmount === 0 && (
          <p className="font-mono text-[11px] text-lime mt-0.5">Free</p>
        )}
      </div>

      {/* Status chip */}
      <div className="flex-shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-transparent"
           style={{ background: 'rgba(244,241,234,0.06)' }}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
        <span className={s.text}>{s.label}</span>
      </div>
    </motion.button>
  );
}

// ─── Ticket modal ─────────────────────────────────────────────────────────────

function TicketModal({ booking, onClose, onCancel }: {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: string) => void;
}) {
  const ev = booking.event;
  const title = ev?.title ?? 'Event unavailable';
  const date = ev?.date ? new Date(ev.date) : null;
  const qrValue = booking.qrCode ?? `UPSOSH-${booking.id}`;
  const bookingRef = `UPSOSH-${booking.id}`;
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const reduced = useReducedMotion();
  const dragControls = useDragControls();

  useEscapeKey(onClose, true);

  async function handleCancel() {
    if (!confirmCancel) { setConfirmCancel(true); return; }
    setCancelling(true);
    try {
      await api.patch(`/api/bookings/${booking.id}/cancel`, {});
      toast.success('Booking cancelled.');
      onCancel(booking.id);
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  }

  function addToCalendar() {
    const start = date
      ? date.toISOString().replace(/[-:]/g, '').slice(0, 15) + '00Z'
      : '';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DTSTART:${start}`,
      `LOCATION:${ev?.venue ?? ''}`,
      `UID:${booking.id}@upsosh.app`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
        />

        {/* Modal */}
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.2 }}
        >
          <motion.div
            className="w-full max-w-sm bg-surface border border-border-strong rounded-3xl overflow-hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-modal-title"
            initial={reduced ? { opacity: 0 } : { y: 40, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 40, scale: 0.97 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: EASE_VERCEL }}
            onClick={(e) => e.stopPropagation()}
            drag={reduced ? false : 'y'}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            {/* Drag handle — mobile only */}
            <div
              className="sm:hidden flex justify-center pt-3 pb-1 touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => !reduced && dragControls.start(e)}
            >
              <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: 'var(--cream-faint)' }} />
            </div>

            {/* Event image header */}
            {ev?.image && (
              <div className="h-36 overflow-hidden relative">
                <Image src={ev.image} alt={title} fill sizes="(min-width: 640px) 480px, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                <button
                  onClick={onClose}
                  aria-label="Close ticket"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-void/60 backdrop-blur-sm flex items-center justify-center text-cream hover:bg-void/80 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="p-6">
              {!ev?.image && (
                <div className="flex items-center justify-between mb-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim">
                    {ev ? 'Your ticket' : 'Booking details'}
                  </p>
                  <button onClick={onClose} aria-label="Close ticket" className="text-cream-dim hover:text-cream transition-colors text-lg leading-none">✕</button>
                </div>
              )}

              {/* Title + date */}
              <h3 id="ticket-modal-title" className="font-display text-[22px] text-cream leading-tight mb-1">{title}</h3>
              {ev ? (
                <>
                  {date && (
                    <p className="font-mono text-[12px] text-cream-dim mb-1">
                      {date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {ev.time ? ` · ${ev.time}` : ''}
                    </p>
                  )}
                  {ev.venue && (
                    <p className="font-mono text-[12px] text-cream-dim mb-5">{ev.venue}{ev.city ? `, ${ev.city}` : ''}</p>
                  )}
                </>
              ) : (
                <p className="font-sans text-[13px] text-cream-dim mb-5 leading-relaxed">
                  This event's listing has been removed or is no longer available. Your booking record is kept for reference.
                </p>
              )}

              {/* QR code (only when there's a real event to check into) */}
              {ev ? (
                <>
                  <div className="bg-white rounded-2xl p-4 flex items-center justify-center mb-5">
                    <QRCode value={qrValue} size={160} level="M" />
                  </div>
                  <p className="font-mono text-[10px] text-cream-dim text-center mb-5 tracking-widest">
                    {qrValue}
                  </p>
                </>
              ) : (
                <div className="bg-surface-2 rounded-xl px-4 py-3 mb-5 text-center">
                  <p className="font-mono text-[10px] text-cream-dim uppercase tracking-wider mb-1">Booking reference</p>
                  <p className="font-mono text-[13px] text-cream tracking-widest">{bookingRef}</p>
                </div>
              )}

              {/* Payment summary */}
              {booking.totalAmount > 0 ? (
                <div className="bg-surface-2 rounded-xl p-4 mb-5 space-y-1.5">
                  <div className="flex justify-between font-sans text-[13px] text-cream-dim">
                    <span>Ticket</span>
                    <span>₹{booking.ticketPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-sans text-[13px] text-cream-dim">
                    <span>Platform fee</span>
                    <span>₹{booking.platformFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-sans text-[14px] text-cream font-medium border-t border-border pt-1.5 mt-1.5">
                    <span>Total paid</span>
                    <span>₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-lime/10 border border-lime/20 rounded-xl px-4 py-3 mb-5 text-center">
                  <span className="font-mono text-[12px] text-lime uppercase tracking-wider">Free event — no charge</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {ev && (
                  <button
                    onClick={addToCalendar}
                    className="flex-1 h-11 border border-border rounded-full font-sans text-[13px] text-cream-dim hover:text-cream hover:border-border-strong transition-colors"
                  >
                    Add to calendar
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className={`flex-1 h-11 rounded-full font-sans text-[13px] font-medium transition-colors ${
                      confirmCancel
                        ? 'bg-red-500/80 text-white hover:bg-red-500'
                        : 'border border-border text-cream-dim hover:text-coral hover:border-coral/30'
                    } disabled:opacity-50`}
                  >
                    {cancelling ? 'Cancelling…' : confirmCancel ? 'Tap again to confirm' : 'Cancel booking'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

// ─── Empty state copy ─────────────────────────────────────────────────────────

const BOOKINGS_EMPTY_COPY: Record<TabType, { heading: string; description?: string }> = {
  upcoming:  { heading: 'No upcoming bookings', description: 'Find something worth showing up to.' },
  past:      { heading: 'No past events yet',   description: 'Your history will appear here.' },
  cancelled: { heading: 'No cancelled bookings' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const { isAuth, loading, hydrated } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<Booking | null>(null);
  const reduced = useReducedMotion();

  // Guard on `hydrated`, not just `loading`: the store's initial isLoading is
  // false until refresh() sets it, so without this a returning logged-in user
  // would be redirected to /signin on the very first render, before Zustand
  // finishes reading the persisted user and refresh() has had a chance to run.
  useEffect(() => {
    if (!hydrated || loading) return;
    if (!isAuth) router.push('/signin?from=/my-bookings');
  }, [hydrated, loading, isAuth, router]);

  useEffect(() => {
    if (!hydrated || loading || !isAuth) return;
    setFetching(true);
    api.get<{ bookings: Booking[] }>('/api/bookings')
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setFetching(false));
  }, [hydrated, loading, isAuth]);

  function handleCancel(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
  }

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const d = b.event?.date ? new Date(b.event.date) : null;
    if (tab === 'cancelled') return b.status === 'cancelled';
    if (tab === 'past')      return b.status !== 'cancelled' && (!d || d < now);
    return b.status !== 'cancelled' && (!d || d >= now);
  });

  const counts = {
    upcoming:  bookings.filter((b) => b.status !== 'cancelled' && (!b.event?.date || new Date(b.event.date) >= now)).length,
    past:      bookings.filter((b) => b.status !== 'cancelled' && b.event?.date && new Date(b.event.date) < now).length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: 'upcoming',  label: 'Upcoming' },
    { id: 'past',      label: 'Past' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (!hydrated || (loading && !isAuth)) return null;

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-lime mb-3">[ MY BOOKINGS ]</p>
        <h1 className="font-display text-[40px] text-cream mb-10" style={{ letterSpacing: '-0.03em' }}>
          Your tickets.
        </h1>

        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-border mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 font-sans text-[14px] transition-colors flex items-center gap-1.5 ${
                tab === t.id ? 'text-cream' : 'text-cream-dim hover:text-cream'
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-lime text-void' : 'bg-surface-2 text-cream-dim'
                }`}>
                  {counts[t.id]}
                </span>
              )}
              {tab === t.id && (
                <motion.span
                  layoutId="bookings-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-lime"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-surface border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0.1 : 0.22, ease: EASE_VERCEL }}
              className="space-y-3"
            >
              {filtered.length === 0 ? (
                <EmptyState
                  heading={BOOKINGS_EMPTY_COPY[tab].heading}
                  description={BOOKINGS_EMPTY_COPY[tab].description}
                  action={tab === 'upcoming' ? { label: 'Browse events', href: '/discover' } : undefined}
                />
              ) : (
                filtered.map((b, i) => (
                  <motion.div
                    key={b.id}
                    layout={!reduced}
                    initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduced ? 0.1 : 0.3,
                      ease: EASE_VERCEL,
                      delay: reduced ? 0 : Math.min(i, 7) * 0.06,
                      layout: { duration: 0.3, ease: EASE_VERCEL },
                    }}
                  >
                    <BookingRow booking={b} onClick={() => setSelected(b)} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {selected && (
        <TicketModal
          booking={selected}
          onClose={() => setSelected(null)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
