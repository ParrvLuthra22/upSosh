// Auth helpers — client-side fetch calls go to /api/auth/*
// Server-side session utilities use jose (server components only)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  hostStatus?: 'none' | 'pending' | 'verified';
  onboardingComplete?: boolean;
}

// ─── Client-side auth helpers ─────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error((await res.json()).message ?? 'Sign in failed');
  return res.json();
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error((await res.json()).message ?? 'Sign up failed');
  return res.json();
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).message ?? 'Request failed');
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message ?? 'Reset failed');
}

// ─── Server-side session helpers (server components / API routes only) ────────
// These use next/headers and must only be imported in server components.
// Do not import this block in client components.

// export { encrypt, decrypt, getSession, createSession, clearSession } from './authServer';
// (Separated to avoid bundling next/headers into client bundles)
