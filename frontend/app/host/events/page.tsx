'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type EventStatus = 'live' | 'draft' | 'past' | 'cancelled';

interface HostEvent {
  id: string;
  title: string;
  date?: string;
  status: EventStatus;
  bookingsCount?: number;
  capacity?: number;
  revenue?: number;
  category?: string;
  image?: string;
}

const STATUS_STYLES: Record<EventStatus, { label: string; bg: string; text: string }> = {
  live: { label: 'Live', bg: 'bg-verified/10', text: 'text-verified' },
  draft: { label: 'Draft', bg: 'bg-border', text: 'text-ink-muted' },
  past: { label: 'Past', bg: 'bg-border', text: 'text-ink-light' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-500' },
};

type Tab = 'live' | 'draft' | 'past';

function ActionsMenu({ eventId, onDelete }: { eventId: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors rounded-lg hover:bg-bg-secondary"
      >
        ···
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute right-0 top-full mt-1 w-48 bg-bg-primary border border-border rounded-xl shadow-lg z-20 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: EASE_VERCEL }}
            >
              {[
                { label: 'Edit', action: () => router.push(`/host/events/${eventId}/edit`) },
                { label: 'View public page', action: () => router.push(`/events/${eventId}`) },
                { label: 'Manage attendees', action: () => router.push(`/host/events/${eventId}`) },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setOpen(false); item.action(); }}
                  className="w-full px-4 py-2.5 text-left font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border" />
              <button
                onClick={() => { setOpen(false); onDelete(); }}
                className="w-full px-4 py-2.5 text-left font-sans text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HostEventsPage() {
  const { user, isAuth, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('live');
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!isAuth || user?.hostStatus !== 'verified')) {
      router.push('/become-a-host');
    }
  }, [loading, isAuth, user, router]);

  useEffect(() => {
    if (!isAuth) return;
    const load = async () => {
      setFetching(true);
      try {
        const data = await api.get<{ events: HostEvent[] }>('/api/host/events');
        setEvents(data.events ?? []);
      } catch {
        setEvents([]);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [isAuth]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.delete(`/api/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Event deleted.');
    } catch (err: any) {
      toast.error(err.message ?? 'Delete failed');
    }
  }

  const filtered = events.filter((e) => {
    if (tab === 'past') return e.status === 'past' || e.status === 'cancelled';
    return e.status === tab;
  });

  const TABS: { id: Tab; label: string }[] = [
    { id: 'live', label: 'Live' },
    { id: 'draft', label: 'Drafts' },
    { id: 'past', label: 'Past' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-24">
        {/* Heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">[ EVENTS ]</p>
            <h1 className="font-display text-4xl text-ink-primary" style={{ letterSpacing: '-0.03em' }}>Your events.</h1>
          </div>
          <Link href="/host/events/new">
            <motion.button
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              + Create event
            </motion.button>
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 border-b border-border mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 font-sans text-sm transition-colors ${tab === t.id ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'}`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span layoutId="host-events-tab" className="absolute bottom-0 left-0 right-0 h-px bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {fetching ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink-primary mb-3">No {tab} events.</p>
            <p className="font-sans text-base text-ink-muted mb-8">Create your first event to get started.</p>
            <Link href="/host/events/new" className="font-sans text-sm bg-accent text-white px-6 py-3 rounded-full hover:bg-ink-primary transition-colors">
              Create event →
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-2xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-bg-secondary border-b border-border">
              {['Event', 'Date', 'Bookings', 'Revenue', ''].map((h) => (
                <p key={h} className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">{h}</p>
              ))}
            </div>

            {filtered.map((event, i) => {
              const s = STATUS_STYLES[event.status];
              const date = event.date ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
              return (
                <motion.div
                  key={event.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center border-b border-border last:border-0 hover:bg-bg-secondary transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: EASE_VERCEL }}
                >
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-medium text-ink-primary truncate">{event.title}</p>
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-ink-muted whitespace-nowrap">{date}</p>
                  <p className="font-mono text-sm text-ink-primary">
                    {event.bookingsCount ?? 0}/{event.capacity ?? '∞'}
                  </p>
                  <p className="font-mono text-sm text-ink-primary">
                    {event.revenue ? `₹${event.revenue.toLocaleString('en-IN')}` : '—'}
                  </p>
                  <ActionsMenu eventId={event.id} onDelete={() => handleDelete(event.id)} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
