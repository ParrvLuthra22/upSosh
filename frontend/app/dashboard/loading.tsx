/**
 * app/dashboard/loading.tsx  —  Loading UI for /dashboard.
 * Matches the fixed sidebar + overview grid layout.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-screen bg-void"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-surface border-r border-border fixed h-screen z-30">
        {/* Wordmark */}
        <div className="px-6 pt-7 pb-4 border-b border-border">
          <Skeleton className="h-5 w-28" />
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 pt-6 space-y-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <Skeleton circle className="w-4 h-4 flex-shrink-0" />
              <Skeleton className="h-3.5" style={{ width: 60 + i * 8 }} />
            </div>
          ))}
        </nav>

        {/* User card */}
        <div className="mx-3 mb-4 p-3 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <Skeleton circle className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 px-6 lg:px-10 py-8 lg:py-10">
        {/* Greeting */}
        <div className="mb-10">
          <Skeleton className="h-3 w-44 mb-4" />
          <Skeleton className="h-10 w-60 mb-3" style={{ borderRadius: 10 }} />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Metric cards — 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-2xl p-5 space-y-3"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-20" style={{ borderRadius: 8 }} />
              {/* Sparkline area */}
              <Skeleton className="h-[60px] w-full rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>

        {/* Your events section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-36" style={{ borderRadius: 8 }} />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <Skeleton className="w-[60px] h-[60px] rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full flex-shrink-0" />
                <Skeleton className="h-6 w-14 rounded-full flex-shrink-0" />
                <Skeleton circle className="w-6 h-6 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent bookings table */}
        <div>
          <Skeleton className="h-8 w-44 mb-4" style={{ borderRadius: 8 }} />
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border mb-1">
            {['Attendee', 'Event', 'Date', 'Amount', 'Status'].map((col) => (
              <Skeleton key={col} className="h-3" style={{ width: '60%' }} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 py-3 border-b border-border last:border-0"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
