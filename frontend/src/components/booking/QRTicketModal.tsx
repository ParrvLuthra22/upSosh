'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import QRCode from 'react-qr-code';
import { Booking } from '@/src/lib/api';
import { downloadQRCode, generateICS } from '@/src/lib/ticketUtils';

interface QRTicketModalProps {
    booking: Booking;
    isOpen: boolean;
    onClose: () => void;
}

const QRTicketModal: React.FC<QRTicketModalProps> = ({ booking, isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            gsap.to(modalRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
            gsap.fromTo(
                ticketRef.current,
                { y: 50, opacity: 0, rotateX: -10 },
                { y: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: 'back.out(1.2)' }
            );
        } else {
            gsap.to(ticketRef.current, { y: 50, opacity: 0, rotateX: -10, duration: 0.3 });
            gsap.to(modalRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3, delay: 0.1 });
        }
    }, [isOpen]);

    // Assuming booking has items, we'll display the first item as the main ticket for now
    // or iterate if multiple. For this demo, let's show the first event.
    const event = booking.items[0];
    const qrValue = JSON.stringify({ bookingId: booking.id, eventId: event.id, user: booking.customer?.email || 'guest' });

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 opacity-0 pointer-events-none"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div
                ref={ticketRef}
                className="relative w-full max-w-md bg-white text-black rounded-3xl shadow-2xl overflow-hidden transform perspective-1000"
            >
                {/* Ticket Header */}
                <div className="bg-primary p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <h2 className="text-2xl font-heading font-bold relative z-10">Digital Ticket</h2>
                    <p className="text-sm opacity-80 relative z-10">Scan at entry</p>
                </div>

                {/* Ticket Body */}
                <div className="p-8 flex flex-col items-center space-y-6">
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.venue}</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                            <span>{event.date}</span>
                            <span>•</span>
                            <span>{event.time}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100">
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                            <QRCode
                                id={`qr-${booking.id}`}
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={qrValue}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Booking ID</p>
                        <p className="font-mono font-bold text-lg">{booking.id}</p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => downloadQRCode(`qr-${booking.id}`, `ticket-${booking.id}`)}
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Save Image</span>
                        </button>
                        <button
                            onClick={() => generateICS(event)}
                            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-600">Add to Cal</span>
                        </button>
                    </div>
                </div>

                {/* Ticket Tear-off Effect */}
                <div className="relative h-6 bg-gray-50">
                    <div className="absolute -top-3 left-0 w-full h-6 bg-[radial-gradient(circle,transparent_0.5rem,white_0.5rem)] bg-[length:1rem_1rem] bg-repeat-x"></div>
                </div>

                <div className="bg-gray-50 p-6 text-center">
                    <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                        Close Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRTicketModal;
