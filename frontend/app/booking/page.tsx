'use client';

import React, { useEffect, useState } from 'react';
import SearchBar from '@/src/components/booking/SearchBar';
import Filters from '@/src/components/booking/Filters';
import EventGrid from '@/src/components/booking/EventGrid';
import Pagination from '@/src/components/booking/Pagination';
import FormalInformalToggle from '@/src/components/FormalInformalToggle';
import { useBookingStore } from '@/src/store/bookingStore';
import { useAppStore } from '@/src/store/useAppStore';
import { api } from '@/src/lib/api';
import { generateEventSchema } from '@/src/lib/structuredData';

import dynamic from 'next/dynamic';

const EventDetailsModal = dynamic(() => import('@/src/components/booking/EventDetailsModal'), { ssr: false });
const CartDrawer = dynamic(() => import('@/src/components/booking/CartDrawer'), { ssr: false });
const CheckoutModal = dynamic(() => import('@/src/components/booking/CheckoutModal'), { ssr: false });

export default function BookingPage() {
    const { isFormal } = useAppStore();
    const { setEvents, setFilters, filteredEvents, cart, toggleCart, isCheckoutOpen, toggleCheckout } = useBookingStore();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Sync global mode with booking filters
    useEffect(() => {
        setFilters({ type: isFormal ? 'formal' : 'informal' });
    }, [isFormal, setFilters]);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const events = await api.getEvents();
                setEvents(events);
            } catch (error) {
                console.error('Failed to load events:', error);
            }
        };
        loadEvents();
    }, [setEvents]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-black">
            <EventDetailsModal />
            <CartDrawer />
            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => toggleCheckout(false)} />

            {/* Floating Cart Button */}
            <button
                onClick={() => toggleCart(true)}
                className="fixed bottom-8 right-8 z-40 bg-[#D4A017] text-black p-4 rounded-full hover:opacity-90 transition-opacity"
            >
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                            {cart.reduce((acc, item) => acc + item.qty, 0)}
                        </span>
                    )}
                </div>
            </button>

            <div className="container mx-auto">
                <h1 className="text-4xl font-heading font-bold mb-8 text-center text-white" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
                    Find Your Next Experience
                </h1>

                {/* Formal/Informal Toggle */}
                <FormalInformalToggle />

                <SearchBar />

                {/* Structured Data for Events */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(filteredEvents.map(event => generateEventSchema(event)))
                    }}
                />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden w-full py-3 px-4 bg-white/10 rounded-xl font-medium text-white mb-4 border border-white/20"
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        style={{ fontFamily: 'var(--font-roboto-bbh)' }}
                    >
                        {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Filters Sidebar */}
                    <aside
                        className={`lg:w-1/4 ${isMobileFiltersOpen ? 'block' : 'hidden'
                            } lg:block transition-all duration-300`}
                    >
                        <Filters />
                    </aside>

                    {/* Event Grid */}
                    <main className="lg:w-3/4">
                        <EventGrid />
                        <Pagination />
                    </main>
                </div>
            </div>
        </div>
    );
}
