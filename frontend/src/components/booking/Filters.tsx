'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const Filters = () => {
    const { filters, setFilters, applyFilters } = useBookingStore();

    const handleApply = () => {
        applyFilters();
    };

    return (
        <div className="glass-panel p-6 rounded-2xl space-y-8">
            <h3 className="text-xl font-heading font-bold text-text-primary">Filters</h3>

            {/* Sort Dropdown */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-text-secondary">Sort By</label>
                <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ sort: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-surface-highlight border-none text-text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                >
                    <option value="date">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-text-secondary">Event Type</label>
                <div className="flex flex-col gap-2">
                    {['all', 'formal', 'informal'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                checked={filters.type === type}
                                onChange={() => setFilters({ type: type as any })}
                                className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-offset-0 bg-surface-highlight"
                            />
                            <span className="capitalize text-text-secondary">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Superhost Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-secondary">Superhost Only</label>
                <button
                    onClick={() => setFilters({ isSuperhost: !filters.isSuperhost })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${filters.isSuperhost ? 'bg-primary' : 'bg-surface-highlight'
                        }`}
                    role="switch"
                    aria-checked={filters.isSuperhost}
                    aria-label="Toggle Superhost only"
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.isSuperhost ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApply}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
                Apply Filters
            </button>
        </div>
    );
};

export default Filters;
