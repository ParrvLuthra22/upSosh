'use client';

/**
 * lib/stores/auth.ts
 * ─────────────────
 * Canonical Zustand auth store for UpSosh.
 *
 * THE JWT IS NEVER STORED HERE.
 *
 * Authentication rides entirely on the httpOnly `token` cookie that the backend
 * sets on signup/signin. That cookie is unreadable from JavaScript, which is the
 * whole point: script injected by an XSS cannot exfiltrate it.
 *
 * This store previously mirrored the same 7-day token into localStorage under
 * three keys AND into a js-cookie (non-httpOnly) cookie, which handed all of
 * that protection back. Every request now authenticates with
 * `credentials: 'include'` instead.
 *
 * What IS persisted: the user profile, so the UI can render without a flash
 * while /api/auth/me revalidates. It is display data, not a credential — if
 * someone forges it locally they get a misleading avatar and nothing else,
 * because the server authorises every request from the cookie.
 *
 * Import paths for the rest of the app:
 *   import { useAuthStore, useAuth } from '@/lib/stores/auth';
 *
 * store/authStore.ts re-exports from here for backward compatibility.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clear credential material this app used to write before the cookie-only
 * migration. Without this, anyone with an existing session keeps a readable JWT
 * in localStorage indefinitely — the vulnerability would persist for every
 * current user even though the code no longer creates it.
 */
function purgeLegacyCredentials() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    // The old non-httpOnly mirror of the JWT.
    document.cookie = 'upsosh_token=; Max-Age=0; path=/';
  } catch {
    // Private mode / storage disabled — nothing to purge.
  }
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: User['role'];
}

interface AuthStore {
  // ── State ──
  user: User | null;
  /** @deprecated Always null. The JWT lives only in the httpOnly cookie. */
  token: string | null;
  isLoading: boolean;
  /** True once Zustand has rehydrated from localStorage */
  hydrated: boolean;

  // ── Setters (escape hatch for AuthProvider) ──
  setUser: (user: User | null) => void;
  /** @deprecated No-op — kept so existing callers compile. */
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;

  // ── Actions ──
  /**
   * POST /api/auth/login → saves JWT to cookie + state.
   * Throws on failure so callers can show field errors.
   */
  login: (payload: LoginPayload) => Promise<void>;

  /**
   * POST /api/auth/register → saves JWT to cookie + state.
   */
  register: (payload: RegisterPayload) => Promise<void>;

  /**
   * POST /api/auth/signout → clears state + cookie.
   */
  logout: () => Promise<void>;

  /**
   * Validates existing token against /api/auth/me.
   * Called on app boot by AuthProvider.
   */
  refresh: () => Promise<void>;

