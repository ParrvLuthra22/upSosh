'use client';

import { useRef, ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
  once?: boolean;
}

const clipStart: Record<string, string> = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  top: 'inset(100% 0 0 0)',
  bottom: 'inset(0 0 100% 0)',
};

export default function ImageReveal({
  children,
  className,
  direction = 'left',
  delay = 0,
  duration = 0.9,
  once = true,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-5% 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: clipStart[direction] }}
      animate={inView ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: clipStart[direction] }}
      transition={{ duration, ease: EASE_VERCEL, delay }}
      style={{ willChange: 'clip-path' }}
    >
      {children}
    </motion.div>
  );
}
