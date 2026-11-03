import { create } from 'zustand';

/**
 * How many requests have been waiting longer than WAKING_AFTER_MS. The free-tier
 * backend sleeps when idle and takes a while to wake; while any request is stuck
 * on that, <ServerWakingBanner /> tells the user instead of leaving a blank page.
 */
interface ServerStatusState {
  slowRequests: number;
  _slow: (delta: 1 | -1) => void;
}

export const useServerStatus = create<ServerStatusState>((set) => ({
  slowRequests: 0,
  _slow: (delta) => set((s) => ({ slowRequests: Math.max(0, s.slowRequests + delta) })),
}));
