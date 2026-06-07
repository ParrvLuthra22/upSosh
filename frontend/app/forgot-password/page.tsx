'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6 py-16">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Logo */}
        <Link href="/" className="block font-display text-[28px] text-cream mb-10">
          upSosh
        </Link>

        {status === 'sent' ? (
          <div className="bg-surface border border-border rounded-3xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-lime/15 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-lime" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-[26px] text-cream mb-3">Check your inbox</h2>
            <p className="font-sans text-[15px] text-cream-dim leading-relaxed mb-8">
              If an account exists for <span className="text-cream">{email}</span>, we've sent a password reset link. It expires in 1 hour.
            </p>
            <Link
              href="/signin"
              className="font-sans text-[14px] text-lime hover:underline transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[36px] text-cream mb-2">Forgot password?</h1>
            <p className="font-sans text-[15px] text-cream-dim mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="font-sans text-[13px] text-red-400">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="font-sans text-[13px] text-cream-dim block mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 bg-surface border border-border rounded-2xl px-4 font-sans text-[15px] text-cream placeholder:text-cream-faint outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 rounded-full bg-lime text-void font-sans font-semibold text-[15px] hover:bg-lime/90 disabled:opacity-60 transition-all"
              >
                {status === 'loading' ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="mt-6 font-sans text-[14px] text-cream-dim text-center">
              Remember your password?{' '}
              <Link href="/signin" className="text-lime hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
