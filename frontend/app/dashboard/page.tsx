'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconTicket,
  IconChartBar,
  IconSparkles,
  IconSettings,
  IconPlus,
  IconDotsVertical,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/stores/auth';
import { withAuth } from '@/components/ProtectedRoute';
import {
  mockHost,
  mockStats,
  mockHostEvents,
  revenueData,
} from '@/lib/mockHostData';

// ─── Types ────────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', Icon: IconLayoutDashboard },
  { id: 'events', label: 'My Events', Icon: IconCalendarEvent },
  { id: 'bookings', label: 'Bookings', Icon: IconTicket },
  { id: 'analytics', label: 'Analytics', Icon: IconChartBar },
  { id: 'ai', label: 'AI Planner', Icon: IconSparkles, href: '/planner' },
  { id: 'settings', label: 'Settings', Icon: IconSettings },
];

const MOCK_BOOKINGS = [
  { id: 'b1', attendee: 'Priya Sharma', event: 'Sunday Run Club', date: 'May 28', amount: 499, status: 'confirmed' },
  { id: 'b2', attendee: 'Rahul Kumar', event: 'Brand Strategy Workshop', date: 'May 27', amount: 1499, status: 'confirmed' },
  { id: 'b3', attendee: 'Ananya M.', event: 'Natural Wine Evening', date: 'May 25', amount: 2499, status: 'confirmed' },
  { id: 'b4', attendee: 'Dev Patel', event: 'Sunday Run Club', date: 'May 24', amount: 499, status: 'pending' },
  { id: 'b5', attendee: 'Sana Khan', event: 'Brand Strategy Workshop', date: 'May 22', amount: 1499, status: 'confirmed' },
];

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, isDecimal = false) {
  const [val, setVal] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    function tick() {
      const t = Math.min((performance.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(isDecimal ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration, isDecimal]);
  return val;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  trend: number;
  sparkKey: '7D' | '30D';
  isDecimal?: boolean;
}

function MetricCard({ label, value, unit, trend, sparkKey, isDecimal = false }: MetricCardProps) {
  const count = useCountUp(value, 1200, isDecimal);
  const data = revenueData[sparkKey];
  const positive = trend >= 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 relative overflow-hidden">
      <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest">{label}</p>
      <p className="font-display text-[36px] text-cream leading-none mt-2">
        {unit === '₹' ? `₹${count.toLocaleString('en-IN')}` : count}
      </p>
      <div className="mt-3 h-[60px]">
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${sparkKey}-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4FF3F"
              strokeWidth={1.5}
              fill={`url(#grad-${sparkKey}-${label})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className={cn('font-mono text-[12px] mt-2', positive ? 'text-emerald' : 'text-coral')}>
        {positive ? '+' : ''}{trend}% this month
      </p>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: 'bg-lime/15 text-lime',
    draft: 'bg-cream/10 text-cream-dim',
    full: 'bg-coral/15 text-coral',
    past: 'bg-surface-2 text-cream-faint',
  };
  return (
    <span className={cn('font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full', styles[status] ?? styles.draft)}>
      {status}
    </span>
  );
}

// ─── Bookings table ───────────────────────────────────────────────────────────

function BookingsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr>
            {['Attendee', 'Event', 'Date', 'Amount', 'Status'].map((col) => (
              <th key={col} className="font-mono text-[11px] uppercase tracking-widest text-cream-faint border-b border-border pb-3 pr-4">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MOCK_BOOKINGS.map((b) => (
            <tr key={b.id} className="border-b border-border last:border-0">
              <td className="font-sans text-[14px] text-cream py-3 pr-4">{b.attendee}</td>
              <td className="font-sans text-[14px] text-cream-dim py-3 pr-4">{b.event}</td>
              <td className="font-mono text-[12px] text-cream-dim py-3 pr-4">{b.date}</td>
              <td className="font-mono text-[12px] text-cream py-3 pr-4">₹{b.amount.toLocaleString('en-IN')}</td>
              <td className="py-3">
                <span className={cn(
                  'font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full',
                  b.status === 'confirmed' ? 'bg-lime/15 text-lime' : 'bg-cream/10 text-cream-dim'
                )}>
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Events list ──────────────────────────────────────────────────────────────

function EventsList({ showSearch = false }: { showSearch?: boolean }) {
  const [search, setSearch] = useState('');
  const filtered = mockHostEvents.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {showSearch && (
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl h-11 px-4 text-cream font-sans text-[14px] placeholder:text-cream-faint focus:outline-none focus:border-border-strong mb-6"
        />
      )}
      <div className="space-y-3">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-border-strong transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image}
              alt={event.title}
              className="w-[60px] h-[60px] rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-sans text-[14px] font-medium text-cream truncate">{event.title}</p>
              <p className="font-mono text-[12px] text-cream-dim mt-0.5">{event.dateShort} · {event.time}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-mono text-[11px] bg-surface-2 text-cream-dim px-2 py-0.5 rounded-full border border-border">
                {event.attendees}/{event.capacity}
              </span>
              <StatusPill status={event.status} />
              <button className="text-cream-faint hover:text-cream transition-colors p-1">
                <IconDotsVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ userName }: { userName: string }) {
  const today = new Date();
  const todayString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const metrics = [
    { label: 'Upcoming Events', value: mockStats.upcomingEvents, unit: '', trend: mockStats.trends.upcomingEvents, sparkKey: '7D' as const },
    { label: 'Monthly Revenue', value: mockStats.monthlyRevenue, unit: '₹', trend: mockStats.trends.monthlyRevenue, sparkKey: '30D' as const },
    { label: 'Total Attendees', value: mockStats.totalAttendees, unit: '', trend: mockStats.trends.totalAttendees, sparkKey: '30D' as const },
    { label: 'Avg Rating', value: mockStats.averageRating, unit: '', trend: mockStats.trends.averageRating, sparkKey: '7D' as const, isDecimal: true },
  ];

  return (
    <div>
      {/* Greeting */}
      <div className="mb-10">
        <p className="font-mono text-[11px] text-cream-faint uppercase tracking-[0.2em] mb-3">
          {todayString}
        </p>
        <h1 className="font-display text-[40px] lg:text-[48px] text-cream leading-none">
          Hey, {userName}.
        </h1>
        <p className="font-sans text-[15px] text-cream-dim mt-2">
          You have {mockStats.upcomingEvents} upcoming event{mockStats.upcomingEvents !== 1 ? 's' : ''}. Keep the momentum going.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Your events */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[28px] text-cream">Your events</h2>
          <Link href="/dashboard/new">
            <button className="h-9 px-4 bg-lime text-void rounded-lg font-sans text-[13px] font-semibold hover:bg-lime/90 transition-colors flex items-center gap-1.5">
              <IconPlus size={14} /> Create event
            </button>
          </Link>
        </div>
        <EventsList />
      </div>

      {/* Recent bookings */}
      <div className="mt-12">
        <h2 className="font-display text-[28px] text-cream mb-4">Recent bookings</h2>
        <BookingsTable />
      </div>
    </div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  return (
    <div>
      <div className="mb-8 text-center">
        <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest mb-1">Analytics</p>
        <h2 className="font-display text-[28px] text-cream">30-day revenue</h2>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData['30D']}>
            <defs>
              <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4FF3F" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D4FF3F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4FF3F"
              strokeWidth={2}
              fill="url(#analyticsGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest text-center mt-8">
        Analytics coming soon.
      </p>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? mockHost.name);
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(mockHost.bio);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Settings saved.');
  }

  const inputCls = 'w-full bg-surface border border-border rounded-xl h-12 px-4 text-cream font-sans text-[14px] placeholder:text-cream-faint focus:outline-none focus:border-border-strong transition-colors';
  const labelCls = 'block font-mono text-[11px] uppercase tracking-widest text-cream-faint mb-2';

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-[28px] text-cream mb-8">Settings</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className={labelCls}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-surface border border-border rounded-xl p-4 text-cream font-sans text-[14px] placeholder:text-cream-faint focus:outline-none focus:border-border-strong transition-colors resize-none"
          />
        </div>
        <button type="submit" className="h-11 px-6 bg-lime text-void rounded-xl font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors">
          Save changes
        </button>
      </form>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? mockHost.firstName;
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : mockHost.initials;

  function renderContent() {
    switch (activeTab) {
      case 'overview': return <OverviewTab userName={firstName} />;
      case 'events': return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-[28px] text-cream">My Events</h2>
            <Link href="/dashboard/new">
              <button className="h-9 px-4 bg-lime text-void rounded-lg font-sans text-[13px] font-semibold hover:bg-lime/90 transition-colors flex items-center gap-1.5">
                <IconPlus size={14} /> Create event
              </button>
            </Link>
          </div>
          <EventsList showSearch />
        </div>
      );
      case 'bookings': return (
        <div>
          <h2 className="font-display text-[28px] text-cream mb-6">Bookings</h2>
          <BookingsTable />
        </div>
      );
      case 'analytics': return <AnalyticsTab />;
      case 'settings': return <SettingsTab />;
      default: return <OverviewTab userName={firstName} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-void">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-surface border-r border-border fixed h-screen overflow-y-auto z-30">
        {/* Wordmark */}
        <div className="px-6 pt-7 pb-4 border-b border-border">
          <span className="font-display text-[22px] text-cream tracking-tight">UpSosh</span>
          <span className="font-mono text-[9px] text-lime ml-1.5 uppercase tracking-[0.2em]">Host</span>
        </div>

        {/* Nav */}
        <nav className="mt-6 px-3 space-y-0.5 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon, href }) => {
            const isActive = activeTab === id;
            if (href) {
              return (
                <Link key={id} href={href}>
                  <span className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-[14px] cursor-pointer transition-colors w-full',
                    'text-cream-dim hover:bg-cream/5 hover:text-cream'
                  )}>
                    <Icon size={17} />
                    {label}
                  </span>
                </Link>
              );
            }
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-[14px] w-full text-left transition-colors',
                  isActive
                    ? 'bg-lime/10 text-lime border-l-2 border-lime -ml-px pl-[15px]'
                    : 'text-cream-dim hover:bg-cream/5 hover:text-cream'
                )}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        <div className="mt-auto mx-3 mb-4 p-3 rounded-xl bg-surface-2 border border-border">
          <div className="flex items-center gap-3">
            <div className="bg-lime text-void font-display w-8 h-8 rounded-full flex items-center justify-center text-[13px] flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[13px] text-cream font-medium truncate">{user?.name ?? mockHost.name}</p>
              <span className="font-mono text-[9px] text-lime uppercase tracking-widest">Verified</span>
            </div>
          </div>
          <Link href="/discover" className="block mt-2">
            <span className="font-mono text-[10px] text-cream-faint hover:text-cream-dim transition-colors">
              Switch to attendee →
            </span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="px-6 lg:px-10 py-8 lg:py-10 pb-24 lg:pb-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-2 grid grid-cols-5 gap-1 z-40">
        {[
          { id: 'overview', Icon: IconLayoutDashboard },
          { id: 'events', Icon: IconCalendarEvent },
          { id: 'bookings', Icon: IconTicket },
          { id: 'ai', Icon: IconSparkles, href: '/planner' },
          { id: 'settings', Icon: IconSettings },
        ].map(({ id, Icon, href }) => {
          const isActive = activeTab === id;
          if (href) {
            return (
              <Link key={id} href={href} className="flex flex-col items-center justify-center py-1.5">
                <Icon size={20} className="text-cream-dim" />
              </Link>
            );
          }
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center justify-center py-1.5"
            >
              <Icon size={20} className={isActive ? 'text-lime' : 'text-cream-dim'} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default withAuth(DashboardPage);
