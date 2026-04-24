// Typed fetch wrapper — injects auth header, handles 401 auto-redirect
import { useAuthStore } from '@/store/authStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function apiFetch<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (res.status === 401) {
    useAuthStore.getState().signOut();
    if (typeof window !== 'undefined') {
      window.location.href = `/signin?from=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>('GET', path),
  post: <T>(path: string, body?: unknown) => apiFetch<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>('PATCH', path, body),
  delete: <T>(path: string) => apiFetch<T>('DELETE', path),
};
