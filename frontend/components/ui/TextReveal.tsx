'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_VERCEL, useReducedMotion } from '@/lib/motion';

interface TextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  splitBy?: 'words' | 'chars';
  delay?: number;
  stagger?: number;
  once?: boolean;
}

export default function TextReveal({
  text,
  as: Tag = 'p',
  className,
  splitBy = 'words',
  delay = 0,
  stagger = 0.06,
  once = true,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: '-10% 0px' });
  const reduced = useReducedMotion();

  const units = splitBy === 'words' ? text.split(' ') : text.split('');
  const sep = splitBy === 'words' ? ' ' : '';

  const AnyTag = Tag as React.ElementType;

  return (
    <AnyTag ref={ref as React.Ref<HTMLElement>} className={className} aria-label={text}>
      {units.map((unit, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            aria-hidden
            style={{ display: 'inline-block' }}
            initial={{ opacity: 0, y: reduced ? '0%' : '110%' }}
            animate={
              inView
                ? { opacity: 1, y: '0%' }
                : { opacity: 0, y: reduced ? '0%' : '110%' }
            }
            transition={
              reduced
                ? { duration: 0.1, delay: delay + i * (stagger / 3) }
                : { duration: 0.65, ease: EASE_VERCEL, delay: delay + i * stagger }
            }
          >
            {unit}
          </motion.span>
          {i < units.length - 1 && sep && (
            <span aria-hidden style={{ display: 'inline-block' }}>{sep}</span>
          )}
        </span>
      ))}
    </AnyTag>
  );
}
