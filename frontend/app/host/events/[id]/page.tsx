'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  name: string;
  email: string;
  bookedAt?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkedIn?: boolean;
}

interface EventDetails {
  id: string;
  title: string;
  date?: string;
  location?: string;
  capacity?: number;
  bookingsCount?: number;
  revenue?: number;
  status?: string;
}

export default function HostEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuth } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAuth || !id) return;
    const load = async () => {
      try {
        const [evData, attData] = await Promise.all([
          api.get<{ event: EventDetails }>(`/api/events/${id}`),
          api.get<{ attendees: Attendee[] }>(`/api/events/${id}/attendees`),
        ]);
        setEvent(evData.event);
        setAttendees(attData.attendees ?? []);
      } catch {
        toast.error('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuth, id]);

  async function toggleCheckIn(attendeeId: string, current: boolean) {
    try {
      await api.patch(`/api/events/${id}/attendees/${attendeeId}/checkin`, { checkedIn: !current });
      setAttendees((prev) => prev.map((a) => a.id === attendeeId ? { ...a, checkedIn: !current } : a));
    } catch {
      toast.error('Check-in update failed');
    }
  }

  async function sendAnnouncement() {
    if (!announcementText.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/events/${id}/announce`, { message: announcementText });
      toast.success('Announcement sent to all attendees.');
      setAnnouncementText('');
      setShowAnnouncement(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  function downloadCSV() {
    const header = 'Name,Email,Status,Checked In\n';
    const rows = attendees.map((a) =>
      `"${a.name}","${a.email}","${a.status}","${a.checkedIn ? 'Yes' : 'No'}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${id}.csv`;
    a.click();
  }

  if (loading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <p className="font-display text-2xl text-ink-primary">Event not found.</p>
    </div>
  );

  const pct = event.capacity && event.bookingsCount
    ? Math.round((event.bookingsCount / event.capacity) * 100)
    : 0;

  const confirmedCount = attendees.filter((a) => a.checkedIn).length;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">[ MANAGE EVENT ]</p>
            <h1 className="font-display text-3xl text-ink-primary" style={{ letterSpacing: '-0.03em' }}>{event.title}</h1>
            {event.date && (
              <p className="font-mono text-xs text-ink-muted mt-1">
                {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/host/events/${id}/edit`)}
              className="px-4 py-2 border border-border rounded-full font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors"
            >
              Edit event
            </button>
            <button
              onClick={() => setShowAnnouncement(true)}
              className="px-4 py-2 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors"
            >
              Send announcement
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Bookings', value: `${event.bookingsCount ?? 0} / ${event.capacity ?? '∞'}` },
            { label: 'Revenue', value: event.revenue ? `₹${event.revenue.toLocaleString('en-IN')}` : '—' },
            { label: 'Checked in', value: `${confirmedCount} / ${attendees.length}` },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-2xl p-5 bg-bg-primary">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-2">{s.label}</p>
              <p className="font-display text-2xl text-ink-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <p className="font-mono text-[11px] text-ink-muted uppercase tracking-widest">Capacity</p>
            <p className="font-mono text-xs text-accent">{pct}% full</p>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: EASE_VERCEL }}
            />
          </div>
        </div>

        {/* Attendees table */}
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-bg-secondary border-b border-border">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Attendees</p>
            <button onClick={downloadCSV} className="font-mono text-xs text-ink-muted hover:text-accent transition-colors">
              Download CSV ↓
            </button>
          </div>

          {attendees.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-display text-xl text-ink-primary mb-2">No attendees yet.</p>
              <p className="font-sans text-sm text-ink-muted">Share your event link to get bookings.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between px-5 py-3 hover:bg-bg-secondary transition-colors">
                  <div>
                    <p className="font-sans text-sm text-ink-primary">{attendee.name}</p>
                    <p className="font-mono text-[11px] text-ink-muted">{attendee.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      attendee.status === 'confirmed' ? 'bg-verified/10 text-verified' : 'bg-border text-ink-muted'
                    }`}>
                      {attendee.status}
                    </span>
                    <button
                      onClick={() => toggleCheckIn(attendee.id, !!attendee.checkedIn)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        attendee.checkedIn
                          ? 'bg-verified border-verified text-white'
                          : 'border-border text-ink-muted hover:border-verified hover:text-verified'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcement modal */}
      {showAnnouncement && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowAnnouncement(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="bg-bg-primary border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="font-display text-xl text-ink-primary mb-4">Send announcement</h3>
              <p className="font-sans text-sm text-ink-muted mb-4">This message will be sent to all {attendees.length} attendees by email.</p>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={5}
                placeholder="Hi everyone! A quick update about tomorrow's event…"
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowAnnouncement(false)} className="flex-1 py-2.5 border border-border rounded-full font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors">
                  Cancel
                </button>
                <button
                  onClick={sendAnnouncement}
                  disabled={!announcementText.trim() || sending}
                  className="flex-1 py-2.5 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send to all'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
