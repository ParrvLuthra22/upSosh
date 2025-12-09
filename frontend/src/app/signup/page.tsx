'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Signup failed');

            router.push('/');
            router.refresh(); // Refresh to update Header state
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pt-24 min-h-screen">
            <section className="bg-gradient-to-br from-light-blue to-white dark:from-dark-navy to-dark-black min-h-[80vh] flex items-center justify-center p-6">
                <div className="container mx-auto">
                    <div className="max-w-md mx-auto glass-card p-8 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-3xl shadow-xl">
                        <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Create Account</h1>

                        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 rounded-xl bg-surface-highlight border-none focus:ring-2 focus:ring-primary dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-3 rounded-xl bg-surface-highlight border-none focus:ring-2 focus:ring-primary dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-3 rounded-xl bg-surface-highlight border-none focus:ring-2 focus:ring-primary dark:text-white"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-primary/25"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:underline">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
