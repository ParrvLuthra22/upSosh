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
                .to(formalTextRef.current, { color: '#000000', fontWeight: 600 }, 0) // Black text on mustard knob
                .to(informalTextRef.current, { color: '#ffffff', fontWeight: 400 }, 0) // White text on black bg
                .to(toggleRef.current, { backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.2)' }, 0);
        } else {
            // Animate to Informal state
            tl.to(knobRef.current, { x: '0%' }, 0)
                .to(formalTextRef.current, { color: '#ffffff', fontWeight: 400 }, 0) // White text on black bg
                .to(informalTextRef.current, { color: '#000000', fontWeight: 600 }, 0) // Black text on mustard knob
                .to(toggleRef.current, { backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.2)' }, 0);
        }
    }, [isFormal]);

    return (
        <div className="flex justify-center w-full mt-24 mb-8">
            <div
                ref={toggleRef}
                onClick={toggleMode}
                className="relative flex items-center justify-between w-64 h-12 px-1 rounded-full cursor-pointer bg-black border border-white/20 transition-colors"
            >
                {/* Sliding Knob */}
                <div
                    ref={knobRef}
                    className="absolute left-1 top-1 w-[calc(50%-4px)] h-10 bg-[#D4A017] rounded-full z-10"
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
