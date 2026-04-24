'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

const HEADLINE_WORDS = ['Where', 'plans', 'become'];

const EVENTS = [
  {
    title: 'Morning Run Club',
    category: 'Run Club',
    date: 'Sat · 7AM',
    spots: '4 spots left',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=560&fit=crop&q=80',
  },
  {
    title: 'Soho Dinner Circle',
    category: 'Dinner Club',
    date: 'Fri · 7:30PM',
    spots: '8 spots left',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=560&fit=crop&q=80',
  },
  {
    title: 'Brand Strategy Workshop',
    category: 'Workshop',
    date: 'Sun · 2PM',
    spots: '12 spots left',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=560&fit=crop&q=80',
  },
  {
    title: 'Creator Meetup LDN',
    category: 'Meetup',
    date: 'Thu · 6PM',
    spots: '2 spots left',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=560&fit=crop&q=80',
  },
];

const PARALLAX_OFFSETS = [
  [0, -80] as [number, number],
  [0, -40] as [number, number],
  [0, -100] as [number, number],
  [0, -60] as [number, number],
];

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const y0 = useTransform(scrollYProgress, [0, 1], PARALLAX_OFFSETS[0]);
  const y1 = useTransform(scrollYProgress, [0, 1], PARALLAX_OFFSETS[1]);
  const y2 = useTransform(scrollYProgress, [0, 1], PARALLAX_OFFSETS[2]);
  const y3 = useTransform(scrollYProgress, [0, 1], PARALLAX_OFFSETS[3]);
  const yValues = [y0, y1, y2, y3];

  const globalOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-bg-primary flex flex-col overflow-hidden"
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 pt-36 md:pt-44 pb-4">
        {/* Eyebrow */}
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_VERCEL, delay: 0.1 }}
        >
          [ The social layer for real-life experiences ]
        </motion.p>

        {/* Headline */}
        <h1 className="font-display font-normal text-ink-primary text-display-hero leading-[0.95] tracking-[-0.04em] mb-8 md:mb-10">
          {HEADLINE_WORDS.map((word, i) => (
            <span key={word} className="inline-block overflow-hidden mr-[0.22em] last:mr-0">
              <motion.span
                className="inline-block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: EASE_VERCEL, delay: 0.2 + i * 0.07 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
          <br className="hidden md:block" />
          <span className="inline-block overflow-hidden">
            <motion.span
              className="inline-block italic text-accent"
              initial={{ y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: EASE_VERCEL, delay: 0.41 }}
            >
              moments.
            </motion.span>
          </span>
        </h1>

        {/* Sub-headline + CTAs */}
        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
          <motion.p
            className="font-sans text-lg text-ink-muted leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.65 }}
          >
            The curated platform for micro-events — run clubs, meetups, and creator gatherings worth showing up to.
          </motion.p>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.75 }}
          >
            <MagneticButton>
              <a
                href="/discover"
                data-cursor="BROWSE"
                className="font-sans text-sm font-medium bg-accent text-white px-6 py-3 rounded-full hover:bg-ink-primary transition-colors duration-300"
              >
                Browse events →
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      {/* Parallax event strip */}
      <motion.div
        style={{ opacity: globalOpacity }}
        className="pb-10 md:pb-14 pt-8"
      >
        <motion.div
          className="flex gap-4 px-6 md:px-16 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_VERCEL, delay: 1.0 }}
        >
          {EVENTS.map((event, i) => (
            <motion.div
              key={event.title}
              style={{ y: yValues[i] }}
              className="flex-shrink-0 w-48 md:w-60 rounded-2xl overflow-hidden border border-border bg-bg-secondary group"
              data-cursor="VIEW"
            >
              <div className="relative overflow-hidden h-44 md:h-56">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-vercel"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-widest bg-bg-primary/90 text-ink-primary px-2 py-1 rounded-full">
                  {event.category}
                </span>
              </div>
              <div className="p-4">
                <p className="font-display text-sm text-ink-primary leading-snug mb-2">{event.title}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-muted">{event.date}</span>
                  <span className="font-mono text-[11px] text-accent">{event.spots}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        style={{ opacity: globalOpacity }}
      >
        <motion.div
          className="w-px h-10 bg-ink-light"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top' }}
        />
      </motion.div>
    </section>
  );
}
