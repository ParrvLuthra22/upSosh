'use client';

import { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconMail,
  IconLock,
  IconBrandApple,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const BG_URL = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80&fit=crop';

// ─── Google / Apple SDK types ─────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          prompt: (cb?: (n: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => void) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (cfg: object) => void;
        signIn: () => Promise<{ authorization: { id_token: string } }>;
      };
    };
  }
}

// ─── Script loader ────────────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(s);
  });
}

// ─── Social token exchange helpers ───────────────────────────────────────────

async function exchangeGoogleToken(idToken: string) {
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as Record<string, string>).message ?? 'Google sign-in failed'); }
  return res.json() as Promise<{ token: string; user: Record<string, unknown> }>;
}

async function exchangeAppleToken(idToken: string) {
  const res = await fetch('/api/auth/apple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as Record<string, string>).message ?? 'Apple sign-in failed'); }
  return res.json() as Promise<{ token: string; user: Record<string, unknown> }>;
}

// ─── Decorative asterisk ──────────────────────────────────────────────────────

function LimeAsterisk() {
  return (
    <motion.div
      className="absolute bottom-10 right-10 select-none pointer-events-none z-20"
      animate={{ rotate: 360 }}
      transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x="27" y="4" width="6" height="52" rx="3" fill="#D4FF3F"
            transform={`rotate(${i * 45} 30 30)`} />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  type = 'text', value, onChange, error, leadingIcon, trailingSlot, placeholder, autoComplete,
}: {
  type?: string; value: string; onChange: (v: string) => void; error?: string;
  leadingIcon: React.ReactNode; trailingSlot?: React.ReactNode;
  placeholder?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className={cn(
        'relative flex items-center h-12 rounded-xl bg-surface border transition-all',
        error ? 'border-coral ring-2 ring-coral/20' : focused ? 'border-lime ring-2 ring-lime/20' : 'border-border',
      )}>
        <span className="absolute left-4 text-cream-faint">{leadingIcon}</span>
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent pl-10 pr-10 h-full font-sans text-[15px] text-cream placeholder:text-cream-faint outline-none"
        />
        {trailingSlot && <div className="absolute right-4">{trailingSlot}</div>}
      </div>
      {error && <p className="mt-1.5 font-mono text-[12px] text-coral">{error}</p>}
    </div>
  );
}

// ─── Social buttons ───────────────────────────────────────────────────────────

function SocialButtons({ onSuccess }: {
  onSuccess: (token: string, user: Record<string, unknown>) => void;
}) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      await loadScript('https://accounts.google.com/gsi/client');
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (!clientId) {
        toast.error('Google sign-in not yet configured', {
          description: 'Please sign in with your email and password for now.',
        });
        return;
      }

      await new Promise<void>((resolve, reject) => {
        window.google!.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }: { credential: string }) => {
            try {
              const result = await exchangeGoogleToken(credential);
              onSuccess(result.token, result.user);
              resolve();
            } catch (err) { reject(err); }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google!.accounts.id.prompt((n) => {
          if (n.isNotDisplayed() || n.isSkippedMoment()) reject(new Error('dismissed'));
        });
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg && msg !== 'dismissed') toast.error(msg);
    } finally { setGoogleLoading(false); }
  }, [onSuccess]);

  const signInWithApple = useCallback(async () => {
    setAppleLoading(true);
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

      if (!clientId) {
        toast.error('Apple sign-in not yet configured', {
          description: 'Please sign in with your email and password for now.',
        });
        return;
      }

      window.AppleID!.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: `${window.location.origin}/api/auth/apple/callback`,
        usePopup: true,
      });
      const data = await window.AppleID!.auth.signIn();
      const result = await exchangeAppleToken(data.authorization.id_token);
      onSuccess(result.token, result.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg && !/cancel|popup|dismiss/i.test(msg)) toast.error(msg);
    } finally { setAppleLoading(false); }
  }, [onSuccess]);

  const busy = googleLoading || appleLoading;

  return (
    <div className="space-y-3">
      {/* Google */}
      <motion.button type="button" onClick={signInWithGoogle} disabled={busy} whileTap={{ scale: 0.97 }}
        className="w-full h-12 rounded-full bg-cream text-void font-sans text-[14px] font-medium flex items-center justify-center gap-3 hover:bg-cream/90 disabled:opacity-60 transition-all">
        {googleLoading
          ? <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
          : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
        Continue with Google
      </motion.button>

      {/* Apple */}
      <motion.button type="button" onClick={signInWithApple} disabled={busy} whileTap={{ scale: 0.97 }}
        className="w-full h-12 rounded-full bg-[rgba(244,241,234,0.10)] border border-[rgba(244,241,234,0.15)] text-cream font-sans text-[14px] font-medium flex items-center justify-center gap-3 hover:bg-[rgba(244,241,234,0.15)] disabled:opacity-60 transition-all">
        {appleLoading
          ? <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
          : <IconBrandApple size={18} />}
        Continue with Apple
      </motion.button>
    </div>
  );
}

