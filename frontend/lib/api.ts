/**
 * src/lib/api.ts
 * ───────────────
 * The one API client for UpSosh.
 *
 * This file used to be two files: `lib/api.ts` (a typed fetch wrapper, never
 * actually shipped) and `src/lib/api.ts` (an untyped legacy client from the
 * Dodo Payments era, which — because `tsconfig.json`'s `@/*` path maps
 * `./src/*` before `./*` — was the one every `@/lib/api` import silently
 * resolved to). They are merged into this one file, at this one path, so the
 * import alias is no longer ambiguous.
 *
 * • Reads NEXT_PUBLIC_API_URL (or falls back to the rewrites proxy prefix "")
 * • credentials: 'include' on every request — auth is the backend's httpOnly
 *   cookie; there is no client-readable token to attach as a Bearer header
 * • On 401: clears the auth store and redirects to /signin
 * • Typed generic methods: api.get<T>(), api.post<T>(), api.put<T>(),
 *   api.patch<T>(), api.delete<T>()
 * • A handful of named domain methods (getEvents, createBooking, …) kept
 *   because the still-live legacy component tree under src/components/booking
 *   and src/components/host calls them by name. New code should prefer the
 *   generic methods directly, e.g. `api.get<Event[]>('/api/events')`.
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

// ─── Domain types ───────────────────────────────────────────────────────────
// Kept for the legacy src/components/booking and src/components/host tree.
// Not the source of truth for the API shape (that's the Prisma schema) — just
// enough structure for the components that still import these by name.

export interface Event {
  id: string;
  title: string;
  type: 'formal' | 'informal';
  date: string;
  time: string;
  venue: string;
  hostId: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  isSuperhost: boolean;
}

export interface Host {
  id: string;
  name: string;
  verified: boolean;
  avatar: string;
}

export interface BookingItem extends Event {
  qty: number;
}

export interface Booking {
  id: string;
  userId: string;
  items: BookingItem[];
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentId?: string;
  paymentProof?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function apiFetch<T>(
  method: HttpMethod,
  path: string,
  body?: unknown
): Promise<T> {
  // Resolve the full URL — if path is already absolute leave it alone
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
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
    // Callers that need to branch on the failure kind (rate-limited vs.
    // misconfigured vs. generic) read this instead of pattern-matching text.
    throw Object.assign(new Error(message), { status: res.status });
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

  // ── Auth ─────────────────────────────────────────────────────────────────
  // Used by app/login/page.tsx (a legacy duplicate of /signin).
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ token: string; user: unknown }>('POST', '/api/auth/login', credentials),

  // ── Events ───────────────────────────────────────────────────────────────
  // Used by src/components/host/MyEventsList.tsx and src/components/host/HostEventForm.tsx.

  /**
   * GET /api/events returns { events, total, page, pages } — this used to be
   * typed as returning Event[] directly and handed the whole envelope to
   * callers expecting an array, which is what broke /booking and /host.
   */
  getEvents: async (): Promise<Event[]> => {
    const data = await apiFetch<{ events: Event[] }>('GET', '/api/events');
    return data.events;
  },

  getEventById: (id: string): Promise<Event> =>
    apiFetch<Event>('GET', `/api/events/${id}`),

  createEvent: (event: Omit<Event, 'id'>): Promise<Event> =>
    apiFetch<Event>('POST', '/api/events', event),

  updateEvent: (eventId: string, event: Partial<Event>): Promise<Event> =>
    apiFetch<Event>('PUT', `/api/events/${eventId}`, event),

  deleteEvent: (eventId: string): Promise<void> =>
    apiFetch<void>('DELETE', `/api/events/${eventId}`),

  // ── Hosts ────────────────────────────────────────────────────────────────
  // Used by src/components/booking/EventCard.tsx and EventDetailsModal.tsx.

  /** GET /api/hosts/:id returns { host }, not the host bare — same class of
   * bug as getEvents above. */
  getHostById: async (id: string): Promise<Host> => {
    const data = await apiFetch<{ host: Host }>('GET', `/api/hosts/${id}`);
    return data.host;
  },

  // ── Bookings ─────────────────────────────────────────────────────────────
  // Used by src/components/booking/CheckoutModal.tsx.
  createBooking: (booking: Omit<Booking, 'id'>): Promise<Booking> =>
    apiFetch<Booking>('POST', '/api/bookings', booking),
} as const;

// ─── Named endpoint helpers (domain shortcuts) ────────────────────────────────

export const authApi = {
  me: () => api.get<{ user: import('@/types').User }>('/api/auth/me'),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: import('@/types').User }>('/api/auth/login', { email, password }),
  signout: () => api.post('/api/auth/signout'),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/api/auth/reset-password', { token, password }),
};

export default api;
