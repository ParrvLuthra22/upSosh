'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'resetting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');
        
        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        
        if (password.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('resetting');

        try {
            
            
            
            
            
            

            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setStatus('success');
            setMessage('Your password has been reset successfully!');
            
            
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to reset password. Please try again or request a new reset link.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary inline-block mb-6">
                        UpSosh
                    </Link>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">
                        Reset your password
                    </h2>
                    <p className="text-text-secondary">
                        Enter your new password below
                    </p>
                </div>

                <div className="bg-surface p-8 rounded-3xl border border-white/10 shadow-xl">
                    {status === 'success' ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Password reset successful!</h3>
                                <p className="text-text-secondary text-sm mb-6">
                                    {message}
                                </p>
                                <p className="text-text-secondary text-sm">
                                    Redirecting to login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <p className="text-red-500 text-sm">{message}</p>
                                </div>
                            )}

                            {email && (
                                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                                    <p className="text-text-secondary text-sm">
                                        Resetting password for: <strong className="text-text-primary">{email}</strong>
                                    </p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 pr-12 text-text-primary focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Enter new password"
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-text-muted mt-1">Must be at least 8 characters</p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-2">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-surface-highlight border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                                    placeholder="Confirm new password"
                                    minLength={8}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'resetting'}
                                className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'resetting' ? 'Resetting password...' : 'Reset password'}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/login"
                                    className="text-sm text-primary hover:text-primary/90 font-medium"
                                >
                                    ← Back to login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center text-sm text-text-muted mt-6">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/90 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
