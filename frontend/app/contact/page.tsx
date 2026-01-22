'use client';

import React, { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        
        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const message = formData.get('message') as string;

        // Create email body
        const emailBody = `Name: ${firstName} ${lastName}%0D%0AEmail: ${email}%0D%0ASubject: ${subject}%0D%0A%0D%0AMessage:%0D%0A${encodeURIComponent(message)}`;
        
        // Open user's email client with pre-filled information
        window.location.href = `mailto:support@upsosh.app?subject=${encodeURIComponent(subject)}&body=${emailBody}`;
        
        // Show success message
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        }, 500);
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
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>support@upsosh.app</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>+91 8076524225</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>B-17, GK Enclave-2<br />New Delhi 110048<br />India</span>
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3">
                        <form onSubmit={handleSubmit} className="bg-surface p-8 md:p-10 rounded-3xl border border-white/10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
                                    <input name="firstName" required type="text" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
                                    <input name="lastName" required type="text" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                                <input name="email" required type="email" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
                                <select name="subject" className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors">
                                    <option>General Inquiry</option>
                                    <option>Support</option>
                                    <option>Partnership</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                                <textarea name="message" required rows={5} className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors" placeholder="How can we help you?" />
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
