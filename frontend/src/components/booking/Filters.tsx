'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const Filters = () => {
    const { filters, setFilters, applyFilters } = useBookingStore();

    const handleApply = () => {
        applyFilters();
    };

    return (
        <div className="bg-background border border-border p-6 space-y-8 sticky top-24">
            <h3 className="text-lg font-medium tracking-tight text-foreground">Filter Events</h3>

            {/* Sort Dropdown */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Sort By</label>
                <div className="relative">
                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters({ sort: e.target.value as any })}
                        className="w-full p-3 rounded-none bg-background border border-border text-foreground appearance-none focus:outline-none focus:border-foreground transition-colors cursor-pointer"
                    >
                        <option value="date">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/50">Event Type</label>
                <div className="flex flex-col gap-2">
                    {['all', 'formal', 'informal'].map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${filters.type === type ? 'border-foreground bg-foreground' : 'border-border group-hover:border-foreground'
                                }`}>
                                {filters.type === type && (
                                    <div className="w-2 h-2 bg-background" />
                                )}
                            </div>
                            <input
                                type="radio"
                                name="type"
                                checked={filters.type === type}
                                onChange={() => setFilters({ type: type as any })}
                                className="hidden"
                            />
                            <span className="capitalize text-foreground/80 group-hover:text-foreground transition-colors">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Superhost Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <label className="text-sm font-medium text-foreground">Superhost Only</label>
                <button
                    onClick={() => setFilters({ isSuperhost: !filters.isSuperhost })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${filters.isSuperhost ? 'bg-foreground' : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                    role="switch"
                    aria-checked={filters.isSuperhost}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${filters.isSuperhost ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApply}
                className="w-full py-3 px-4 bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
                Apply Filters
            </button>
        </div>
    );
};

export default Filters;
