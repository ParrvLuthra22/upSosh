'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import MagneticButton from '@/components/ui/MagneticButton';

type GroupSize = 'intimate' | 'larger' | '';
type Vibe = 'chill' | 'structured' | '';
type Frequency = 'weekly' | 'occasional' | '';

interface CardOption<T> {
  value: T;
  title: string;
  subtitle: string;
}

function PreferenceCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: CardOption<T>;
  selected: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.value)}
      className={`relative flex-1 border rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-accent bg-accent/[0.06]'
          : 'border-border bg-bg-primary hover:bg-bg-secondary'
      }`}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
        >
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
      <p className="font-display text-base text-ink-primary">{option.title}</p>
      <p className="font-sans text-xs text-ink-muted mt-1">{option.subtitle}</p>
    </motion.div>
  );
}

export default function OnboardingStep4() {
  const router = useRouter();
  const { groupSize: savedGroupSize, vibe: savedVibe, frequency: savedFrequency, update } = useOnboardingStore();
  const [groupSize, setGroupSize] = useState<GroupSize>(savedGroupSize);
  const [vibe, setVibe] = useState<Vibe>(savedVibe);
  const [frequency, setFrequency] = useState<Frequency>(savedFrequency);

  const canContinue = groupSize !== '' && vibe !== '' && frequency !== '';

  function handleContinue() {
    update({ groupSize, vibe, frequency });
    router.push('/onboarding/step-5');
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          How do you like to gather?
        </h1>
      </div>

      {/* Group size */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
          Group size
        </p>
        <div className="flex gap-3">
          <PreferenceCard
            option={{ value: 'intimate' as GroupSize, title: 'Intimate', subtitle: '5–15 people' }}
            selected={groupSize === 'intimate'}
            onSelect={setGroupSize}
          />
          <PreferenceCard
            option={{ value: 'larger' as GroupSize, title: 'Larger', subtitle: '15+ people' }}
            selected={groupSize === 'larger'}
            onSelect={setGroupSize}
          />
        </div>
      </div>

      {/* Vibe */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">Vibe</p>
        <div className="flex gap-3">
          <PreferenceCard
            option={{
              value: 'chill' as Vibe,
              title: 'Chill & casual',
              subtitle: 'Low-key, conversational',
            }}
            selected={vibe === 'chill'}
            onSelect={setVibe}
          />
          <PreferenceCard
            option={{
              value: 'structured' as Vibe,
              title: 'Structured & focused',
              subtitle: 'Agenda-driven',
            }}
            selected={vibe === 'structured'}
            onSelect={setVibe}
          />
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted">
          Frequency
        </p>
        <div className="flex gap-3">
          <PreferenceCard
            option={{
              value: 'weekly' as Frequency,
              title: 'Weekly regular',
              subtitle: 'Show up every time',
            }}
            selected={frequency === 'weekly'}
            onSelect={setFrequency}
          />
          <PreferenceCard
            option={{
              value: 'occasional' as Frequency,
              title: 'Occasional & curated',
              subtitle: 'Quality over quantity',
            }}
            selected={frequency === 'occasional'}
            onSelect={setFrequency}
          />
        </div>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/step-3')}
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
