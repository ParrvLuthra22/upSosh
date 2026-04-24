import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/auth';

function syncLegacyAuthStorage(user: User | null, token: string | null) {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }

  if (user) {
    window.localStorage.setItem('userData', JSON.stringify(user));
    window.localStorage.setItem('user', user.name ?? '');
  } else {
    window.localStorage.removeItem('userData');
    window.localStorage.removeItem('user');
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: typeof window !== 'undefined' ? window.localStorage.getItem('token') : null,
      loading: true,
      hydrated: false,
      setUser: (user) =>
        set((state) => {
          syncLegacyAuthStorage(user, state.token);
          return { user };
        }),
      setToken: (token) =>
        set((state) => {
          syncLegacyAuthStorage(state.user, token);
          return { token };
        }),
      setLoading: (loading) => set({ loading }),
      initializeAuth: async () => {
        if (!get().hydrated) return;

        set({ loading: !get().user });

        try {
          const headers: HeadersInit = {};
          const token =
            get().token || (typeof window !== 'undefined' ? window.localStorage.getItem('token') : null);
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 5000);

          if (token) {
            (headers as Record<string, string>).Authorization = `Bearer ${token}`;
          }

          const res = await fetch('/api/auth/me', {
            credentials: 'include',
            headers,
            signal: controller.signal,
          });
          window.clearTimeout(timeoutId);

          if (!res.ok) {
            if (res.status === 401) {
              syncLegacyAuthStorage(null, null);
              set({ user: null, token: null, loading: false });
              return;
            }

            set({ loading: false });
            return;
          }

          const data = await res.json().catch(() => null);
          const user = data?.user ?? null;

          if (user) {
            syncLegacyAuthStorage(user, token);
            set({ user, token, loading: false });
            return;
          }

          set({ loading: false });
        } catch {
          set({ loading: false });
        }
      },
      signOut: () => {
        syncLegacyAuthStorage(null, null);
        set({ user: null, token: null, loading: false });
      },
    }),
    {
      name: 'upsosh-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        const user = state?.user ?? null;
        const token = state?.token ?? null;
        syncLegacyAuthStorage(user, token);
        useAuthStore.setState({ hydrated: true });
      },
    }
  )
);

export function useAuth() {
  const {
    user,
    token,
    loading,
    hydrated,
    setUser,
    setToken,
    setLoading,
    initializeAuth,
    signOut: _signOut,
  } = useAuthStore();

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
    _signOut();
  }

  return {
    user,
    token,
    loading,
    hydrated,
    setUser,
    setToken,
    setLoading,
    initializeAuth,
    signOut,
    isAuth: !!user,
  };
}
