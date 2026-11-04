'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

const STEPS = [
  '/onboarding/host-verification/identity',
  '/onboarding/host-verification/profile',
  '/onboarding/host-verification/sample-event',
  '/onboarding/host-verification/review',
];
const TOTAL = STEPS.length;
const STEP_LABELS = ['identity', 'profile', 'sample-event', 'review'];

function getStep(pathname: string): number {
  const idx = STEPS.findIndex((s) => pathname.startsWith(s));
  return idx === -1 ? 1 : idx + 1;
}

export default function HostVerificationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = getStep(pathname);
  const progress = (currentStep / TOTAL) * 100;

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Accent progress bar */}
      <div className="h-0.5 bg-border relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-lime"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: EASE_VERCEL }}
        />
      </div>

      {/* Top bar */}
      <div className="px-6 md:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-cream">
          UpSosh
        </Link>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[10px] uppercase text-cream-dim tracking-[0.15em]">
            Host Verification
          </span>
          <span className="font-mono text-[11px] text-cream-dim">
            Step {currentStep} of {TOTAL}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[640px] mx-auto w-full px-6 pt-10 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: EASE_VERCEL }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
