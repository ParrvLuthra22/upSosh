'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { Event, api } from '@/src/lib/api';
import { useState } from 'react';

interface EventCardProps {
    event: Event;
    onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [host, setHost] = useState<any>(null);

    useEffect(() => {
        api.getHostById(event.hostId).then(setHost).catch(console.error);
    }, [event.hostId]);

    const handleMouseEnter = () => {
        gsap.to(cardRef.current, {
            y: -8,
            scale: 1.02,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    const handleMouseLeave = () => {
        gsap.to(cardRef.current, {
            y: 0,
            scale: 1,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            duration: 0.3,
            ease: 'power2.out',
        });
    };

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative bg-black border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-white/20"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 z-20 bg-black/90 px-3 py-1 rounded-full text-sm font-bold text-white border border-white/10" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
                    {event.price === 0 ? 'Free' : `₹${event.price}`}
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${event.type === 'formal'
                            ? 'bg-[#D4A017] text-black'
                            : 'bg-white/20 text-white'
                            }`}
                        style={{ fontFamily: 'var(--font-roboto-bbh)' }}
                    >
                        {event.type}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-heading font-bold text-white line-clamp-1 group-hover:text-[#D4A017] transition-colors" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
                            {event.title}
                        </h3>
                    </div>
                    <div className="flex items-center text-sm text-white/50 gap-2 font-body" style={{ fontFamily: 'var(--font-lora)' }}>
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/60 font-body" style={{ fontFamily: 'var(--font-lora)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{event.venue}</span>
                </div>

                {/* Host Info */}
                {host && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <img src={host.avatar} alt={host.name} className="w-6 h-6 rounded-full" />
                            <span className="text-xs font-medium text-white/60 line-clamp-1 font-body" style={{ fontFamily: 'var(--font-lora)' }}>
                                {host.name}
                            </span>
                            {host.verified && (
                                <svg className="w-3 h-3 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        {event.isSuperhost && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4A017]/10 border border-[#D4A017]/20">
                                <span className="text-[10px] font-bold text-[#D4A017] uppercase" style={{ fontFamily: 'var(--font-jersey)' }}>Superhost</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
