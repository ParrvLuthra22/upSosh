'use client';

import React from 'react';
import { useBookingStore } from '@/src/store/bookingStore';

const Pagination = () => {
    const { pagination, setPage } = useBookingStore();
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-4 mt-16 pb-12">
            <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-3 border border-border text-foreground rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors font-medium"
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
                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors font-medium ${currentPage === page
                                ? 'bg-foreground text-background'
                                : 'text-foreground hover:bg-foreground/5'
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
                className="px-6 py-3 border border-border text-foreground rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-foreground/5 transition-colors font-medium"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
