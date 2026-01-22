'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Event, api } from '@/src/lib/api';

interface EventCardProps {
    event: Event;
    onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
    const [host, setHost] = useState<any>(null);

    useEffect(() => {
        if (event.hostId) {
            api.getHostById(event.hostId).then(setHost).catch(console.error);
        }
    }, [event.hostId]);

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer space-y-4 p-4 rounded-xl transition-all duration-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 hover:shadow-lg hover:-translate-y-1"
        >
            {/* Minimalist Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 shadow-sm">
                <Image
                    src={event.image || '/placeholder-event.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover transition-all duration-700 ease-editorial group-hover:scale-105 filter grayscale-[100%] group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Minimal Status Badge - Top Left */}
                <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-widest bg-background/90 text-foreground backdrop-blur-md border border-border/50 shadow-sm rounded-full">
                        {event.type}
                    </span>
                </div>
            </div>

            {/* Content - Clean Typography */}
            <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-semibold leading-tight text-foreground tracking-tight transition-colors group-hover:text-foreground/80">
                        {event.title}
                    </h3>
                    <span className="shrink-0 text-base font-medium text-foreground">
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                    </span>
                </div>

                <div className="flex flex-col gap-1.5 text-sm text-foreground/60 font-light">
                    <div className="flex items-center gap-2">
                        <span>{event.date}</span>
                        <span className="w-1 h-1 rounded-full bg-foreground/40" />
                        <span>{event.time}</span>
                    </div>

                    <div className="flex items-start gap-1.5 transition-colors group-hover:text-foreground/80">
                        <svg
                            className="w-4 h-4 mt-0.5 shrink-0 opacity-70"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{event.venue}</span>
                    </div>
                </div>

                {/* Micro Host Info */}
                {host && (
                    <div className="pt-3 border-t border-border/50 flex items-center gap-2">
                        <span className="text-xs text-foreground/50 uppercase tracking-widest font-medium">
                            Hosted by {host.name}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
