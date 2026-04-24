'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import MagneticButton from '@/components/ui/MagneticButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PublicUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  bio?: string;
  photoUrl?: string;
  location?: string;
  hostStatus?: 'none' | 'pending' | 'verified';
  isSuperhost?: boolean;
  memberSince?: string;
  eventsAttended?: number;
  eventsHosted?: number;
  privacy?: { hideAttending?: boolean };
}

interface Event {
  id: string;
  title: string;
  image?: string;
  date?: string;
  category?: string;
  price?: number | 'Free';
  spotsLeft?: number;
}

const TABS = ['Hosted', 'Attending', 'Reviews'] as const;
type Tab = typeof TABS[number];

// ─── Components ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <motion.div
        className="border border-border rounded-xl overflow-hidden bg-bg-primary hover:bg-bg-secondary transition-colors group"
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
      >
        {event.image && (
          <div className="h-36 overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-4">
          <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1">{event.category}</p>
          <p className="font-display text-sm text-ink-primary leading-snug line-clamp-2 mb-2">{event.title}</p>
          {event.date && (
            <p className="font-mono text-[10px] text-ink-muted">{event.date}</p>
          )}
          <div className="mt-2 flex items-center justify-between">
            {event.price !== undefined && (
              <span className="font-mono text-xs text-ink-primary">
                {event.price === 'Free' ? 'Free' : `₹${event.price}`}
              </span>
            )}
            {event.spotsLeft !== undefined && (
              <span className="font-mono text-[10px] text-ink-muted">{event.spotsLeft} spots left</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, { title: string; sub: string }> = {
    Hosted: { title: 'No events hosted yet.', sub: 'Events this host creates will appear here.' },
    Attending: { title: 'No public events.', sub: 'Events they RSVP to will appear here.' },
    Reviews: { title: 'No reviews yet.', sub: 'Reviews from co-attendees will appear here.' },
  };
  const m = messages[tab];
  return (
    <div className="py-16 text-center">
      <p className="font-display text-2xl text-ink-primary mb-2">{m.title}</p>
      <p className="font-sans text-base text-ink-muted">{m.sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Hosted');
  const [hostedEvents, setHostedEvents] = useState<Event[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);

  const isOwner = authUser && ((authUser as any).username === username || authUser.id === profile?.id);

  useEffect(() => {
    if (!username) return;
    const load = async () => {
      try {
        const data = await api.get<{ user: PublicUser }>(`/api/users/${username}`);
        setProfile(data.user);

        // Load hosted events if host
        if (data.user.hostStatus === 'verified') {
          try {
            const evData = await api.get<{ events: Event[] }>(`/api/events?hostId=${data.user.id}`);
            setHostedEvents(evData.events ?? []);
          } catch { /* no events */ }
        }

        // Load attending events
        if (!data.user.privacy?.hideAttending) {
          try {
            const attData = await api.get<{ events: Event[] }>(`/api/users/${data.user.id}/attending`);
            setAttendingEvents(attData.events ?? []);
          } catch { /* none */ }
        }
      } catch (err: any) {
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="space-y-4 w-full max-w-3xl px-6">
          {/* skeleton */}
          <div className="flex gap-8">
            <div className="w-48 h-64 bg-bg-secondary rounded-2xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-3 bg-bg-secondary rounded animate-pulse w-32" />
              <div className="h-12 bg-bg-secondary rounded animate-pulse w-64" />
              <div className="h-4 bg-bg-secondary rounded animate-pulse w-20" />
              <div className="h-16 bg-bg-secondary rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-4">[ 404 ]</p>
        <h1 className="font-display text-5xl text-ink-primary mb-4">User not found.</h1>
        <p className="font-sans text-base text-ink-muted mb-8">The profile you're looking for doesn't exist.</p>
        <Link href="/discover" className="font-sans text-sm text-accent hover:text-ink-primary transition-colors">
          ← Back to Discover
        </Link>
      </div>
    );
  }

  const memberYear = profile.memberSince
    ? new Date(profile.memberSince).getFullYear()
    : new Date().getFullYear();

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const visibleTabs: Tab[] = [
    ...(profile.hostStatus === 'verified' ? (['Hosted'] as Tab[]) : []),
    ...(!profile.privacy?.hideAttending ? (['Attending'] as Tab[]) : []),
    'Reviews',
  ];

  const tabContent: Record<Tab, Event[]> = {
    Hosted: hostedEvents,
    Attending: attendingEvents,
    Reviews: [],
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Hero Block ──────────────────────────────────────────────── */}
      <section className="pt-28 md:pt-36 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">

          {/* Photo */}
          <motion.div
            className="flex-shrink-0 w-48 md:w-64"
            initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.8, ease: EASE_VERCEL }}
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-bg-secondary border border-border">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-5xl text-ink-muted">{initials}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.15 }}
          >
            {/* Eyebrow */}
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-4">
              [ MEMBER SINCE {memberYear} ]
            </p>

            {/* Name */}
            <h1
              className="font-display text-ink-primary leading-none mb-2"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.03em' }}
            >
              {profile.name}
            </h1>

            {/* Username */}
            {profile.username && (
              <p className="font-mono text-sm text-ink-muted mb-4">@{profile.username}</p>
            )}

            {/* Verified/Superhost badge */}
            <div className="flex flex-wrap gap-2 mb-5">
              {profile.hostStatus === 'verified' && (
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-verified/30 bg-verified/10 text-verified">
                  ✓ Verified Host
                </span>
              )}
              {profile.isSuperhost && (
                <span
                  className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#F0C96A22,#C9A84C22)', color: '#C9A84C', border: '1px solid #C9A84C33' }}
                >
                  ★ Superhost
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="font-sans text-lg text-ink-muted leading-relaxed mb-4 max-w-[480px]">
                {profile.bio}
              </p>
            )}

            {/* Location */}
            {profile.location && (
              <p className="font-mono text-sm text-ink-muted mb-5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              {isOwner ? (
                <Link
                  href="/settings"
                  className="font-sans text-sm border border-border text-ink-primary px-5 py-2.5 rounded-full hover:border-ink-primary transition-colors duration-200"
                >
                  Edit profile
                </Link>
              ) : (
                <>
                  <MagneticButton>
                    <button className="font-sans text-sm font-medium bg-accent text-white px-5 py-2.5 rounded-full hover:bg-ink-primary transition-colors duration-300">
                      Follow
                    </button>
                  </MagneticButton>
                  <button className="font-sans text-sm border border-border text-ink-muted px-5 py-2.5 rounded-full hover:text-ink-primary hover:border-ink-primary transition-colors duration-200">
                    Message
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <p className="font-mono text-[12px] text-ink-muted">
              {profile.eventsAttended ?? 0} events attended
              {' · '}
              {profile.eventsHosted ?? 0} hosted
              {' · '}
              Member since {new Date(profile.memberSince ?? Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      {visibleTabs.length > 0 && (
        <section className="px-6 md:px-16 max-w-7xl mx-auto pb-24">
          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-border mb-10 relative">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 font-sans text-sm transition-colors ${
                  activeTab === tab ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.span
                    layoutId="profile-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: EASE_VERCEL }}
            >
              {activeTab === 'Reviews' ? (
                <EmptyState tab="Reviews" />
              ) : tabContent[activeTab].length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tabContent[activeTab].map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
