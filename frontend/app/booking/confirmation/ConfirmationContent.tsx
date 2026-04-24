'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` 
    : 'https://upsosh-production.up.railway.app/api';

export default function ConfirmationContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
    
    const paymentId = searchParams.get('payment_id');
    const paymentStatus = searchParams.get('status');
    const bookingId = searchParams.get('bookingId');
    
    useEffect(() => {
        const confirmBooking = async () => {
            
            const pendingBookingId = bookingId || sessionStorage.getItem('pendingBookingId');
            
            
            const isPaymentSuccess = paymentStatus === 'succeeded' || paymentStatus === 'success' || paymentId;
            
            if (isPaymentSuccess && pendingBookingId) {
                try {
                    
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_URL}/bookings/${pendingBookingId}/confirm-payment`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` })
                        },
                        credentials: 'include',
                        body: JSON.stringify({ 
                            paymentId: paymentId || 'dodo_payment',
                            status: 'confirmed'
                        })
                    });
                    
                    if (response.ok) {
                        setStatus('success');
                        
                        sessionStorage.removeItem('pendingBookingId');
                        sessionStorage.removeItem('pendingBookingItems');
                    } else {
                        
                        console.warn('Failed to update booking status, but payment succeeded');
                        setStatus('success');
                    }
                } catch (error) {
                    console.error('Error confirming booking:', error);
                    
                    setStatus('success');
                }
            } else if (paymentStatus === 'failed') {
                setStatus('failed');
            } else if (paymentStatus === 'pending') {
                setStatus('pending');
            } else if (paymentId) {
                
                setStatus('success');
            } else {
                setStatus('pending');
            }
        };
        
        confirmBooking();
    }, [paymentId, paymentStatus, bookingId]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Processing your payment...
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Please wait while we confirm your payment.
                        </p>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your tickets have been booked successfully. You will receive a confirmation email shortly.
                        </p>
                        {paymentId && (
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Payment ID</p>
                                <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{paymentId}</p>
                            </div>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link
                                href="/profile"
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                View My Tickets
                            </Link>
                            <Link
                                href="/booking"
                                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Browse More Events
                            </Link>
                        </div>
                    </div>
                )}
                
                {status === 'failed' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Unfortunately, your payment could not be processed. Please try again or contact support.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link
                                href="/booking"
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/contact"
                                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                )}
                
                {status === 'pending' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Payment Pending
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your payment is being processed. You will receive a confirmation email once it's complete.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link
                                href="/profile"
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                Check Status
                            </Link>
                            <Link
                                href="/"
                                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
