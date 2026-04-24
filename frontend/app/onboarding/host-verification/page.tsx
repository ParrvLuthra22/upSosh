'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /onboarding/host-verification — entry point
 * Immediately redirects to the first real step (identity verification).
 * This page exists so that links to /onboarding/host-verification don't 404.
 */
export default function HostVerificationIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/host-verification/identity');
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );
}
