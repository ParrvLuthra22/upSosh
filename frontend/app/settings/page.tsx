'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useEscapeKey } from '@/lib/a11y';

type Section = 'account' | 'profile' | 'host' | 'danger';

const NAV_ITEMS: { id: Section; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'host', label: 'Host Settings' },
  { id: 'danger', label: 'Danger Zone' },
];

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink-primary text-bg-primary rounded-full font-sans text-sm font-medium hover:bg-accent transition-colors duration-300 disabled:opacity-60"
    >
      {saving ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : saved ? (
        <span>✓ Saved</span>
      ) : (
        'Save'
      )}
    </button>
  );
}

function SectionHeading({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <h2 className={`font-display text-3xl mb-8 ${color ?? 'text-ink-primary'}`} style={{ letterSpacing: '-0.03em' }}>
      {children}
    </h2>
  );
}

// ─── Account Section ─────────────────────────────────────────────────────────

function AccountSection({ user }: { user: any }) {
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.patch('/api/users/me/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password updated.');
      setSaved(true);
      setPwd({ current: '', newPwd: '', confirm: '' });
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to update password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeading>Account.</SectionHeading>

      {/* Email */}
      <div className="border border-border rounded-2xl p-6 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Email address</p>
        <p className="font-sans text-base text-ink-primary mb-1">{user.email}</p>
        <p className="font-mono text-xs text-ink-light">Email cannot be changed</p>
      </div>

      {/* Password */}
      <div className="border border-border rounded-2xl p-6">
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Change password</p>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: 'Current password', key: 'current', value: pwd.current },
            { label: 'New password', key: 'newPwd', value: pwd.newPwd },
            { label: 'Confirm new password', key: 'confirm', value: pwd.confirm },
          ].map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">{f.label}</label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => setPwd((p) => ({ ...p, [f.key]: e.target.value }))}
                required
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <SaveButton saving={saving} saved={saved} />
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [form, setForm] = useState({ name: user.name ?? '', bio: user.bio ?? '', location: user.location ?? '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch<{ user: any }>('/api/users/me', form);
      onUpdate(res.user);
      toast.success('Profile updated.');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeading>Profile.</SectionHeading>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-border rounded-2xl p-6 space-y-5">
          {[
            { label: 'Display name', key: 'name', type: 'text', value: form.name },
            { label: 'Location', key: 'location', type: 'text', value: form.location },
          ].map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              maxLength={500}
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Tell people about yourself…"
            />
            <p className="font-mono text-[10px] text-ink-muted text-right mt-1">{form.bio.length}/500</p>
          </div>
        </div>
        <div className="flex justify-end">
          <SaveButton saving={saving} saved={saved} />
        </div>
      </form>
    </div>
  );
}

// ─── Host Section ─────────────────────────────────────────────────────────────

function HostSection({ user }: { user: any }) {
  const [bio, setBio] = useState(user.hostBio ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/api/users/me', { hostBio: bio });
      toast.success('Host settings saved.');
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <SectionHeading>Host settings.</SectionHeading>
      <div className="border border-border rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-verified/30 bg-verified/10 text-verified">
            ✓ Verified Host
          </span>
        </div>
        <form onSubmit={handleSave}>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Public host bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none mb-4"
            placeholder="Describe your hosting style…"
          />
          <div className="flex justify-end">
            <SaveButton saving={saving} saved={false} />
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Danger Zone ─────────────────────────────────────────────────────────────

function DangerZone() {
  const [deleteInput, setDeleteInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEscapeKey(() => setShowDeleteModal(false), showDeleteModal);
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleDelete() {
    if (deleteInput !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      await api.delete('/api/users/me');
      signOut();
      toast.success('Account deleted.');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message ?? 'Deletion failed');
    }
  }

  return (
    <div>
      <SectionHeading color="text-red-500">Danger zone.</SectionHeading>
      <div className="border border-red-200 rounded-2xl p-6 bg-red-50/50">
        <h3 className="font-sans text-base font-medium text-red-600 mb-2">Delete account</h3>
        <p className="font-sans text-sm text-ink-muted mb-4">
          Once deleted, your account and all data are permanently removed. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 bg-red-500 text-white rounded-full font-sans text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Delete my account
        </button>
      </div>

      {/* Delete modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              role="button"
              tabIndex={0}
              aria-label="Close"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowDeleteModal(false); }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE_VERCEL }}
            >
              <div className="bg-bg-primary border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="font-display text-2xl text-ink-primary mb-3">Are you sure?</h2>
                <p className="font-sans text-sm text-ink-muted mb-6">
                  This action <strong>cannot</strong> be undone. Type <code className="font-mono text-accent">DELETE</code> below to confirm.
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-mono text-sm text-ink-primary focus:outline-none focus:border-red-400 transition-colors mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 border border-border rounded-full font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors">Cancel</button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteInput !== 'DELETE'}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-full font-sans text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-40"
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user: authUser, isAuthenticated, hydrated, isLoading } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState<Section>('account');
  // Initialise directly — no loading flash
  const [user, setUser] = useState<any>(authUser ?? null);

  // Keep in sync with store updates
  useEffect(() => { if (authUser) setUser(authUser); }, [authUser]);

  // Redirect unauthenticated users. Gated on `hydrated` (and not `isLoading`):
  // without this, a returning logged-in user is bounced to /signin on the very
  // first render, before the store finishes rehydrating and /api/auth/me has
  // had a chance to confirm the session — there is no longer a synchronous
  // localStorage token to fall back on while that resolves.
  useEffect(() => {
    if (!hydrated || isLoading) return;
    if (!authUser) router.push('/signin?from=/settings');
  }, [hydrated, isLoading, authUser, router]);

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.id === 'host') return user.hostStatus === 'verified';
    return true;
  });

  const sections: Record<Section, React.ReactNode> = {
    account: <AccountSection user={user} />,
    profile: <ProfileSection user={user} onUpdate={setUser} />,
    host: <HostSection user={user} />,
    danger: <DangerZone />,
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ ACCOUNT ]</p>
        <h1 className="font-display text-4xl text-ink-primary mb-10" style={{ letterSpacing: '-0.03em' }}>Settings.</h1>

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <nav className="sticky top-28 space-y-0.5">
              {filteredNav.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`relative w-full text-left px-4 py-2.5 rounded-xl font-sans text-sm transition-colors ${
                      isActive ? 'text-accent' : 'text-ink-muted hover:text-ink-primary'
                    } ${item.id === 'danger' ? 'text-red-400 hover:text-red-500 mt-4' : ''}`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="settings-sidebar-bg"
                        className="absolute inset-0 bg-accent-soft rounded-xl border-l-2 border-l-accent"
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile tab bar */}
          <div className="md:hidden -mx-6 mb-6 overflow-x-auto">
            <div className="flex gap-1 px-6 pb-2">
              {filteredNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-mono text-xs transition-colors ${
                    active === item.id ? 'bg-accent text-white' : 'bg-bg-secondary text-ink-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: EASE_VERCEL }}
              >
                {sections[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
