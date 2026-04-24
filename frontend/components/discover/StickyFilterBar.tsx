'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { CATEGORIES } from '@/lib/mockEvents';
import type { FilterState } from '@/app/discover/page';

interface StickyFilterBarProps {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  view: 'list' | 'grid';
  setView: (v: 'list' | 'grid') => void;
  onShowMobileFilters: () => void;
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export default function StickyFilterBar({
  filters,
  updateFilter,
  view,
  setView,
  onShowMobileFilters,
}: StickyFilterBarProps) {
  const [scrolled, setScrolled] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className={`sticky top-[4.5rem] z-40 bg-bg-primary/90 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? 'border-b border-border' : ''
      }`}
    >
      <div className="px-6 md:px-10 py-3 flex items-center gap-3" role="toolbar" aria-label="Event filters">
        {/* Scrollable category pills */}
        <LayoutGroup>
          <div className="flex items-center gap-2 overflow-x-auto flex-1 scrollbar-hide pb-0.5" role="group" aria-label="Category">
            {CATEGORIES.map((cat) => {
              const active = filters.category === cat.value;
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => updateFilter('category', cat.value)}
                  aria-pressed={active}
                  className={`relative flex-shrink-0 font-sans text-xs font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
                    active
                      ? 'text-white'
                      : 'text-ink-muted border border-border hover:border-ink-primary hover:text-ink-primary'
                  }`}
                  whileTap={{ scale: 0.96 }}
                >
                  {active && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute inset-0 bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-border flex-shrink-0" aria-hidden="true" />

        {/* Tonight toggle */}
        <button
          onClick={() => updateFilter('tonight', !filters.tonight)}
          aria-pressed={filters.tonight}
          className={`hidden md:flex flex-shrink-0 items-center gap-1.5 font-sans text-xs font-medium px-4 py-2 rounded-full border transition-colors duration-200 ${
            filters.tonight
              ? 'bg-ink-primary text-bg-primary border-ink-primary'
              : 'border-border text-ink-muted hover:border-ink-primary hover:text-ink-primary'
          }`}
        >
          <span>Tonight</span>
        </button>

        {/* Near me toggle */}
        <button
          onClick={() => updateFilter('nearMe', !filters.nearMe)}
          aria-pressed={filters.nearMe}
          className={`hidden md:flex flex-shrink-0 items-center gap-1.5 font-sans text-xs font-medium px-4 py-2 rounded-full border transition-colors duration-200 ${
            filters.nearMe
              ? 'bg-ink-primary text-bg-primary border-ink-primary'
              : 'border-border text-ink-muted hover:border-ink-primary hover:text-ink-primary'
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Near me</span>
        </button>

        {/* View toggle */}
        <div
          className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1 flex-shrink-0"
          role="group"
          aria-label="View mode"
        >
          <button
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="List view"
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-ink-primary text-bg-primary' : 'text-ink-muted hover:text-ink-primary'}`}
          >
            <ListIcon />
          </button>
          <button
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            aria-label="Grid view"
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-ink-primary text-bg-primary' : 'text-ink-muted hover:text-ink-primary'}`}
          >
            <GridIcon />
          </button>
        </div>

        {/* Mobile: Filters button */}
        <button
          onClick={onShowMobileFilters}
          aria-label="Open filters"
          className="md:hidden flex-shrink-0 flex items-center gap-1.5 font-sans text-xs font-medium px-4 py-2 rounded-full border border-border text-ink-muted"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
}
