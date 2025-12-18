'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { api, Booking } from '@/src/lib/api';
import QRTicketModal from '@/src/components/booking/QRTicketModal';

export default function ConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTicket, setShowTicket] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // In a real app, we'd fetch by ID. Since our mock API might not have a direct "get by ID" 
                // that is efficient if we didn't implement it, we'll fetch all and find (or implement getBookingById).
                // Actually, json-server supports /bookings/:id automatically.
                const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://upsosh-production.up.railway.app';
                const res = await fetch(`${API_URL}/api/bookings/${params.bookingId}`);
                if (!res.ok) throw new Error('Booking not found');
                const data = await res.json();
                setBooking(data);

                // Confetti Animation
                // Simple particle system using GSAP
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                const container = document.getElementById('confetti-container');
                if (container) {
                    for (let i = 0; i < 100; i++) {
                        const el = document.createElement('div');
                        el.classList.add('absolute', 'w-2', 'h-2', 'rounded-full');
                        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        el.style.left = '50%';
                        el.style.top = '50%';
                        container.appendChild(el);

                        const angle = Math.random() * Math.PI * 2;
                        const velocity = 200 + Math.random() * 300;

                        gsap.to(el, {
                            x: Math.cos(angle) * velocity,
                            y: Math.sin(angle) * velocity,
                            opacity: 0,
                            duration: 1 + Math.random(),
                            ease: 'power2.out',
                            onComplete: () => el.remove()
                        });
                    }
                }

            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.bookingId) {
            fetchBooking();
        }
    }, [params.bookingId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
                <button onClick={() => router.push('/booking')} className="text-primary hover:underline">
                    Return to Booking
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
            <div id="confetti-container" className="absolute inset-0 pointer-events-none" />

            <div className="container mx-auto max-w-2xl text-center space-y-8 relative z-10">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-heading font-bold text-text-primary">Booking Confirmed!</h1>
                    <p className="text-text-secondary text-lg">
                        Your order <span className="font-mono font-bold text-primary">#{booking.id}</span> has been successfully processed.
                    </p>
                </div>

                <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
                    <h2 className="text-xl font-bold text-text-primary">Your Events</h2>
                    <div className="space-y-4">
                        {booking.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 bg-surface-highlight rounded-xl p-4 text-left">
                                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-text-primary">{item.title}</h3>
                                    <p className="text-sm text-text-muted">{item.date} • {item.time}</p>
                                </div>
                                <button
                                    onClick={() => setShowTicket(true)}
                                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    View Ticket
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => router.push('/booking')}
                        className="px-8 py-3 rounded-xl border border-white/10 hover:bg-surface-highlight transition-colors text-text-primary"
                    >
                        Book Another
                    </button>
                    <button
                        onClick={() => setShowTicket(true)}
                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                    >
                        View All Tickets
                    </button>
                </div>
            </div>

            <QRTicketModal
                booking={booking}
                isOpen={showTicket}
                onClose={() => setShowTicket(false)}
            />
        </div>
    );
}
