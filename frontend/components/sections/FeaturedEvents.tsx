'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import ImageReveal from '@/components/ui/ImageReveal';
import { EASE_VERCEL, staggerContainer, fadeInUp } from '@/lib/motion';

const EVENTS = [
  {
    title: 'Hyde Park Dawn Runners',
    category: 'Run Club',
    host: 'James K.',
    date: 'Sat 23 Nov',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop&q=80',
    span: 'row-span-2',
  },
  {
    title: 'Soho Dinner Circle',
    category: 'Dinner Club',
    host: 'Amara D.',
    date: 'Fri 22 Nov',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=480&fit=crop&q=80',
    span: '',
  },
  {
    title: 'Creator Strategy Workshop',
    category: 'Workshop',
    host: 'Paulo M.',
    date: 'Sun 24 Nov',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=480&fit=crop&q=80',
    span: '',
  },
  {
    title: 'East London Meetup',
    category: 'Meetup',
    host: 'Sia N.',
    date: 'Thu 21 Nov',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&h=480&fit=crop&q=80',
    span: '',
  },
  {
    title: 'Philosophy & Wine Night',
    category: 'Book Circle',
    host: 'Remi A.',
    date: 'Wed 20 Nov',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=480&fit=crop&q=80',
    span: '',
  },
  {
    title: 'Shoreditch Speed Dating',
    category: 'Social',
    host: 'Layla T.',
    date: 'Tue 19 Nov',
    image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&h=560&fit=crop&q=80',
    span: 'col-span-2',
  },
];

function EventCard({ event, delay = 0 }: { event: typeof EVENTS[number]; delay?: number }) {
  return (
    <motion.article
      className={`group relative rounded-2xl overflow-hidden border border-border bg-bg-secondary ${event.span}`}
      data-cursor="VIEW"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.7, ease: EASE_VERCEL, delay }}
    >
      <div className="relative overflow-hidden aspect-[4/5] md:h-full md:aspect-auto min-h-[280px]">
        <ImageReveal direction="top" delay={delay + 0.1}>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-vercel"
          />
        </ImageReveal>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category tag */}
        <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.15em] bg-bg-primary/90 text-ink-primary px-2.5 py-1.5 rounded-full">
          {event.category}
        </span>
      </div>

      {/* Card info */}
      <div className="p-5 border-t border-border">
        <h3 className="font-display text-xl text-ink-primary leading-snug tracking-tight mb-3">
          {event.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-muted">{event.host}</span>
          <span className="font-mono text-xs text-ink-light">{event.date}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedEvents() {
  const headingRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-bg-primary border-t border-border py-24 md:py-32 px-6 md:px-16">
      {/* Heading */}
      <div ref={headingRef} className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            [ 02 — FEATURED ]
          </motion.p>
          <motion.h2
            className="font-display text-display-lg text-ink-primary leading-[1.0] tracking-tight"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.1 }}
          >
            Happening now.
          </motion.h2>
        </div>
        <motion.a
          href="/booking"
          className="hidden md:block font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          See all events →
        </motion.a>
      </div>

      {/* Magazine grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[300px] md:auto-rows-[260px]">
        {/* Card 1: tall, spans 2 rows */}
        <div className="md:row-span-2">
          <EventCard event={EVENTS[0]} delay={0} />
        </div>

        {/* Cards 2 & 3: normal */}
        <EventCard event={EVENTS[1]} delay={0.05} />
        <EventCard event={EVENTS[2]} delay={0.1} />

        {/* Card 4 & 5: second row fills col 2 & 3 */}
        <EventCard event={EVENTS[3]} delay={0.1} />
        <EventCard event={EVENTS[4]} delay={0.15} />

        {/* Card 6: full width */}
        <div className="md:col-span-3 md:row-span-1 md:h-[220px]">
          <EventCard event={EVENTS[5]} delay={0.2} />
        </div>
      </div>
    </section>
  );
}
