'use client';

import React, { useRef } from 'react';
import { Event } from '@/src/lib/api';
import EventCard from './EventCard';
import { useBookingStore } from '@/src/store/bookingStore';

interface HorizontalEventSliderProps {
    title: string;
    events: Event[];
}

const HorizontalEventSlider: React.FC<HorizontalEventSliderProps> = ({ title, events }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { setSelectedEvent } = useBookingStore();

    if (events.length === 0) return null;

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6 px-4 md:px-0">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
                <button className="text-sm font-medium text-red-600 hover:text-red-700">See All ›</button>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 px-4 md:px-0 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 md:mx-0"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {events.map((event) => (
                    <div key={event.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                        <EventCard
                            event={event}
                            onClick={() => setSelectedEvent(event)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HorizontalEventSlider;
