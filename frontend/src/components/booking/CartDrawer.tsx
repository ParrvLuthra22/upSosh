'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';

const CartDrawer = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateCartQty, toggleCheckout } = useBookingStore();
    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Accessibility hooks
    useFocusTrap(drawerRef, isCartOpen);
    useEscapeKey(() => toggleCart(false), isCartOpen);

    useEffect(() => {
        if (isCartOpen) {
            gsap.to(overlayRef.current, {
                opacity: 1,
                pointerEvents: 'auto',
                duration: 0.3,
            });
            gsap.to(drawerRef.current, {
                x: 0,
                duration: 0.4,
                ease: 'power3.out',
            });
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0,
                pointerEvents: 'none',
                duration: 0.3,
                delay: 0.1,
            });
            gsap.to(drawerRef.current, {
                x: '100%',
                duration: 0.3,
                ease: 'power3.in',
            });
        }
    }, [isCartOpen]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <div
            className="fixed inset-0 z-[60] pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
        >
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0"
                onClick={() => toggleCart(false)}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="absolute top-0 right-0 h-full w-full max-w-md bg-black border-l border-white/10 transform translate-x-full pointer-events-auto flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 id="cart-title" className="text-2xl font-heading font-bold text-white">Your Cart</h2>
                    <button
                        onClick={() => toggleCart(false)}
                        className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                        aria-label="Close cart"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" aria-live="polite">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-white/50">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <button
                                onClick={() => toggleCart(false)}
                                className="mt-4 text-[#D4A017] hover:underline focus:outline-none focus:ring-2 focus:ring-[#D4A017] rounded-md px-2"
                            >
                                Browse Events
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-white/50">{item.date}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-white/10 rounded-md p-0.5">
                                            <button
                                                onClick={() => updateCartQty(item.id, item.qty - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                                                aria-label={`Decrease quantity of ${item.title}`}
                                            >
                                                -
                                            </button>
                                            <span className="text-xs font-medium w-3 text-center text-white" aria-label="Quantity">{item.qty}</span>
                                            <button
                                                onClick={() => updateCartQty(item.id, item.qty + 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                                                aria-label={`Increase quantity of ${item.title}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-white">₹{item.price * item.qty}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-white/50 hover:text-[#D4A017] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A017] rounded-full p-1"
                                                aria-label={`Remove ${item.title} from cart`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-white/10 bg-black">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white/60">Subtotal</span>
                            <span className="text-2xl font-bold text-white">₹{subtotal}</span>
                        </div>
                        <button
                            onClick={() => {
                                toggleCart(false);
                                toggleCheckout(true);
                            }}
                            className="w-full py-4 rounded-xl bg-[#D4A017] text-black font-bold text-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                        >
                            Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
