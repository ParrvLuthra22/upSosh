'use client';

/**
 * components/sections/HowItWorks.tsx
 * ─────────────────────────────────────
 * Three-step explainer — Discover → Book → Show up.
 * Each step is a surface card with a large lime step number, an SVG
 * illustration, and copy.
 *
 * Animations
 *   • Cards stagger in (y:40 → 0, opacity:0 → 1) when the section enters
 *     the viewport. Delay: 0 / 0.15 / 0.30s.
 *   • Step numbers fade in 0.3s after their card.
 *   • Illustrations react on card hover (extra transform / stroke draw).
 */

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── SVG illustrations ────────────────────────────────────────────────────────

/** Step 1 — three event cards fanning out, top card with lime border */
function DiscoverIllustration({ hovered }: { hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 80"
      className="w-full"
      style={{ height: 72 }}
      fill="none"
      aria-hidden="true"
    >
      {/* Back card */}
      <motion.rect
        x="8" y="16" width="44" height="56" rx="5"
        fill="var(--surface-2)"
        stroke="var(--border)"
        strokeWidth="1"
        animate={{ rotate: hovered ? -14 : -10, x: hovered ? 4 : 8 }}
        style={{ transformOrigin: '30px 80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      {/* Mid card */}
      <motion.rect
        x="20" y="10" width="44" height="56" rx="5"
        fill="var(--surface)"
        stroke="var(--border-strong)"
        strokeWidth="1"
        animate={{ rotate: hovered ? -5 : -3, x: hovered ? 0 : 0 }}
        style={{ transformOrigin: '42px 80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      {/* Front card — lime border */}
      <motion.rect
        x="32" y="4" width="44" height="56" rx="5"
        fill="var(--surface)"
        stroke="var(--lime)"
        strokeWidth="1.5"
        animate={{ rotate: hovered ? 3 : 0 }}
        style={{ transformOrigin: '54px 80px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      {/* Front card content lines */}
      <rect x="39" y="14" width="20" height="2.5" rx="1.25" fill="var(--lime)" opacity="0.7" />
      <rect x="39" y="21" width="28" height="2" rx="1" fill="var(--cream)" opacity="0.2" />
      <rect x="39" y="27" width="20" height="2" rx="1" fill="var(--cream)" opacity="0.15" />
      <rect x="39" y="33" width="24" height="2" rx="1" fill="var(--cream)" opacity="0.1" />
    </svg>
  );
}

/** Step 2 — phone outline with a ticket sliding out + lime checkmark */
function BookIllustration({ hovered }: { hovered: boolean }) {
  // Draw-on checkmark via stroke-dashoffset
  const checkLen = 22;

  return (
    <svg
      viewBox="0 0 100 80"
      className="w-full"
      style={{ height: 72 }}
      fill="none"
      aria-hidden="true"
    >
      {/* Phone shell */}
      <rect x="28" y="4" width="36" height="64" rx="6" fill="var(--surface-2)" stroke="var(--border-strong)" strokeWidth="1.2" />
      {/* Screen */}
      <rect x="32" y="10" width="28" height="46" rx="3" fill="var(--surface)" />
      {/* Home notch */}
      <rect x="42" y="58" width="8" height="2" rx="1" fill="rgba(244,241,234,0.2)" />

      {/* Ticket sliding out (lime card) */}
      <motion.g
        animate={{ y: hovered ? -6 : 0, opacity: hovered ? 1 : 0.85 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <rect x="34" y="16" width="24" height="32" rx="3" fill="var(--surface)" stroke="var(--lime)" strokeWidth="1.2" />
        {/* Ticket perforation line */}
        <line x1="34" y1="36" x2="58" y2="36" stroke="var(--lime)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
        {/* Ticket lines */}
        <rect x="38" y="21" width="14" height="2" rx="1" fill="var(--lime)" opacity="0.6" />
        <rect x="38" y="26" width="10" height="1.5" rx="0.75" fill="var(--cream)" opacity="0.2" />
        {/* Lime checkmark — draws on hover */}
        <motion.path
          d="M38 42 L43 47 L55 35"
          stroke="var(--lime)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${checkLen}`}
          animate={{ strokeDashoffset: hovered ? 0 : checkLen }}
          transition={{ duration: 0.45, ease: EASE }}
        />
      </motion.g>
    </svg>
  );
}

/** Step 3 — three overlapping circles (people) with lime sparkle at centre */
function ShowUpIllustration({ hovered }: { hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 100 80"
      className="w-full"
      style={{ height: 72 }}
      fill="none"
      aria-hidden="true"
    >
      {/* Three overlapping person circles */}
      <motion.circle
        cx="35" cy="42" r="18"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="1.2"
        animate={{ cx: hovered ? 31 : 35 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      <motion.circle
        cx="50" cy="40" r="18"
        fill="var(--surface)"
        stroke="rgba(244,241,234,0.24)"
        strokeWidth="1.2"
        animate={{ scale: hovered ? 1.06 : 1 }}
        style={{ transformOrigin: '50px 40px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      <motion.circle
        cx="65" cy="42" r="18"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="1.2"
        animate={{ cx: hovered ? 69 : 65 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />

      {/* Head silhouettes */}
      <circle cx="35" cy="38" r="5" fill="rgba(244,241,234,0.15)" />
      <path d="M26 52 Q35 46 44 52" stroke="rgba(244,241,234,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy="36" r="5" fill="rgba(244,241,234,0.2)" />
      <path d="M41 50 Q50 44 59 50" stroke="rgba(244,241,234,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="65" cy="38" r="5" fill="rgba(244,241,234,0.15)" />
      <path d="M56 52 Q65 46 74 52" stroke="rgba(244,241,234,0.15)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Lime sparkle at intersection — rotates on hover */}
      <motion.g
        style={{ transformOrigin: '50px 40px' }}
        animate={{ rotate: hovered ? 45 : 0, scale: hovered ? 1.25 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      >
        {/* 4-point star */}
        <path
          d="M50 33 L51.5 38 L57 40 L51.5 42 L50 47 L48.5 42 L43 40 L48.5 38 Z"
          fill="var(--lime)"
          opacity={hovered ? 1 : 0.85}
        />
      </motion.g>
    </svg>
  );
}

// ─── Step data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Discover',
    body: 'Browse curated micro-events near you — filtered by vibe, format, and size. No noise, only signal.',
    Illustration: DiscoverIllustration,
  },
  {
    num: '02',
    title: 'Book',
    body: 'Reserve your spot with a single tap. Transparent pricing, instant confirmation, digital ticket.',
    Illustration: BookIllustration,
  },
  {
    num: '03',
    title: 'Show up',
    body: 'Walk in as a stranger, leave as a regular. Every event designed for real connection.',
    Illustration: ShowUpIllustration,
  },
] as const;

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({
  step,
  delay,
  inView,
}: {
  step: (typeof STEPS)[number];
  delay: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { Illustration } = step;

  return (
    <motion.div
      className="bg-surface border border-border rounded-3xl p-8 h-full flex flex-col"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: EASE, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Step number */}
      <motion.p
        className="font-display leading-none text-lime select-none mb-6"
        style={{ fontSize: 96, fontWeight: 300, lineHeight: 1 }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, ease: EASE, delay: delay + 0.3 }}
      >
        {step.num}
      </motion.p>

      {/* SVG illustration */}
      <div className="mb-8">
        <Illustration hovered={hovered} />
      </div>

      {/* Text */}
      <div className="mt-auto">
        <h3
          className="font-display text-cream mb-3 leading-tight"
          style={{ fontSize: 24, fontWeight: 400 }}
        >
          {step.title}
        </h3>
        <p
          className="font-sans text-cream-dim"
          style={{ fontSize: 15, lineHeight: 1.7 }}
        >
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <section
      ref={ref}
      className="bg-void border-t border-border py-24 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="label text-lime mb-4">01 — THE FLOW</p>
          <h2 className="display-md text-cream text-balance max-w-xl">
            Three steps. One great evening.
          </h2>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.num}
              step={step}
              delay={i * 0.15}
              inView={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
