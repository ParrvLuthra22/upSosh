'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { EASE_VERCEL, SHADOW_PANEL, SHADOW_GLOW_LIME, useReducedMotion } from '@/lib/motion';
import { useAuth } from '@/lib/stores/auth';
import { type HostEvent, HOST_NAV, activeHostNav, apiEventToHostEvent, isUpcoming, statusStyle } from '@/lib/hostEventTypes';
import { api } from '@/lib/api';
import { describeError } from '@/lib/http';
import ModeSwitch from '@/components/layout/ModeSwitch';
import { cardVariants } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountUp(target: number, isInView: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (reduced) { setValue(target); return; }
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
  }, [target, isInView, duration, reduced]);

  return value;
}

function useGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
// Every item is a real page (see HOST_NAV in lib/hostEventTypes.ts). There are no
// Attendees / Analytics / Payouts entries: nothing stands behind them yet.

const NAV_ICONS: Record<string, React.ReactNode> = {
  overview: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  events: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  new: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
  planner: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .23 2.71-1.13 2.71H3.93c-1.36 0-2.13-1.71-1.13-2.71L4.2 15.3" />
    </svg>
  ),
  settings: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

// The global header is fixed at the top of every page that shows it; the dashboard
// shell starts below it.
const HEADER_OFFSET = 88;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active }: { active: string }) {
  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-surface border-r border-border sticky overflow-y-auto"
      style={{ top: HEADER_OFFSET, height: `calc(100vh - ${HEADER_OFFSET}px)` }}
    >
      <div className="px-6 py-5 border-b border-border">
        <Link href="/discover" className="font-mono text-xs text-cream-dim hover:text-lime transition-colors">
          ← Back to site
        </Link>
        <p className="font-mono text-[10px] text-cream-faint uppercase tracking-widest mt-2">Host</p>
      </div>

      <nav aria-label="Host" className="flex-1 px-3 py-4">
        <div className="relative space-y-0.5">
          {HOST_NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-lime/8 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-lime"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 transition-colors duration-150 ${isActive ? 'text-lime' : 'text-cream-dim group-hover:text-cream'}`}
                >
                  {NAV_ICONS[item.id]}
                </span>
                <span
                  className={`relative z-10 font-sans text-sm transition-colors duration-150 ${isActive ? 'text-cream font-medium' : 'text-cream-dim group-hover:text-cream'}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

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
              style={{ background: 'linear-gradient(135deg, #F0C96A22, #C9A84C22)', color: '#C9A84C', border: '1px solid #C9A84C33' }}
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

function MobileBottomNav({ active }: { active: string }) {
  return (
    <nav aria-label="Host" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-void/95 backdrop-blur-xl border-t border-border">
      <div className="flex justify-around items-center py-2 px-1">
        {HOST_NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl min-w-0 flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-bg"
                  className="absolute inset-0 bg-lime/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isActive ? 'text-lime' : 'text-cream-dim'}`}>{NAV_ICONS[item.id]}</span>
              <span className={`relative z-10 font-mono text-[9px] uppercase tracking-wide transition-colors whitespace-nowrap ${isActive ? 'text-lime' : 'text-cream-dim'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, rawValue, delay }: { label: string; value: string; rawValue: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const count = useCountUp(rawValue, inView);
  const isRevenue = value.startsWith('₹');
  const displayValue = isRevenue ? `₹${count.toLocaleString('en-IN')}` : count.toString();

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
      <p className="font-display text-[2.5rem] text-cream leading-none">{displayValue}</p>
    </motion.div>
  );
}

// ─── Event Cards (Horizontal Scroll) ─────────────────────────────────────────

function EventCard({ event, index }: { event: HostEvent; index: number }) {
  const pct = event.capacity > 0 ? Math.round((event.attendees / event.capacity) * 100) : 0;
  const s = statusStyle(event.status);
  const eventHref = `/events/${event.slug}`;

  return (
    <motion.div
      className={cn(cardVariants({ padding: 'none' }), 'flex-shrink-0 w-[280px] overflow-hidden group')}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.45, ease: EASE_VERCEL }}
      whileHover={{ y: -4, boxShadow: SHADOW_PANEL, transition: { duration: 0.2 } }}
    >
      <Link href={eventHref} aria-label={`View ${event.title}`} className="block">
        <div className="relative h-[140px] overflow-hidden">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="280px"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 bg-void/95 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
            <p className="font-display text-xl text-cream leading-none">{event.day}</p>
            <p className="font-mono text-[9px] text-cream-dim uppercase tracking-widest">{event.month}</p>
          </div>
          <div className={`absolute top-3 right-3 ${s.bg} ${s.text} font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full`}>
            {s.label}
          </div>
        </div>

        <div className="p-4 pb-2">
          <p className="font-display text-base text-cream leading-snug mb-1 line-clamp-2">{event.title}</p>
          <p className="font-mono text-[10px] text-cream-dim mb-3">{event.time} · {event.category}</p>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[10px] text-cream-dim">{event.attendees}/{event.capacity}</span>
              <span className="font-mono text-[10px] text-lime">{pct}% full</span>
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-lime rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ delay: 0.4 + index * 0.07, duration: 0.8, ease: EASE_VERCEL }}
              />
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex items-center justify-between">
        {/* Collected so far: the server's total of this event's paid bookings. */}
        <span className="font-mono text-xs text-cream">
          {event.isFree && event.revenue === 0 ? 'Free' : `₹${event.revenue.toLocaleString('en-IN')} ticket revenue`}
        </span>
        <Link href={`/host/events/${event.id}`} className="font-mono text-[10px] text-cream-dim hover:text-lime transition-colors">
          Manage →
        </Link>
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(212,255,63,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center">
              <span className="font-mono text-[9px] text-lime">AI</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime/70">AI Planner</span>
          </div>
          <h3 className="font-display leading-[1.1] tracking-tight mb-3" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#FAFAF7' }}>
            Planning your next event?
            <br />
            <em style={{ color: 'var(--lime)' }}>Let the AI do the math.</em>
          </h3>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(250,250,247,0.45)', maxWidth: '400px' }}>
            Optimal pricing, the best date based on your audience, and a full run-of-show — generated in seconds.
          </p>
        </div>

        <div className="flex-shrink-0">
          {/* The planner lives at /planner. */}
          <Link
            href="/planner"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-sans text-sm font-medium transition-transform hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: 'var(--lime)', color: 'var(--void)' }}
          >
            Open AI Planner
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl text-cream tracking-tight">{children}</h2>;
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-coral/40 bg-coral/5 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <p className="font-sans text-sm text-cream">{message}</p>
      <button onClick={onRetry} className="font-mono text-xs uppercase tracking-wider text-lime border border-lime/40 rounded-full px-4 py-1.5 hover:bg-lime/10 transition-colors">
        Retry
      </button>
    </div>
  );
}

// ─── API data ─────────────────────────────────────────────────────────────────

interface HostStats {
  upcomingEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  eventsHosted: number;
}

function statsToCards(stats: HostStats) {
  return [
    { label: 'Upcoming events', value: stats.upcomingEvents.toString(), rawValue: stats.upcomingEvents },
    { label: 'Ticket revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, rawValue: stats.totalRevenue },
    { label: 'Total attendees', value: stats.totalAttendees.toString(), rawValue: stats.totalAttendees },
    { label: 'Events hosted', value: stats.eventsHosted.toString(), rawValue: stats.eventsHosted },
  ];
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

import { withAuth } from '@/components/ProtectedRoute';

function HostDashboard() {
  const pathname = usePathname();
  const active = activeHostNav(pathname);
  const greeting = useGreeting();
  const { user } = useAuth();

  const [hostEvents, setHostEvents] = useState<HostEvent[]>([]);
  const [hostStats, setHostStats] = useState<HostStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Both must succeed: showing zeros for a failed stats call would read as "you earned nothing".
      const [mine, stats] = await Promise.all([
        api.get<{ events: any[] }>('/api/events/host/mine'),
        api.get<HostStats>('/api/events/host/stats'),
      ]);
      setHostEvents((mine.events ?? []).map(apiEventToHostEvent));
      setHostStats(stats);
    } catch (err) {
      setError(describeError(err, "We couldn't load your dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cards = hostStats ? statsToCards(hostStats) : null;
  const upcomingCount = hostEvents.filter((e) => isUpcoming(e)).length;
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="flex min-h-screen bg-void" style={{ paddingTop: HEADER_OFFSET }}>
      <Sidebar active={active} />

      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-8 md:py-10 space-y-10">

          {/* Way back to the rest of the site, and the Attending / Hosting switch: visible on every screen size. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/discover" className="font-mono text-xs text-cream-dim hover:text-lime transition-colors">
              ← Back to site
            </Link>
            <ModeSwitch />
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_VERCEL }}>
            <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] text-cream tracking-tight leading-none mb-2">
              Good {greeting}, {firstName}.
            </h1>
            <p className="font-sans text-base text-cream-dim">
              {loading ? 'Loading your events…' : error ? 'Something went wrong loading your events.' : (
                upcomingCount > 0
                  ? <>You have <span className="text-cream font-medium">{upcomingCount} upcoming event{upcomingCount > 1 ? 's' : ''}</span>.</>
                  : 'No upcoming events yet. Create your first one!'
              )}
            </p>
          </motion.div>

          {error ? (
            <InlineError message={error} onRetry={load} />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards
                  ? cards.map((c, i) => <StatCard key={c.label} {...c} delay={0.1 + i * 0.07} />)
                  : [0, 1, 2, 3].map((i) => <div key={i} className="h-[132px] bg-surface border border-border rounded-2xl animate-pulse" />)}
              </div>

              <section>
                <div className="flex items-center justify-between mb-5">
                  <SectionHeading>Your events</SectionHeading>
                  <Link href="/host/events" className="font-mono text-xs text-cream-dim hover:text-lime transition-colors">
                    View all →
                  </Link>
                </div>
                {loading ? (
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
                    <Link href="/host/events/new">
                      <motion.div
                        className="flex-shrink-0 w-[280px] h-full min-h-[240px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center hover:border-lime/40 hover:bg-lime/3 transition-colors duration-200 group cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                      >
                        <div className="w-10 h-10 rounded-full border border-dashed border-border group-hover:border-lime/40 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-cream-faint group-hover:text-lime transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                          </svg>
                        </div>
                        <p className="font-sans text-sm font-medium text-cream-dim group-hover:text-cream transition-colors">New event</p>
                      </motion.div>
                    </Link>
                  </div>
                )}
              </section>
            </>
          )}

          <AIPromoCard />
        </div>
      </main>

      <MobileBottomNav active={active} />
    </div>
  );
}

export default withAuth(HostDashboard);
