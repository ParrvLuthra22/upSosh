'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';

type TabType = 'upcoming' | 'past' | 'cancelled';

interface Booking {
  id: string;
  eventTitle?: string;
  eventDate?: string;
  hostName?: string;
  location?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount?: number;
  items?: { title: string; qty: number; price: number }[];
  event?: {
    title?: string;
    date?: string;
    location?: string;
    image?: string;
  };
  createdAt?: string;
}

const STATUS_STYLES = {
  confirmed: { label: 'Confirmed', bg: 'bg-verified/10', text: 'text-verified' },
  pending: { label: 'Pending', bg: 'bg-accent/10', text: 'text-accent' },
  cancelled: { label: 'Cancelled', bg: 'bg-border', text: 'text-ink-muted' },
};

function BookingRow({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  const title = booking.event?.title ?? booking.eventTitle ?? 'Event';
  const date = booking.event?.date ?? booking.eventDate;
  const location = booking.event?.location ?? booking.location;
  const s = STATUS_STYLES[booking.status] ?? STATUS_STYLES.pending;

  const day = date ? new Date(date).getDate() : '?';
  const month = date ? new Date(date).toLocaleString('en-IN', { month: 'short' }).toUpperCase() : '';

  return (
    <motion.button
      onClick={onClick}
      className="w-full flex items-center gap-5 p-5 border border-border rounded-2xl bg-bg-primary hover:bg-bg-secondary transition-colors group text-left"
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-14 h-14 bg-bg-secondary rounded-xl flex flex-col items-center justify-center border border-border">
        <p className="font-display text-xl text-ink-primary leading-none">{day}</p>
        <p className="font-mono text-[9px] text-ink-muted uppercase tracking-widest">{month}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display text-base text-ink-primary truncate mb-0.5">{title}</p>
        {location && <p className="font-mono text-[11px] text-ink-muted truncate">{location}</p>}
      </div>

      {/* Status + CTA */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2">
        <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          {s.label}
        </span>
        {booking.status === 'confirmed' && (
          <span className="font-sans text-xs text-accent group-hover:text-ink-primary transition-colors">
            View ticket →
          </span>
        )}
      </div>
    </motion.button>
  );
}

function TicketModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const title = booking.event?.title ?? booking.eventTitle ?? 'Event';

  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: EASE_VERCEL }}
        >
          <div className="bg-bg-primary border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Your ticket</p>
              <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">✕</button>
            </div>

            {/* QR Code */}
            <div className="w-full aspect-square bg-bg-secondary rounded-2xl flex items-center justify-center mb-6 border border-border">
              <div className="w-32 h-32 bg-ink-primary rounded-xl flex items-center justify-center">
                <p className="font-mono text-[8px] text-bg-primary text-center leading-loose">
                  {booking.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <h3 className="font-display text-xl text-ink-primary mb-1">{title}</h3>
            {(booking.event?.date ?? booking.eventDate) && (
              <p className="font-mono text-xs text-ink-muted mb-4">
                {new Date(booking.event?.date ?? booking.eventDate ?? '').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}

            {booking.totalAmount && (
              <div className="border-t border-border pt-4 mt-4 flex justify-between">
                <span className="font-mono text-xs text-ink-muted">Total paid</span>
                <span className="font-mono text-sm text-ink-primary">₹{booking.totalAmount}</span>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nUID:${booking.id}\nEND:VEVENT\nEND:VCALENDAR`;
                  const blob = new Blob([ics], { type: 'text/calendar' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${title.replace(/\s+/g, '-')}.ics`;
                  a.click();
                }}
                className="flex-1 px-4 py-2.5 border border-border rounded-full font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors text-center"
              >
                Add to calendar
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-ink-primary text-bg-primary rounded-full font-sans text-sm font-medium hover:bg-accent transition-colors text-center"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

function EmptyState({ tab }: { tab: TabType }) {
  const msgs = {
    upcoming: 'No upcoming bookings.',
    past: 'No past events yet.',
    cancelled: 'No cancelled bookings.',
  };
  return (
    <div className="py-24 text-center">
      <p className="font-display text-3xl text-ink-primary mb-3">{msgs[tab]}</p>
      <p className="font-sans text-base text-ink-muted mb-8">
        {tab === 'upcoming' ? 'Find something worth showing up to.' : 'Your history will appear here.'}
      </p>
      {tab === 'upcoming' && (
        <Link href="/discover" className="font-sans text-sm bg-accent text-white px-6 py-3 rounded-full hover:bg-ink-primary transition-colors">
          Browse events →
        </Link>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  const { isAuth, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Quick local-storage check to avoid full spinner on initial load
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  useEffect(() => {
    if (!loading && !isAuth) router.push('/signin?from=/my-bookings');
  }, [loading, isAuth, router]);

  useEffect(() => {
    if (!isAuth && !hasToken) return;
    const load = async () => {
      setFetching(true);
      try {
        const data = await api.get<{ bookings: Booking[] }>('/api/bookings/me');
        setBookings(data.bookings ?? []);
      } catch {
        setBookings([]);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [isAuth]);

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const d = new Date(b.event?.date ?? b.eventDate ?? b.createdAt ?? '');
    if (tab === 'cancelled') return b.status === 'cancelled';
    if (tab === 'past') return b.status !== 'cancelled' && d < now;
    return b.status !== 'cancelled' && d >= now;
  });

  const TABS: { id: TabType; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  // Don't block render — if no token at all, redirect will handle it
  if (!hasToken && !isAuth && !loading) return null;


  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-28 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ BOOKINGS ]</p>
        <h1 className="font-display text-4xl text-ink-primary mb-10" style={{ letterSpacing: '-0.03em' }}>Your bookings.</h1>

        {/* Tab bar */}
        <div className="flex items-center gap-0 border-b border-border mb-8 relative">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 font-sans text-sm transition-colors ${tab === t.id ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'}`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="bookings-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {fetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: EASE_VERCEL }}
              className="space-y-4"
            >
              {filtered.length === 0 ? (
                <EmptyState tab={tab} />
              ) : (
                filtered.map((b) => (
                  <BookingRow key={b.id} booking={b} onClick={() => b.status === 'confirmed' && setSelectedBooking(b)} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {selectedBooking && <TicketModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
    </div>
  );
}
