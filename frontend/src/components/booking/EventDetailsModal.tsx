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

    // Accessibility hooks
    useFocusTrap(contentRef, !!selectedEvent);
    useEscapeKey(() => handleClose(), !!selectedEvent);

    useEffect(() => {
        if (selectedEvent) {
            // Reset state
            setQty(1);
            setHost(null);

            // Fetch host
            api.getHostById(selectedEvent.hostId).then(setHost).catch(console.error);

            // Animate in
            const tl = gsap.timeline();
            tl.to(modalRef.current, {
                opacity: 1,
                duration: 0.3,
                pointerEvents: 'auto',
            }).fromTo(
                contentRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' },
                '-=0.2'
            );
        }
    }, [selectedEvent]);

    if (!selectedEvent) return null;

    const handleClose = () => {
        gsap.to(contentRef.current, {
            y: 50,
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in',
        });
        gsap.to(modalRef.current, {
            opacity: 0,
            duration: 0.3,
            delay: 0.1,
            onComplete: () => setSelectedEvent(null),
        });
    };

    const handleAddToCart = () => {
        addToCart(selectedEvent, qty);
        handleClose();
    };

    const handleBuyNow = () => {
        // Don't add to cart here, just open checkout with current quantity
        // The checkout modal will use the qty from the modal state
        addToCart(selectedEvent, qty);
        handleClose();
        setTimeout(() => toggleCheckout(true), 300); // Wait for modal close animation
    };

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={contentRef}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row"
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close modal"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Section */}
                <div className="md:w-1/2 h-64 md:h-auto relative">
                    <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 p-8 flex flex-col">
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedEvent.type === 'formal'
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-secondary/10 text-secondary'
                                        }`}
                                >
                                    {selectedEvent.type}
                                </span>
                                {selectedEvent.isSuperhost && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-500 text-xs font-bold uppercase border border-yellow-400/20">
                                        Superhost
                                    </span>
                                )}
                            </div>
                            <h2 id="modal-title" className="text-3xl font-heading font-bold text-text-primary mb-2">
                                {selectedEvent.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-text-muted">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {selectedEvent.date} • {selectedEvent.time}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {selectedEvent.venue}
                                </span>
                            </div>
                        </div>

                        {/* Host Info */}
                        {host && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-highlight/50">
                                <img src={host.avatar} alt={host.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="text-sm font-medium text-text-primary flex items-center gap-1">
                                        Hosted by {host.name}
                                        {host.verified && (
                                            <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified Host">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </p>
                                    <p className="text-xs text-text-muted">{host.rating} ★ ({host.reviews} reviews)</p>
                                </div>
                            </div>
                        )}

                        <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                            <p>{selectedEvent.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {selectedEvent.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 rounded-md bg-surface-highlight text-xs text-text-muted">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-text-primary">
                                ₹{selectedEvent.price * qty}
                                {qty > 1 && <span className="text-sm font-normal text-text-muted ml-2">(₹{selectedEvent.price} x {qty})</span>}
                            </div>

                            {/* Quantity Selector */}
                            <div className="flex items-center gap-3 bg-surface-highlight rounded-lg p-1">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label="Decrease quantity"
                                >
                                    -
                                </button>
                                <span className="font-medium w-4 text-center" aria-label="Current quantity">{qty}</span>
                                <button
                                    onClick={() => setQty(qty + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="py-3 px-4 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="py-3 px-4 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsModal;
