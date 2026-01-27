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
            className="group cursor-pointer flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-300"
        >
            
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                <Image
                    src={event.image || '/placeholder-event.jpg'}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                
                <div className="absolute top-3 left-3">
                    <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-black backdrop-blur-sm rounded-sm shadow-sm">
                        {event.type}
                    </span>
                </div>
            </div>

            
            <div className="p-4 flex flex-col grow space-y-3">
                <h3 className="text-lg font-semibold leading-tight text-gray-900 group-hover:text-black line-clamp-2">
                    {event.title}
                </h3>

                <div className="space-y-1 text-sm text-gray-500">
                    <p className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-700">{event.date}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span>{event.time}</span>
                    </p>
                    <p className="line-clamp-1">{event.venue}</p>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                    <span className="text-base font-semibold text-gray-900">
                        {event.price === 0 ? 'Free' : `₹${event.price}`}
                    </span>
                    {host && (
                        <span className="text-xs text-gray-500 truncate max-w-[50%]">
                            by {host.name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventCard;
