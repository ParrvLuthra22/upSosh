'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconCalendarEvent,
  IconMicrophone2,
  IconSparkles,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/stores/auth';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;
const BG_URL = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&q=80&fit=crop';

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-coral' };
  if (score <= 2) return { score: 40, label: 'Fair', color: 'bg-coral' };
  if (score <= 3) return { score: 60, label: 'Good', color: 'bg-emerald' };
  if (score <= 4) return { score: 80, label: 'Strong', color: 'bg-emerald' };
  return { score: 100, label: 'Excellent', color: 'bg-lime' };
}

function StrengthBar({ password }: { password: string }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>
      <p className={cn('font-mono text-[11px] mt-1', {
        'text-coral': color === 'bg-coral',
        'text-emerald': color === 'bg-emerald',
        'text-lime': color === 'bg-lime',
      })}>
        {label}
      </p>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  type = 'text', value, onChange, error, leadingIcon, trailingSlot, placeholder, autoComplete,
}: {
  type?: string; value: string; onChange: (v: string) => void; error?: string;
  leadingIcon: React.ReactNode; trailingSlot?: React.ReactNode;
  placeholder?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={cn(
      'relative flex items-center h-12 rounded-xl bg-surface border transition-all',
      error ? 'border-coral ring-2 ring-coral/20' : focused ? 'border-lime ring-2 ring-lime/20' : 'border-border',
    )}>
      <span className="absolute left-4 text-cream-faint">{leadingIcon}</span>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent pl-10 pr-10 h-full font-sans text-[15px] text-cream placeholder:text-cream-faint outline-none"
      />
      {trailingSlot && <div className="absolute right-4">{trailingSlot}</div>}
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────

type Role = 'attendee' | 'host' | 'both';

const ROLES: { id: Role; icon: React.ReactNode; label: string; desc: string }[] = [
  { id: 'attendee', icon: <IconCalendarEvent size={20} />, label: 'Attend events', desc: 'Discover and book experiences' },
  { id: 'host',     icon: <IconMicrophone2 size={20} />,  label: 'Host events',   desc: 'Create and manage your events' },
  { id: 'both',     icon: <IconSparkles size={20} />,      label: 'Both',          desc: 'The full UpSosh experience' },
];

function RoleCard({ role, selected, onSelect }: { role: typeof ROLES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-center',
        selected
          ? 'bg-lime/10 border-lime/40 text-lime'
          : 'bg-surface border-border text-cream-dim hover:border-border-strong hover:text-cream',
      )}
    >
      <div className={cn('transition-colors', selected ? 'text-lime' : 'text-cream-faint')}>
        {role.icon}
      </div>
      <span className="font-sans text-[13px] font-medium">{role.label}</span>
      <span className="font-mono text-[10px] leading-tight opacity-70">{role.desc}</span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lime">
          <IconCheck size={14} />
        </motion.div>
      )}
    </button>
  );
}

// ─── Floating asterisk ────────────────────────────────────────────────────────

