'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import CheckoutForm from './CheckoutForm';
import { processPayment } from '@/src/lib/mockPayment';
import { api } from '@/src/lib/api';
import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const { cart, clearCart } = useBookingStore();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // Accessibility hooks
    useFocusTrap(contentRef, isOpen);
    useEscapeKey(onClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.fromTo(
                contentRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
            );
        } else {
            gsap.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 });
            gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });
        }
    }, [isOpen]);

    const handleCheckout = async (formData: any) => {
        setStatus('processing');
        setErrorMessage('');

        try {
            // 1. Process Payment
            const paymentResult = await processPayment(formData.total, formData.paymentMethod);

            if (!paymentResult.success) {
                throw new Error(paymentResult.error || 'Payment failed');
            }

            // 2. Create Booking
            const bookingData = {
                userId: 'guest_user', // Mock user ID
                items: cart,
                totalAmount: formData.total,
                status: 'confirmed',
                paymentId: paymentResult.transactionId,
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                },
                createdAt: new Date().toISOString(),
            };

            const booking = await api.createBooking(bookingData as any);
            setBookingDetails(booking);

            // 3. Success
            setStatus('success');
            clearCart();
        } catch (error: any) {
            console.error('Checkout error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    if (!isOpen && status === 'idle') return null;

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
        >
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />

            <div
                ref={contentRef}
                className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface/50">
                    <h2 id="checkout-title" className="text-2xl font-heading font-bold text-text-primary">
                        {status === 'success' ? 'Order Confirmed' : 'Checkout'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Close checkout"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-text-primary">Thank you for your purchase!</h3>
                            <p className="text-text-secondary max-w-md">
                                Your booking has been confirmed. A confirmation email has been sent to <strong>{bookingDetails?.customer.email}</strong>.
                            </p>
                            <div className="bg-surface-highlight rounded-xl p-4 w-full max-w-md">
                                <p className="text-sm text-text-muted mb-1">Booking Reference</p>
                                <p className="text-xl font-mono font-bold text-text-primary">{bookingDetails?.id}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="py-3 px-8 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                Continue Exploring
                            </button>
                        </div>
                    ) : (
                        <>
                            {status === 'error' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3" role="alert">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errorMessage}
                                </div>
                            )}
                            <CheckoutForm onSubmit={handleCheckout} isProcessing={status === 'processing'} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
