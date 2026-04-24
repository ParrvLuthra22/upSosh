'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { resetPassword } from '@/lib/auth';
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
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
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

export default function ResetPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState('');

  function validate(): boolean {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError('');
    try {
      await resetPassword(token, password);
      router.push('/signin');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          [ NEW PASSWORD ]
        </p>
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Choose a new password.
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="New password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-ink-muted hover:text-ink-primary transition-colors"
                aria-label="Toggle password visibility"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Confirm new password"
            type={showConfirm ? 'text' : 'password'}
            error={errors.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-ink-muted hover:text-ink-primary transition-colors"
                aria-label="Toggle password visibility"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            }
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: EASE_VERCEL }}
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
                'Update password'
              )}
            </button>
          </MagneticButton>
        </motion.div>
      </form>

      <p className="text-center font-sans text-sm text-ink-muted">
        <Link href="/signin" className="text-accent hover:opacity-80 transition-opacity">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
