'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { describeError } from '@/lib/http';
import { amountLabel, bookingStatusKey, bookingTab, type DisplayBooking } from '@/lib/bookingDisplay';

export interface UserStats {
  eventsAttended: number;
  upcomingCount: number;
  totalPaid: number;
  totalRefunded: number;
  totalSpent: number;
}

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-coral/40 bg-coral/5 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p className="font-sans text-sm text-cream">{message}</p>
      <button onClick={onRetry} className="font-mono text-xs uppercase tracking-wider text-lime border border-lime/40 rounded-full px-4 py-1.5 hover:bg-lime/10 transition-colors">
        Retry
      </button>
    </div>
  );
}

/** Events attended, upcoming, and total spent (paid minus refunds), from GET /api/users/me/stats. */
export function StatsSummary() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    api.get<UserStats>('/api/users/me/stats').then(setStats).catch((e) => setError(describeError(e, "We couldn't load your summary.")));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;

  const cells: { label: string; value: string }[] = [
    { label: 'Events attended', value: stats ? String(stats.eventsAttended) : '…' },
    { label: 'Upcoming', value: stats ? String(stats.upcomingCount) : '…' },
    { label: 'Total spent', value: stats ? rupees(stats.totalSpent) : '…' },
  ];
  return (
    <dl className="grid grid-cols-3 gap-3" aria-label="Your summary">
      {cells.map((c) => (
        <div key={c.label} className="border border-border rounded-xl p-4 bg-surface">
          <dt className="font-mono text-[10px] uppercase tracking-widest text-cream-dim mb-1">{c.label}</dt>
          <dd className="font-display text-2xl text-cream">{c.value}</dd>
        </div>
      ))}
      {stats && stats.totalRefunded > 0 && (
        <p className="col-span-3 font-mono text-[10px] text-cream-faint">
          {rupees(stats.totalPaid)} paid, {rupees(stats.totalRefunded)} refunded.
        </p>
      )}
    </dl>
  );
}

interface ListedBooking extends DisplayBooking {
  createdAt?: string;
}

const MAX_SHOWN = 5;

/** Your latest bookings, upcoming first, with a link through to the full list and tickets. */
export function BookingsSection() {
  const [bookings, setBookings] = useState<ListedBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    setBookings(null);
    api.get<{ bookings: ListedBooking[] }>('/api/bookings')
      .then((d) => setBookings(d.bookings ?? []))
      .catch((e) => setError(describeError(e, "We couldn't load your bookings.")));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!bookings) return <div className="h-24 rounded-xl bg-surface border border-border animate-pulse" />;

  const now = new Date();
  const rank = { upcoming: 0, past: 1, cancelled: 2 } as const;
  const shown = [...bookings]
    .sort((a, b) => rank[bookingTab(a, now)] - rank[bookingTab(b, now)] || +new Date(b.event?.date ?? 0) - +new Date(a.event?.date ?? 0))
    .slice(0, MAX_SHOWN);

  if (shown.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="font-sans text-sm text-cream-dim mb-3">You haven&apos;t booked anything yet.</p>
        <Link href="/discover" className="font-mono text-xs uppercase tracking-wider text-lime hover:underline">Browse events →</Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-border">
        {shown.map((b) => {
          const key = bookingStatusKey(b);
          const date = b.event?.date ? new Date(b.event.date) : null;
          return (
            <li key={b.id} className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-base text-cream truncate">{b.event?.title ?? 'Event unavailable'}</p>
                <p className="font-mono text-[11px] text-cream-dim truncate">
                  {date ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date TBD'} · {amountLabel(b).text}
                </p>
              </div>
              <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-wider text-cream-dim border border-border rounded-full px-2.5 py-1">
                {key}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 text-right">
        <Link href="/my-bookings" className="font-mono text-xs uppercase tracking-wider text-lime hover:underline">
          All bookings and tickets →
        </Link>
      </div>
    </div>
  );
}
