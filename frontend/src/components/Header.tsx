'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';
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
                    className={`flex items-center justify-between rounded-full px-4 md:px-6 py-3 transition-all duration-300 ${isScrolled
                        ? 'glass-panel bg-surface/80 shadow-lg'
                        : 'bg-transparent'
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="text-xl md:text-2xl font-heading font-bold text-primary">
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

                    {/* Right Actions - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <DarkModeToggle />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-text-primary">
                                    Hi, {user.name}
                                </span>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin/payments"
                                        className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        🔐 Admin Panel
                                    </Link>
                                )}
                                {user.isHost && (
                                    <Link
                                        href="/host"
                                        className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        Host Event
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="px-5 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-6 py-2 rounded-full border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
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

                    {/* Mobile Menu Button and Dark Mode Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <DarkModeToggle />
                        {/* Show Login/Signup or Menu Button */}
                        {!user && !isMobileMenuOpen && (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-full border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                            >
                                Log In
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/30"
                            aria-label="Toggle mobile menu"
                        >
                            <svg
                                className="w-6 h-6 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 glass-panel bg-surface/98 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-primary/20">
                        {/* Mobile Navigation Links */}
                        <nav className="flex flex-col gap-4 mb-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-semibold text-text-secondary hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-primary/5"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile User Section */}
                        {user ? (
                            <div className="flex flex-col gap-3 border-t border-border pt-6">
                                <div className="text-sm font-semibold text-text-primary mb-2 px-3">
                                    Hi, {user.name}
                                </div>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin/payments"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg text-center"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {user.isHost && (
                                    <Link
                                        href="/host"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-5 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg text-center"
                                    >
                                        Host Event
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-5 py-3 rounded-full border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors text-center"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-3 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 border-t border-border pt-6">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-6 py-3.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary/10 transition-colors text-center text-base"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold hover:opacity-90 transition-opacity shadow-lg text-center text-base"
                                >
                                    Sign Up
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
