'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Avatar Upload ───────────────────────────────────────────────────────────

function AvatarUpload({
  currentUrl,
  name,
  onUpload,
}: {
  currentUrl?: string;
  name?: string;
  onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  // Keep preview in sync with currentUrl
  useEffect(() => { setPreview(currentUrl); }, [currentUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      // Try to upload to backend
      const formData = new FormData();
      formData.append('avatar', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const url = data.avatarUrl ?? data.photoUrl ?? objectUrl;
        setPreview(url);
        onUpload(url);
        toast.success('Profile photo updated.');
      } else {
        // Backend doesn't have upload endpoint — keep local preview, save as data URL
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          setPreview(dataUrl);
          onUpload(dataUrl);
          toast.success('Photo updated locally.');
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback to base64 if network fails
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onUpload(dataUrl);
        toast.success('Photo updated.');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }

  const initial = name?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="relative group w-28 h-28 flex-shrink-0">
      <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-border bg-bg-secondary flex items-center justify-center">
        {preview ? (
          <img src={preview} alt={name ?? 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span className="font-display text-4xl text-ink-muted">{initial}</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
        title="Change photo"
      >
        <span className="text-white text-xs font-sans">Change</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Profile Form ─────────────────────────────────────────────────────────────

function ProfileForm({ user, onSaved }: { user: any; onSaved: (u: any) => void }) {
  const [form, setForm] = useState({
    name: user.name ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    photoUrl: user.photoUrl ?? user.avatar ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Try new endpoint first
      let res: any;
      try {
        res = await api.patch<{ user: any }>('/api/users/me', form);
        onSaved(res.user);
      } catch {
        // Fallback to legacy updateProfile
        res = await api.updateProfile({ name: form.name, bio: form.bio, avatar: form.photoUrl });
        onSaved({ ...user, ...form });
      }
      toast.success('Profile saved.');
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Display name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          placeholder="New Delhi, India"
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          rows={4}
          maxLength={500}
          placeholder="Tell people a little about yourself…"
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none"
        />
        <p className="font-mono text-[10px] text-ink-muted text-right mt-1">{form.bio.length}/500</p>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-ink-primary text-bg-primary rounded-full font-sans text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

// ─── Security Form ────────────────────────────────────────────────────────────

function SecurityForm() {
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.patch('/api/users/me/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password updated.');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message ?? 'Password update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleChange} className="space-y-4">
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
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-ink-primary text-bg-primary rounded-full font-sans text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
        >
          {saving ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

type Tab = 'profile' | 'security';

export default function ProfilePage() {
  const { user: authUser, isAuth, loading, setUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');
  const [user, setLocalUser] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');

  useEffect(() => {
    if (!loading && !isAuth && !hasToken) router.push('/signin?from=/profile');
  }, [loading, isAuth, hasToken, router]);

  useEffect(() => {
    // Use persisted user from store immediately
    if (authUser) {
      setLocalUser(authUser);
      setDataLoading(false);
    } else {
      // Fetch from API
      const load = async () => {
        try {
          const data = await api.getMe();
          const u = data?.user ?? data;
          if (u) {
            setLocalUser(u);
            setUser(u);
          }
        } catch {
          // use whatever is in localStorage
          try {
            const stored = localStorage.getItem('userData');
            if (stored) setLocalUser(JSON.parse(stored));
          } catch {}
        } finally {
          setDataLoading(false);
        }
      };
      if (hasToken) load();
    }
  }, [authUser]);

  function handleSaved(updatedUser: any) {
    setLocalUser(updatedUser);
    setUser(updatedUser);
  }

  function handleAvatarUpload(url: string) {
    const updated = { ...user, photoUrl: url, avatar: url };
    setLocalUser(updated);
    setUser(updated);
    // Try to persist to API
    api.patch('/api/users/me', { photoUrl: url }).catch(() =>
      api.updateProfile({ avatar: url }).catch(() => {})
    );
  }

  if (dataLoading && !user) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
  ];

  const rawUser = user as any;
  const resolvedHostStatus = user.hostStatus || (rawUser.hostVerified || rawUser.isHost ? 'verified' : 'none');

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-28 pb-24">

        {/* Header */}
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ PROFILE ]</p>

        {/* Avatar + info */}
        <div className="flex items-center gap-6 mb-10">
          <AvatarUpload
            currentUrl={user.photoUrl ?? user.avatar}
            name={user.name}
            onUpload={handleAvatarUpload}
          />
          <div>
            <h1 className="font-display text-3xl text-ink-primary mb-1" style={{ letterSpacing: '-0.03em' }}>
              {user.name ?? 'Your profile'}
            </h1>
            <p className="font-mono text-xs text-ink-muted mb-2">{user.email}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {resolvedHostStatus === 'verified' && (
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-verified/10 text-verified border border-verified/20">
                  ✓ Verified Host
                </span>
              )}
              {resolvedHostStatus === 'pending' && (
                <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Verification pending
                </span>
              )}
              {resolvedHostStatus === 'none' && (
                <Link
                  href="/become-a-host"
                  className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-border text-ink-muted hover:border-accent hover:text-accent transition-colors"
                >
                  Become a host →
                </Link>
              )}
              <p className="font-mono text-[10px] text-ink-light">Hover your photo to change it</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-0 border-b border-border mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-3 font-sans text-sm transition-colors ${tab === t.id ? 'text-ink-primary' : 'text-ink-muted hover:text-ink-primary'}`}
            >
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="profile-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: EASE_VERCEL }}
          >
            <div className="border border-border rounded-2xl p-6 bg-bg-primary">
              {tab === 'profile' && <ProfileForm user={user} onSaved={handleSaved} />}
              {tab === 'security' && <SecurityForm />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link href="/my-bookings" className="border border-border rounded-xl p-4 hover:bg-bg-secondary transition-colors group">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Bookings</p>
            <p className="font-display text-lg text-ink-primary group-hover:text-accent transition-colors">View tickets →</p>
          </Link>
          <Link href="/settings" className="border border-border rounded-xl p-4 hover:bg-bg-secondary transition-colors group">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Settings</p>
            <p className="font-display text-lg text-ink-primary group-hover:text-accent transition-colors">Privacy & notifications →</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
