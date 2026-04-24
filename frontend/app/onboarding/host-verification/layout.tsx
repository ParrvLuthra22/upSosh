'use client';

import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const currentStep = getStep(pathname);
  const progress = (currentStep / TOTAL) * 100;

  function handleBack() {
    if (currentStep > 1) {
      router.push(STEPS[currentStep - 2]);
    } else {
      router.push('/onboarding/step-5');
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Accent progress bar */}
      <div className="h-0.5 bg-border relative">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: EASE_VERCEL }}
        />
      </div>

      {/* Top bar */}
      <div className="px-6 md:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-ink-primary">
          UpSosh
        </Link>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-[10px] uppercase text-ink-muted tracking-[0.15em]">
            Host Verification
          </span>
          <span className="font-mono text-[11px] text-ink-muted">
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

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="font-mono text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back
        </button>
        <div id="host-verify-continue-portal" />
      </div>
    </div>
  );
}
