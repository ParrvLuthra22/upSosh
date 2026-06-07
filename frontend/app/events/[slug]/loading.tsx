/**
 * app/events/[slug]/loading.tsx  —  Loading UI for event detail pages.
 * Matches the two-column layout: skeleton hero image + skeleton meta + booking card.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventDetailLoading() {
  return (
    <div
      className="min-h-screen bg-void pb-32 lg:pb-0"
      aria-busy="true"
      aria-label="Loading event"
    >
      {/* ── Back nav ─────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-24 pb-4 max-w-7xl mx-auto">
        <Skeleton className="h-3 w-28" />
      </div>

      {/* ── Hero section ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 pt-6 pb-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[55%_45%] gap-10 lg:gap-14 items-start">

          {/* Left — text skeleton */}
          <div>
            {/* Category + date pills */}
            <div className="flex gap-2 mb-5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>

            {/* Title — two lines */}
            <div className="space-y-3 mb-6">
              <Skeleton className="h-10 md:h-12 w-full" style={{ borderRadius: 10 }} />
              <Skeleton className="h-10 md:h-12 w-4/5" style={{ borderRadius: 10 }} />
            </div>

            {/* Host row */}
            <div className="flex items-center gap-3 mb-8">
              <Skeleton circle className="w-9 h-9" />
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* Meta grid — 4 cells */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-8 border-t border-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-14 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Right — portrait image */}
          <div className="order-first lg:order-last">
            <Skeleton className="w-full aspect-[4/5] rounded-3xl" />
          </div>
        </div>
      </section>

      {/* ── Body + booking card ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_360px] gap-16">

          {/* Left — content blocks */}
          <div className="space-y-16">
            {/* About */}
            <div>
              <Skeleton className="h-3 w-16 mb-5" />
              <Skeleton className="h-7 w-56 mb-5" style={{ borderRadius: 8 }} />
              <div className="space-y-2.5 max-w-prose">
                {[100, 95, 88, 92, 70].map((w, i) => (
                  <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>

            {/* Schedule / timeline */}
            <div>
              <Skeleton className="h-3 w-24 mb-5" />
              <Skeleton className="h-7 w-48 mb-8" style={{ borderRadius: 8 }} />
              <div className="hidden md:grid grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton circle className="w-2 h-2" />
                      <Skeleton className="h-px flex-1" />
                    </div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <div className="space-y-1.5">
                      {[100, 85, 70].map((w, j) => (
                        <Skeleton key={j} className="h-3.5" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host card */}
            <div>
              <Skeleton className="h-3 w-16 mb-5" />
              <div className="flex items-start gap-4 p-5 bg-surface border border-border rounded-2xl">
                <Skeleton circle className="w-14 h-14 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3.5 w-full max-w-xs" />
                  <Skeleton className="h-3.5 w-3/4 max-w-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Right — booking card */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-surface border border-border rounded-3xl p-6 space-y-4">
              {/* Price */}
              <Skeleton className="h-10 w-28" style={{ borderRadius: 8 }} />
              {/* Capacity bar */}
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-3 w-32" />
              {/* CTA */}
              <Skeleton className="h-13 w-full rounded-xl" style={{ height: '3.25rem' }} />
              <Skeleton className="h-3 w-3/4 mx-auto" />
              {/* Meta list */}
              <div className="pt-4 border-t border-border space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton circle className="w-4 h-4" />
                    <Skeleton className="h-3.5 w-36" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
