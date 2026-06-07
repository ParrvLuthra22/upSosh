/**
 * app/discover/loading.tsx  —  Loading UI for the /discover route.
 * Matches the real page: sticky filter bar + sidebar + masonry-style event feed.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function DiscoverLoading() {
  return (
    <div
      className="min-h-screen bg-void"
      aria-busy="true"
      aria-label="Loading Discover"
    >
      {/* ── Hero / search header ─────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-28 pb-10 max-w-7xl mx-auto">
        <Skeleton className="h-3 w-20 mb-5 rounded-full" />
        <Skeleton className="h-11 w-72 md:w-96 mb-3" style={{ borderRadius: 10 }} />
        <Skeleton className="h-4 w-48 mb-8" />
        {/* Search bar */}
        <Skeleton className="h-12 w-full max-w-xl rounded-2xl" />
      </div>

      {/* ── Sticky filter bar ────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-void border-y border-border px-6 md:px-10 py-3">
        <div className="flex items-center gap-2 overflow-hidden max-w-7xl mx-auto">
          <Skeleton className="h-8 w-24 flex-shrink-0 rounded-full" />
          {[88, 104, 76, 96, 80, 112, 72, 88].map((w, i) => (
            <Skeleton key={i} className="h-8 flex-shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="flex max-w-7xl mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 border-r border-border px-5 py-8 sticky top-[7rem] h-[calc(100vh-7rem)] overflow-y-auto">
          <Skeleton className="h-3 w-12 mb-8" />
          {['Category', 'Price range', 'Date', 'Distance', 'Host type'].map((_, i) => (
            <div key={i} className="mb-8">
              <Skeleton className="h-3 w-16 mb-4" />
              {i === 1 ? (
                <div className="space-y-2">
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: i === 0 ? 4 : 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-7 rounded-full" style={{ width: 60 + j * 12 }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* Event feed */}
        <div className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="px-6 md:px-10 py-4 border-b border-border flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* 6 skeleton cards — varied heights mimic masonry rhythm */}
          <div className="px-6 md:px-10 py-6 columns-1 sm:columns-2 xl:columns-3 gap-5 space-y-5">
            {(['h-64','h-56','h-72','h-60','h-68','h-52'] as const).map((h, i) => (
              <div
                key={i}
                className="break-inside-avoid bg-surface border border-border rounded-2xl overflow-hidden mb-5"
              >
                <Skeleton className={`w-full rounded-none ${h}`} />
                <div className="p-5 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3.5 w-1/2" />
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton circle className="w-6 h-6" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
