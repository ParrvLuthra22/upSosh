'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import {
  mockHost,
  mockStats,
  mockHostEvents,
  mockActivity,
  revenueData,
  type HostEvent,
  type ActivityItem,
  type RevenuePoint,
} from '@/lib/mockHostData';

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

// ─── SVG Chart helpers ────────────────────────────────────────────────────────

const W = 800;
const H = 180;
const PAD = { top: 16, right: 4, bottom: 24, left: 4 };

function normalize(points: RevenuePoint[]): Array<{ x: number; y: number; d: RevenuePoint }> {
  if (!points.length) return [];
  const maxR = Math.max(...points.map((p) => p.revenue), 1);
  return points.map((d, i) => ({
    x: PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - d.revenue / maxR) * (H - PAD.top - PAD.bottom),
    d,
  }));
}

function smoothLinePath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const pp = i > 1 ? pts[i - 2] : pts[i - 1];
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = i < pts.length - 1 ? pts[i + 1] : p1;
    const cp1x = p0.x + (p1.x - pp.x) / 6;
    const cp1y = p0.y + (p1.y - pp.y) / 6;
    const cp2x = p1.x - (p2.x - p0.x) / 6;
    const cp2y = p1.y - (p2.y - p0.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }
  return d;
}

function areaPath(linePath: string, pts: Array<{ x: number; y: number }>): string {
  if (!pts.length) return '';
  const bottom = H - PAD.bottom;
  return `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${bottom} L ${pts[0].x.toFixed(2)} ${bottom} Z`;
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
    <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-bg-secondary border-r border-border h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/">
          <span className="font-display text-xl text-ink-primary tracking-tight">UpSosh</span>
          <span className="font-mono text-[10px] text-ink-muted ml-1.5 uppercase tracking-widest">Host</span>
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
                    className="absolute inset-0 bg-accent/8 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {/* Left border */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 transition-colors duration-150 ${
                    isActive ? 'text-accent' : 'text-ink-muted group-hover:text-ink-primary'
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`relative z-10 font-sans text-sm transition-colors duration-150 ${
                    isActive ? 'text-ink-primary font-medium' : 'text-ink-muted group-hover:text-ink-primary'
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
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border">
            <img src={mockHost.photo} alt={mockHost.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-ink-primary truncate">{mockHost.name}</p>
            {mockHost.isSuperhost && (
              <span
                className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F0C96A22, #C9A84C22)',
                  color: '#C9A84C',
                  border: '1px solid #C9A84C33',
                }}
              >
                ★ Superhost
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────

function MobileBottomNav({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-t border-border">
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
                  className="absolute inset-0 bg-accent/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 transition-colors ${isActive ? 'text-accent' : 'text-ink-muted'}`}>
                {item.icon}
              </span>
              <span className={`relative z-10 font-mono text-[9px] uppercase tracking-wider transition-colors ${isActive ? 'text-accent' : 'text-ink-muted'}`}>
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
      className="border border-border rounded-2xl p-6 bg-bg-primary hover:bg-bg-secondary transition-colors duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: EASE_VERCEL }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-3">{label}</p>
      <p className="font-display text-[2.5rem] text-ink-primary leading-none mb-3">{displayValue}</p>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-mono text-xs ${positive ? 'text-verified' : 'text-red-500'}`}
        >
          {positive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="font-mono text-[10px] text-ink-light">vs last month</span>
      </div>
    </motion.div>
  );
}

// ─── Event Cards (Horizontal Scroll) ─────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  live: { bg: 'bg-verified/10', text: 'text-verified', label: 'Live' },
  draft: { bg: 'bg-border', text: 'text-ink-muted', label: 'Draft' },
  full: { bg: 'bg-accent/10', text: 'text-accent', label: 'Full' },
  past: { bg: 'bg-border', text: 'text-ink-light', label: 'Past' },
};

function EventCard({ event, index }: { event: HostEvent; index: number }) {
  const pct = Math.round((event.attendees / event.capacity) * 100);
  const s = STATUS_STYLES[event.status];

  return (
    <motion.div
      className="flex-shrink-0 w-[280px] border border-border rounded-2xl overflow-hidden bg-bg-primary group cursor-none"
      data-cursor="MANAGE"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.45, ease: EASE_VERCEL }}
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(10,10,10,0.08)', transition: { duration: 0.2 } }}
    >
      {/* Image */}
      <div className="relative h-[140px] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Date badge */}
        <div className="absolute bottom-3 left-3 bg-bg-primary/95 rounded-lg px-2.5 py-1.5 text-center min-w-[44px]">
          <p className="font-display text-xl text-ink-primary leading-none">{event.day}</p>
          <p className="font-mono text-[9px] text-ink-muted uppercase tracking-widest">{event.month}</p>
        </div>
        {/* Status */}
        <div className={`absolute top-3 right-3 ${s.bg} ${s.text} font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full`}>
          {s.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-display text-base text-ink-primary leading-snug mb-1 line-clamp-2">{event.title}</p>
        <p className="font-mono text-[10px] text-ink-muted mb-3">{event.time} · {event.category}</p>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-mono text-[10px] text-ink-muted">{event.attendees}/{event.capacity}</span>
            <span className="font-mono text-[10px] text-accent">{pct}% full</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.4 + index * 0.07, duration: 0.8, ease: EASE_VERCEL }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {event.revenue > 0 ? (
            <span className="font-mono text-xs text-ink-primary">₹{event.revenue.toLocaleString('en-IN')}</span>
          ) : (
            <span className="font-mono text-xs text-ink-light">Free</span>
          )}
          <button className="font-mono text-[10px] text-ink-muted hover:text-accent transition-colors group-hover:text-accent flex items-center gap-1">
            Manage <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────

type TimeRange = '7D' | '30D' | '3M' | 'All';

function RevenueChart() {
  const [range, setRange] = useState<TimeRange>('30D');
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; svgX: number; data: RevenuePoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const points = revenueData[range];
  const normalized = normalize(points);
  const linePath = smoothLinePath(normalized);
  const fillPath = areaPath(linePath, normalized);
  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !normalized.length) return;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * W;
      let nearest = normalized[0];
      let minDist = Infinity;
      for (const pt of normalized) {
        const dist = Math.abs(pt.x - mouseX);
        if (dist < minDist) { minDist = dist; nearest = pt; }
      }
      setTooltip({
        x: (nearest.x / W) * rect.width + rect.left - rect.left,
        y: (nearest.y / H) * rect.height,
        svgX: nearest.x,
        data: nearest.d,
      });
    },
    [normalized]
  );

  return (
    <motion.div
      className="border border-border rounded-2xl p-6 bg-bg-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: EASE_VERCEL }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-1">Revenue</p>
          <p className="font-display text-3xl text-ink-primary">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="font-mono text-[10px] text-ink-muted mt-0.5">
            {range === '7D' ? 'Last 7 days' : range === '30D' ? 'Last 30 days' : range === '3M' ? 'Last 3 months' : 'All time'}
          </p>
        </div>
        {/* Time range pills */}
        <div className="flex items-center gap-1 bg-bg-secondary rounded-xl p-1 border border-border">
          {(['7D', '30D', '3M', 'All'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`relative px-3 py-1.5 rounded-lg font-mono text-xs transition-colors duration-150 ${
                range === r ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {range === r && (
                <motion.div
                  layoutId="chart-range-bg"
                  className="absolute inset-0 bg-bg-primary border border-border rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative" onMouseLeave={() => setTooltip(null)}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Revenue chart: ₹${totalRevenue.toLocaleString('en-IN')} for ${range === '7D' ? 'last 7 days' : range === '30D' ? 'last 30 days' : range === '3M' ? 'last 3 months' : 'all time'}`}
          className="w-full overflow-visible"
          style={{ height: 200 }}
          onMouseMove={handleMouseMove}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`fill-${range}`}
              d={fillPath}
              fill="url(#chart-fill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>

          {/* Line — animates pathLength on mount/range change */}
          <AnimatePresence mode="wait">
            <motion.path
              key={`line-${range}`}
              d={linePath}
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 1.2, ease: EASE_VERCEL }}
            />
          </AnimatePresence>

          {/* Tooltip elements */}
          {tooltip && (
            <>
              {/* Vertical dashed line */}
              <line
                x1={tooltip.svgX}
                y1={PAD.top}
                x2={tooltip.svgX}
                y2={H - PAD.bottom}
                stroke="#E8E4DC"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Dot */}
              <circle
                cx={tooltip.svgX}
                cy={normalized.find((p) => p.d === tooltip.data)?.y ?? 0}
                r="4"
                fill="#FF5A1F"
                stroke="#FAFAF7"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {/* Tooltip card */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              className="absolute pointer-events-none z-10 bg-ink-primary text-bg-primary rounded-xl px-3 py-2 shadow-lg text-left"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -110%)',
              }}
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <p className="font-mono text-[10px] text-bg-primary/60 mb-0.5">{tooltip.data.label}</p>
              <p className="font-sans text-sm font-medium">
                {tooltip.data.revenue === 0 ? '—' : `₹${tooltip.data.revenue.toLocaleString('en-IN')}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, string> = {
  booking: '🎟',
  review: '★',
  cancellation: '✕',
  payout: '₹',
  message: '💬',
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <motion.div
      className="border border-border rounded-2xl p-6 bg-bg-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5, ease: EASE_VERCEL }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted mb-5">Recent activity</p>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
        <div className="space-y-5">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className="relative flex items-start gap-4 group pl-1"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.35, ease: EASE_VERCEL }}
              whileHover={{ x: 2, transition: { duration: 0.15 } }}
            >
              {/* Icon dot */}
              <div
                className="relative z-10 w-6 h-6 rounded-full bg-bg-primary border border-border flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]"
                style={{ borderColor: item.accent ? `${item.accent}40` : undefined, backgroundColor: item.accent ? `${item.accent}10` : undefined }}
              >
                <span>{item.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-ink-primary leading-snug group-hover:text-accent transition-colors duration-150">
                  {item.text}
                </p>
                <p className="font-mono text-[10px] text-ink-light mt-0.5">{item.time}</p>
              </div>
            </motion.div>
          ))}
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
      style={{ background: '#0A0A0A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 0.5, ease: EASE_VERCEL }}
    >
      {/* Subtle radial accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,90,31,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-lg">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="font-mono text-[9px] text-accent">AI</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/70">AI Planner</span>
          </div>
          <h3
            className="font-display leading-[1.1] tracking-tight mb-3"
            style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#FAFAF7' }}
          >
            Planning your next event?
            <br />
            <em style={{ color: '#FF5A1F' }}>Let the AI do the math.</em>
          </h3>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(250,250,247,0.45)', maxWidth: '400px' }}>
            Optimal pricing, the best date based on your audience, and a full run-of-show — generated in seconds.
          </p>
        </div>

        <div className="flex-shrink-0">
          <motion.button
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-sans text-sm font-medium"
            style={{
              background: '#FF5A1F',
              color: '#FAFAF7',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(255,90,31,0.4)' }}
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
    <h2 className="font-display text-2xl text-ink-primary tracking-tight">{children}</h2>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Upcoming events',
    value: mockStats.upcomingEvents.toString(),
    rawValue: mockStats.upcomingEvents,
    trend: mockStats.trends.upcomingEvents,
  },
  {
    label: 'This month revenue',
    value: `₹${mockStats.monthlyRevenue.toLocaleString('en-IN')}`,
    rawValue: mockStats.monthlyRevenue,
    trend: mockStats.trends.monthlyRevenue,
  },
  {
    label: 'Total attendees',
    value: mockStats.totalAttendees.toString(),
    rawValue: mockStats.totalAttendees,
    trend: mockStats.trends.totalAttendees,
  },
  {
    label: 'Average rating',
    value: `${mockStats.averageRating} ★`,
    rawValue: mockStats.averageRating * 10,
    trend: mockStats.trends.averageRating,
  },
];

export default function HostDashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const greeting = useGreeting();

  const upcomingCount = mockHostEvents.filter((e) => e.status === 'live' || e.status === 'draft').length;

  return (
    <div className="flex min-h-screen bg-bg-primary">
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
            <h1 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] text-ink-primary tracking-tight leading-none mb-2">
              Good {greeting}, {mockHost.firstName}.
            </h1>
            <p className="font-sans text-base text-ink-muted">
              You have <span className="text-ink-primary font-medium">{upcomingCount} events</span> this week.
            </p>
          </motion.div>

          {/* ── Stats Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={0.1 + i * 0.07} />
            ))}
          </div>

          {/* ── Upcoming Events ───────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <SectionHeading>Your next events</SectionHeading>
              <button className="font-mono text-xs text-ink-muted hover:text-accent transition-colors">
                View all →
              </button>
            </div>
            {/* Horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {mockHostEvents.map((ev, i) => (
                <EventCard key={ev.id} event={ev} index={i} />
              ))}
              {/* Add event CTA */}
              <motion.div
                className="flex-shrink-0 w-[280px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center hover:border-accent/40 hover:bg-accent/3 transition-colors duration-200 group cursor-none"
                data-cursor="CREATE"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <div className="w-10 h-10 rounded-full border border-dashed border-border group-hover:border-accent/40 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-ink-light group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-ink-muted group-hover:text-ink-primary transition-colors">New event</p>
                  <p className="font-mono text-[10px] text-ink-light mt-0.5">Plan with AI →</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── Revenue Chart ─────────────────────────────────────── */}
          <section>
            <RevenueChart />
          </section>

          {/* ── Activity Feed ─────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <SectionHeading>Activity</SectionHeading>
            </div>
            <ActivityFeed items={mockActivity} />
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
