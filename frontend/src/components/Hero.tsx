'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useAppStore } from '@/src/store/useAppStore';
import { useTheme } from '@/contexts/ThemeContext';
import AnimeHeroBackground from '@/src/components/AnimeHeroBackground';
import SplineToggle from './SplineToggle';
import Link from 'next/link';

const Hero = () => {
    const { isFormal } = useAppStore();
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });

            if (isFormal) {
                // Formal Mode Transitions
                tl.to(containerRef.current, {
                    backgroundColor: theme === 'dark' ? '#0B0E12' : '#F8FAFC',
                    backgroundImage: theme === 'dark'
                        ? 'radial-gradient(circle at 50% 50%, #1E293B 0%, #0B0E12 100%)'
                        : 'radial-gradient(circle at 50% 50%, #E7F1FF 0%, #F8FAFC 100%)',
                })
                    .to(headlineRef.current, { color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }, 0)
                    .to(subtextRef.current, { color: theme === 'dark' ? '#94A3B8' : '#475569' }, 0);
            } else {
                // Informal (Party) Mode Transitions
                // Using different colors for Light/Dark in Informal mode too
                tl.to(containerRef.current, {
                    backgroundColor: theme === 'dark' ? '#0B0E12' : '#F0F9FF', // Sky 50 for light
                    backgroundImage: theme === 'dark'
                        ? 'radial-gradient(circle at 50% 50%, #1E3A8A 0%, #0B0E12 100%)' // Blue-900 instead of Indigo
                        : 'radial-gradient(circle at 50% 50%, #CFFAFE 0%, #F0F9FF 100%)', // Cyan 100/Sky 50
                })
                    .to(headlineRef.current, { color: theme === 'dark' ? '#F8FAFC' : '#0F172A' }, 0)
                    .to(subtextRef.current, { color: theme === 'dark' ? '#94A3B8' : '#475569' }, 0);
            }

            // Text Content Animation (Fade out/in)
            gsap.fromTo(
                [headlineRef.current, subtextRef.current],
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isFormal, theme]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden transition-colors duration-500"
        >
            <div className="w-full relative z-20">
                <SplineToggle />
            </div>
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Content */}
                <div className="space-y-8 z-10">
                    <h1
                        ref={headlineRef}
                        className="text-5xl md:text-7xl font-heading font-bold leading-tight"
                    >
                        Switch Up Your <br />
                        <span className={isFormal ? 'text-primary' : 'text-secondary'}>
                            {isFormal ? 'Professional Network' : 'Social Experiences'}
                        </span>
                    </h1>

                    <p
                        ref={subtextRef}
                        className="text-lg md:text-xl max-w-lg"
                    >
                        {isFormal
                            ? 'Discover workshops, conferences, and networking events curated for your career growth.'
                            : 'Find the hottest house parties, underground gigs, and social meetups happening right now.'}
                    </p>

                    <div ref={ctaRef} className="flex flex-wrap gap-4">
                        <Link
                            href="/download"
                            className={`px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] ${isFormal ? 'bg-primary' : 'bg-secondary hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                                }`}
                        >
                            Download App
                        </Link>
                        <Link
                            href="/booking"
                            className={`px-8 py-4 rounded-full font-semibold border transition-colors ${isFormal
                                ? 'border-primary text-primary hover:bg-primary/10'
                                : 'border-secondary text-secondary hover:bg-secondary/10'
                                }`}
                        >
                            Explore Events
                        </Link>
                        <Link
                            href="/host"
                            className="px-8 py-4 rounded-full font-semibold text-text-muted hover:text-text-primary transition-colors"
                        >
                            Host an Event
                        </Link>
                    </div>
                </div>

                {/* Right Content - Anime Animation */}
                <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center">
                    <AnimeHeroBackground />
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl ${isFormal ? 'bg-primary' : 'bg-secondary'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${isFormal ? 'bg-secondary' : 'bg-primary'}`} />
            </div>
        </section>
    );
};

export default Hero;
