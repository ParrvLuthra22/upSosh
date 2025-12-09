'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const Pagination = () => {
    const { pagination, setPage } = useBookingStore();
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-4 mt-12">
            <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-surface-highlight text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-highlight/80 transition-colors"
            >
                Previous
            </button>

            <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                        <button
                            key={page}
                            onClick={() => setPage(page)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${currentPage === page
                                    ? 'bg-primary text-white font-bold'
                                    : 'bg-surface-highlight text-text-secondary hover:bg-surface-highlight/80'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-surface-highlight text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-highlight/80 transition-colors"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
