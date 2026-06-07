'use client';

/**
 * components/providers/AuthProvider.tsx
 * ──────────────────────────────────────
 * Wraps the app in app/layout.tsx.
 *
 * On mount it:
 *   1. Reads the JWT from the "upsosh_token" cookie via js-cookie
 *   2. Syncs the cookie value into the Zustand store (in case the tab was
 *      opened without a localStorage snapshot, e.g. from a link)
 *   3. Calls store.refresh() which validates the token against /api/auth/me
 *
 * Re-exports useAuth() so consumers only need one import:
 *   import { useAuth } from '@/components/providers/AuthProvider';
 */

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore, useAuth } from '@/lib/stores/auth';

const COOKIE_KEY = 'upsosh_token';

// ─── Provider ─────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, token, refresh, setToken } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    // If the store has no token but the cookie does (e.g. opened from an email
    // link), pull the cookie token into the store before validating.
    const cookieToken = Cookies.get(COOKIE_KEY) ?? null;
    if (!token && cookieToken) {
      setToken(cookieToken);
    }

    // Validate whatever token we have against the server
    void refresh();
  // We only want this to run once after hydration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return <>{children}</>;
}

// ─── Re-export hook ───────────────────────────────────────────────────────────

export { useAuth };
