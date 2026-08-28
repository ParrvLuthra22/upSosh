import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
// Legacy exports below (EASE_VERCEL, fadeInUp, staggerContainer, blurReveal,
// maskReveal) predate this system and are left untouched — EASE_VERCEL is
// imported in 24 files, fadeInUp/staggerContainer drive 3 live home-page
// sections (Testimonials, AIPlanner, FeaturedEvents). blurReveal/maskReveal
// have zero importers (confirmed) and are dead but harmless.
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

export const staggerContainer: Variants = {
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
 * children. Named `staggerGroup`, not `staggerContainer`: that name is
 * already live (see the legacy block above) with different timing feeding
 * 3 shipped sections. Flagged for the user rather than silently overwritten
 * or silently renamed out from under those call sites — see chat.
 * Cap stagger groups at ~8 children; longer chains make the last item feel
 * late (enforced by the caller slicing its array, not by this primitive).
 */
export function staggerGroup(reduced = false): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.04 } },
  };
}

/** A single item inside a `staggerGroup` — same motion as `fadeUp`, named
 * separately so call sites read intent (child of a stagger) at a glance. */
export function staggerItem(reduced = false): Variants {
  return fadeUp(reduced);
}
