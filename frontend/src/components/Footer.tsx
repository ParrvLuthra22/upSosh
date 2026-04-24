'use client';

import Link from 'next/link';
import React, { useState } from 'react';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            
            const subject = encodeURIComponent('Newsletter Subscription Request');
            const body = encodeURIComponent(`I would like to subscribe to the upSosh newsletter.\n\nEmail: ${email}`);
            window.location.href = `mailto:support@upsosh.app?subject=${subject}&body=${body}`;
            setEmail(''); 
        }
    };

    return (
        <footer className="bg-surface border-t border-white/10 pt-16 pb-8 mt-20 font-sans">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    
                    <div className="space-y-4">
                        <Link 
                            href="/" 
                            className="text-2xl font-bold text-[#D4A017]"
                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                        >
                            UpSosh
                        </Link>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Discover formal + informal events around you — all in one place. Join the community today.
                        </p>
                        <div className="flex gap-4 pt-2">
                            
                            <a
                                href="https://www.instagram.com/upsosh.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110"
                                aria-label="Follow us on Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.linkedin.com/company/upsosh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
                                aria-label="Follow us on LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Discover</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/booking" className="hover:text-primary transition-colors">Browse Events</Link></li>
                            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Support</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/safety" className="hover:text-primary transition-colors">Safety</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/refund" className="hover:text-primary transition-colors">Refund & Cancellation</Link></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Stay Updated</h4>
                        <p className="text-text-secondary text-sm mb-4">
                            Subscribe to our newsletter for the latest events and offers.
                        </p>
                        <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 bg-surface-highlight border border-white/10 rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                    <p>&copy; {new Date().getFullYear()} UpSosh. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                        <Link href="/refund" className="hover:text-text-primary transition-colors">Refunds</Link>
                        <Link href="/cookies" className="hover:text-text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
