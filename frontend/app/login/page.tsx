'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/src/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const data = await api.login({ email, password });
            
            // Store user name for backward compatibility
            localStorage.setItem('user', data.user.name);
            // Store full user data including isHost
            localStorage.setItem('userData', JSON.stringify(data.user));
            // Store token for API calls
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            window.dispatchEvent(new Event('storage'));
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-white/60 font-body" style={{ fontFamily: 'var(--font-body)' }}>
                        Or{' '}
                        <Link href="/signup" className="font-semibold text-[#D4A017] hover:opacity-80">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6 bg-black p-8 rounded-2xl border border-white/10" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email-address" className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                                Email address
                            </Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Enter your email"
                                className="h-12 text-base border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-[#D4A017] focus:ring-[#D4A017] font-body"
                                style={{ fontFamily: 'var(--font-body)' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="Enter your password"
                                className="h-12 text-base border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-[#D4A017] focus:ring-[#D4A017] font-body"
                                style={{ fontFamily: 'var(--font-body)' }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/20 bg-black text-[#D4A017] focus:ring-[#D4A017]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-white/60 font-body" style={{ fontFamily: 'var(--font-body)' }}>
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm font-body" style={{ fontFamily: 'var(--font-body)' }}>
                            <Link href="/forgot-password" className="font-semibold text-[#D4A017] hover:opacity-80">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 px-6 py-3 text-base font-semibold text-black bg-[#D4A017] rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A017] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
