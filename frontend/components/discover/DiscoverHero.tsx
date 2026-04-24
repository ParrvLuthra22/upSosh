'use client';

import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

interface DiscoverHeroProps {
  searchQuery: string;
  onSearch: (q: string) => void;
}

export default function DiscoverHero({ searchQuery, onSearch }: DiscoverHeroProps) {
  return (
    <div className="pt-28 pb-10 px-6 md:px-10 bg-bg-primary">
      <motion.p
        className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_VERCEL }}
      >
        [ DISCOVER ]
      </motion.p>

      <motion.h1
        className="font-display text-[clamp(2.5rem,6vw,5rem)] text-ink-primary leading-[1.0] tracking-[-0.03em] mb-8 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.1 }}
      >
        Events worth showing up to.
      </motion.h1>

      {/* Search bar */}
      <motion.div
        className="relative max-w-xl"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_VERCEL, delay: 0.2 }}
      >
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search events, hosts, venues…"
          className="w-full bg-bg-secondary border border-border rounded-full px-5 py-3.5 pl-11 font-sans text-sm text-ink-primary placeholder:text-ink-light focus:outline-none focus:border-ink-primary focus:bg-bg-primary transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    </div>
  );
}
