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

    // Animated text variants for Jersey 10 keywords
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
                    <h1
                        ref={headlineRef}
                        className="display-xl md:text-7xl font-heading font-bold leading-tight text-white"
                        style={{ fontFamily: 'var(--font-heading)' }}
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            Switch Up Your
                        </motion.span>
                        <br />
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isFormal ? 'formal' : 'informal'}
                                className="jersey-animated inline-block"
                                style={{ fontFamily: 'var(--font-heading)', color: '#D4A017' }}
                                variants={keywordVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {isFormal ? 'Professional Network' : 'Social Experiences'}
                            </motion.span>
                        </AnimatePresence>
                    </h1>

                    <p
                        ref={subtextRef}
                        className="text-lg md:text-xl max-w-lg text-white/70 font-body"
                        style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}
                    >
                        {isFormal
                            ? 'Discover workshops, conferences, and networking events curated for your career growth.'
                            : 'Find the hottest house parties, underground gigs, and social meetups happening right now.'}
                    </p>

                    <motion.div 
                        ref={ctaRef} 
                        className="flex flex-wrap gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    >
                        <button
                            onClick={() => alert('Coming Soon! 🚀')}
                            className="px-8 py-4 rounded-full font-semibold bg-[#D4A017] text-black transition-all duration-300 ease-in-out hover:bg-[#E5B020] hover:shadow-[0_4px_20px_rgba(212,160,23,0.25)] hover:-translate-y-0.5"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Download App
                        </button>
                        <Link
                            href="/booking"
                            className="px-8 py-4 rounded-full font-semibold border-2 border-[#D4A017] text-[#D4A017] transition-all duration-300 ease-in-out hover:bg-[#D4A017] hover:text-black hover:-translate-y-0.5"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            Explore Events
                        </Link>
                        <Link
                            href="/host"
                            className="px-8 py-4 rounded-full font-semibold text-white/60 transition-colors duration-300 ease-in-out hover:text-[#D4A017]"
                            style={{ fontFamily: 'var(--font-heading)' }}
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
