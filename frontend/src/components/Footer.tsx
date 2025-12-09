'use client';

import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-white/10 pt-16 pb-8 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            UpSosh
                        </Link>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Discover formal + informal events around you — all in one place. Join the community today.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Social Icons */}
                            {/* Social Icons */}
                            {[
                                { name: 'twitter', url: 'https://twitter.com/upsosh' },
                                { name: 'instagram', url: 'https://www.instagram.com/upsosh.app/' },
                                { name: 'linkedin', url: 'https://linkedin.com/company/upsosh' }
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all duration-300"
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    <span className="capitalize sr-only">{social.name}</span>
                                    {/* Simple Icon Placeholder */}
                                    <div className="w-4 h-4 bg-current rounded-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Discover</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/booking" className="hover:text-primary transition-colors">Browse Events</Link></li>
                            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>

                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Support</h4>
                        <ul className="space-y-3 text-sm text-text-secondary">
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-heading font-bold text-text-primary mb-6">Stay Updated</h4>
                        <p className="text-text-secondary text-sm mb-4">
                            Subscribe to our newsletter for the latest events and offers.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
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

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
                    <p>&copy; {new Date().getFullYear()} UpSosh. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
                        <Link href="/cookies" className="hover:text-text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
