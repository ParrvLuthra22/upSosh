/**
 * lib/api.ts
 * ──────────
 * Typed fetch wrapper for UpSosh.
 *
 * • Reads NEXT_PUBLIC_API_URL (or falls back to the rewrites proxy prefix "")
 * • Injects `Authorization: Bearer {token}` from the Zustand auth store
 * • On 401: clears auth state and redirects to /signin
 * • Typed generic methods: api.get<T>(), api.post<T>(), api.put<T>(),
 *   api.patch<T>(), api.delete<T>()
 *
 * Usage:
 *   const events = await api.get<Event[]>('/api/events');
 *   const booking = await api.post<Booking>('/api/bookings', payload);
 */

import { useAuthStore } from '@/lib/stores/auth';

// ─── Base URL ─────────────────────────────────────────────────────────────────

/**
 * When NEXT_PUBLIC_API_URL is set (e.g. in production) requests go to that
 * origin directly. In development the Next.js rewrite rule proxies /api/* to
 * the backend, so we use an empty base and let the rewrite handle it.
 */
const BASE_URL: string =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || '';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function apiFetch<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<T> {
  // Resolve the full URL — if path is already absolute leave it alone
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  // Pull the current token from the store (works outside React components)
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : JSON.stringify(body),
    credentials: 'include',
  });

  // ── 401 → clear auth + redirect ──────────────────────────────────────────
  if (res.status === 401) {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      const from = encodeURIComponent(window.location.pathname);
      window.location.href = `/signin?from=${from}`;
    }
    throw new Error('Unauthorized — redirecting to sign-in');
  }

  // ── Non-OK responses ──────────────────────────────────────────────────────
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch {
      // body wasn't JSON; keep the status string
    }
    throw new Error(message);
  }

  // ── 204 No Content ────────────────────────────────────────────────────────
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Exported client ──────────────────────────────────────────────────────────

export const api = {
  /** GET  /path */
  get: <T>(path: string): Promise<T> =>
    apiFetch<T>('GET', path),

  /** POST /path with optional body */
  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>('POST', path, body),

  /** PUT  /path with body */
  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>('PUT', path, body),

  /** PATCH /path with partial body */
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    apiFetch<T>('PATCH', path, body),

  /** DELETE /path */
  delete: <T>(path: string): Promise<T> =>
    apiFetch<T>('DELETE', path),
} as const;

// ─── Named endpoint helpers (domain shortcuts) ────────────────────────────────
// These live here so every fetch in the app goes through the same wrapper.

export const authApi = {
  me: () => api.get<{ user: import('@/types').User }>('/api/auth/me'),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: import('@/types').User }>('/api/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post<{ token: string; user: import('@/types').User }>('/api/auth/register', { name, email, password, role }),
  signout: () => api.post('/api/auth/signout'),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }),
};

// Legacy shims used by profile page and older components
export { api as default };
Object.assign(api, {
  getMe: () => api.get<{ user: any }>('/api/auth/me'),
  updateProfile: (data: Record<string, unknown>) =>
    api.patch<{ user: any }>('/api/users/me', data),
});
