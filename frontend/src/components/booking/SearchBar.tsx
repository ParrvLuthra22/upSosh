'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const SearchBar = () => {
    const { searchQuery, setSearch } = useBookingStore();

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg
                    className="w-5 h-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, hosts, or tags..."
                className="w-full py-4 pl-12 pr-4 text-white bg-black border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017] transition-all placeholder:text-white/40"
                aria-label="Search events"
            />
        </div>
    );
};

export default SearchBar;
