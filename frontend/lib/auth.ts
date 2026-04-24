// Auth helpers — all fetch calls go to /api/auth/*
// Store JWT in zustand + httpOnly cookie set by backend

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  hostStatus?: 'none' | 'pending' | 'verified';
  onboardingComplete?: boolean;
}

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
