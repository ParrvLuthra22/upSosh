'use client';

import React from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
    const features = [
        {
            title: 'Smart Discovery',
            description: 'Our AI engine learns your preferences to suggest events that align with your interests.',
        },
        {
            title: 'Instant Booking',
            description: 'Secure your spot in seconds. One-click booking with no queues or wait times.',
        },
        {
            title: 'Verified Hosts',
            description: 'Every host is manually vetted. Look for the refined badge for top-tier experiences.',
        },
        {
            title: 'Social Connections',
            description: 'See who is attending, connect with like-minded people, and expand your circle.',
        },
        {
            title: 'Seamless Payments',
            description: 'Track all your bookings and receipts in one place. Secure and encrypted.',
        },
        {
            title: 'Real-time Updates',
            description: 'Instant notifications for event changes, ensuring you never miss a beat.',
        },
    ];

    return (
        <div className="min-h-screen pt-32 pb-24 bg-background text-foreground">
            
            <div className="container mx-auto px-6 mb-24">
                <div className="max-w-3xl">
                    <h1 className="text-display font-semibold tracking-tighter leading-[1] mb-8">
                        Features designed <br />
                        <span className="text-foreground/40">for human connection.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-foreground/60 font-light leading-relaxed max-w-2xl">
                        A curated set of tools built for the modern socialite. Simple, effective, and invisible.
                    </p>
                </div>
            </div>

            
            <div className="container mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {features.map((feature, index) => (
                        <div key={index} className="group space-y-4">
                            <div className="w-12 h-[1px] bg-foreground/20 group-hover:bg-foreground transition-colors duration-500" />
                            <h3 className="text-xl font-medium tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-base text-foreground/60 leading-relaxed max-w-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            
            <div className="container mx-auto px-6 border-t border-border pt-24">
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-8">
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter">
                        Ready to switch up?
                    </h2>
                    <Link
                        href="/"
                        className="group inline-flex items-center text-xl font-medium border-b border-foreground/30 hover:border-foreground pb-1 transition-all duration-300"
                    >
                        Get Started
                        <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
