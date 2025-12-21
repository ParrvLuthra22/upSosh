'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import { api } from '@/src/lib/api';
import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';

declare global {
    interface Window {
        Razorpay: any;
    }
}

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
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);

    useFocusTrap(contentRef, isOpen);
    useEscapeKey(onClose, isOpen);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.fromTo(contentRef.current, { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' });
        } else {
            gsap.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 });
            gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });
        }
    }, [isOpen]);

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const handleDirectCheckout = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            setErrorMessage('Please login to complete your booking');
            setStatus('error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }
        
        const user = JSON.parse(userData);
        if (!razorpayLoaded) {
            setErrorMessage('Payment system is loading. Please try again.');
            return;
        }
        setStatus('processing');
        setErrorMessage('');
        try {
            console.log('Creating payment order for amount:', total);
            const orderData = await api.createPaymentOrder(total);
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.orderId,
                name: 'UpSosh',
                description: `${cart.length} Event Ticket${cart.length > 1 ? 's' : ''}`,
                image: 'https://www.upsosh.app/logo.png',
                prefill: { name: user.name, email: user.email, contact: user.phone || '' },
                theme: { color: '#6366f1' },
                handler: async (response: any) => {
                    try {
                        const verification = await api.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        if (verification.success) {
                            const bookingData = {
                                userId: user.id,
                                items: cart,
                                totalAmount: total,
                                status: 'confirmed' as const,
                                paymentId: verification.paymentId,
                                customer: { name: user.name, email: user.email, phone: user.phone || '' },
                                createdAt: new Date().toISOString(),
                            };
                            const booking = await api.createBooking(bookingData as any);
                            setBookingDetails(booking);
                            setStatus('success');
                            clearCart();
                        } else throw new Error('Payment verification failed');
                    } catch (error: any) {
                        console.error('Payment error:', error);
                        setStatus('error');
                        setErrorMessage(error.message || 'Payment failed. Contact support.');
                    }
                },
                modal: { ondismiss: () => { setStatus('idle'); setErrorMessage('Payment cancelled.'); } },
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Checkout error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Something went wrong.');
        }
    };

    if (!isOpen && status === 'idle') return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={status === 'processing' ? undefined : onClose} />
            <div ref={contentRef} className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface/50">
                    <h2 className="text-2xl font-heading font-bold text-text-primary">{status === 'success' ? '🎉 Booking Confirmed!' : 'Complete Your Purchase'}</h2>
                    {status !== 'processing' && <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                            <h3 className="text-3xl font-bold text-text-primary">Payment Successful!</h3>
                            <p className="text-text-secondary max-w-md text-lg">Your tickets have been booked. Check your email for confirmation.</p>
                            <div className="bg-surface-highlight rounded-xl p-6 w-full"><p className="text-sm text-text-muted mb-2">Booking Reference</p><p className="text-2xl font-mono font-bold text-primary">{bookingDetails?.id}</p></div>
                            <div className="flex gap-4 w-full"><button onClick={() => window.location.href = '/profile'} className="flex-1 py-3 px-6 rounded-xl bg-surface-highlight text-text-primary font-bold hover:bg-surface-highlight/80">View My Tickets</button><button onClick={onClose} className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold hover:opacity-90">Book More Events</button></div>
                        </div>
                    ) : status === 'processing' ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><h3 className="text-2xl font-bold text-text-primary">Processing Payment...</h3><p className="text-text-secondary">Complete the payment in the Razorpay window</p></div>
                    ) : (
                        <div className="space-y-6">
                            {errorMessage && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{errorMessage}</span></div>}
                            <div className="bg-surface-highlight rounded-xl p-6 space-y-4"><h3 className="text-lg font-bold text-text-primary mb-4">Order Summary</h3><div className="space-y-3">{cart.map((item) => (<div key={item.id} className="flex justify-between items-center"><div><p className="font-medium text-text-primary">{item.title}</p><p className="text-sm text-text-muted">Qty: {item.qty}</p></div><p className="font-bold text-text-primary">₹{(item.price * item.qty).toFixed(2)}</p></div>))}</div><div className="border-t border-border/50 pt-4 mt-4"><div className="flex justify-between items-center text-xl font-bold"><span className="text-text-primary">Total</span><span className="text-primary">₹{total.toFixed(2)}</span></div></div></div>
                            <button onClick={handleDirectCheckout} disabled={!razorpayLoaded} className="w-full py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">{!razorpayLoaded ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Loading Payment System...</>) : (<><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Pay ₹{total.toFixed(2)}</>)}</button>
                            <p className="text-center text-sm text-text-muted">Secure payment powered by Razorpay 🔒</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
