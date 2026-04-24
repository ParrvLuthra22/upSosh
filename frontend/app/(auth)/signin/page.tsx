'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { signIn } from '@/lib/auth';
import { useAuth } from '@/store/authStore';
import MagneticButton from '@/components/ui/MagneticButton';

function FloatingInput({
  label,
  type = 'text',
  error,
  rightSlot,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  error?: string;
  rightSlot?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative border-2 rounded-2xl transition-all duration-200 ${
          error
            ? 'border-red-500'
            : focused
            ? 'border-accent'
            : 'border-border'
        } ${focused ? 'bg-bg-primary' : 'bg-bg-secondary'}`}
      >
        <label
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-sans text-ink-muted ${
            lifted ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent px-4 pt-6 pb-2 font-sans text-sm text-ink-primary outline-none rounded-2xl"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, x: [0, 8, -8, 8, -8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-1.5 font-mono text-xs text-red-500 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError('');
    try {
      const result = await signIn(email, password);
      setUser(result.user);
      setToken(result.token);
      const from = searchParams.get('from') ?? '/discover';
      router.push(from);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Eyebrow */}
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          [ WELCOME BACK ]
        </p>
        <h1 className="font-display text-5xl text-ink-primary leading-tight">Sign in.</h1>
      </div>

      {/* Google */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_VERCEL }}
        className="w-full flex items-center justify-center gap-3 border border-border bg-bg-primary hover:bg-bg-secondary transition-colors duration-200 rounded-2xl px-4 py-3.5 font-sans text-sm text-ink-primary"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4" />
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
        Continue with Google
      </motion.button>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[10px] text-ink-muted">or</span>
        <div className="flex-1 h-px bg-border" />
      </motion.div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Email address"
            type="email"
            error={errors.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: EASE_VERCEL }}
          className="relative"
        >
          <FloatingInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-ink-muted hover:text-ink-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            }
          />
          <Link
            href="/forgot"
            className="absolute top-3.5 right-12 font-mono text-xs text-accent hover:opacity-80 transition-opacity"
          >
            Forgot?
          </Link>
        </motion.div>

        <AnimatePresence>
          {serverError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-xs text-red-500"
            >
              {serverError}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4, ease: EASE_VERCEL }}
        >
          <MagneticButton className="w-full">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A0A0A] text-white font-sans text-sm font-medium py-4 rounded-2xl hover:bg-accent transition-colors duration-300 flex items-center justify-center"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </MagneticButton>
        </motion.div>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-center font-sans text-sm text-ink-muted"
      >
        New here?{' '}
        <Link href="/signup" className="text-accent hover:opacity-80 transition-opacity">
          Create an account
        </Link>
      </motion.p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <SignInForm />
    </Suspense>
  );
}
