import type { Variants } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
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
    transition: { duration: 0.8, ease },
  },
};

export const maskReveal: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  visible: {
    clipPath: 'inset(0 0% 0 0)',
    transition: { duration: 0.9, ease },
  },
};

export const EASE_VERCEL = ease;

// Shared box-shadow values for framer-motion animation targets (whileHover,
// animate, etc.) — these can't be Tailwind classes since Motion animates the
// raw CSS value, not a static utility class.
export const SHADOW_PANEL = '0 16px 40px rgba(10,10,10,0.08)';
export const SHADOW_GLOW_LIME = '0 0 32px rgba(212,255,63,0.4)';
