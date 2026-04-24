'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { forgotPassword } from '@/lib/auth';
import MagneticButton from '@/components/ui/MagneticButton';

function FloatingInput({
  label,
  type = 'text',
  error,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={`relative border-2 rounded-2xl transition-all duration-200 ${
          error ? 'border-red-500' : focused ? 'border-accent' : 'border-border'
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
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 font-mono text-xs text-red-500 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email');
      return;
    }
    setEmailError('');
    setIsLoading(true);
    setServerError('');
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!submitted ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: EASE_VERCEL }}
          className="space-y-8"
        >
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
              [ ACCOUNT RECOVERY ]
            </p>
            <h1 className="font-display text-5xl text-ink-primary leading-tight">
              Reset your password.
            </h1>
            <p className="font-sans text-sm text-ink-muted">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.4, ease: EASE_VERCEL }}
            >
              <FloatingInput
                label="Email address"
                type="email"
                error={emailError}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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

            <MagneticButton className="w-full">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0A0A0A] text-white font-sans text-sm font-medium py-4 rounded-2xl hover:bg-accent transition-colors duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </button>
            </MagneticButton>
          </form>

          <p className="text-center font-sans text-sm text-ink-muted">
            Remembered it?{' '}
            <Link href="/signin" className="text-accent hover:opacity-80 transition-opacity">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: EASE_VERCEL }}
          className="space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl text-ink-primary">Check your inbox.</h2>
            <p className="font-sans text-sm text-ink-muted">
              We sent a reset link to{' '}
              <span className="text-ink-primary font-medium">{email}</span>. Check spam if you
              don't see it.
            </p>
          </div>

          <Link
            href="/signin"
            className="inline-block font-sans text-sm text-accent hover:opacity-80 transition-opacity"
          >
            ← Back to sign in
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
