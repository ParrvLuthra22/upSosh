'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import MagneticButton from '@/components/ui/MagneticButton';

const INTERESTS = [
  'Run Clubs',
  'Creator Meetups',
  'Workshops',
  'Dinner Clubs',
  'Book Clubs',
  'Yoga & Wellness',
  'Live Music',
  'Art & Culture',
  'Tech & Startups',
  'Photography',
  'Food & Drink',
  'Networking',
];

export default function OnboardingStep2() {
  const router = useRouter();
  const { interests: savedInterests, update } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>(savedInterests);

  const canContinue = selected.length >= 3;

  function toggle(interest: string) {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  function handleContinue() {
    update({ interests: selected });
    router.push('/onboarding/step-3');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-5xl text-ink-primary leading-tight">
            What are you into?
          </h1>
          <span
            className={`font-mono text-[11px] transition-colors duration-200 ${
              canContinue ? 'text-accent' : 'text-ink-muted'
            }`}
          >
            {selected.length} selected
          </span>
        </div>
        <p className="font-sans text-sm text-ink-muted">
          Pick at least 3. We'll tailor your feed.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INTERESTS.map((interest, i) => {
          const isSelected = selected.includes(interest);
          return (
            <motion.button
              key={interest}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(interest)}
              className={`border rounded-2xl px-4 py-3 font-sans text-sm text-left flex items-center gap-2 transition-all duration-200 ${
                isSelected
                  ? 'border-accent bg-accent/[0.08] text-ink-primary'
                  : 'border-border bg-bg-primary text-ink-muted hover:bg-bg-secondary'
              }`}
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-accent text-xs flex-shrink-0"
                >
                  ✓
                </motion.span>
              )}
              {interest}
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/step-1')}
          className="font-mono text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back
        </button>
        <MagneticButton>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-ink-primary text-bg-primary font-sans text-sm font-medium px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors duration-300"
          >
            Continue
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
