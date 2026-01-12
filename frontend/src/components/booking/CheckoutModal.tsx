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
    const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

    useFocusTrap(contentRef, isOpen);
    useEscapeKey(onClose, isOpen);

    // Check for Buy Now item or use cart
    useEffect(() => {
        if (isOpen) {
            const buyNowItemStr = sessionStorage.getItem('buyNowItem');
            if (buyNowItemStr) {
                const buyNowItem = JSON.parse(buyNowItemStr);
                setCheckoutItems([buyNowItem]);
                // Clear the buy now item from session storage
                sessionStorage.removeItem('buyNowItem');
            } else {
                setCheckoutItems(cart);
            }
        }
    }, [isOpen, cart]);

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

    const total = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);

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

    // Handle Dodo Payments online checkout
    const handleDodoPayment = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            setErrorMessage('Please login to complete your booking');
            setStatus('error');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }
        
        const user = JSON.parse(userData);
        setStatus('uploading'); // Reusing this status for "processing"
        setErrorMessage('');
        
        try {
            // Transform checkoutItems for Dodo API
            const items = checkoutItems.map(item => ({
                id: item.event?.id || item.id,
                title: item.event?.title || item.title,
                price: item.price,
                qty: item.qty,
            }));
            
            // First, create a pending booking BEFORE redirecting to payment
            const bookingData = {
                userId: user.id,
                items: checkoutItems.map(item => ({
                    id: item.event?.id || item.id,
                    title: item.event?.title || item.title,
                    price: item.price,
                    qty: item.qty,
                    ...(item.event || item)
                })),
                totalAmount: total,
                status: 'pending_payment' as const,
                customer: { name: user.name, email: user.email, phone: user.phone || '' },
                createdAt: new Date().toISOString(),
            };
            
            const booking = await api.createBooking(bookingData as any);
            console.log('Pre-payment booking created:', booking.id);
            
            // Store booking ID for confirmation page
            sessionStorage.setItem('pendingBookingId', booking.id);
            sessionStorage.setItem('pendingBookingItems', JSON.stringify(items));
            
            const response = await api.createDodoCheckout({
                items,
                customer: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                },
                returnUrl: `${window.location.origin}/booking/confirmation?bookingId=${booking.id}`,
                metadata: {
                    userId: user.id,
                    bookingId: booking.id,
                },
            });
            
            // Check if backend suggests manual payment (DodoPayments not configured)
            if (response.useManualPayment) {
                setStatus('payment-details');
                setErrorMessage('Online payments are currently unavailable. Please use manual payment.');
                return;
            }
            
            if (response.checkoutUrl) {
                // Clear cart before redirect
                clearCart();
                // Redirect to Dodo checkout page
                window.location.href = response.checkoutUrl;
            } else {
                // Fallback to manual payment if no checkout URL
                setStatus('payment-details');
                setErrorMessage('Online checkout unavailable. Please use manual payment.');
            }
        } catch (error: any) {
            console.error('Dodo payment error:', error);
            // On error, fallback to manual payment option
            setStatus('payment-details');
            setErrorMessage(error.message || 'Online payment unavailable. Please use manual payment below.');
        }
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
                
                // Transform checkoutItems to match the expected format
                const formattedItems = checkoutItems.map(item => ({
                    id: item.event?.id || item.id,
                    title: item.event?.title || item.title,
                    price: item.price,
                    qty: item.qty,
                    // Include other necessary fields from the event
                    ...(item.event || item)
                }));
                
                const bookingData = {
                    userId: user.id,
                    items: formattedItems,
                    totalAmount: total,
                    status: 'pending' as const, // Pending until admin verifies
                    paymentProof: base64Image,
                    customer: { name: user.name, email: user.email, phone: user.phone || '' },
                    createdAt: new Date().toISOString(),
                };

                const booking = await api.createBooking(bookingData as any);
                setBookingDetails(booking);
                setStatus('success');
                
                // Only clear cart if items came from cart (not buy now)
                const buyNowItem = sessionStorage.getItem('buyNowItem');
                if (!buyNowItem && cart.length > 0) {
                    clearCart();
                }
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
            <div ref={contentRef} className="relative w-full max-w-2xl bg-black border border-white/10 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black sticky top-0 z-10">
                    <h2 className="text-2xl font-heading font-bold text-white">
                        {status === 'success' ? '✅ Booking Submitted!' : status === 'payment-details' ? '💳 Payment Details' : 'Complete Your Purchase'}
                    </h2>
                    {status !== 'uploading' && <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-[#D4A017]/20 text-[#D4A017] rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-3xl font-bold text-white">Booking Submitted!</h3>
                            <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl p-4 w-full">
                                <p className="text-[#D4A017] font-medium">⏳ Pending Verification</p>
                                <p className="text-white/60 text-sm mt-2">Your booking will be confirmed once we verify your payment. You'll receive an email confirmation within 24 hours.</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-6 w-full">
                                <p className="text-sm text-white/50 mb-2">Booking Reference</p>
                                <p className="text-2xl font-mono font-bold text-[#D4A017]">{bookingDetails?.id}</p>
                            </div>
                            <button onClick={onClose} className="w-full py-3 px-6 rounded-xl bg-[#D4A017] text-black font-bold hover:opacity-90">Done</button>
                        </div>
                    ) : status === 'uploading' ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                            <div className="w-16 h-16 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin"></div>
                            <h3 className="text-2xl font-bold text-white">Submitting Booking...</h3>
                            <p className="text-white/60">Please wait while we process your request</p>
                        </div>
                    ) : status === 'payment-details' ? (
                        <div className="space-y-6">
                            {errorMessage && <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{errorMessage}</span></div>}
                            
                            <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    How to Pay
                                </h3>
                                <p className="text-white/60 text-sm">Send ₹{total.toFixed(2)} using the QR code, UPI ID, or Bank Account details below, then upload your payment screenshot.</p>
                            </div>

                            {/* QR Code Section */}
                            <div className="bg-white/10 rounded-xl p-6 flex flex-col items-center space-y-4">
                                <h3 className="text-lg font-bold text-white">Scan QR Code to Pay</h3>
                                <div className="bg-white p-4 rounded-xl">
                                    <img 
                                        src="/payment-qr.png" 
                                        alt="Payment QR Code" 
                                        className="w-64 h-64 object-contain"
                                    />
                                </div>
                                <p className="text-sm text-white/50 text-center">Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
                                <p className="text-xs text-white/50 text-center">Amount: ₹{total.toFixed(2)}</p>
                            </div>

                            <div className="bg-white/10 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
                                
                                <div className="space-y-3">
                                    <div className="bg-black border border-white/10 rounded-lg p-4">
                                        <p className="text-sm text-white/50 mb-1">UPI ID</p>
                                        <p className="text-xl font-mono font-bold text-[#D4A017]">upsosh@ptyes</p>
                                        <button onClick={() => navigator.clipboard.writeText('upsosh@ptyes')} className="text-sm text-[#D4A017] hover:opacity-80 mt-2">Copy UPI ID</button>
                                    </div>
                                    
                                    <div className="bg-black border border-white/10 rounded-lg p-4">
                                        <p className="text-sm text-white/50 mb-2">Bank Transfer</p>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-white/60"><span className="text-white/40">Account Holder:</span> Aadit Vachher</p>
                                            <p className="text-white/60"><span className="text-white/40">Bank:</span> HDFC Bank</p>
                                            <p className="text-white/60"><span className="text-white/40">Account Number:</span> 50100828764622</p>
                                            <p className="text-white/60"><span className="text-white/40">IFSC Code:</span> HDFC0000027</p>
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText('50100828764622')} 
                                            className="text-sm text-[#D4A017] hover:opacity-80 mt-2"
                                        >
                                            Copy Account Number
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-white">📸 Upload Payment Proof</h3>
                                <p className="text-sm text-white/50">Take a screenshot of your payment and upload it here</p>
                                
                                <label className="block">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#D4A017]/50 cursor-pointer transition-colors">
                                        {previewUrl ? (
                                            <div className="space-y-3">
                                                <img src={previewUrl} alt="Payment proof" className="max-h-48 mx-auto rounded-lg" />
                                                <p className="text-sm text-[#D4A017]">✓ Image uploaded</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <svg className="w-12 h-12 mx-auto text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                <p className="text-white font-medium">Click to upload screenshot</p>
                                                <p className="text-xs text-white/50">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-3 px-6 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Back</button>
                                <button onClick={handleSubmitManualPayment} disabled={!paymentProof} className="flex-1 py-3 px-6 rounded-xl bg-[#D4A017] text-black font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">Submit Booking</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {errorMessage && <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-white/80 flex items-center gap-3"><svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{errorMessage}</span></div>}
                            
                            <div className="bg-white/10 rounded-xl p-6 space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                                <div className="space-y-3">
                                    {checkoutItems.map((item) => (
                                        <div key={item.event?.id || item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-white">{item.event?.title || item.title}</p>
                                                <p className="text-sm text-white/50">Qty: {item.qty}</p>
                                            </div>
                                            <p className="font-bold text-white">₹{(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span className="text-white">Total</span>
                                        <span className="text-[#D4A017]">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Options */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Choose Payment Method</h3>
                                
                                {/* Online Payment - Dodo Payments */}
                                <button 
                                    onClick={handleDodoPayment} 
                                    className="w-full py-4 px-6 rounded-xl bg-[#D4A017] text-black font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    Pay Online (Card/UPI/Wallet)
                                </button>
                                <p className="text-center text-xs text-white/50">Instant Secure payment powered by Dodo Payments(platform charges may apply)</p>
                                
                                {/* Divider */}
                                <div className="flex items-center gap-4 my-4">
                                    <div className="flex-1 h-px bg-white/10"></div>
                                    <span className="text-sm text-white/50">or</span>
                                    <div className="flex-1 h-px bg-white/10"></div>
                                </div>
                                
                                {/* Manual Payment */}
                                <button 
                                    onClick={handleShowPaymentDetails} 
                                    className="w-full py-4 px-6 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    Pay via UPI/Bank Transfer
                                </button>
                                <p className="text-center text-xs text-white/50">Manual verification (6-8 hours)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
