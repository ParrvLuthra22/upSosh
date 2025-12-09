'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<'signup' | 'otp'>('signup');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData(e.currentTarget);
        setFormData({
            name: data.get('name') as string,
            email: data.get('email') as string,
            password: data.get('password') as string
        });

        // Simulate API call to send OTP
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setStep('otp');
        // In a real app, this is where we'd trigger the email sending
        console.log('OTP Sent to', data.get('email'));
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData(e.currentTarget);
        const otp = data.get('otp');

        // Simulate OTP verification (Client side check for demo)
        if (otp !== '123456') { // Mock OTP
            alert('Invalid OTP. Please try 123456');
            setIsLoading(false);
            return;
        }

        try {
            // Create user in DB after OTP verification
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const responseData = await res.json();
                localStorage.setItem('user', responseData.user.name);
                window.dispatchEvent(new Event('storage'));
                router.push('/');
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                        {step === 'signup' ? 'Create your account' : 'Verify your email'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        {step === 'signup' ? (
                            <>
                                Or{' '}
                                <Link href="/login" className="font-medium text-primary hover:text-primary/90">
                                    sign in to your existing account
                                </Link>
                            </>
                        ) : (
                            `We sent a code to ${formData.email}`
                        )}
                    </p>
                </div>

                {step === 'signup' ? (
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
                                    defaultValue={formData.name}
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
                                    defaultValue={formData.email}
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
                                    placeholder="Password"
                                    defaultValue={formData.password}
                                />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending code...' : 'Sign up'}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                        <div className="-space-y-px rounded-md shadow-sm">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter Verification Code</Label>
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    placeholder="Enter 6-digit code"
                                    className="text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    (For testing, use code: 123456)
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Verifying...' : 'Verify & Login'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setStep('signup')}
                            >
                                Back to details
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
