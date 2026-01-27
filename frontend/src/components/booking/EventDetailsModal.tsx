'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import { api } from '@/src/lib/api';
import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';

const EventDetailsModal = () => {
    const { selectedEvent, setSelectedEvent, addToCart, toggleCheckout } = useBookingStore();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [qty, setQty] = useState(1);
    const [host, setHost] = useState<any>(null);

    
    useFocusTrap(contentRef, !!selectedEvent);
    useEscapeKey(() => handleClose(), !!selectedEvent);

    useEffect(() => {
        if (selectedEvent) {
            setQty(1);
            setHost(null);
            api.getHostById(selectedEvent.hostId).then(setHost).catch(console.error);

            
            gsap.timeline()
                .to(modalRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' })
                .fromTo(contentRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
                    '-=0.1'
                );
        }
    }, [selectedEvent]);

    if (!selectedEvent) return null;

    const handleClose = () => {
        gsap.to(contentRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
        gsap.to(modalRef.current, {
            opacity: 0,
            duration: 0.2,
            delay: 0.1,
            onComplete: () => setSelectedEvent(null)
        });
    };

    const handleAddToCart = () => {
        addToCart(selectedEvent, qty);
        handleClose();
    };

    const handleBuyNow = () => {
        const buyNowItem = { event: selectedEvent, qty, price: selectedEvent.price };
        sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
        handleClose();
        setTimeout(() => toggleCheckout(true), 300);
    };

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 opacity-0 pointer-events-none"
            role="dialog"
            aria-modal="true"
        >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

            <div
                ref={contentRef}
                className="relative w-full max-w-4xl bg-background border border-border overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[800px]"
            >
                
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 p-2 text-foreground/50 hover:text-foreground transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                
                <div className="md:w-1/2 h-64 md:h-auto relative bg-neutral-100 dark:bg-neutral-900">
                    <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-out"
                    />
                </div>

                
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                    <div className="flex-1 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider border border-foreground/20 px-2 py-1">
                                    {selectedEvent.type}
                                </span>
                                {selectedEvent.isSuperhost && (
                                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">
                                        Superhost
                                    </span>
                                )}
                            </div>

                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4 leading-[1.1]">
                                {selectedEvent.title}
                            </h2>

                            <div className="space-y-2 text-foreground/70 text-lg">
                                <div className="flex items-center gap-2">
                                    <span>{selectedEvent.date}</span>
                                    <span className="w-1 h-1 bg-foreground/50 rounded-full" />
                                    <span>{selectedEvent.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{selectedEvent.venue}</span>
                                </div>
                            </div>
                        </div>

                        
                        {host && (
                            <div className="flex items-center gap-4 py-4 border-y border-border">
                                <img src={host.avatar} alt={host.name} className="w-12 h-12 rounded-full grayscale" />
                                <div>
                                    <p className="font-medium text-foreground">Hosted by {host.name}</p>
                                    <p className="text-sm text-foreground/50">{host.rating} ★ ({host.reviews} reviews)</p>
                                </div>
                            </div>
                        )}

                        <div className="prose prose-neutral dark:prose-invert">
                            <p className="text-foreground/80 leading-relaxed text-lg font-light">
                                {selectedEvent.description}
                            </p>
                        </div>
                    </div>

                    
                    <div className="mt-8 pt-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-medium text-foreground">
                                ₹{selectedEvent.price * qty}
                                <span className="text-base text-foreground/40 ml-2 font-normal">
                                    {qty > 1 && `(₹${selectedEvent.price} × ${qty})`}
                                </span>
                            </div>

                            <div className="flex items-center border border-border rounded-full">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors rounded-l-full"
                                >-</button>
                                <span className="w-8 text-center font-medium">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-foreground/5 transition-colors rounded-r-full"
                                >+</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="py-4 px-6 border border-foreground text-foreground font-medium text-lg hover:bg-foreground hover:text-background transition-colors"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="py-4 px-6 bg-foreground text-background font-medium text-lg hover:opacity-90 transition-opacity"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
