'use client';

import { useServerStatus } from '@/lib/stores/serverStatus';

/** Shown while any request has been waiting more than a few seconds (the backend sleeps when idle). */
export default function ServerWakingBanner() {
  const waking = useServerStatus((s) => s.slowRequests > 0);
  if (!waking) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] rounded-full border border-cream/15 bg-void/95 px-5 py-2.5 font-sans text-sm text-cream shadow-lg backdrop-blur"
    >
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-lime align-middle" aria-hidden="true" />
      Waking the server, one moment
    </div>
  );
}
