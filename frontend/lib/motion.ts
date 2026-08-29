import { useEffect, useRef, useState } from 'react';
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// Legacy exports below (EASE_VERCEL, fadeInUp, legacyStagger, blurReveal,
// maskReveal) predate this system and are left untouched — EASE_VERCEL is
// imported in 24 files, fadeInUp/legacyStagger drive 2 live home-page
// sections (Testimonials, AIPlanner). blurReveal/maskReveal have zero
// importers (confirmed) and are dead but harmless.
//
// legacyStagger was named `staggerContainer` until the animation-system
// brief asked for that exact name on the new stagger-orchestrator function
// below — renamed here (not the new one) so the brief's literal name wins
// and nothing has to keep working around the collision.
//
// New code should use `duration`/`ease`/the variant functions below instead
// of writing inline transition objects — that scattering is how the color
// system drifted, and motion will drift the same way.
// ─────────────────────────────────────────────────────────────────────────

const legacyEase = [0.22, 1, 0.36, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: legacyEase },
  },
};

export const legacyStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const blurReveal: Variants = {
  hidden: { opacity: 0, filter: 'blur(12px)', y: 16 },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.8, ease: legacyEase },
  },
};

export const maskReveal: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.9, ease: legacyEase },
  },
};

export const EASE_VERCEL = legacyEase;

// Shared box-shadow values for framer-motion animation targets (whileHover,
// animate, etc.) — these can't be Tailwind classes since Motion animates the
// raw CSS value, not a static utility class.
export const SHADOW_PANEL = '0 16px 40px rgba(10,10,10,0.08)';
export const SHADOW_GLOW_LIME = '0 0 32px rgba(212,255,63,0.4)';

// ─────────────────────────────────────────────────────────────────────────
// Animation system — the single source of truth going forward. Only animate
// transform and opacity (never width/height/top/left/box-shadow — those
// drop frames). Entrances 200-300ms, exits 150-200ms, travel 8-16px.
// ─────────────────────────────────────────────────────────────────────────

export const duration = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  deliberate: 0.8,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  spring: { type: 'spring', stiffness: 400, damping: 30 },
  softSpring: { type: 'spring', stiffness: 200, damping: 25 },
} as const;

/**
 * Wraps framer-motion's own hook so every component reads reduced-motion
 * state through this module rather than importing 'framer-motion' directly
 * — keeps the detection strategy swappable in one place later.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

// Each variant is a function of `reduced` rather than a static object: under
// reduced motion the element still appears (opacity 0 -> 1, near-instant),
// it's never just deleted. Call sites: variants={fadeUp(prefersReduced)}.

export function fadeUp(reduced = false): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: duration.instant } } };
  }
  return {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  };
}

export function fadeIn(reduced = false): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: reduced ? duration.instant : duration.fast, ease: ease.out } },
  };
}

export function scaleIn(reduced = false): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: duration.instant } } };
  }
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.out } },
  };
}

export function slideInRight(reduced = false): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: duration.instant } } };
  }
  return {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0, transition: { duration: duration.base, ease: ease.out } },
  };
}

/**
 * Parent orchestrator for staggered entrances — pair with `staggerItem` on
 * children. The legacy stagger export (different timing, 2 shipped
 * sections) was renamed to `legacyStagger` to free up this name.
 * Cap stagger groups at ~8 children; longer chains make the last item feel
 * late (enforced by the caller slicing its array, not by this primitive).
 */
export function staggerContainer(reduced = false): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.04 } },
  };
}

/** A single item inside a `staggerContainer` — same motion as `fadeUp`, named
 * separately so call sites read intent (child of a stagger) at a glance. */
export function staggerItem(reduced = false): Variants {
  return fadeUp(reduced);
}

/**
 * Animates a displayed integer from its previous value to `value` over
 * `durationMs` — for a price, count, or capacity figure that changes in
 * place (guest stepper, live total) rather than mounting fresh. Distinct
 * from a mount-triggered count-up (0 -> target on scroll-into-view,
 * hand-rolled per call site elsewhere in the app): this one re-fires from
 * wherever the number currently sits every time `value` changes.
 * Under reduced motion, snaps straight to the new value — no ticking.
 */
export function useCountTransition(value: number, durationMs = 300): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    if (reduced) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }

    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, reduced]);

  return display;
}

/**
 * A determinate-feeling progress value (0-`ceiling`) for an operation with
 * no real server-reported progress — a single POST awaiting a response,
 * like a payment submission. An indefinite spinner tells the user nothing;
 * this eases toward `ceiling` while `active` is true and never quite
 * reaches it, so it reads as "this is happening and getting closer"
 * instead of "wait, no idea how long." Resets to 0 when `active` goes
 * false so the next submission starts clean. Under reduced motion, jumps
 * straight to `ceiling` rather than easing.
 */
export function useFakeProgress(active: boolean, ceiling = 92): number {
  const [progress, setProgress] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    if (reduced) {
      setProgress(ceiling);
      return;
    }
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsedSeconds = (now - start) / 1000;
      setProgress(ceiling * (1 - Math.exp(-elapsedSeconds / 1.2)));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, ceiling, reduced]);

  return progress;
}
