'use client';'use client';



import React, { useEffect, useRef, useState } from 'react';import React, { useEffect, useRef, useState } from 'react';

import gsap from 'gsap';import gsap from 'gsap';

import { useBookingStore } from '@/src/store/bookingStore';import { useBookingStore } from '@/src/store/bookingStore';

import { api } from '@/src/lib/api';import { api } from '@/src/lib/api';

import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';



// Declare Razorpay type// Declare Razorpay type

declare global {declare global {

    interface Window {    interface Window {

        Razorpay: any;        Razorpay: any;

    }    }

}}



interface CheckoutModalProps {interface CheckoutModalProps {

    isOpen: boolean;    isOpen: boolean;

    onClose: () => void;    onClose: () => void;

}}



const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {

    const { cart, clearCart } = useBookingStore();    const { cart, clearCart } = useBookingStore();

    const modalRef = useRef<HTMLDivElement>(null);    const modalRef = useRef<HTMLDivElement>(null);

    const contentRef = useRef<HTMLDivElement>(null);    const contentRef = useRef<HTMLDivElement>(null);



    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    const [errorMessage, setErrorMessage] = useState('');    const [errorMessage, setErrorMessage] = useState('');

    const [bookingDetails, setBookingDetails] = useState<any>(null);    const [bookingDetails, setBookingDetails] = useState<any>(null);

    const [razorpayLoaded, setRazorpayLoaded] = useState(false);    const [razorpayLoaded, setRazorpayLoaded] = useState(false);



    // Accessibility hooks    // Accessibility hooks

    useFocusTrap(contentRef, isOpen);    useFocusTrap(contentRef, isOpen);

    useEscapeKey(onClose, isOpen);    useEscapeKey(onClose, isOpen);



    // Load Razorpay script    // Load Razorpay script

    useEffect(() => {    useEffect(() => {

        const script = document.createElement('script');        const script = document.createElement('script');

        script.src = 'https://checkout.razorpay.com/v1/checkout.js';        script.src = 'https://checkout.razorpay.com/v1/checkout.js';

        script.async = true;        script.async = true;

        script.onload = () => setRazorpayLoaded(true);        script.onload = () => setRazorpayLoaded(true);

        document.body.appendChild(script);        document.body.appendChild(script);



        return () => {        return () => {

            if (document.body.contains(script)) {            if (document.body.contains(script)) {

                document.body.removeChild(script);                document.body.removeChild(script);

            }            }

        };        };

    }, []);    }, []);



    useEffect(() => {    useEffect(() => {

        if (isOpen) {        if (isOpen) {

            setStatus('idle');            setStatus('idle');

            setErrorMessage('');            setErrorMessage('');

            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });

            gsap.fromTo(            gsap.fromTo(

                contentRef.current,                contentRef.current,

                { y: 50, opacity: 0, scale: 0.95 },                { y: 50, opacity: 0, scale: 0.95 },

                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }

            );            );

        } else {        } else {

            gsap.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 });            gsap.to(contentRef.current, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 });

            gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });            gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });

        }        }

    }, [isOpen]);    }, [isOpen]);



    // Calculate total    // Calculate total

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);



    const handleDirectCheckout = async () => {    const handleDirectCheckout = async () => {

        // Check if user is logged in        // Check if user is logged in

        const userData = localStorage.getItem('userData');        const userData = localStorage.getItem('userData');

        if (!userData) {        if (!userData) {

            setErrorMessage('Please login to complete your booking');            setErrorMessage('Please login to complete your booking');

            setTimeout(() => {            setTimeout(() => {

                window.location.href = '/login';                window.location.href = '/login';

            }, 2000);            }, 2000);

            return;            return;

        }        }



        const user = JSON.parse(userData);        const user = JSON.parse(userData);



        if (!razorpayLoaded) {        if (!razorpayLoaded) {

            setErrorMessage('Payment system is loading. Please try again in a moment.');            setErrorMessage('Payment system is loading. Please try again in a moment.');

            return;            return;

        }        }



        setStatus('processing');        setStatus('processing');

        setErrorMessage('');        setErrorMessage('');



        try {        try {

            // 1. Create Razorpay order            // 1. Create Razorpay order

            const orderData = await api.createPaymentOrder(total);            const orderData = await api.createPaymentOrder(total);



            // 2. Initialize Razorpay payment - Opens directly!            // 2. Initialize Razorpay payment - Opens directly!

            const options = {            const options = {

                key: orderData.key,                key: orderData.key,

                amount: orderData.amount,                amount: orderData.amount,

                currency: orderData.currency,                currency: orderData.currency,

                order_id: orderData.orderId,                order_id: orderData.orderId,

                name: 'UpSosh',                name: 'UpSosh',

                description: `${cart.length} Event Ticket${cart.length > 1 ? 's' : ''}`,                description: `${cart.length} Event Ticket${cart.length > 1 ? 's' : ''}`,

                image: 'https://www.upsosh.app/logo.png',                image: 'https://www.upsosh.app/logo.png',

                prefill: {                prefill: {

                    name: user.name,                    name: user.name,

                    email: user.email,                    email: user.email,

                    contact: user.phone || '',                    contact: user.phone || '',

                },                },

                theme: {                theme: {

                    color: '#6366f1',                    color: '#6366f1',

                },                },

                handler: async (response: any) => {                handler: async (response: any) => {

                    try {                    try {

                        // 3. Verify payment                        // 3. Verify payment

                        const verification = await api.verifyPayment({                        const verification = await api.verifyPayment({

                            razorpay_order_id: response.razorpay_order_id,                            razorpay_order_id: response.razorpay_order_id,

                            razorpay_payment_id: response.razorpay_payment_id,                            razorpay_payment_id: response.razorpay_payment_id,

                            razorpay_signature: response.razorpay_signature,                            razorpay_signature: response.razorpay_signature,

                        });                        });



                        if (verification.success) {                        if (verification.success) {

                            // 4. Create booking                            // 4. Create booking

                            const bookingData = {                            const bookingData = {

                                userId: user.id,                                userId: user.id,

                                items: cart,                                items: cart,

                                totalAmount: total,                                totalAmount: total,

                                status: 'confirmed' as const,                                status: 'confirmed' as const,

                                paymentId: verification.paymentId,                                paymentId: verification.paymentId,

                                customer: {                                customer: {

                                    name: user.name,                                    name: user.name,

                                    email: user.email,                                    email: user.email,

                                    phone: user.phone || '',                                    phone: user.phone || '',

                                },                                },

                                createdAt: new Date().toISOString(),                                createdAt: new Date().toISOString(),

                            };                            };



                            const booking = await api.createBooking(bookingData as any);                            const booking = await api.createBooking(bookingData as any);

                            setBookingDetails(booking);                            setBookingDetails(booking);

                            setStatus('success');                            setStatus('success');

                            clearCart();                            clearCart();

                        } else {                        } else {

                            throw new Error('Payment verification failed');                            throw new Error('Payment verification failed');

                        }                        }

                    } catch (error: any) {                    } catch (error: any) {

                        console.error('Payment verification error:', error);                        console.error('Payment verification error:', error);

                        setStatus('error');                        setStatus('error');

                        setErrorMessage(error.message || 'Payment verification failed. Please contact support.');                        setErrorMessage(error.message || 'Payment verification failed. Please contact support.');

                    }                    }

                },                },

                modal: {                modal: {

                    ondismiss: () => {                    ondismiss: () => {

                        setStatus('idle');                        setStatus('idle');

                        setErrorMessage('Payment cancelled. You can try again.');                        setErrorMessage('Payment cancelled. You can try again.');

                    },                    },

                },                },

            };            };



            const razorpay = new window.Razorpay(options);            const razorpay = new window.Razorpay(options);

            razorpay.open();            razorpay.open();

        } catch (error: any) {        } catch (error: any) {

            console.error('Checkout error:', error);            console.error('Checkout error:', error);

            setStatus('error');            setStatus('error');

            setErrorMessage(error.message || 'Something went wrong. Please try again.');            setErrorMessage(error.message || 'Something went wrong. Please try again.');

        }        }

    };    };



    if (!isOpen && status === 'idle') return null;    if (!isOpen && status === 'idle') return null;



    return (    return (

        <div        <div

            ref={modalRef}            ref={modalRef}

            className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none"            className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none"

            role="dialog"            role="dialog"

            aria-modal="true"            aria-modal="true"

            aria-labelledby="checkout-title"            aria-labelledby="checkout-title"

        >        >

            <div            <div

                className="absolute inset-0 bg-black/80 backdrop-blur-md"                className="absolute inset-0 bg-black/80 backdrop-blur-md"

                onClick={status === 'processing' ? undefined : onClose}                onClick={onClose}

                aria-hidden="true"                aria-hidden="true"

            />            />



            <div            <div

                ref={contentRef}                ref={contentRef}

                className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden"                className="relative w-full max-w-5xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"

            >            >

                {/* Header */}                {/* Header */}

                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface/50">                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface/50">

                    <h2 id="checkout-title" className="text-2xl font-heading font-bold text-text-primary">                    <h2 id="checkout-title" className="text-2xl font-heading font-bold text-text-primary">

                        {status === 'success' ? '🎉 Booking Confirmed!' : 'Complete Your Purchase'}                        {status === 'success' ? 'Order Confirmed' : 'Checkout'}

                    </h2>                    </h2>

                    {status !== 'processing' && (                    <button

                        <button                        onClick={onClose}

                            onClick={onClose}                        className="p-2 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"

                            className="p-2 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"                        aria-label="Close checkout"

                            aria-label="Close checkout"                    >

                        >                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />                        </svg>

                            </svg>                    </button>

                        </button>                </div>

                    )}

                </div>                {/* Content */}

                <div className="p-6 overflow-y-auto">

                {/* Content */}                    {status === 'success' ? (

                <div className="p-8">                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">

                    {status === 'success' ? (                            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">

                        <div className="flex flex-col items-center justify-center text-center space-y-6">                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

                            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />

                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">                                </svg>

                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />                            </div>

                                </svg>                            <h3 className="text-3xl font-bold text-text-primary">Thank you for your purchase!</h3>

                            </div>                            <p className="text-text-secondary max-w-md">

                            <h3 className="text-3xl font-bold text-text-primary">Payment Successful!</h3>                                Your booking has been confirmed. A confirmation email has been sent to <strong>{bookingDetails?.customer.email}</strong>.

                            <p className="text-text-secondary max-w-md text-lg">                            </p>

                                Your tickets have been booked. Check your email for confirmation.                            <div className="bg-surface-highlight rounded-xl p-4 w-full max-w-md">

                            </p>                                <p className="text-sm text-text-muted mb-1">Booking Reference</p>

                            <div className="bg-surface-highlight rounded-xl p-6 w-full">                                <p className="text-xl font-mono font-bold text-text-primary">{bookingDetails?.id}</p>

                                <p className="text-sm text-text-muted mb-2">Booking Reference</p>                            </div>

                                <p className="text-2xl font-mono font-bold text-primary">{bookingDetails?.id}</p>                            <button

                            </div>                                onClick={onClose}

                            <div className="flex gap-4 w-full">                                className="py-3 px-8 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"

                                <button                            >

                                    onClick={() => window.location.href = '/profile'}                                Continue Exploring

                                    className="flex-1 py-3 px-6 rounded-xl bg-surface-highlight text-text-primary font-bold hover:bg-surface-highlight/80 transition-colors"                            </button>

                                >                        </div>

                                    View My Tickets                    ) : (

                                </button>                        <>

                                <button                            {status === 'error' && (

                                    onClick={onClose}                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3" role="alert">

                                    className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity"                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">

                                >                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                                    Book More Events                                    </svg>

                                </button>                                    {errorMessage}

                            </div>                                </div>

                        </div>                            )}

                    ) : status === 'processing' ? (                            <CheckoutForm onSubmit={handleCheckout} isProcessing={status === 'processing'} />

                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">                        </>

                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>                    )}

                            <h3 className="text-2xl font-bold text-text-primary">Processing Payment...</h3>                </div>

                            <p className="text-text-secondary">Please complete the payment in the Razorpay window</p>            </div>

                        </div>        </div>

                    ) : (    );

                        <div className="space-y-6">};

                            {errorMessage && (

                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3">export default CheckoutModal;

                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="bg-surface-highlight rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-text-primary mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-text-primary">{item.title}</p>
                                                <p className="text-sm text-text-muted">Qty: {item.qty}</p>
                                            </div>
                                            <p className="font-bold text-text-primary">₹{(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border/50 pt-4 mt-4">
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span className="text-text-primary">Total</span>
                                        <span className="text-primary">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Button */}
                            <button
                                onClick={handleDirectCheckout}
                                disabled={status === 'processing' || !razorpayLoaded}
                                className="w-full py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {!razorpayLoaded ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading Payment System...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Pay ₹{total.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-text-muted">
                                Secure payment powered by Razorpay 🔒
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