  /** Internal: called when persist rehydration completes. */
  _onRehydrate: (user: User | null, token: string | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      hydrated: false,

      // ── Setters ────────────────────────────────────────────────────────────

      setUser: (user) => {
        set({ user });
      },

      /**
       * @deprecated No-op. The JWT lives only in the backend's httpOnly cookie
       * and is never held in JS. Kept so existing callers compile; they pass the
       * token into an `if (token)` Authorization header that is now simply
       * omitted, and their requests authenticate via `credentials: 'include'`.
       */
      setToken: () => {
        purgeLegacyCredentials();
      },

      setLoading: (isLoading) => set({ isLoading }),

      // ── Login ──────────────────────────────────────────────────────────────

      login: async ({ email, password }) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
          });

          const body = await res.json();
          if (!res.ok) throw new Error(body.message ?? body.error ?? 'Login failed');

          // The JWT arrives in the response body too, but we deliberately
          // ignore it — the httpOnly cookie set by this same response is the
          // only credential we keep.
          const { user } = body as { user: User };
          purgeLegacyCredentials();
          set({ user, token: null, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ── Register ───────────────────────────────────────────────────────────

      register: async ({ name, email, password, role = 'attendee' }) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role }),
            credentials: 'include',
          });

          // Fall back to /api/auth/signup if /register isn't wired up yet
          let body = await res.json();
          if (!res.ok && res.status === 404) {
            const res2 = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, password }),
              credentials: 'include',
            });
            body = await res2.json();
            if (!res2.ok) throw new Error(body.message ?? body.error ?? 'Registration failed');
          } else if (!res.ok) {
            throw new Error(body.message ?? body.error ?? 'Registration failed');
          }

          const { user } = body as { user: User };
          purgeLegacyCredentials();
          set({ user, token: null, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────

      logout: async () => {
        try {
          await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
        } catch {
          // swallow — we clear state regardless
        }
        // The server clears the httpOnly cookie; we clear local display state
        // and any credential left over from before the cookie-only migration.
        purgeLegacyCredentials();
        set({ user: null, token: null, isLoading: false });
      },

      // ── Refresh (validate token on app load) ───────────────────────────────

      refresh: async () => {
        // We cannot see the httpOnly cookie from JS, so there is nothing to
        // check locally — just ask the server who we are. The browser attaches
        // the cookie because of `credentials: 'include'`. An unauthenticated
        // visitor simply gets a 401 and we settle on user: null.
        set({ isLoading: true });
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 5000);

          const res = await fetch('/api/auth/me', {
            credentials: 'include',
            signal: controller.signal,
          });
          clearTimeout(id);

          if (res.status === 401) {
            purgeLegacyCredentials();
            set({ user: null, token: null, isLoading: false });
            return;
          }

          if (!res.ok) {
            set({ isLoading: false });
            return;
          }

          const data = await res.json();
          const user: User | null = data?.user ?? null;

          if (user) {
            set({ user, token: null, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          // Network error or timeout — keep whatever we had rather than
          // logging the user out on a flaky connection.
          set({ isLoading: false });
        }
      },

      // ── Internal ───────────────────────────────────────────────────────────

      _onRehydrate: () => {
        // Anything a previous version of this app left in localStorage is a
        // credential we no longer want on disk.
        purgeLegacyCredentials();
        // Use the closure's own `set`, not `useAuthStore.setState`.
        //
        // Automatic hydration runs SYNCHRONOUSLY inside `create(persist(...))`
        // when the storage backend is synchronous (real localStorage is).
        // `_onRehydrate` can therefore execute before the right-hand side of
        // `export const useAuthStore = create(...)` has finished evaluating —
        // referencing `useAuthStore` by name at that point throws
        // "Cannot access 'useAuthStore' before initialization" (a temporal
        // dead zone error on the module-level const). Zustand's persist
        // middleware swallows that throw internally, so it never surfaces as
        // a visible error: `hydrated` just silently never becomes true, on
        // every single page load, for every user. (This exact bug predates
        // this file's Phase 1 rewrite — the original code had the identical
        // `useAuthStore.setState(...)` call in this exact spot.) `set`, in
        // contrast, is a function parameter bound when the creator runs — it
        // is never subject to the const's TDZ.
        set({ hydrated: true, token: null });
      },
    }),
    {
      name: 'upsosh-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      // `user` only — NEVER the token. Persisting the JWT here is what put a
      // 7-day bearer credential in reach of any injected script.
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?._onRehydrate(null, null);
      },
    }
  )
);

// ─── useAuth hook ─────────────────────────────────────────────────────────────

/**
 * Primary hook for auth state + actions.
 *
 * @example
 *   const { user, login, logout, isLoading } = useAuth();
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    /** Authenticated user, or null if logged out */
    user: store.user,
    /** @deprecated Always null — the JWT is in an httpOnly cookie. */
    token: store.token,
    /** True while an auth request is in flight or the token is being validated */
    isLoading: store.isLoading,
    /** True once Zustand has rehydrated — use to avoid flash of wrong UI */
    hydrated: store.hydrated,
    /** Convenience boolean */
    isAuthenticated: !!store.user,

    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    refresh: store.refresh,
    setUser: store.setUser,
    setToken: store.setToken,

    // ── Backward-compat aliases (used by existing pages) ──────────────────
    /** @deprecated use isAuthenticated */
    isAuth: !!store.user,
    /** @deprecated use isLoading */
    loading: store.isLoading,
    /** @deprecated use logout */
    signOut: store.logout,
    /** @deprecated use refresh */
    initializeAuth: store.refresh,
  };
}
