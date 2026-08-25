/**
 * app/not-found.tsx  —  Global 404 page.
 * Server component — no 'use client' needed.
 */
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
      {/* Giant 404 */}
      <p
        className="font-display text-lime select-none leading-none"
        style={{ fontSize: 'clamp(72px, 16vw, 120px)', letterSpacing: '-0.04em' }}
        aria-hidden="true"
      >
        404
      </p>

      {/* Headline */}
      <h1 className="font-display text-[28px] md:text-[36px] text-cream mt-4 mb-3 leading-tight">
        This page left the building.
      </h1>

      {/* Subhead */}
      <p className="font-sans text-[15px] text-cream-dim max-w-sm mb-10 leading-relaxed">
        The event may have ended, the link may have changed, or it never existed.
        Either way, there's plenty happening elsewhere.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/discover"
          className="h-11 px-8 bg-lime text-void rounded-xl font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors inline-flex items-center justify-center"
        >
          Find events
        </Link>
        <Link
          href="/"
          className="h-11 px-8 border border-border rounded-xl font-sans text-[14px] text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors inline-flex items-center justify-center"
        >
          Go home
        </Link>
      </div>

      {/* Decorative mono label */}
      <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.25em] text-cream-dim">
        UpSosh · Where plans become moments.
      </p>
    </div>
  );
}
