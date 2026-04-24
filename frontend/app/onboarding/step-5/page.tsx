'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import MagneticButton from '@/components/ui/MagneticButton';
import { toast } from 'sonner';

export default function OnboardingStep5() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { token } = useAuthStore();
  const [selected, setSelected] = useState<boolean | null>(store.wantsToHost);
  const [isLoading, setIsLoading] = useState(false);

  async function handleComplete() {
    if (selected === null) return;
    setIsLoading(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name: store.name,
          photoUrl: store.photoUrl,
          bio: store.bio,
          interests: store.interests,
          city: store.city,
          groupSize: store.groupSize,
          vibe: store.vibe,
          frequency: store.frequency,
          wantsToHost: selected,
          onboardingComplete: true,
        }),
      });
      store.update({ wantsToHost: selected });
      if (selected) {
        router.push('/onboarding/host-verification/identity');
      } else {
        toast.success('Welcome to UpSosh!');
        router.push('/discover');
      }
    } catch {
      // If API fails, still navigate (offline graceful)
      store.update({ wantsToHost: selected });
      if (selected) {
        router.push('/onboarding/host-verification/identity');
      } else {
        toast.success('Welcome to UpSosh!');
        router.push('/discover');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">One last thing.</h1>
        <p className="font-sans text-sm text-ink-muted">
          Want to host events too? You can decide later.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Attend card */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setSelected(false)}
          animate={{ scale: selected === false ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`flex-1 border rounded-3xl p-8 text-left transition-all duration-200 ${
            selected === false
              ? 'border-accent bg-accent/[0.04]'
              : 'border-border bg-bg-primary hover:bg-bg-secondary'
          }`}
        >
          <div className="mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="font-display text-xl text-ink-primary mb-2">Just attending</p>
          <p className="font-sans text-sm text-ink-muted">
            Discover and book events curated for you.
          </p>
        </motion.button>

        {/* Host card */}
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setSelected(true)}
          animate={{ scale: selected === true ? 1.02 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative flex-1 border-2 rounded-3xl p-8 text-left transition-all duration-200 ${
            selected === true
              ? 'border-accent bg-accent/5'
              : 'border-accent/40 bg-bg-primary hover:bg-accent/[0.03]'
          }`}
          style={selected === true ? { boxShadow: '0 0 24px rgba(255,90,31,0.15)' } : undefined}
        >
          {/* Recommended badge */}
          <span className="absolute top-4 right-4 font-mono text-[9px] uppercase bg-accent text-white px-2 py-0.5 rounded-full">
            Recommended
          </span>
          <div className="mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="font-display text-xl text-ink-primary mb-2">Host events</p>
          <p className="font-sans text-sm text-ink-muted">
            Build your community. UpSosh handles everything else.
          </p>
        </motion.button>
      </div>

      {/* Complete button */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/step-4')}
          className="font-mono text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back
        </button>
        <MagneticButton className="w-full max-w-[320px]">
          <button
            onClick={handleComplete}
            disabled={selected === null || isLoading}
            className="w-full bg-ink-primary text-bg-primary font-sans text-sm font-medium px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Complete setup →'
            )}
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
