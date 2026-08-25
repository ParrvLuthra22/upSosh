'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/stores/auth';

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Planner',  href: '/planner' },
  { label: 'About',    href: '/about' },
];

// ─── Animated underline nav link ─────────────────────────────────────────────

function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', paddingBottom: 2, textDecoration: 'none', color: 'var(--cream-dim)', fontSize: 14 }}
    >
      {label}
      <motion.span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'var(--lime)',
          transformOrigin: 'left',
          display: 'block',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      />
    </Link>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

export default function Nav() {
  const { user, isAuthenticated } = useAuth();

  return (
    <motion.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '4.5rem',          /* h-18 */
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(10,10,11,0.85)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Left — wordmark */}
        <Link href="/" style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--cream)', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          UpSosh
        </Link>

        {/* Center — nav links */}
        <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(link => (
            <NavLink key={link.label} {...link} />
          ))}
        </div>

        {/* Right — auth CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAuthenticated && user ? (
            <>
              <Link
                href="/discover"
                className="hidden md:block"
                style={{ fontFamily: 'inherit', fontSize: 14, color: 'var(--cream-dim)', textDecoration: 'none' }}
              >
                Browse events
              </Link>
              <Link
                href="/profile"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  overflow: 'hidden',
                  border: '2px solid rgba(212,255,63,0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--surface-2)',
                  flexShrink: 0,
                  textDecoration: 'none',
                }}
                title="My profile"
              >
                {user.photoUrl ? (
                  <Image src={user.photoUrl} alt={user.name} width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 14, fontWeight: 700, color: 'var(--lime)' }}>
                    {(user.name?.[0] ?? 'U').toUpperCase()}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden md:block"
                style={{ fontFamily: 'inherit', fontSize: 14, color: 'var(--cream-dim)', textDecoration: 'none' }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  height: 40,
                  padding: '0 20px',
                  backgroundColor: 'var(--lime)',
                  color: 'var(--void)',
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
