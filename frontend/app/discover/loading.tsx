/**
 * app/discover/loading.tsx  —  Loading UI for the /discover route.
 * Mirrors DiscoverPageClient's actual structure: header + sticky pill/chip
 * bar (no permanent sidebar — filters live in a slide-out drawer) + results
 * line + masonry grid. Reuses the shared shimmer `Skeleton` component so the
 * loading treatment matches every other loading state in the app.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function DiscoverLoading() {
  return (
    <div
      className="min-h-screen bg-void"
      aria-busy="true"
      aria-label="Loading Discover"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="pt-16 md:pt-24 pb-10 md:pb-14 px-6 md:px-10 max-w-7xl mx-auto">
        <Skeleton className="h-3 w-20 mb-4 rounded-full" />
        <Skeleton className="h-11 md:h-16 w-72 md:w-[28rem] mb-8 rounded-xl" />
        <Skeleton className="h-12 w-full max-w-lg rounded-2xl" />
      </div>

      {/* ── Sticky filter bar — matches the real top-16 offset ─────────────── */}
      <div className="sticky top-16 z-40 backdrop-blur-xl bg-void/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0 flex gap-2 overflow-hidden">
            <Skeleton className="h-9 w-14 flex-shrink-0 rounded-full" />
            {[88, 128, 96, 80, 104, 72, 88].map((w, i) => (
              <Skeleton key={i} className="h-9 flex-shrink-0 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-4">
        <Skeleton className="h-3 w-20" />
      </div>

      {/* ── Masonry grid — 6 skeleton cards, varied heights mimic the real
             rhythm ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {(['h-72', 'h-64', 'h-80', 'h-68', 'h-76', 'h-60'] as const).map((h, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-5 bg-surface border border-border rounded-2xl overflow-hidden"
            >
              <Skeleton className={`w-full rounded-none ${h}`} />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton circle className="w-6 h-6" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-4/5" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
