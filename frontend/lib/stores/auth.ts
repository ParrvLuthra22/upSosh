'use client';

/**
 * lib/stores/auth.ts
 * ─────────────────
 * Canonical Zustand auth store for UpSosh.
 * Persisted to localStorage (token + user) and synced to a "upsosh_token"
 * cookie so the AuthProvider can read it server-side on mount.
 *
 * Import paths for the rest of the app:
 *   import { useAuthStore, useAuth } from '@/lib/stores/auth';
 *
 * store/authStore.ts re-exports from here for backward compatibility.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User } from '@/types/index';

// ─── Cookie key ───────────────────────────────────────────────────────────────

const COOKIE_KEY = 'upsosh_token';
const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires: 30,        // 30 days
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function writeTokenCookie(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    Cookies.set(COOKIE_KEY, token, COOKIE_OPTS);
  } else {
    Cookies.remove(COOKIE_KEY, { path: '/' });
  }
}

/** Keep legacy localStorage keys alive so old pages don't break. */
function syncLegacyStorage(user: User | null, token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
  if (user) {
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('user', user.name ?? '');
  } else {
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
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
  token: string | null;
  isLoading: boolean;
  /** True once Zustand has rehydrated from localStorage */
  hydrated: boolean;

  // ── Setters (escape hatch for AuthProvider) ──
  setUser: (user: User | null) => void;
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
        syncLegacyStorage(user, get().token);
      },

      setToken: (token) => {
        set({ token });
        writeTokenCookie(token);
        syncLegacyStorage(get().user, token);
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

          const { token, user } = body as { token: string; user: User };
          writeTokenCookie(token);
          syncLegacyStorage(user, token);
          set({ user, token, isLoading: false });
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

          const { token, user } = body as { token: string; user: User };
          writeTokenCookie(token);
          syncLegacyStorage(user, token);
          set({ user, token, isLoading: false });
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
        writeTokenCookie(null);
        syncLegacyStorage(null, null);
        set({ user: null, token: null, isLoading: false });
      },

      // ── Refresh (validate token on app load) ───────────────────────────────

      refresh: async () => {
        const token = get().token ?? Cookies.get(COOKIE_KEY) ?? null;

        // Nothing to validate
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 5000);

          const res = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          clearTimeout(id);

          if (res.status === 401) {
            writeTokenCookie(null);
            syncLegacyStorage(null, null);
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
            writeTokenCookie(token);
            syncLegacyStorage(user, token);
            set({ user, token, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      // ── Internal ───────────────────────────────────────────────────────────

      _onRehydrate: (user, token) => {
        writeTokenCookie(token);
        syncLegacyStorage(user, token);
        useAuthStore.setState({ hydrated: true });
      },
    }),
    {
      name: 'upsosh-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        const user = state?.user ?? null;
        const token = state?.token ?? null;
        state?._onRehydrate(user, token);
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
    /** JWT token, or null */
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
