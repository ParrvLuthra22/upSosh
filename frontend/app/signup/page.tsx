'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/src/lib/api';

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData(e.currentTarget);
        const formData = {
            name: data.get('name') as string,
            email: data.get('email') as string,
            password: data.get('password') as string
        };

        try {
            const responseData = await api.signup(formData);
            // Store user name for backward compatibility
            localStorage.setItem('user', responseData.user.name);
            // Store full user data including isHost (defaults to false for new users)
            localStorage.setItem('userData', JSON.stringify(responseData.user));
            // Store token for API calls
            if (responseData.token) {
                localStorage.setItem('token', responseData.token);
            }
            window.dispatchEvent(new Event('storage'));
            alert('Account created successfully!');
            router.push('/');
        } catch (error: any) {
            console.error('Signup error:', error);
            alert(error.message || 'An error occurred during signup.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="email-address">Email address</Label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="Email address"
                            />
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="Password (min 6 characters)"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
