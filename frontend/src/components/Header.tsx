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

        
        checkUser();

        
        window.addEventListener('storage', checkUser);

        
        const fetchUser = async () => {
            try {
                const data = await api.getMe();
                if (data && data.user) {
                    setUser(data.user);
                    
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
        
        
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');

        
        window.dispatchEvent(new Event('storage'));

        setUser(null);
        
        
        setIsMobileMenuOpen(false);
        
        
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${isScrolled ? 'py-3' : 'py-5'
                }`}
        >
            <div className="container mx-auto px-4">
                <div
                    className={`flex items-center justify-between rounded-full px-4 md:px-6 py-3 transition-all duration-300 ${isScrolled
                        ? 'bg-black border border-white/10'
                        : 'bg-transparent'
                        }`}
                >
                    
                    <Link 
                        href="/" 
                        className="text-xl md:text-2xl font-bold text-[#D4A017]"
                        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                        UpSosh
                    </Link>

                    
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-white/60 hover:text-[#D4A017] transition-colors uppercase tracking-wide"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-white">
                                    Hi, {user.name}
                                </span>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin/payments"
                                        className="px-5 py-2 rounded-full bg-[#D4A017] text-black text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        🔐 Admin Panel
                                    </Link>
                                )}
                                {user.isHost && (
                                    <Link
                                        href="/host"
                                        className="px-5 py-2 rounded-full bg-[#D4A017] text-black text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        Host Event
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="px-5 py-2 rounded-full border border-[#D4A017] text-[#D4A017] text-sm font-medium hover:bg-[#D4A017] hover:text-black transition-colors"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-2 rounded-full border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-6 py-2 rounded-full border border-[#D4A017] text-[#D4A017] font-medium hover:bg-[#D4A017] hover:text-black transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2 rounded-full bg-[#D4A017] text-black text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    
                    <div className="flex md:hidden items-center gap-2">
                        
                        {!user && !isMobileMenuOpen && (
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-full border-2 border-[#D4A017] text-[#D4A017] text-sm font-semibold hover:bg-[#D4A017] hover:text-black transition-colors"
                            >
                                Log In
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                            aria-label="Toggle mobile menu"
                        >
                            <svg
                                className="w-6 h-6 text-white"
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

                
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 bg-black border border-white/10 rounded-2xl p-6">
                        
                        <nav className="flex flex-col gap-4 mb-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-base font-semibold text-white/60 hover:text-[#D4A017] transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        
                        {user ? (
                            <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
                                <div className="text-sm font-semibold text-white mb-2 px-3">
                                    Hi, {user.name}
                                </div>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin/payments"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-5 py-3 rounded-full bg-[#D4A017] text-black text-sm font-semibold hover:opacity-90 transition-opacity text-center"
                                    >
                                        Admin Panel
                                    </Link>
                                )}
                                {user.isHost && (
                                    <Link
                                        href="/host"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full px-5 py-3 rounded-full bg-[#D4A017] text-black text-sm font-semibold hover:opacity-90 transition-opacity text-center"
                                    >
                                        Host Event
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-5 py-3 rounded-full border-2 border-[#D4A017] text-[#D4A017] text-sm font-semibold hover:bg-[#D4A017] hover:text-black transition-colors text-center"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-5 py-3 rounded-full border border-white/20 text-white text-sm font-semibold hover:border-white/40 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-6 py-3.5 rounded-full border-2 border-[#D4A017] text-[#D4A017] font-semibold hover:bg-[#D4A017] hover:text-black transition-colors text-center text-base"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full px-6 py-3.5 rounded-full bg-[#D4A017] text-black font-semibold hover:opacity-90 transition-opacity text-center text-base"
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
