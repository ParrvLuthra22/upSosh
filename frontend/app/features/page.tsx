'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesPage() {
    const headerRef = useRef(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headerRef.current, {
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });

            const cards = featuresRef.current?.children;
            if (cards) {
                gsap.from(cards, {
                    y: 100,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: featuresRef.current,
                        start: 'top 80%',
                    },
                });
            }
        });

        return () => ctx.revert();
    }, []);

    const features = [
        {
            title: 'Smart Discovery',
            description: 'Our AI-powered recommendation engine learns your preferences to suggest events you\'ll actually love.',
            icon: '🔍',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            title: 'Instant Booking',
            description: 'Secure your spot in seconds with our seamless one-click booking system. No more waiting in queues.',
            icon: '⚡',
            color: 'from-purple-500 to-pink-500',
        },
        {
            title: 'Verified Hosts',
            description: 'Every host is vetted to ensure safety and quality. Look for the Superhost badge for top-tier experiences.',
            icon: '🛡️',
            color: 'from-green-500 to-emerald-500',
        },
        {
            title: 'Social Connections',
            description: 'See who\'s attending, connect with like-minded people, and build your social circle effortlessly.',
            icon: '🤝',
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12">
            {/* Hero Section */}
            <section className="container mx-auto px-4 mb-20 text-center">
                <div ref={headerRef} className="max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                        Features that Empower You
                    </h1>
                    <p className="text-xl text-text-secondary leading-relaxed">
                        Experience a new way to discover, book, and host events. Built for the modern socialite.
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4">
                <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-3xl bg-surface/50 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="text-4xl mb-6 bg-surface-highlight w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-heading font-bold text-text-primary mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-tl-full -mr-8 -mb-8 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 mt-32">
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl p-12 text-center border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Switch Up?</h2>
                        <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
                            Join thousands of users who are already experiencing the future of event discovery.
                        </p>
                        <button className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
