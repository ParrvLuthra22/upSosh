'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

const QUOTES = [
  'Events that actually matter.',
  'Found my running crew here.',
  'Built my community from scratch.',
  'Where strangers become regulars.',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark editorial */}
      <div className="hidden md:flex md:w-1/2 bg-[#0A0A0A] flex-col relative overflow-hidden">
        {/* SVG noise overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
          aria-hidden="true"
        >
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Top — logo */}
        <div className="relative z-10 px-10 pt-10">
          <Link href="/" className="font-display text-xl text-white tracking-tight">
            UpSosh
          </Link>
        </div>

        {/* Center — rotating quotes */}
        <div className="relative z-10 flex-1 flex items-center px-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
              className="font-display italic text-4xl text-white leading-tight"
            >
              {QUOTES[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bottom — trust line */}
        <div className="relative z-10 px-10 pb-10">
          <p className="font-mono text-[10px] text-white/40">
            Trusted by 2,400+ hosts across India
          </p>
        </div>
      </div>

      {/* Right panel — form area */}
      <div className="w-full md:w-1/2 flex flex-col bg-bg-primary">
        {/* Mobile logo bar */}
        <div className="md:hidden bg-[#0A0A0A] h-14 px-6 flex items-center">
          <Link href="/" className="font-display text-xl text-white">
            UpSosh
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
