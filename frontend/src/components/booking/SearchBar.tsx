'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const SearchBar = () => {
    const { searchQuery, setSearch } = useBookingStore();

    return (
        <div className="relative w-full max-w-xl mx-auto mb-16">
            <div className="absolute inset-y-0 left-0 flex items-center pl-0 pointer-events-none">
                <svg
                    className="w-5 h-5 text-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, hosts..."
                className="w-full py-4 pl-8 pr-4 text-xl font-light text-foreground bg-transparent border-b border-border focus:border-foreground focus:outline-none transition-all placeholder:text-foreground/30"
                aria-label="Search events"
            />
        </div>
    );
};

export default SearchBar;
