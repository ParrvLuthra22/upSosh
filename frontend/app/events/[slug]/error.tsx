'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="max-w-md"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream-faint mb-6">
          [ Event · Error ]
        </p>
        <h1 className="font-display text-[32px] text-cream leading-tight mb-4">
          Something went wrong.
        </h1>
        <p className="font-sans text-[15px] text-cream-dim leading-relaxed mb-10">
          We couldn't load this event. It may have been removed or there was a
          network issue.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            onClick={reset}
            whileTap={{ scale: 0.97 }}
            className="h-11 px-8 bg-lime text-void rounded-xl font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors"
          >
            Try again
          </motion.button>
          <Link
            href="/discover"
            className="h-11 px-8 flex items-center justify-center border border-border rounded-xl font-sans text-[14px] text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors"
          >
            Browse events
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
