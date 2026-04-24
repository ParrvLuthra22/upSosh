'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import type { FilterState } from '@/app/discover/page';

interface SidebarProps {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DATE_OPTIONS = [
  { label: 'Any time', value: 'any' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This weekend', value: 'weekend' },
] as const;

function SidebarContent({ filters, updateFilter }: Pick<SidebarProps, 'filters' | 'updateFilter'>) {
  return (
    <div className="space-y-8">
      {/* Price */}
      <div>
        <p id="filter-price-label" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">Price</p>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', Number(e.target.value))}
            aria-labelledby="filter-price-label"
            aria-valuetext={filters.priceMax === 5000 ? '₹5,000 or more' : `up to ₹${filters.priceMax.toLocaleString()}`}
            className="w-full accent-accent h-0.5 bg-border rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between font-mono text-xs text-ink-muted" aria-hidden="true">
            <span>Free</span>
            <span className="text-ink-primary font-medium">
              {filters.priceMax === 5000 ? '₹5,000+' : `₹${filters.priceMax.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Date — native radio inputs, visually replaced */}
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">Date</legend>
        <div className="space-y-2">
          {DATE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              {/* Visually hidden native radio — keyboard + screen-reader accessible */}
              <input
                type="radio"
                name="dateFilter"
                value={opt.value}
                checked={filters.dateFilter === opt.value}
                onChange={() => updateFilter('dateFilter', opt.value as FilterState['dateFilter'])}
                className="sr-only"
              />
              {/* Custom visual indicator */}
              <div
                aria-hidden="true"
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  filters.dateFilter === opt.value
                    ? 'border-accent bg-accent'
                    : 'border-border group-hover:border-ink-muted group-focus-within:border-accent'
                }`}
              >
                {filters.dateFilter === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`font-sans text-sm transition-colors ${
                  filters.dateFilter === opt.value ? 'text-ink-primary' : 'text-ink-muted'
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Distance */}
      <div>
        <p id="filter-distance-label" className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">Distance</p>
        <div className="space-y-3">
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={filters.distance}
            onChange={(e) => updateFilter('distance', Number(e.target.value))}
            aria-labelledby="filter-distance-label"
            aria-valuetext={`${filters.distance} kilometres`}
            className="w-full accent-accent h-0.5 bg-border rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between font-mono text-xs text-ink-muted" aria-hidden="true">
            <span>1 km</span>
            <span className="text-ink-primary font-medium">{filters.distance} km</span>
          </div>
        </div>
      </div>

      {/* Host type — native checkboxes */}
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-4">Host type</legend>
        <div className="space-y-3">
          {[
            { key: 'verified' as const, label: 'Verified hosts' },
            { key: 'superhost' as const, label: 'Superhost' },
            { key: 'newHosts' as const, label: 'New hosts' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => updateFilter(key, !filters[key])}
                className="sr-only"
              />
              <div
                aria-hidden="true"
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  filters[key]
                    ? 'border-accent bg-accent'
                    : 'border-border group-hover:border-ink-muted group-focus-within:border-accent'
                }`}
              >
                {filters[key] && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={`font-sans text-sm transition-colors ${filters[key] ? 'text-ink-primary' : 'text-ink-muted'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        onClick={() => {
          updateFilter('priceMax', 5000);
          updateFilter('dateFilter', 'any');
          updateFilter('distance', 20);
          updateFilter('verified', false);
          updateFilter('superhost', false);
          updateFilter('newHosts', false);
        }}
        className="font-sans text-xs text-ink-muted hover:text-ink-primary transition-colors underline underline-offset-2"
      >
        Clear all filters
      </button>
    </div>
  );
}

export default function Sidebar({ filters, updateFilter, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0 border-r border-border" aria-label="Event filters">
        <div className="sticky top-[8.5rem] px-6 py-8 h-[calc(100vh-8.5rem)] overflow-y-auto scrollbar-hide">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-8" aria-hidden="true">Filter</p>
          <SidebarContent filters={filters} updateFilter={updateFilter} />
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Event filters"
              className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary rounded-t-3xl border-t border-border p-6 lg:hidden max-h-[80vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-sans text-base font-medium text-ink-primary">Filters</p>
                <button onClick={onClose} className="text-ink-muted hover:text-ink-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarContent filters={filters} updateFilter={updateFilter} />
              <button
                onClick={onClose}
                className="w-full mt-8 bg-ink-primary text-bg-primary font-sans text-sm font-medium py-3.5 rounded-full"
              >
                Show results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
