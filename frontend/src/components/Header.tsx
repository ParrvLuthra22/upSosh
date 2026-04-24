'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuth } from '@/store/authStore';
import { toast } from 'sonner';

const navLinks = [
  { name: 'Discover', href: '/discover' },
  { name: 'Host', href: '/host' },
  { name: 'Planner', href: '/planner' },
];

function UserAvatar({ src, name }: { src?: string; name?: string }) {
  const initial = name?.[0]?.toUpperCase() ?? 'U';
  if (src) {
    return <img src={src} alt={name ?? 'User'} className="w-full h-full object-cover" />;
  }
  return (
    <span className="font-sans text-sm font-medium text-ink-primary">{initial}</span>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuth, signOut } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOut();
    toast.success('See you soon.');
    router.push('/');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="px-6 md:px-10 pt-5">
        <motion.div
          className="flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500"
          animate={{
            backgroundColor: scrolled ? 'rgba(250,250,247,0.9)' : 'rgba(250,250,247,0)',
            backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
            borderColor: scrolled ? 'rgba(232,228,220,1)' : 'rgba(232,228,220,0)',
          }}
          style={{ border: '1px solid transparent' }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="font-mono text-sm font-medium tracking-widest text-ink-primary uppercase"
          >
            UpSosh
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop right: auth or CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-border bg-bg-secondary flex items-center justify-center hover:border-accent transition-colors duration-200"
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                >
                  <UserAvatar src={user.photoUrl} name={user.name} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.2, ease: EASE_VERCEL }}
                      className="absolute top-full right-0 mt-2 w-52 bg-bg-primary border border-border rounded-2xl shadow-lg overflow-hidden z-50"
                      style={{ transformOrigin: 'top right' }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="font-sans text-sm font-medium text-ink-primary truncate">
                          {user.name}
                        </p>
                        <p className="font-mono text-[10px] text-ink-muted truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                        >
                          My Bookings
                        </Link>
                        {user.hostStatus === 'verified' && (
                          <Link
                            href="/host/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                          >
                            Host Dashboard
                          </Link>
                        )}
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                        >
                          Settings
                        </Link>

                        {/* Divider */}
                        <div className="my-1 border-t border-border" />

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 font-sans text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors duration-300"
                >
                  Sign in
                </Link>
                <MagneticButton>
                  <Link
                    href="/signup"
                    data-cursor="JOIN"
                    className="font-sans text-sm font-medium bg-ink-primary text-bg-primary px-5 py-2.5 rounded-full hover:bg-accent transition-colors duration-300"
                  >
                    Get early access
                  </Link>
                </MagneticButton>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex flex-col justify-center gap-1.5 group"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-px bg-ink-primary transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}
            />
            <span
              className={`block h-px bg-ink-primary transition-all duration-300 ${menuOpen ? 'w-0 opacity-0' : ''}`}
            />
            <span
              className={`block h-px bg-ink-primary transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}
            />
          </button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_VERCEL }}
            className="md:hidden mx-6 mt-2 bg-bg-primary border border-border rounded-2xl p-6 shadow-lg"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-base text-ink-primary py-3 border-b border-border/50 last:border-0"
                >
                  {link.name}
                </Link>
              ))}

              {isAuth && user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="font-sans text-base text-ink-primary py-3 border-b border-border/50"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setMenuOpen(false)}
                    className="font-sans text-base text-ink-primary py-3 border-b border-border/50"
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="mt-4 font-sans text-sm font-medium text-red-500 py-3 text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={() => setMenuOpen(false)}
                    className="mt-4 font-sans text-sm font-medium text-ink-primary py-3 text-center border border-border rounded-full"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 font-sans text-sm font-medium bg-ink-primary text-bg-primary px-5 py-3 rounded-full text-center"
                  >
                    Get early access
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
