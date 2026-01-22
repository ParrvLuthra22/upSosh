'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import { api } from '@/src/lib/api';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const [user, setUser] = useState<{ name: string; email: string; isHost?: boolean; role?: string } | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);

        const checkUser = () => {
            const storedUserData = localStorage.getItem('userData');
            const storedUser = localStorage.getItem('user');

            if (storedUserData) {
                try {
                    const userData = JSON.parse(storedUserData);
                    setUser(userData);
                } catch (e) {
                    // Fallback to simple user name
                    if (storedUser) {
                        setUser({ name: storedUser, email: '', isHost: false });
                    } else {
                        setUser(null);
                    }
                }
            } else if (storedUser) {
                setUser({ name: storedUser, email: '', isHost: false });
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
                const data = await api.getMe();
                if (data && data.user) {
                    setUser(data.user);
                    // Update localStorage with full user data
                    localStorage.setItem('userData', JSON.stringify(data.user));
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
            await api.logout();
        } catch (e) {
            console.error('Logout error:', e);
        }

        // Clear all authentication data
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');

        // Dispatch storage event to update UI in current tab
        window.dispatchEvent(new Event('storage'));

        setUser(null);

        // Close mobile menu if open
        setIsMobileMenuOpen(false);

        // Force full page reload to clear any cached state
        window.location.replace('/');
    };

    const navLinks = [
        { name: 'Explore', href: '/booking' },
        { name: 'Host', href: '/host' },
        { name: 'Features', href: '/features' },
        { name: 'About', href: '/about' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
                ? 'bg-background/80 backdrop-blur-md border-border py-4'
                : 'bg-transparent border-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Brand */}
                <Link
                    href="/"
                    className="text-xl font-semibold tracking-tight text-foreground"
                >
                    UpSosh
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {!user && (
                        <Link
                            href="/login"
                            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                        >
                            Sign In
                        </Link>
                    )}
                </nav>

                {/* Right Actions - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-foreground/60">
                                {user.name}
                            </span>
                            <div className="h-4 w-[1px] bg-border"></div>
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin/payments"
                                    className="text-sm font-medium text-foreground hover:opacity-70"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                className="text-sm font-medium text-foreground hover:opacity-70"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/"
                            className="btn-reset bg-foreground text-background px-5 py-2.5 hover:opacity-90 transition-opacity"
                        >
                            Explore & Book Events
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-foreground"
                    aria-label="Toggle mobile menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-6 md:hidden flex flex-col gap-6 shadow-xl">
                        <nav className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-foreground"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!user && (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-foreground/60"
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>

                        {user ? (
                            <div className="flex flex-col gap-4 border-t border-border pt-6">
                                <div className="text-sm text-foreground/60">
                                    Signed in as {user.name}
                                </div>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-medium text-foreground"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-base font-medium text-foreground/60 text-left"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2">
                                <Link
                                    href="/"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="btn-reset w-full bg-foreground text-background py-3"
                                >
                                    Explore & Book Events
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
