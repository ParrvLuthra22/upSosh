'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import EventCard from './EventCard';

const EventGrid = () => {
    const { filteredEvents, setSelectedEvent } = useBookingStore();
    const gridRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading for effect (since mock API is instant)
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && gridRef.current) {
            gsap.fromTo(
                gridRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, [filteredEvents, isLoading]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-surface/30 rounded-2xl h-[400px] animate-pulse" />
                ))}
            </div>
        );
    }

    if (filteredEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">No events found</h3>
                <p className="text-text-muted">Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                />
            ))}
        </div>
    );
};

export default EventGrid;
