'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';
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
    const [status, setStatus] = useState<'idle' | 'payment-details' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [checkoutItems, setCheckoutItems] = useState<any[]>([]);

    useFocusTrap(contentRef, isOpen);
    useEscapeKey(onClose, isOpen);

    useEffect(() => {
        if (isOpen) {
            const buyNowItemStr = sessionStorage.getItem('buyNowItem');
            if (buyNowItemStr) {
                const buyNowItem = JSON.parse(buyNowItemStr);
                setCheckoutItems([buyNowItem]);
                sessionStorage.removeItem('buyNowItem');
            } else {
                setCheckoutItems(cart);
            }
        }
    }, [isOpen, cart]);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setErrorMessage('');
            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        } else {
            gsap.to(contentRef.current, { y: 20, opacity: 0, duration: 0.3, ease: 'power2.in' });
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
        if (!token) {
            setErrorMessage('Please login to complete booking');
            return;
        }
        setStatus('payment-details');
        setErrorMessage('');
    };

    const isTokenValid = (token: string): boolean => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    };

    const handleDodoPayment = async () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');

        if (!token || !userData) {
            window.location.href = '/login';
            return;
        }

        if (!isTokenValid(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);
        setStatus('uploading');
        setErrorMessage('');

        try {
            const items = checkoutItems.map(item => ({
                id: item.event?.id || item.id,
                title: item.event?.title || item.title,
                price: item.price,
                qty: item.qty,
            }));

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
            sessionStorage.setItem('pendingBookingId', booking.id);
            sessionStorage.setItem('pendingBookingItems', JSON.stringify(items));

            const response = await api.createDodoCheckout({
                items,
                customer: { name: user.name, email: user.email, phone: user.phone || '' },
                returnUrl: `${window.location.origin}/booking/confirmation?bookingId=${booking.id}`,
                metadata: { userId: user.id, bookingId: booking.id },
            });

            if (response.useManualPayment) {
                setStatus('payment-details');
                setErrorMessage('Online payments currently unavailable.');
                return;
            }

            if (response.checkoutUrl) {
                clearCart();
                window.location.href = response.checkoutUrl;
            } else {
                setStatus('payment-details');
                setErrorMessage('Online checkout unavailable.');
            }
        } catch (error: any) {
            console.error('Dodo payment error:', error);
            setStatus('payment-details');
            setErrorMessage(error.message || 'Online payment unavailable.');
        }
    };

    const handleSubmitManualPayment = async () => {
        const userData = localStorage.getItem('userData');
        if (!userData || !paymentProof) return;

        const user = JSON.parse(userData);
        setStatus('uploading');
        setErrorMessage('');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(paymentProof);
            reader.onload = async () => {
                const base64Image = reader.result as string;

                const formattedItems = checkoutItems.map(item => ({
                    id: item.event?.id || item.id,
                    title: item.event?.title || item.title,
                    price: item.price,
                    qty: item.qty,
                    ...(item.event || item)
                }));

                const bookingData = {
                    userId: user.id,
                    items: formattedItems,
                    totalAmount: total,
                    status: 'pending' as const,
                    paymentProof: base64Image,
                    customer: { name: user.name, email: user.email, phone: user.phone || '' },
                    createdAt: new Date().toISOString(),
                };

                const booking = await api.createBooking(bookingData as any);
                setBookingDetails(booking);
                setStatus('success');

                if (!sessionStorage.getItem('buyNowItem') && cart.length > 0) {
                    clearCart();
                }
            };
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.message || 'Failed to create booking.');
        }
    };

    if (!isOpen && status === 'idle') return null;

    return (
        <div ref={modalRef} className="fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 pointer-events-none" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={status === 'uploading' ? undefined : onClose} />
            <div ref={contentRef} className="relative w-full max-w-2xl bg-background border border-border shadow-2xl rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        {status === 'success' ? 'Booking Submitted' : status === 'payment-details' ? 'Payment Details' : 'Checkout'}
                    </h2>
                    {status !== 'uploading' && <button onClick={onClose} className="p-2 text-foreground/50 hover:text-foreground transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>}
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-8 py-8">
                            <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-foreground">Success</h3>
                                <p className="text-foreground/60 max-w-sm mx-auto">
                                    Your booking is pending verification. You'll receive a confirmation email shortly.
                                </p>
                            </div>
                            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 w-full max-w-xs text-sm">
                                <p className="text-foreground/50 mb-1">Booking Reference</p>
                                <p className="font-mono font-medium text-foreground">{bookingDetails?.id}</p>
                            </div>
                            <button onClick={onClose} className="btn-reset bg-foreground text-background px-8 py-3 w-full max-w-xs">Done</button>
                        </div>
                    ) : status === 'uploading' ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                            <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                            <h3 className="text-lg font-medium text-foreground">Processing...</h3>
                        </div>
                    ) : status === 'payment-details' ? (
                        <div className="space-y-8">
                            {errorMessage && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">{errorMessage}</div>}

                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* QR Code */}
                                    <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <img src="/payment-qr.png" alt="Scan to Pay" className="w-48 h-48 object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Scan to Pay</p>
                                            <p className="text-sm text-foreground/50">₹{total.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground/70">UPI ID</label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-3 rounded text-sm font-mono">upsosh@ptyes</code>
                                                <button onClick={() => navigator.clipboard.writeText('upsosh@ptyes')} className="text-sm font-medium hover:underline">Copy</button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground/70">Bank Transfer</label>
                                            <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded text-sm space-y-2">
                                                <div className="flex justify-between"><span className="text-foreground/50">Bank</span> <span>HDFC</span></div>
                                                <div className="flex justify-between"><span className="text-foreground/50">Account</span> <span className="font-mono">50100828764622</span></div>
                                                <div className="flex justify-between"><span className="text-foreground/50">IFSC</span> <span className="font-mono">HDFC0000027</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upload Proof */}
                                <div className="border-t border-border pt-6">
                                    <label className="block mb-4 text-sm font-medium text-foreground">Upload Payment Verification</label>
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-foreground/40 transition-colors">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        {previewUrl ? (
                                            <div className="text-center space-y-2">
                                                <img src={previewUrl} alt="Preview" className="h-32 object-contain mx-auto rounded" />
                                                <p className="text-sm text-foreground/60">Click to change</p>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-2 text-foreground/50">
                                                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <p>Upload screenshot</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-3 px-4 border border-border rounded text-foreground font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800">Back</button>
                                <button
                                    onClick={handleSubmitManualPayment}
                                    disabled={!paymentProof}
                                    className="flex-1 py-3 px-4 bg-foreground text-background rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {errorMessage && <div className="p-4 bg-red-500/10 text-red-500 rounded text-sm">{errorMessage}</div>}

                            {/* Summary */}
                            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-6 space-y-4">
                                <div className="space-y-3">
                                    {checkoutItems.map((item) => (
                                        <div key={item.event?.id || item.id} className="flex justify-between text-sm">
                                            <div>
                                                <p className="font-medium text-foreground">{item.event?.title || item.title}</p>
                                                <p className="text-foreground/50">Qty: {item.qty}</p>
                                            </div>
                                            <p className="font-medium">₹{(item.price * item.qty).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-border pt-4 flex justify-between items-center text-lg font-semibold">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleDodoPayment}
                                    className="w-full py-4 bg-foreground text-background font-medium text-lg hover:opacity-90 transition-opacity rounded-sm"
                                >
                                    Pay Online
                                </button>
                                <div className="text-center text-xs text-foreground/40 uppercase tracking-widest my-2">OR</div>
                                <button
                                    onClick={handleShowPaymentDetails}
                                    className="w-full py-4 border border-foreground text-foreground font-medium text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-sm"
                                >
                                    Manual Transfer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
