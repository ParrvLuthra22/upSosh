import { Skeleton, SkeletonEventListRow } from '@/components/ui/Skeleton';

/**
 * Next.js App Router loading UI for /discover.
 * Shown instantly (no JS required) while the client bundle hydrates.
 * Mirrors the real page's visual structure to eliminate layout shift.
 */
export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-bg-primary" aria-busy="true" aria-label="Loading discover page">
      {/* Hero skeleton */}
      <div className="pt-28 pb-10 px-6 md:px-10">
        <Skeleton className="h-3 w-24 mb-5" />
        <Skeleton className="h-16 w-3/4 max-w-lg mb-4" />
        <Skeleton className="h-10 w-2/5 max-w-xs mb-8" />
        {/* Search bar */}
        <div className="relative max-w-xl">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="sticky top-[4.5rem] z-40 border-b border-border px-6 md:px-10 py-3">
        <div className="flex items-center gap-2 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-shrink-0 rounded-full" style={{ width: `${60 + i * 8}px` }} />
          ))}
        </div>
      </div>

      {/* Content row */}
      <div className="flex">
        {/* Sidebar skeleton (desktop only) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0 border-r border-border px-6 py-8">
          <Skeleton className="h-3 w-16 mb-8" />
          <div className="space-y-8">
            {['Price', 'Date', 'Distance', 'Host type'].map((label) => (
              <div key={label}>
                <Skeleton className="h-3 w-20 mb-4" />
                <Skeleton className="h-1.5 w-full rounded-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Event feed skeleton */}
        <div className="flex-1 min-w-0">
          <div className="px-6 md:px-10 py-4 border-b border-border flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonEventListRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
