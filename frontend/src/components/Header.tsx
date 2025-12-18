'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const [user, setUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);

        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser({ name: storedUser, email: '' });
            } else {
                setUser(null);
            }
        };

        // Initial check
        checkUser();

        // Listen for storage events (login/logout)
        window.addEventListener('storage', checkUser);

        // Fetch user from API (optional fallback)
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) setUser(data.user);
                }
            } catch (e) {
                console.error('Failed to fetch user', e);
            }
        };
        fetchUser();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            // Ignore api error
        }
        localStorage.removeItem('user');

        // Dispatch storage event to update UI in current tab
        window.dispatchEvent(new Event('storage'));

        setUser(null);
        window.location.href = '/';
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/features' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'
                }`}
        >
            <div className="container mx-auto px-4">
                <div
                    className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${isScrolled
                        ? 'glass-panel bg-surface/80 shadow-lg'
                        : 'bg-transparent'
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-heading font-bold text-primary">
                        UpSosh
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <DarkModeToggle />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-text-primary hidden md:block">
                                    Hi, {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="hidden md:block px-6 py-2 rounded-full border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
