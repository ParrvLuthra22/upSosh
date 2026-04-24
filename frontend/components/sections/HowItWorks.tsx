'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE_VERCEL, fadeInUp, staggerContainer } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    description:
      'Browse curated micro-events near you — filtered by vibe, format, and size. No noise, only signal.',
    detail: 'From morning runs to intimate dinners, every event is vetted by our team for quality and intentionality.',
  },
  {
    num: '02',
    title: 'Book in seconds',
    description:
      'Reserve your spot with a single tap. Transparent pricing, instant confirmation, digital ticket in your pocket.',
    detail: 'No account required to browse. One-click booking for returning members.',
  },
  {
    num: '03',
    title: 'Show up & belong',
    description:
      'Walk in as a stranger, leave as a regular. Every event is designed for real connection, not networking theatre.',
    detail: 'Post-event groups, host ratings, and curated follow-up events keep the momentum alive.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const headingRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headingRef, { once: true, margin: '-10% 0px' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: leftRef.current,
          pinSpacing: false,
        });

        STEPS.forEach((_, i) => {
          ScrollTrigger.create({
            trigger: cardRefs.current[i],
            start: 'top 55%',
            end: 'bottom 45%',
            onEnter: () => setActiveStep(i),
            onEnterBack: () => setActiveStep(i),
          });
        });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-bg-primary border-t border-border">
      {/* Section heading */}
      <div ref={headingRef} className="px-6 md:px-16 pt-24 md:pt-32 pb-16 md:pb-0">
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: EASE_VERCEL }}
        >
          [ 01 — THE FLOW ]
        </motion.p>
        <motion.h2
          className="font-display text-display-lg text-ink-primary max-w-2xl leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.1 }}
        >
          Three steps to your next great evening.
        </motion.h2>
      </div>

      {/* Desktop: sticky left + scrolling right */}
      <div className="hidden md:grid grid-cols-2 min-h-[300vh]">
        {/* Left: pinned */}
        <div ref={leftRef} className="h-screen flex flex-col justify-center px-16">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_VERCEL }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted block mb-4">
              Step {STEPS[activeStep].num}
            </span>
            <p
              className="font-display text-[clamp(5rem,10vw,9rem)] text-ink-primary leading-none tracking-[-0.04em] select-none"
            >
              {STEPS[activeStep].num}
            </p>
            <h3 className="font-display text-4xl text-ink-primary mt-4 mb-4 tracking-tight">
              {STEPS[activeStep].title}
            </h3>
            <p className="font-sans text-base text-ink-muted leading-relaxed max-w-xs">
              {STEPS[activeStep].detail}
            </p>
          </motion.div>
        </div>

        {/* Right: scrolling cards */}
        <div className="py-32 px-8 flex flex-col gap-10 border-l border-border">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`rounded-2xl border transition-all duration-500 p-10 min-h-[380px] flex flex-col justify-between ${
                activeStep === i
                  ? 'border-ink-primary bg-bg-secondary'
                  : 'border-border bg-bg-primary'
              }`}
            >
              <div>
                <span className="font-mono text-xs text-ink-light tracking-widest uppercase">{step.num}</span>
                <h3 className="font-display text-4xl text-ink-primary mt-3 mb-4 tracking-tight leading-tight">
                  {step.title}
                </h3>
                <p className="font-sans text-base text-ink-muted leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </div>
              {/* Mockup placeholder */}
              <div className="mt-8 rounded-xl border border-border bg-bg-primary h-28 flex items-center justify-center">
                <span className="font-mono text-xs text-ink-light tracking-wide">[ {step.title} · mockup ]</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <motion.div
        className="md:hidden px-6 pb-24 flex flex-col gap-6 mt-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
      >
        {STEPS.map((step) => (
          <motion.div
            key={step.num}
            variants={fadeInUp}
            className="rounded-2xl border border-border bg-bg-secondary p-8"
          >
            <span className="font-mono text-xs text-ink-light tracking-widest uppercase">{step.num}</span>
            <h3 className="font-display text-3xl text-ink-primary mt-3 mb-3 tracking-tight">
              {step.title}
            </h3>
            <p className="font-sans text-base text-ink-muted leading-relaxed">
              {step.description}
            </p>
            <div className="mt-6 rounded-xl border border-border bg-bg-primary h-20 flex items-center justify-center">
              <span className="font-mono text-xs text-ink-light">[ {step.title} · mockup ]</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
