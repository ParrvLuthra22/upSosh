'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/src/store/useAppStore';
import FloatingMesh3D from '@/src/components/FloatingMesh3D';
import SplineToggle from './SplineToggle';
import Link from 'next/link';

const Hero = () => {
    const { isFormal } = useAppStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Text Content Animation (Fade out/in)
            gsap.fromTo(
                [headlineRef.current, subtextRef.current],
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [isFormal]);

    // Animated text variants for VT323 pixel keywords
    const keywordVariants = {
        hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
        visible: { 
            opacity: 1, 
            y: 0, 
            filter: 'blur(0px)',
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }
        },
        exit: { 
            opacity: 0, 
            y: -20, 
            filter: 'blur(4px)',
            transition: {
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 overflow-hidden bg-black"
        >
            <div className="w-full relative z-20">
                <SplineToggle />
            </div>
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left Content */}
                <div className="space-y-8 z-10">
                    {/* Hero Heading - Playfair Display */}
                    <h1
                        ref={headlineRef}
                        className="font-serif font-bold leading-tight text-white"
                        style={{ 
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                            lineHeight: '1.05',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            Switch Up Your
                        </motion.span>
                        {/* Animated Keyword - VT323 Pixel Font */}
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isFormal ? 'formal' : 'informal'}
                                className="font-pixel inline-block text-[#D4A017] uppercase"
                                style={{ 
                                    fontFamily: 'VT323, monospace',
                                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                                    letterSpacing: '0.05em',
                                    textShadow: '0 0 40px rgba(212, 160, 23, 0.3)'
                                }}
                                variants={keywordVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {isFormal ? 'PROFESSIONAL NETWORK' : 'SOCIAL EXPERIENCES'}
                            </motion.span>
                        </AnimatePresence>
                    </h1>

                    {/* Subtext - Inter body font */}
                    <p
                        ref={subtextRef}
                        className="text-lg md:text-xl max-w-lg font-sans"
                        style={{ 
                            color: 'rgba(255, 255, 255, 0.75)',
                            lineHeight: '1.75',
                            letterSpacing: '-0.01em'
                        }}
                    >
                        {isFormal
                            ? 'Discover workshops, conferences, and networking events curated for your career growth.'
                            : 'Find the hottest house parties, underground gigs, and social meetups happening right now.'}
                    </p>

                    {/* CTA Buttons - Inter font */}
                    <motion.div 
                        ref={ctaRef} 
                        className="flex flex-wrap gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <Link
                            href="/booking"
                            className="px-8 py-4 rounded-full font-sans font-semibold bg-[#D4A017] text-black transition-all duration-300 ease-in-out hover:bg-[#E5B020] hover:shadow-[0_4px_20px_rgba(212,160,23,0.25)] hover:-translate-y-0.5"
                            style={{ letterSpacing: '0.02em' }}
                        >
                            Explore Events
                        </Link>
                        <Link
                            href="/host"
                            className="px-8 py-4 rounded-full font-sans font-semibold border-2 border-[#D4A017] text-[#D4A017] transition-all duration-300 ease-in-out hover:bg-[#D4A017] hover:text-black hover:-translate-y-0.5"
                            style={{ letterSpacing: '0.02em' }}
                        >
                            Host an Event
                        </Link>
                    </motion.div>
                </div>

                {/* Right Content - 3D Floating Mesh */}
                <div className="relative h-[500px] lg:h-[700px] w-full flex items-center justify-center">
                    <FloatingMesh3D />
                </div>
            </div>

            {/* Background Elements - mustard accent circles */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-[#D4A017]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl bg-[#D4A017]" />
            </div>
        </section>
    );
};

export default Hero;