function LimeAsterisk() {
  return (
    <motion.div
      className="absolute bottom-10 right-10 select-none pointer-events-none z-20"
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x="27" y="4" width="6" height="52" rx="3" fill="var(--lime)"
            transform={`rotate(${i * 45} 30 30)`} />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [role, setRole]         = useState<Role>('attendee');
  const [agreed, setAgreed]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (!agreed) e.terms = 'You must agree to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setServerError('');
    try {
      await register({ name, email, password, role });
      router.push('/discover');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Try again.');
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-void">

      {/* LEFT — photo panel */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${BG_URL}')` }} />
        <div className="absolute inset-0 bg-void/65" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "url('/noise.svg')", backgroundSize: '200px 200px' }} />

        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          <Link href="/" className="font-display italic text-[26px] text-cream tracking-tight w-fit">
            UpSosh
          </Link>

          <div>
            <blockquote className="display-md text-cream italic text-balance leading-[1.1] max-w-lg">
              "Real events. Real people.<br />Worth showing up to."
            </blockquote>
            <p className="font-sans text-[13px] text-cream-dim mt-5">
              — Across 40+ cities in India
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { n: '2,400+', l: 'Hosts' },
              { n: '18,000+', l: 'Attendees' },
              { n: '6,200+', l: 'Events hosted' },
            ].map(({ n, l }) => (
              <div key={l} className="bg-border backdrop-blur-md border border-[rgba(244,241,234,0.10)] rounded-xl p-4">
                <p className="font-display text-[24px] text-cream leading-none">{n}</p>
                <p className="font-mono text-[10px] text-cream-faint uppercase tracking-widest mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <LimeAsterisk />
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center p-8 min-h-screen lg:min-h-0">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {/* Mobile wordmark */}
          <Link href="/" className="font-display italic text-[22px] text-cream tracking-tight block lg:hidden mb-8">
            UpSosh
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="display-md text-cream">Create account</h1>
            <p className="font-sans text-[15px] text-cream-dim mt-2">
              Your first event is one step away.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <Field type="text" value={name} onChange={setName}
                error={errors.name} placeholder="Full name" autoComplete="name"
                leadingIcon={<IconUser size={16} />} />
              {errors.name && <p className="mt-1.5 font-mono text-[12px] text-coral">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <Field type="email" value={email} onChange={setEmail}
                error={errors.email} placeholder="Email address" autoComplete="email"
                leadingIcon={<IconMail size={16} />} />
              {errors.email && <p className="mt-1.5 font-mono text-[12px] text-coral">{errors.email}</p>}
            </div>

            {/* Password + strength bar */}
            <div>
              <Field
                type={showPwd ? 'text' : 'password'} value={password} onChange={setPassword}
                error={errors.password} placeholder="Password" autoComplete="new-password"
                leadingIcon={<IconLock size={16} />}
                trailingSlot={
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="text-cream-faint hover:text-cream transition-colors"
                    aria-label={showPwd ? 'Hide' : 'Show'}>
                    {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                }
              />
              {errors.password && <p className="mt-1.5 font-mono text-[12px] text-coral">{errors.password}</p>}
              <StrengthBar password={password} />
            </div>

            {/* Role selector */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-cream-faint mb-3">
                I want to…
              </p>
              <div className="flex gap-2">
                {ROLES.map(r => (
                  <RoleCard key={r.id} role={r} selected={role === r.id} onSelect={() => setRole(r.id)} />
                ))}
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setAgreed(v => !v)}
                  className={cn(
                    'w-5 h-5 flex-shrink-0 mt-0.5 rounded border flex items-center justify-center transition-all',
                    agreed ? 'bg-lime border-lime' : 'border-border group-hover:border-border-strong',
                  )}
                >
                  <AnimatePresence>
                    {agreed && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="text-void">
                        <IconCheck size={12} strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <span className="font-sans text-[13px] text-cream-dim leading-relaxed">
                  I agree to UpSosh's{' '}
                  <Link href="/terms" className="text-lime hover:text-lime/80 transition-colors">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-lime hover:text-lime/80 transition-colors">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="mt-1.5 font-mono text-[12px] text-coral">{errors.terms}</p>}
            </div>

            {serverError && <p className="font-mono text-[12px] text-coral">{serverError}</p>}

            {/* CTA */}
            <motion.button type="submit" disabled={isLoading} whileTap={{ scale: 0.97 }}
              className="w-full h-12 bg-lime text-void rounded-full font-sans text-[15px] font-semibold hover:bg-lime/90 disabled:opacity-50 transition-colors flex items-center justify-center">
              {isLoading
                ? <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                : 'Create account'}
            </motion.button>
          </form>

          <p className="text-center font-sans text-[14px] text-cream-dim mt-6">
            Already have an account?{' '}
            <Link href="/signin" className="text-lime hover:text-lime/80 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
