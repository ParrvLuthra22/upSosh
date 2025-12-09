'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useAppStore } from '@/src/store/useAppStore';

const FormalInformalToggle = () => {
    const { isFormal, toggleMode } = useAppStore();
    const toggleRef = useRef<HTMLDivElement>(null);
    const knobRef = useRef<HTMLDivElement>(null);
    const formalTextRef = useRef<HTMLSpanElement>(null);
    const informalTextRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!toggleRef.current || !knobRef.current) return;

        const tl = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' } });

        if (isFormal) {
            // Animate to Formal state
            tl.to(knobRef.current, { x: '100%' }, 0)
                .to(formalTextRef.current, { color: '#ffffff', fontWeight: 600 }, 0)
                .to(informalTextRef.current, { color: '#94a3b8', fontWeight: 400 }, 0)
                .to(toggleRef.current, { backgroundColor: '#3B82F6' }, 0); // Blue for formal
        } else {
            // Animate to Informal state
            tl.to(knobRef.current, { x: '0%' }, 0)
                .to(formalTextRef.current, { color: '#94a3b8', fontWeight: 400 }, 0)
                .to(informalTextRef.current, { color: '#ffffff', fontWeight: 600 }, 0)
                .to(toggleRef.current, { backgroundColor: '#A855F7' }, 0); // Purple for informal
        }
    }, [isFormal]);

    return (
        <div className="flex justify-center w-full mt-24 mb-8">
            <div
                ref={toggleRef}
                onClick={toggleMode}
                className="relative flex items-center justify-between w-64 h-12 px-1 rounded-full cursor-pointer bg-secondary shadow-lg transition-colors"
            >
                {/* Sliding Knob */}
                <div
                    ref={knobRef}
                    className="absolute left-1 top-1 w-[calc(50%-4px)] h-10 bg-white rounded-full shadow-md z-10"
                />

                {/* Labels */}
                <span
                    ref={informalTextRef}
                    className="relative z-20 w-1/2 text-center text-sm transition-colors select-none"
                >
                    Informal
                </span>
                <span
                    ref={formalTextRef}
                    className="relative z-20 w-1/2 text-center text-sm transition-colors select-none"
                >
                    Formal
                </span>
            </div>
        </div>
    );
};

export default FormalInformalToggle;