// ─── Email form (needs Suspense for useSearchParams) ──────────────────────────

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setUser, setToken, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');

  const redirectTo = searchParams.get('from') ?? '/discover';

  function validate() {
    const e: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e); return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setServerError('');
    try {
      await login({ email, password });
      toast.success("You're in. Welcome back.");
      router.push(redirectTo);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign in failed. Try again.');
    }
  }

  function handleSocialSuccess(token: string, user: Record<string, unknown>) {
    setToken(token);
    setUser(user as unknown as Parameters<typeof setUser>[0]);
    toast.success("You're in. Welcome to UpSosh.");
    router.push(redirectTo);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field type="email" value={email} onChange={setEmail} error={errors.email}
          placeholder="Email address" autoComplete="email"
          leadingIcon={<IconMail size={16} />} />

        <div>
          <div className="flex justify-end mb-1.5">
            <Link href="/forgot" className="font-sans text-[12px] text-lime hover:text-lime/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <Field type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword}
            error={errors.password} placeholder="Password" autoComplete="current-password"
            leadingIcon={<IconLock size={16} />}
            trailingSlot={
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="text-cream-faint hover:text-cream transition-colors"
                aria-label={showPwd ? 'Hide password' : 'Show password'}>
                {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            } />
        </div>

        {serverError && <p className="font-mono text-[12px] text-coral">{serverError}</p>}

        <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.97 }}
          className="w-full h-12 bg-lime text-void rounded-full font-sans text-[15px] font-semibold hover:bg-lime/90 disabled:opacity-50 transition-colors flex items-center justify-center">
          {isLoading
            ? <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
            : 'Sign in'}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[11px] text-cream-faint">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <SocialButtons onSuccess={handleSocialSuccess} />

      <p className="text-center font-sans text-[14px] text-cream-dim mt-6">
        New here?{' '}
        <Link href="/signup" className="text-lime hover:text-lime/80 transition-colors font-medium">
          Create an account
        </Link>
      </p>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignInPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-void">
      {/* LEFT — photo + editorial */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${BG_URL}')` }} />
        <div className="absolute inset-0 bg-void/65" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('/noise.svg')", backgroundSize: '200px 200px' }} />

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <Link href="/" className="font-display italic text-[26px] text-cream tracking-tight w-fit">
            UpSosh
          </Link>
          <div>
            <blockquote className="display-md text-cream italic text-balance leading-[1.1] max-w-lg">
              "Walk in as a stranger,<br />leave as a regular."
            </blockquote>
            <p className="font-sans text-[13px] text-cream-dim mt-5">
              — What 2,400+ hosts say about UpSosh
            </p>
          </div>
          <div className="bg-[rgba(244,241,234,0.08)] backdrop-blur-md border border-[rgba(244,241,234,0.10)] rounded-xl p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-lime flex items-center justify-center flex-shrink-0">
                <span className="font-display text-void text-[15px] font-bold">P</span>
              </div>
              <div>
                <p className="font-sans text-[14px] font-medium text-cream">Priya Sharma</p>
                <p className="font-sans text-[12px] text-cream-dim">Run club host · New Delhi</p>
              </div>
            </div>
            <p className="font-sans text-[13px] text-cream-dim leading-relaxed">
              "Hosted my first event with 0 followers. 40 people showed up. UpSosh just works."
            </p>
          </div>
        </div>
        <LimeAsterisk />
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8 min-h-screen lg:min-h-0">
        <motion.div className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}>
          <Link href="/" className="font-display italic text-[22px] text-cream tracking-tight block lg:hidden mb-8">
            UpSosh
          </Link>
          <div className="mb-6">
            <h1 className="display-md text-cream">Welcome back</h1>
            <p className="font-sans text-[15px] text-cream-dim mt-2">Sign in to keep your seat warm.</p>
          </div>
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />)}
            </div>
          }>
            <SignInForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
