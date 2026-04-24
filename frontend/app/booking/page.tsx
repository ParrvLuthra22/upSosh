'use client';

import React, { useEffect, useState } from 'react';
import SearchBar from '@/src/components/booking/SearchBar';
import Filters from '@/src/components/booking/Filters';
import EventGrid from '@/src/components/booking/EventGrid';
import HorizontalEventSlider from '@/src/components/booking/HorizontalEventSlider';
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

    
    const recommendedEvents = filteredEvents.slice(0, 5);
    const weekendEvents = filteredEvents.filter(e => e.date.toLowerCase().includes('sat') || e.date.toLowerCase().includes('sun')).slice(0, 5);
    
    const popularEvents = weekendEvents.length > 0 ? weekendEvents : filteredEvents.slice(5, 10);

    
    const allEvents = filteredEvents; 

    return (
        <div className="min-h-screen pt-20 pb-12 bg-white">
            <EventDetailsModal />
            <CartDrawer />
            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => toggleCheckout(false)} />

            
            <button
                onClick={() => toggleCart(true)}
                className="fixed bottom-8 right-8 z-40 bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-900 transition-colors"
                aria-label="Open cart"
            >
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cart.reduce((acc, item) => acc + item.qty, 0)}
                        </span>
                    )}
                </div>
            </button>

            <div className="container mx-auto max-w-7xl px-4 md:px-8">
                
                <div className="py-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
                        {isFormal ? 'Professional Networking' : 'Social Gatherings'}
                    </h1>
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
                        <div className="w-full md:w-2/3">
                            <SearchBar />
                        </div>
                        <div className="w-full md:w-auto">
                            <FormalInformalToggle />
                        </div>
                    </div>
                </div>

                
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(filteredEvents.map(event => generateEventSchema(event)))
                    }}
                />

                <div className="space-y-4">
                    
                    <HorizontalEventSlider
                        title="Recommended for You"
                        events={recommendedEvents}
                    />

                    
                    <HorizontalEventSlider
                        title={weekendEvents.length > 0 ? "This Weekend" : "Trending Now"}
                        events={popularEvents}
                    />

                    
                    <section className="py-8 border-t border-gray-100 mt-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            <aside className="lg:w-1/4">
                                <h3 className="text-xl font-bold mb-6 text-gray-900">Filters</h3>
                                <Filters />
                            </aside>

                            
                            <main className="lg:w-3/4">
                                <h3 className="text-2xl font-bold mb-6 text-gray-900">All Events</h3>
                                <EventGrid />
                                <div className="mt-8">
                                    <Pagination />
                                </div>
                            </main>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
