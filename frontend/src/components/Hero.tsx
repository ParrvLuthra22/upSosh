'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import FloatingMesh3D from './FloatingMesh3D';

const Hero = () => {
    const heroRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.animate-hero-text',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: 'power3.out',
                    delay: 0.2
                }
            );

            gsap.fromTo(
                '.hero-mesh',
                { opacity: 0 },
                { opacity: 1, duration: 2, ease: 'power2.inOut' }
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-background">

            {/* 3D Background Element - Subtle & Premium */}
            <div className="absolute inset-0 z-0 hero-mesh">
                <FloatingMesh3D />
            </div>

            <div className="container mx-auto px-6 max-w-5xl text-center z-10">
                <div ref={textRef} className="space-y-8">

                    {/* H1 - Premium Editorial Typography */}
                    <h1 className="animate-hero-text text-display font-semibold tracking-tighter text-foreground leading-[1.05]">
                        Discover and book curated events, <br className="hidden md:block" />
                        <span className="text-foreground/80 font-medium italic">hosted by real people.</span>
                    </h1>

                    {/* Subtext - Elegant & Readable */}
                    <p className="animate-hero-text text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                        From intimate gatherings to professional workshops.
                        Experience the human side of booking.
                    </p>

                    {/* Primary CTA - Premium Button */}
                    <div className="animate-hero-text pt-8 flex justify-center">
                        <Link
                            href="/booking"
                            className="group relative px-10 py-5 bg-foreground text-background rounded-full font-medium text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Explore & Book Events
                                <svg
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-editorial" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
