'use client';

/**
 * components/providers/AuthProvider.tsx
 * ──────────────────────────────────────
 * Wraps the app in app/layout.tsx.
 *
 * On mount, once the Zustand store has rehydrated, it calls store.refresh(),
 * which asks the server "who am I?" via GET /api/auth/me. The request carries
 * the backend's httpOnly `token` cookie automatically (credentials: 'include')
 * — there is no client-readable token to inspect or forward here.
 *
 * Re-exports useAuth() so consumers only need one import:
 *   import { useAuth } from '@/components/providers/AuthProvider';
 */

import { useEffect } from 'react';
import { useAuthStore, useAuth } from '@/lib/stores/auth';

// ─── Provider ─────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, refresh } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;
    void refresh();
  // We only want this to run once after hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return <>{children}</>;
}

// ─── Re-export hook ───────────────────────────────────────────────────────────

export { useAuth };
