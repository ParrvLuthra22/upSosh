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

    
    useFocusTrap(drawerRef, isCartOpen);
    useEscapeKey(() => toggleCart(false), isCartOpen);

    useEffect(() => {
        if (isCartOpen) {
            gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
        } else {
            gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });
            gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
        }
    }, [isCartOpen]);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none" role="dialog" aria-modal="true">
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0"
                onClick={() => toggleCart(false)}
            />

            <div
                ref={drawerRef}
                className="absolute top-0 right-0 h-full w-full max-w-md bg-background border-l border-border transform translate-x-full pointer-events-auto flex flex-col shadow-2xl"
            >
                
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">Your Cart</h2>
                    <button
                        onClick={() => toggleCart(false)}
                        className="p-2 text-foreground/50 hover:text-foreground transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-foreground/50">
                            <p className="text-lg font-medium mb-4">Your cart is empty</p>
                            <button
                                onClick={() => toggleCart(false)}
                                className="text-foreground underline underline-offset-4 hover:opacity-70"
                            >
                                Browse Events
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-20 relative bg-neutral-100 dark:bg-neutral-900 flex-shrink-0">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover grayscale"
                                        sizes="80px"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-medium text-foreground line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-foreground/50">{item.date}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-border rounded-full h-8">
                                            <button
                                                onClick={() => updateCartQty(item.id, item.qty - 1)}
                                                className="w-8 h-full flex items-center justify-center text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-l-full"
                                            >-</button>
                                            <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                                            <button
                                                onClick={() => updateCartQty(item.id, item.qty + 1)}
                                                className="w-8 h-full flex items-center justify-center text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-r-full"
                                            >+</button>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-foreground">₹{item.price * item.qty}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-foreground/40 hover:text-red-500 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                
                {cart.length > 0 && (
                    <div className="p-6 border-t border-border bg-background">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-foreground/60">Subtotal</span>
                            <span className="text-2xl font-medium text-foreground">₹{subtotal}</span>
                        </div>
                        <button
                            onClick={() => {
                                toggleCart(false);
                                toggleCheckout(true);
                            }}
                            className="w-full py-4 bg-foreground text-background font-medium text-lg hover:opacity-90 transition-opacity"
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
