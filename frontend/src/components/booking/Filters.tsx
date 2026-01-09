'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const Filters = () => {
    const { filters, setFilters, applyFilters } = useBookingStore();

    const handleApply = () => {
        applyFilters();
    };

    return (
        <div className="bg-black border border-white/10 p-6 rounded-2xl space-y-8">
            <h3 className="text-xl font-heading font-bold text-white">Filters</h3>

            {/* Sort Dropdown */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/60">Sort By</label>
                <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ sort: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white focus:ring-2 focus:ring-[#D4A017] cursor-pointer"
                >
                    <option value="date">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                </select>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/60">Event Type</label>
                <div className="flex flex-col gap-2">
                    {['all', 'formal', 'informal'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                checked={filters.type === type}
                                onChange={() => setFilters({ type: type as any })}
                                className="w-4 h-4 text-[#D4A017] border-white/20 focus:ring-[#D4A017] focus:ring-offset-0 bg-white/10"
                            />
                            <span className="capitalize text-white/60">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Superhost Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/60">Superhost Only</label>
                <button
                    onClick={() => setFilters({ isSuperhost: !filters.isSuperhost })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A017] ${filters.isSuperhost ? 'bg-[#D4A017]' : 'bg-white/10'
                        }`}
                    role="switch"
                    aria-checked={filters.isSuperhost}
                    aria-label="Toggle Superhost only"
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${filters.isSuperhost ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
            </div>

            {/* Apply Button */}
            <button
                onClick={handleApply}
                className="w-full py-3 px-4 bg-[#D4A017] text-black font-medium rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
            >
                Apply Filters
            </button>
        </div>
    );
};

export default Filters;
