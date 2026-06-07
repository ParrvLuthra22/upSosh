/**
 * app/loading.tsx  —  Root-level loading UI (shown for the "/" home route).
 * Server component — no 'use client' needed; shimmer is CSS-only.
 */
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div
      className="min-h-screen bg-void"
      aria-busy="true"
      aria-label="Loading UpSosh"
    >
      {/* ── Navbar placeholder ─────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-void/80 px-6 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <div className="hidden md:flex items-center gap-6">
          {[80, 64, 72, 56].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        {/* Eyebrow label */}
        <Skeleton className="h-3 w-36 mb-8 rounded-full" />

        {/* Display headline — three staggered lines */}
        <div className="space-y-4 mb-8">
          <Skeleton className="h-16 md:h-20 w-full max-w-3xl" style={{ borderRadius: 12 }} />
          <Skeleton className="h-16 md:h-20 w-5/6 max-w-2xl" style={{ borderRadius: 12 }} />
          <Skeleton className="h-16 md:h-20 w-3/5 max-w-xl" style={{ borderRadius: 12 }} />
        </div>

        {/* Subhead */}
        <div className="space-y-2 mb-12 max-w-lg">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-36 rounded-xl" />
        </div>
      </section>

      {/* ── Marquee band ───────────────────────────────────────────────────── */}
      <div className="py-5 border-y border-border flex gap-8 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-shrink-0 rounded-full" style={{ width: 80 + i * 12 }} />
        ))}
      </div>

      {/* ── Featured events ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        {/* Section label */}
        <Skeleton className="h-3 w-28 mb-4" />
        <div className="flex items-end justify-between mb-8">
          <Skeleton className="h-9 w-48 md:w-64" style={{ borderRadius: 10 }} />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Card grid — 3 cols on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-2xl overflow-hidden"
            >
              {/* Image */}
              <Skeleton className="w-full h-48 rounded-none" />
              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton circle className="w-6 h-6" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto">
        <Skeleton className="h-3 w-24 mb-4 mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto mb-14" style={{ borderRadius: 10 }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton circle className="w-10 h-10 mb-4" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
