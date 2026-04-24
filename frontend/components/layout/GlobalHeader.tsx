'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import { useAuth } from '@/store/authStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'event' | 'host' | 'verification' | 'general';
  read: boolean;
  createdAt: string;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { name: 'Discover', href: '/discover' },
  { name: 'Planner', href: '/planner' },
  { name: 'About', href: '/about' },
];

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const icons: Record<Notification['type'], string> = {
    booking: '🎟',
    event: '📅',
    host: '🏠',
    verification: '✓',
    general: '💬',
  };
  return <span className="text-base">{icons[type]}</span>;
}

function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}) {
  const unread = notifications.filter((n) => !n.read);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="absolute right-0 top-full mt-3 w-[380px] max-h-[80vh] overflow-y-auto bg-bg-primary border border-border rounded-2xl shadow-2xl z-50"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_VERCEL }}
            style={{ transformOrigin: 'top right' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <p className="font-display text-lg text-ink-primary">Notifications</p>
              {unread.length > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="font-mono text-[11px] text-accent hover:text-ink-primary transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="font-display text-xl text-ink-primary mb-2">All caught up.</p>
                <p className="font-sans text-sm text-ink-muted">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-4 flex gap-3 transition-colors ${
                      !n.read ? 'bg-accent-soft border-l-2 border-l-accent' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center flex-shrink-0">
                      <NotificationIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-ink-primary leading-snug">{n.title}</p>
                      <p className="font-sans text-[13px] text-ink-muted leading-relaxed mt-0.5">{n.body}</p>
                      <p className="font-mono text-[10px] text-ink-light mt-1">
                        {new Date(n.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Avatar Dropdown ──────────────────────────────────────────────────────────

function UserAvatar({ src, name }: { src?: string; name?: string }) {
  const initial = name?.[0]?.toUpperCase() ?? 'U';
  if (src) {
    return <img src={src} alt={name ?? 'User'} className="w-full h-full object-cover" />;
  }
  return <span className="font-sans text-sm font-medium text-ink-primary">{initial}</span>;
}

function AvatarDropdown({
  user,
  onSignOut,
}: {
  user: { name: string; email: string; photoUrl?: string; hostStatus?: string };
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const username = (user as any).username;
  // Normalize host status — backend may use isHost/hostVerified (legacy) or hostStatus (new)
  const rawUser = user as any;
  const resolvedHostStatus: string =
    user.hostStatus ||
    (rawUser.hostVerified || rawUser.isHost === true ? 'verified' : 'none');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden border border-border bg-bg-secondary flex items-center justify-center hover:border-accent transition-colors duration-200"
        aria-label="Account menu"
      >
        <UserAvatar src={user.photoUrl} name={user.name} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-56 bg-bg-primary border border-border rounded-2xl shadow-xl overflow-hidden z-50"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_VERCEL }}
            style={{ transformOrigin: 'top right' }}
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="font-sans text-sm font-medium text-ink-primary truncate">{user.name}</p>
              <p className="font-mono text-[10px] text-ink-muted truncate">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href={username ? `/u/${username}` : '/profile'}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
              >
                My profile
              </Link>
              <Link
                href="/my-bookings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
              >
                My bookings
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
              >
                Settings
              </Link>

              {resolvedHostStatus === 'verified' && (
                <>
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/host/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                  >
                    Host dashboard
                  </Link>
                  <Link
                    href="/host/events"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                  >
                    My events
                  </Link>
                  <Link
                    href="/host/events/new"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-muted hover:text-ink-primary hover:bg-bg-secondary transition-colors"
                  >
                    Create event
                  </Link>
                </>
              )}

              {resolvedHostStatus === 'none' || resolvedHostStatus === '' ? (
                <>
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/become-a-host"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-accent hover:bg-accent-soft transition-colors"
                  >
                    Become a host
                  </Link>
                </>
              ) : resolvedHostStatus === 'pending' ? (
                <>
                  <div className="my-1 border-t border-border" />
                  <div className="flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-ink-light cursor-not-allowed">
                    Verification pending…
                  </div>
                </>
              ) : null}

              <div className="my-1 border-t border-border" />
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 font-sans text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  isOpen,
  onClose,
  isAuth,
  user,
  onSignOut,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  isAuth: boolean;
  user: any;
  onSignOut: () => void;
  pathname: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-xl flex flex-col"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.35, ease: EASE_VERCEL }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <Link href="/" onClick={onClose} className="font-mono text-sm font-medium tracking-widest text-ink-primary uppercase">
              UpSosh
            </Link>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links — stagger in */}
          <nav className="flex-1 flex flex-col justify-center px-8 gap-1">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: EASE_VERCEL }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`block font-display text-5xl leading-tight tracking-tight mb-2 transition-colors ${
                    pathname.startsWith(link.href) ? 'text-accent' : 'text-ink-primary hover:text-accent'
                  }`}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}

            {user?.hostStatus === 'verified' && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.23, duration: 0.4, ease: EASE_VERCEL }}
              >
                <Link href="/host/dashboard" onClick={onClose} className="block font-display text-5xl leading-tight tracking-tight mb-2 text-ink-primary hover:text-accent transition-colors">
                  Dashboard
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Bottom auth area */}
          <motion.div
            className="px-8 pb-10 pt-6 border-t border-border"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: EASE_VERCEL }}
          >
            {isAuth && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-ink-primary">{user.name}</p>
                  <p className="font-mono text-[11px] text-ink-muted">{user.email}</p>
                </div>
                <button
                  onClick={() => { onClose(); onSignOut(); }}
                  className="font-sans text-sm text-red-500 hover:text-red-600 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/signin" onClick={onClose} className="font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="font-sans text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-full hover:bg-ink-primary transition-colors duration-300"
                >
                  Get early access
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── GlobalHeader ─────────────────────────────────────────────────────────────

export default function GlobalHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();
  const { user, isAuth, signOut } = useAuth();
  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch notifications (poll every 30s if auth)
  useEffect(() => {
    if (!isAuth) return;
    const fetchNotifs = async () => {
      try {
        const data = await api.get<{ notifications: Notification[] }>('/api/notifications');
        setNotifications(data.notifications ?? []);
      } catch {
        // silent fail
      }
    };
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [isAuth]);

  async function handleSignOut() {
    await signOut();
    toast.success('See you soon.');
    router.push('/');
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const logoHref = isAuth ? '/discover' : '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="px-6 md:px-10 pt-5">
        <motion.div
          className="flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500"
          animate={{
            backgroundColor: scrolled ? 'rgba(250,250,247,0.92)' : 'rgba(250,250,247,0)',
            backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
            borderColor: scrolled ? 'rgba(232,228,220,1)' : 'rgba(232,228,220,0)',
          }}
          style={{ border: '1px solid transparent' }}
        >
          {/* Logo */}
          <Link
            href={logoHref}
            className="font-mono text-sm font-medium tracking-widest text-ink-primary uppercase"
          >
            UpSosh
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 relative">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative font-sans text-sm transition-colors duration-300 pb-0.5 ${
                    isActive ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </Link>
              );
            })}
            {user?.hostStatus === 'verified' && (
              <Link
                href="/host/dashboard"
                className={`relative font-sans text-sm transition-colors duration-300 pb-0.5 ${
                  pathname.startsWith('/host/dashboard') ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                Dashboard
                {pathname.startsWith('/host/dashboard') && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            )}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth && user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink-primary transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-accent rounded-full" />
                    )}
                  </button>
                  <div className="relative">
                    <NotificationPanel
                      isOpen={notifOpen}
                      onClose={() => setNotifOpen(false)}
                      notifications={notifications}
                      onMarkAllRead={handleMarkAllRead}
                    />
                  </div>
                </div>

                {/* Avatar */}
                <AvatarDropdown user={user} onSignOut={handleSignOut} />
              </>
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
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="block h-px bg-ink-primary transition-all duration-300" />
            <span className="block h-px bg-ink-primary transition-all duration-300" />
            <span className="block h-px bg-ink-primary transition-all duration-300 w-1/2 group-hover:w-full" />
          </button>
        </motion.div>
      </div>

      {/* Mobile fullscreen menu */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isAuth={isAuth}
        user={user}
        onSignOut={handleSignOut}
        pathname={pathname}
      />
    </header>
  );
}
