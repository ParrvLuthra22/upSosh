'use client';

import React, { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-24 pb-12">
            <section className="container mx-auto px-4 mb-16 text-center">
                <h1 className="text-5xl font-heading font-bold mb-6">Get in Touch</h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                    Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </section>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="lg:w-1/3 space-y-8">
                        <div className="bg-surface p-8 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                            <div className="space-y-4 text-text-secondary">
                                <p className="flex items-center gap-3">
                                    <span className="text-primary">📧</span> support@upsosh.app
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="text-primary">📞</span> +1 (555) 123-4567
                                </p>
                                <p className="flex items-center gap-3">
                                    <span className="text-primary">📍</span> 123 Innovation Dr,<br />San Francisco, CA 94103
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-2">Join the Community</h3>
                            <p className="text-sm text-text-secondary mb-4">Follow us on social media for updates and featured events.</p>
                            <div className="flex gap-4">
                                {['Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                                    <button key={social} className="px-4 py-2 rounded-lg bg-surface/50 hover:bg-surface transition-colors text-sm font-medium">
                                        {social}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3">
                        <form onSubmit={handleSubmit} className="bg-surface p-8 md:p-10 rounded-3xl border border-white/10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
                                    <input required type="text" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
                                    <input required type="text" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                                <input required type="email" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                                <select className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors">
                                    <option>General Inquiry</option>
                                    <option>Support</option>
                                    <option>Partnership</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                                <textarea required rows={5} className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="How can we help you?" />
                            </div>

                            <button
                                type="submit"
                                disabled={status !== 'idle'}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${status === 'success'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                                    }`}
                            >
                                {status === 'idle' && 'Send Message'}
                                {status === 'submitting' && 'Sending...'}
                                {status === 'success' && 'Message Sent!'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
