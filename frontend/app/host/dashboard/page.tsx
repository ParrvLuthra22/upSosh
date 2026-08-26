'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { EASE_VERCEL, SHADOW_PANEL, SHADOW_GLOW_LIME } from '@/lib/motion';
import { useAuth } from '@/lib/stores/auth';
import { type HostEvent } from '@/lib/hostEventTypes';
import { getApiUrl } from '@/lib/api';
import { cardVariants } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, isInView: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    function tick() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, isInView, duration]);

  return value;
}

function useGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    id: 'attendees',
    label: 'Attendees',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'payouts',
    label: 'Payouts',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
        <path strokeLinecap="round" d="M15 9.354a4 4 0 10-2 6.991" />
        <path strokeLinecap="round" d="M12 7v2m0 6v2" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'AI Planner',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .23 2.71-1.13 2.71H3.93c-1.36 0-2.13-1.71-1.13-2.71L4.2 15.3" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="3" />
        <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  active,
  setActive,
}: {
  active: string;
  setActive: (id: string) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-surface border-r border-border h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/">
          <span className="font-display text-xl text-cream tracking-tight">UpSosh</span>
          <span className="font-mono text-[10px] text-cream-dim ml-1.5 uppercase tracking-widest">Host</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <div className="relative space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group"
              >
                {/* Spring pill bg */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-lime/8 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {/* Left border */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-lime"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 transition-colors duration-150 ${
                    isActive ? 'text-lime' : 'text-cream-dim group-hover:text-cream'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 font-sans text-sm transition-colors duration-150 ${
                    isActive ? 'text-cream font-medium' : 'text-cream-dim group-hover:text-cream'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Host profile */}
      <SidebarProfile />
    </aside>
  );
}

function SidebarProfile() {
  const { user } = useAuth();
  const initials = (user?.name ?? 'H').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="px-4 py-4 border-t border-border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border bg-surface flex items-center justify-center">
          {user?.photoUrl ? (
            <Image src={user.photoUrl} alt={user.name} width={36} height={36} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-xs text-cream font-bold">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-medium text-cream truncate">{user?.name ?? 'Host'}</p>
          {user?.hostStatus === 'verified' && (
            <span
              className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #F0C96A22, #C9A84C22)',
                color: '#C9A84C',
                border: '1px solid #C9A84C33',
              }}
            >
              ★ Verified Host
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileBottomNav({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-void/95 backdrop-blur-xl border-t border-border">
      <div className="flex justify-around items-center py-2 px-2">
        {MOBILE_NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 bg-lime/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isActive ? 'text-lime' : 'text-cream-dim'}`}>
                {item.icon}
              </span>
              <span className={`relative z-10 font-mono text-[9px] uppercase tracking-wider transition-colors ${isActive ? 'text-lime' : 'text-cream-dim'}`}>
                {item.label.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  rawValue,
  trend,
  delay,
}: {
  label: string;
  value: string;
  rawValue: number;
  trend: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCountUp(rawValue, inView);
  const isRevenue = value.startsWith('₹');
  const isRating = value.includes('★');

  let displayValue: string;
  if (isRevenue) displayValue = `₹${count.toLocaleString('en-IN')}`;
  else if (isRating) displayValue = `${(count / 10).toFixed(1)} ★`;
  else displayValue = count.toString();

  const positive = trend >= 0;

  return (
    <motion.div
      ref={ref}
      className={cn(cardVariants({ interactive: true, padding: 'lg' }), 'group')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE_VERCEL }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream-dim mb-3">{label}</p>
      <p className="font-display text-[2.5rem] text-cream leading-none mb-3">{displayValue}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-mono text-xs ${positive ? 'text-verified' : 'text-red-500'}`}
        >
          {positive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="font-mono text-[10px] text-cream-faint">vs last month</span>
      </div>
    </motion.div>
  );
}

// ─── Event Cards (Horizontal Scroll) ─────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  live: { bg: 'bg-verified/10', text: 'text-verified', label: 'Live' },
  draft: { bg: 'bg-border', text: 'text-cream-dim', label: 'Draft' },
  full: { bg: 'bg-lime/10', text: 'text-lime', label: 'Full' },
  past: { bg: 'bg-border', text: 'text-cream-faint', label: 'Past' },
};

function EventCard({ event, index }: { event: HostEvent; index: number }) {
  const pct = Math.round((event.attendees / event.capacity) * 100);
  const s = STATUS_STYLES[event.status];

  return (
    <motion.div
      className={cn(cardVariants({ padding: 'none' }), 'flex-shrink-0 w-[280px] overflow-hidden group')}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.45, ease: EASE_VERCEL }}
      whileHover={{ y: -4, boxShadow: SHADOW_PANEL, transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="relative h-[140px] overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="280px"
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Date badge */}
        <div className="absolute bottom-3 left-3 bg-void/95 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
          <p className="font-display text-xl text-cream leading-none">{event.day}</p>
          <p className="font-mono text-[9px] text-cream-dim uppercase tracking-widest">{event.month}</p>
        </div>
        {/* Status */}
        <div className={`absolute top-3 right-3 ${s.bg} ${s.text} font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full`}>
          {s.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-display text-base text-cream leading-snug mb-1 line-clamp-2">{event.title}</p>
        <p className="font-mono text-[10px] text-cream-dim mb-3">{event.time} · {event.category}</p>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-[10px] text-cream-dim">{event.attendees}/{event.capacity}</span>
            <span className="font-mono text-[10px] text-lime">{pct}% full</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-lime rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.4 + index * 0.07, duration: 0.8, ease: EASE_VERCEL }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {event.revenue > 0 ? (
            <span className="font-mono text-xs text-cream">₹{event.revenue.toLocaleString('en-IN')}</span>
          ) : (
            <span className="font-mono text-xs text-cream-faint">Free</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── AI Promo Card ────────────────────────────────────────────────────────────

function AIPromoCard() {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden relative"
      style={{ background: 'var(--void)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: EASE_VERCEL }}
    >
      {/* Subtle radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(212,255,63,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center">
              <span className="font-mono text-[9px] text-lime">AI</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime/70">AI Planner</span>
          </div>
          <h3
            className="font-display leading-[1.1] tracking-tight mb-3"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#FAFAF7' }}
          >
            Planning your next event?
            <br />
            <em style={{ color: 'var(--lime)' }}>Let the AI do the math.</em>
          </h3>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(250,250,247,0.45)', maxWidth: '400px' }}>
            Optimal pricing, the best date based on your audience, and a full run-of-show — generated in seconds.
          </p>
        </div>

        <div className="flex-shrink-0">
          <motion.button
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-sans text-sm font-medium"
            style={{
              background: 'var(--lime)',
              color: 'var(--void)',
            }}
            whileHover={{ scale: 1.03, boxShadow: SHADOW_GLOW_LIME }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            Open AI Planner
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl text-cream tracking-tight">{children}</h2>
  );
}

// ─── API data helpers ─────────────────────────────────────────────────────────

function apiEventToHostEvent(ev: any): HostEvent {
  const d = ev.date ? new Date(ev.date) : null;
  const revenue = (ev.price ?? 0) * (ev.attendees ?? 0);
  return {
    id: ev.id,
    title: ev.title,
    category: ev.category ?? 'Event',
    image: ev.image ?? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&fit=crop',
    status: (ev.status ?? 'draft') as HostEvent['status'],
    attendees: ev.attendees ?? 0,
    capacity: ev.capacity ?? 30,
    date: d ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
    dateShort: d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '',
    day: d ? d.getDate().toString() : '--',
    month: d ? d.toLocaleString('en-IN', { month: 'short' }) : '--',
    time: ev.time ?? '',
    revenue,
  };
}

interface HostStats {
  upcomingEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  eventsHosted: number;
}

function statsToCards(stats: HostStats) {
  return [
    { label: 'Upcoming events', value: stats.upcomingEvents.toString(), rawValue: stats.upcomingEvents, trend: 0 },
    { label: 'Total revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, rawValue: stats.totalRevenue, trend: 0 },
    { label: 'Total attendees', value: stats.totalAttendees.toString(), rawValue: stats.totalAttendees, trend: 0 },
    { label: 'Events hosted', value: stats.eventsHosted.toString(), rawValue: stats.eventsHosted, trend: 0 },
  ];
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

import { withAuth } from '@/components/ProtectedRoute';
function HostDashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const greeting = useGreeting();
  const { user } = useAuth();

  const [hostEvents, setHostEvents] = useState<HostEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);

  useEffect(() => {
    async function fetchHostEvents() {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/events/host/mine`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setHostEvents((data.events ?? []).map(apiEventToHostEvent));
          return;
        }
      } catch { /* fall through */ }
    }
    async function fetchHostStats() {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/events/host/stats`, {
          credentials: 'include',
        });
        if (res.ok) setHostStats(await res.json());
      } catch { /* stat cards fall back to zeros below */ }
    }
    fetchHostEvents().finally(() => setLoadingEvents(false));
    fetchHostStats();
  }, []);

  const stats = statsToCards(
    hostStats ?? { upcomingEvents: 0, totalAttendees: 0, totalRevenue: 0, eventsHosted: 0 },
  );
  const upcomingCount = hostEvents.filter((e) => e.status === 'live' || e.status === 'draft').length;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex min-h-screen bg-void">
      <Sidebar active={activeNav} setActive={setActiveNav} />

      {/* ── Main ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-12 space-y-10">

          {/* ── Greeting ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_VERCEL }}
          >
            <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] text-cream tracking-tight leading-none mb-2">
              Good {greeting}, {firstName}.
            </h1>
            <p className="font-sans text-base text-cream-dim">
              {loadingEvents ? 'Loading your events…' : (
                upcomingCount > 0
                  ? <>You have <span className="text-cream font-medium">{upcomingCount} upcoming event{upcomingCount > 1 ? 's' : ''}</span>.</>
                  : 'No upcoming events yet. Create your first one!'
              )}
            </p>
          </motion.div>

          {/* ── Stats Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={0.1 + i * 0.07} />
            ))}
          </div>

          {/* ── Upcoming Events ───────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <SectionHeading>Your events</SectionHeading>
              <Link href="/host/events" className="font-mono text-xs text-cream-dim hover:text-lime transition-colors">
                View all →
              </Link>
            </div>
            {loadingEvents ? (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[280px] h-[240px] bg-surface border border-border rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {hostEvents.map((ev, i) => (
                  <EventCard key={ev.id} event={ev} index={i} />
                ))}
                {/* Add event CTA */}
                <Link href="/host/events/new">
                  <motion.div
                    className="flex-shrink-0 w-[280px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center hover:border-lime/40 hover:bg-lime/3 transition-colors duration-200 group cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-border group-hover:border-lime/40 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-cream-faint group-hover:text-lime transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-cream-dim group-hover:text-cream transition-colors">New event</p>
                      <p className="font-mono text-[10px] text-cream-faint mt-0.5">Plan with AI →</p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}
          </section>

          {/* ── AI Planner Promo ──────────────────────────────────── */}
          <AIPromoCard />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav active={activeNav} setActive={setActiveNav} />
    </div>
  );
}

export default withAuth(HostDashboard);
