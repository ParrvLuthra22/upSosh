'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/lib/motion';

const EASE = [0.22, 1, 0.36, 1] as const;
const BG_URL = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80&fit=crop';

// ─── Decorative asterisk ──────────────────────────────────────────────────────

function LimeAsterisk() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute bottom-10 right-10 select-none pointer-events-none z-20"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={reduced ? undefined : { duration: 24, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x="27" y="4" width="6" height="52" rx="3" fill="var(--lime)"
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
        <span className="absolute left-4 text-cream-dim">{leadingIcon}</span>
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent pl-10 pr-10 h-full font-sans text-[15px] text-cream placeholder:text-cream-dim outline-none"
        />
        {trailingSlot && <div className="absolute right-4">{trailingSlot}</div>}
      </div>
      {error && <p className="mt-1.5 font-mono text-[12px] text-coral">{error}</p>}
    </div>
  );
}

// ─── Email form (needs Suspense for useSearchParams) ──────────────────────────

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field type="email" value={email} onChange={setEmail} error={errors.email}
          placeholder="Email address" autoComplete="email"
          leadingIcon={<IconMail size={16} />} />

        <div>
          <div className="flex justify-end mb-1.5">
            <Link href="/forgot-password" className="font-sans text-[12px] text-lime hover:text-lime/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <Field type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword}
            error={errors.password} placeholder="Password" autoComplete="current-password"
            leadingIcon={<IconLock size={16} />}
            trailingSlot={
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="text-cream-dim hover:text-cream transition-colors"
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
  const reduced = useReducedMotion();
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
          <div className="bg-border backdrop-blur-md border border-[rgba(244,241,234,0.10)] rounded-xl p-4 max-w-sm">
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
          initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.1 : 0.55, ease: EASE }}>
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
