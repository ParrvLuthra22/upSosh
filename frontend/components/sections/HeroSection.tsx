'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import { IconArrowRight, IconChevronDown } from '@tabler/icons-react';

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Stagger config ───────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

function FadeUp({
  delay,
  children,
  className,
}: {
  delay: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={FADE_UP}
      initial="hidden"
      animate="show"
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ─── Pulsing lime dot ─────────────────────────────────────────────────────────

function PulseDot() {
  return (
    <motion.span
      className="inline-block w-2 h-2 rounded-full bg-lime flex-shrink-0"
      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── Wavy SVG underline for "moments." ───────────────────────────────────────
// Path length ≈ 220px; we animate stroke-dashoffset 220 → 0

const WAVE_PATH = 'M2,8 Q28,2 55,8 Q82,14 110,8 Q137,2 165,8 Q192,14 218,8';

function WavyUnderline() {
  return (
    <svg
      viewBox="0 0 220 16"
      aria-hidden="true"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        bottom: '-6px',
        left: 0,
        width: '100%',
        height: '16px',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <motion.path
        d={WAVE_PATH}
        stroke="var(--lime)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="220"
        initial={{ strokeDashoffset: 220 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
      />
    </svg>
  );
}

// ─── Social proof avatars ─────────────────────────────────────────────────────

const AVATARS = [
  { initials: 'PR', bg: 'var(--lime)', fg: 'var(--void)' },
  { initials: 'AK', bg: 'var(--surface-2)', fg: 'var(--cream)' },
  { initials: 'SN', bg: 'var(--coral)', fg: 'var(--cream)' },
  { initials: 'RV', bg: '#34D399', fg: 'var(--void)' },
  { initials: 'DM', bg: 'var(--surface-2)', fg: 'var(--cream)' },
];

function AvatarStack() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {AVATARS.map(({ initials, bg, fg }, i) => (
        <div
          key={initials}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: bg,
            border: '2px solid var(--void)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginLeft: i === 0 ? 0 : -8,
          }}
        >
          <span style={{ fontSize: 9, color: fg, fontWeight: 700, lineHeight: 1 }}>
            {initials}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── CTA button — primary (Host an event) ────────────────────────────────────

function PrimaryButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        href="/become-a-host"
        className="inline-flex items-center gap-2 rounded-full font-sans font-semibold hover:opacity-90 transition-opacity duration-200"
        style={{
          height: '3.25rem',
          padding: '0 1.75rem',
          backgroundColor: 'var(--lime)',
          color: 'var(--void)',
          fontSize: '15px',
          textDecoration: 'none',
        }}
      >
        Host an event
        <IconArrowRight size={16} strokeWidth={2.5} />
      </Link>
    </motion.div>
  );
}

// ─── CTA button — secondary (Browse events) ───────────────────────────────────

function SecondaryButton() {
  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <Link
        href="/discover"
        className="inline-flex items-center rounded-full font-sans hover:opacity-80 transition-opacity duration-200"
        style={{
          height: '3.25rem',
          padding: '0 1.75rem',
          border: '1px solid rgba(244,241,234,0.40)',
          color: 'var(--cream)',
          fontSize: '15px',
          textDecoration: 'none',
        }}
      >
        Browse events
      </Link>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  // Parallax scroll for "moments." word
  const { scrollY } = useScroll();
  const momentY = useSpring(
    useTransform(scrollY, [0, 600], [0, -30]),
    { stiffness: 120, damping: 30, restDelta: 0.001 },
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-void flex flex-col pt-18"
    >
      {/* Hero content */}
      <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full px-6 mt-16 md:mt-24">

        {/* 1 — Eyebrow */}
        <FadeUp delay={0} className="flex items-center gap-3 mb-8">
          <PulseDot />
          <span className="font-mono text-[11px] uppercase tracking-wider text-cream-dim">
            Made in India · UPI native · Free to start
          </span>
        </FadeUp>

        {/* 2 — H1 */}
        <h1 className="display-xl mb-0 leading-[0.95]" aria-label="Where plans become moments.">
          {/* Line 1 */}
          <FadeUp delay={0.1}>
            <span className="text-cream block">Where plans</span>
          </FadeUp>

          {/* Line 2 — "become " + "moments." with wavy underline */}
          <FadeUp delay={0.2}>
            <span className="block mt-1">
              <span className="text-cream">become </span>
              {/* "moments." — lime italic + parallax + wavy underline */}
              <motion.span
                className="italic text-lime"
                style={{ y: momentY, position: 'relative', display: 'inline-block' }}
              >
                moments.
                <WavyUnderline />
              </motion.span>
            </span>
          </FadeUp>
        </h1>

        {/* 3 — Subhead */}
        <FadeUp delay={0.35} className="mt-8">
          <p className="font-sans text-[20px] text-cream-dim max-w-2xl text-balance leading-relaxed">
            The curated platform for micro-events worth showing up to — native UPI payments, WhatsApp reminders, and attendee tracking built for India.
          </p>
        </FadeUp>

        {/* 4 — CTAs */}
        <FadeUp delay={0.5} className="mt-10 flex flex-wrap items-center gap-4">
          <PrimaryButton />
          <SecondaryButton />
        </FadeUp>

        {/* 5 — Social proof */}
        <FadeUp delay={0.65} className="mt-14 flex items-center gap-4">
          <AvatarStack />
          <p className="font-sans text-[13px] text-cream-dim">
            Trusted by 2,400+ hosts across India
          </p>
        </FadeUp>
      </div>

      {/* Scroll indicator */}
      <div className="flex flex-col items-center gap-2 pb-10 mt-12">
        <motion.p
          className="font-mono text-[10px] uppercase tracking-widest text-cream-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          scroll
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <IconChevronDown size={18} className="text-cream-dim" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
