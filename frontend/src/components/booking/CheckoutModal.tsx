'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
import { api } from '@/src/lib/api';
import { useFocusTrap, useEscapeKey } from '@/src/lib/a11y';

// RAZORPAY COMMENTED OUT - Waiting for approval
// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
    const { cart, clearCart } = useBookingStore();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'idle' | 'payment-details' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useFocusTrap(contentRef, isOpen);
    useEscapeKey(onClose, isOpen);

    // RAZORPAY SCRIPT LOADING COMMENTED OUT
    // useEffect(() => {
    //     const script = document.createElement('script');
    //     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    //     script.async = true;
    //     script.onload = () => setRazorpayLoaded(true);
    //     document.body.appendChild(script);
    //     return () => {
    //         if (document.body.contains(script)) document.body.removeChild(script);
    //     };
    // }, []);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrorMessage('Please upload an image file');
                return;
            }
            setPaymentProof(file);
            setPreviewUrl(URL.createObjectURL(file));
            setErrorMessage('');
        }
    };

    const handleShowPaymentDetails = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            setErrorMessage('Please login to complete your booking');
            setStatus('error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }
        
        setStatus('payment-details');
        setErrorMessage('');
    };

    const handleSubmitManualPayment = async () => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            setErrorMessage('Please login');
            return;
        }

        if (!paymentProof) {
            setErrorMessage('Please upload payment screenshot');
            return;
        }

        const user = JSON.parse(userData);
        setStatus('uploading');
        setErrorMessage('');

        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(paymentProof);
            reader.onload = async () => {
                const base64Image = reader.result as string;
                
                const bookingData = {
                    userId: user.id,
                    items: cart,
                    totalAmount: total,
                    status: 'pending' as const, // Pending until admin verifies
                    paymentProof: base64Image,
                    customer: { name: user.name, email: user.email, phone: user.phone || '' },
                    createdAt: new Date().toISOString(),
                };

                const booking = await api.createBooking(bookingData as any);
                setBookingDetails(booking);
                setStatus('success');
                clearCart();
            };
        } catch (error: any) {
            console.error('Booking error:', error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to create booking. Please try again.');
        }
    };

    // RAZORPAY CODE COMMENTED OUT
    // const handleDirectCheckout = async () => {
    //     const token = localStorage.getItem('token');
    //     const userData = localStorage.getItem('userData');
    //     
    //     if (!token || !userData) {
    //         setErrorMessage('Please login to complete your booking');
    //         setStatus('error');
    //         setTimeout(() => window.location.href = '/login', 2000);
    //         return;
    //     }
    //     
    //     const user = JSON.parse(userData);
    //     if (!razorpayLoaded) {
    //         setErrorMessage('Payment system is loading. Please try again.');
    //         return;
    //     }
    //     setStatus('processing');
    //     setErrorMessage('');
    //     try {
    //         console.log('Creating payment order for amount:', total);
    //         const orderData = await api.createPaymentOrder(total);
    //         const options = {
    //             key: orderData.key,
    //             amount: orderData.amount,
    //             currency: orderData.currency,
    //             order_id: orderData.orderId,
    //             name: 'UpSosh',
    //             description: `${cart.length} Event Ticket${cart.length > 1 ? 's' : ''}`,
    //             image: 'https://www.upsosh.app/logo.png',
    //             prefill: { name: user.name, email: user.email, contact: user.phone || '' },
    //             theme: { color: '#6366f1' },
    //             handler: async (response: any) => {
    //                 try {
    //                     const verification = await api.verifyPayment({
    //                         razorpay_order_id: response.razorpay_order_id,
    //                         razorpay_payment_id: response.razorpay_payment_id,
    //                         razorpay_signature: response.razorpay_signature,
    //                     });
    //                     if (verification.success) {
    //                         const bookingData = {
    //                             userId: user.id,
    //                             items: cart,
    //                             totalAmount: total,
    //                             status: 'confirmed' as const,
    //                             paymentId: verification.paymentId,
    //                             customer: { name: user.name, email: user.email, phone: user.phone || '' },
    //                             createdAt: new Date().toISOString(),
    //                         };
    //                         const booking = await api.createBooking(bookingData as any);
    //                         setBookingDetails(booking);
    //                         setStatus('success');
    //                         clearCart();
    //                     } else throw new Error('Payment verification failed');
    //                 } catch (error: any) {
    //                     console.error('Payment error:', error);
    //                     setStatus('error');
    //                     setErrorMessage(error.message || 'Payment failed. Contact support.');
    //                 }
    //             },
    //             modal: { ondismiss: () => { setStatus('idle'); setErrorMessage('Payment cancelled.'); } },
    //         };
    //         const razorpay = new window.Razorpay(options);
    //         razorpay.open();
    //     } catch (error: any) {
    //         console.error('Checkout error:', error);
    //         setStatus('error');
    //         setErrorMessage(error.message || 'Something went wrong.');
    //     }
    // };

    if (!isOpen && status === 'idle') return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={status === 'uploading' ? undefined : onClose} />
            <div ref={contentRef} className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface/50 sticky top-0 z-10">
                    <h2 className="text-2xl font-heading font-bold text-text-primary">
                        {status === 'success' ? '✅ Booking Submitted!' : status === 'payment-details' ? '💳 Payment Details' : 'Complete Your Purchase'}
                    </h2>
                    {status !== 'uploading' && <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-highlight text-text-muted hover:text-text-primary transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-3xl font-bold text-text-primary">Booking Submitted!</h3>
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 w-full">
                                <p className="text-yellow-500 font-medium">⏳ Pending Verification</p>
                                <p className="text-text-secondary text-sm mt-2">Your booking will be confirmed once we verify your payment. You'll receive an email confirmation within 24 hours.</p>
                            </div>
                            <div className="bg-surface-highlight rounded-xl p-6 w-full">
                                <p className="text-sm text-text-muted mb-2">Booking Reference</p>
                                <p className="text-2xl font-mono font-bold text-primary">{bookingDetails?.id}</p>
                            </div>
                            <button onClick={onClose} className="w-full py-3 px-6 rounded-xl bg-primary text-white font-bold hover:opacity-90">Done</button>
                        </div>
                    ) : status === 'uploading' ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <h3 className="text-2xl font-bold text-text-primary">Submitting Booking...</h3>
                            <p className="text-text-secondary">Please wait while we process your request</p>
                        </div>
                    ) : status === 'payment-details' ? (
                        <div className="space-y-6">
                            {errorMessage && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{errorMessage}</span></div>}
                            
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    How to Pay
                                </h3>
                                <p className="text-text-secondary text-sm">Send ₹{total.toFixed(2)} to our UPI ID or Bank Account, then upload your payment screenshot below.</p>
                            </div>

                            <div className="bg-surface-highlight rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-text-primary mb-4">💳 Payment Methods</h3>
                                
                                <div className="space-y-3">
                                    <div className="bg-surface border border-border/50 rounded-lg p-4">
                                        <p className="text-sm text-text-muted mb-1">UPI ID</p>
                                        <p className="text-xl font-mono font-bold text-primary">upsosh@ptyes</p>
                                        <button onClick={() => navigator.clipboard.writeText('upsosh@ptyes')} className="text-sm text-blue-400 hover:text-blue-300 mt-2">📋 Copy</button>
                                    </div>
                                    
                                    <div className="bg-surface border border-border/50 rounded-lg p-4">
                                        <p className="text-sm text-text-muted mb-2">Bank Transfer</p>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-text-secondary"><span className="text-text-muted">Bank:</span> HDFC Bank</p>
                                            <p className="text-text-secondary"><span className="text-text-muted">Account:</span> 1234567890</p>
                                            <p className="text-text-secondary"><span className="text-text-muted">IFSC:</span> HDFC0001234</p>
                                            <p className="text-text-secondary"><span className="text-text-muted">Name:</span> UpSosh Events</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-highlight rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-text-primary">📸 Upload Payment Proof</h3>
                                <p className="text-sm text-text-muted">Take a screenshot of your payment and upload it here</p>
                                
                                <label className="block">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer transition-colors">
                                        {previewUrl ? (
                                            <div className="space-y-3">
                                                <img src={previewUrl} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                                                <p className="text-sm text-green-400">✓ Image uploaded</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <svg className="w-12 h-12 mx-auto text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                <p className="text-text-primary font-medium">Click to upload screenshot</p>
                                                <p className="text-xs text-text-muted">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-3 px-6 rounded-xl bg-surface-highlight text-text-primary font-bold hover:bg-surface-highlight/80">Back</button>
                                <button onClick={handleSubmitManualPayment} disabled={!paymentProof} className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Submit Booking</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {errorMessage && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{errorMessage}</span></div>}
                            
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

                            <button onClick={handleShowPaymentDetails} className="w-full py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Proceed to Payment
                            </button>
                            <p className="text-center text-sm text-text-muted">💳 Pay via UPI or Bank Transfer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
