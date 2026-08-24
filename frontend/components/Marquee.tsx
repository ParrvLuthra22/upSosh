'use client';

/**
 * components/Marquee.tsx
 * ───────────────────────
 * Full-bleed horizontal ticker that breaks out of any container width.
 *
 * Props
 *   items   – string array; duplicated internally to hide the loop seam
 *   speed   – seconds for one full pass (default 40)
 *   reverse – scrolls right-to-left when false (default), left-to-right when true
 *   accent  – colour theme: 'cream' (all cream), 'lime' (alternating lime/cream),
 *             'coral' (all coral)
 *
 * Implementation notes
 *   • The track holds 2× the items array. At exactly 50% scroll the duplicate
 *     lines up with the start — CSS linear animation then loops invisibly.
 *   • Framer Motion is used only for the mount fade-in; the scroll itself uses
 *     CSS `animation-play-state` (most reliable for mid-animation pause).
 *   • Pause-on-hover is handled via a React state toggle that sets
 *     `animationPlayState: 'paused'` via inline style — no jump on resume.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarqueeProps {
  items: string[];
  speed?: number;
  reverse?: boolean;
  accent?: 'lime' | 'cream' | 'coral';
  className?: string;
}

// ─── Per-item colour ──────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<NonNullable<MarqueeProps['accent']>, string[]> = {
  cream:  ['var(--cream)'],
  coral:  ['var(--coral)'],
  // lime accent alternates lime → cream on each item
  lime:   ['var(--lime)', 'var(--cream)'],
};

function itemColor(accent: NonNullable<MarqueeProps['accent']>, index: number): string {
  const palette = ACCENT_COLORS[accent];
  return palette[index % palette.length];
}

// ─── Separator glyph ─────────────────────────────────────────────────────────

function Sep({ color }: { color: string }) {
  return (
    <span
      className="mx-6 md:mx-10 select-none flex-shrink-0 inline-block leading-none"
      style={{ color, opacity: 0.45, fontSize: '1.5rem' }}
      aria-hidden="true"
    >
      ✦
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Marquee({
  items,
  speed = 40,
  reverse = false,
  accent = 'cream',
  className,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  // Double the array — the seam is hidden at the 50% mark
  const doubled = [...items, ...items];

  // CSS animation name comes from globals.css keyframes
  const animName = reverse ? 'marquee-right' : 'marquee-left';

  const trackStyle: React.CSSProperties = {
    animationName: animName,
    animationDuration: `${speed}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationPlayState: paused ? 'paused' : 'running',
    willChange: 'transform',
  };

  return (
    <motion.div
      className={`w-screen border-y border-border overflow-hidden ${className ?? ''}`}
      // Break out of any padded container
      style={{
        marginLeft: 'calc(-50vw + 50%)',
        height: undefined,
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-hidden="true"
    >
      {/* Height: 80px mobile, 120px desktop */}
      <div
        className="h-20 md:h-[120px] flex items-center select-none"
        style={{ display: 'flex', overflow: 'hidden' }}
      >
        <div
          className="flex items-center flex-shrink-0"
          style={trackStyle}
        >
          {doubled.map((item, i) => {
            const color = itemColor(accent, i);
            return (
              <span key={`${item}-${i}`} className="flex items-center flex-shrink-0">
                <span
                  className="font-display italic whitespace-nowrap"
                  style={{
                    color,
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {item}
                </span>
                <Sep color={color} />
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
