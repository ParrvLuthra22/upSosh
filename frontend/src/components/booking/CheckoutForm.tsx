'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useBookingStore } from '@/src/store/bookingStore';

interface CheckoutFormProps {
    onSubmit: (formData: any) => void;
    isProcessing: boolean;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isProcessing }) => {
    const { cart } = useBookingStore();
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        promoCode: '',
        paymentMethod: 'credit_card',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ ...formData, total });
        } else {
            // Shake animation on error
            gsap.fromTo(
                formRef.current,
                { x: -10 },
                { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: 'power1.inOut', onComplete: () => { gsap.set(formRef.current, { x: 0 }); } }
            );
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <div className="flex-1">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-xl font-heading font-bold text-text-primary">Contact Information</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full p-3 rounded-xl bg-surface-highlight border ${errors.name ? 'border-red-500' : 'border-transparent'
                                    } focus:border-primary focus:outline-none transition-colors`}
                                placeholder="John Doe"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full p-3 rounded-xl bg-surface-highlight border ${errors.email ? 'border-red-500' : 'border-transparent'
                                        } focus:border-primary focus:outline-none transition-colors`}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={`w-full p-3 rounded-xl bg-surface-highlight border ${errors.phone ? 'border-red-500' : 'border-transparent'
                                        } focus:border-primary focus:outline-none transition-colors`}
                                    placeholder="+1 (555) 000-0000"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-heading font-bold text-text-primary pt-4">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.paymentMethod === 'credit_card'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-white/10 bg-surface-highlight text-text-muted hover:bg-surface'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-sm font-medium">Credit Card</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${formData.paymentMethod === 'paypal'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-white/10 bg-surface-highlight text-text-muted hover:bg-surface'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-sm font-medium">PayPal</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
                <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
                    <h3 className="text-xl font-heading font-bold text-text-primary">Order Summary</h3>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-text-primary line-clamp-1">{item.title}</p>
                                    <p className="text-xs text-text-muted">Qty: {item.qty}</p>
                                </div>
                                <p className="text-sm font-bold text-text-primary">${item.price * item.qty}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border/50 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-text-primary pt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Complete Purchase'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutForm;
