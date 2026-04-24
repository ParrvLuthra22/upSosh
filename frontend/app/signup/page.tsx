'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { signUp } from '@/lib/auth';
import { useAuth } from '@/store/authStore';
import MagneticButton from '@/components/ui/MagneticButton';
import AuthLayout from '@/app/(auth)/layout';

function FloatingInput({
  label,
  type = 'text',
  error,
  rightSlot,
  ...props
}: {
  label: string;
  type?: string;
  error?: string;
  rightSlot?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const lifted = focused || hasValue;

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
          className="w-full bg-transparent px-4 pt-6 pb-2 font-sans text-sm text-ink-primary outline-none rounded-2xl"
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          onChange={(e) => setHasValue(e.target.value.length > 0)}
          {...props}
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

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const colors = ['', 'bg-red-500', 'bg-amber-500', 'bg-amber-400', 'bg-green-500'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors[strength]}`}
          animate={{ width: `${(strength / 4) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="font-mono text-[10px] text-ink-muted">{labels[strength]}</p>
    </div>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { setUser, setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (!termsChecked) {
      newErrors.terms = 'You must accept the terms';
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
      const result = await signUp(email, password, name || email.split('@')[0]);
      setUser(result.user);
      setToken(result.token);
      router.push('/onboarding/step-1');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          [ GET STARTED ]
        </p>
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Create your account.
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.10, duration: 0.4, ease: EASE_VERCEL }}
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
          transition={{ delay: 0.14, duration: 0.4, ease: EASE_VERCEL }}
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
                aria-label="Toggle password visibility"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            }
          />
          <PasswordStrength password={password} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            error={errors.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-ink-muted hover:text-ink-primary transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            }
          />
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4, ease: EASE_VERCEL }}
          className="flex items-start gap-3"
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={termsChecked}
            onClick={() => setTermsChecked((v) => !v)}
            className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
              termsChecked ? 'bg-accent border-accent' : 'border-border bg-bg-secondary'
            }`}
          >
            {termsChecked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <p className="font-sans text-sm text-ink-muted">
            I agree to the{' '}
            <Link href="/terms" className="text-accent hover:opacity-80">Terms</Link>{' '}
            &{' '}
            <Link href="/privacy" className="text-accent hover:opacity-80">Privacy Policy</Link>
          </p>
        </motion.div>

        <AnimatePresence>
          {errors.terms && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-red-500">
              {errors.terms}
            </motion.p>
          )}
          {serverError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-mono text-xs text-red-500">
              {serverError}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4, ease: EASE_VERCEL }}
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
                'Create account →'
              )}
            </button>
          </MagneticButton>
        </motion.div>
      </form>

      <p className="text-center font-sans text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/signin" className="text-accent hover:opacity-80">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
