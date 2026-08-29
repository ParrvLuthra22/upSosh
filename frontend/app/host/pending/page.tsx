'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE_VERCEL, useReducedMotion } from '@/lib/motion';

function PulsingDots() {
  const reduced = useReducedMotion();
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-lime"
          animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={
            reduced
              ? undefined
              : { duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }
          }
        />
      ))}
    </div>
  );
}

const STATUS_STEPS = [
  { label: 'Submitted', done: true },
  { label: 'Under review', current: true },
  { label: 'Approved', done: false },
];

export default function HostPendingPage() {
  const reduced = useReducedMotion();
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center space-y-10">
        {/* Pulsing dots */}
        <div className="flex justify-center">
          <PulsingDots />
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: reduced ? 0 : 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.1 : 0.6, ease: EASE_VERCEL }}
            className="font-display text-5xl text-cream"
          >
            You're in the queue.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.1, duration: reduced ? 0.1 : 0.6, ease: EASE_VERCEL }}
            className="font-sans text-base text-cream-dim"
          >
            We're reviewing your submission. Average wait: 36 hours.
          </motion.p>
        </div>

        {/* Status timeline */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.2, duration: reduced ? 0.1 : 0.6, ease: EASE_VERCEL }}
          className="text-left inline-block"
        >
          <div className="flex flex-col gap-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-stretch gap-4">
                {/* Icon + vertical line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                      step.done
                        ? 'bg-verified'
                        : step.current
                        ? 'border-2 border-lime'
                        : 'border-2 border-border bg-surface'
                    }`}
                  >
                    {step.done && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {step.current && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-lime"
                        animate={reduced ? undefined : { opacity: [0.4, 1, 0.4] }}
                        transition={reduced ? undefined : { duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>

                {/* Label */}
                <div className="pb-5">
                  <p
                    className={`font-sans text-sm mt-0.5 ${
                      step.done
                        ? 'text-verified font-medium'
                        : step.current
                        ? 'text-cream font-medium'
                        : 'text-cream-dim'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.3, duration: reduced ? 0.1 : 0.6, ease: EASE_VERCEL }}
        >
          <Link
            href="/discover"
            className="inline-block font-sans text-sm bg-cream text-void px-8 py-3.5 rounded-full hover:bg-lime transition-colors duration-300"
          >
            Browse events while you wait
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
