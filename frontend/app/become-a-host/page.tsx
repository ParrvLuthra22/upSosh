'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import MagneticButton from '@/components/ui/MagneticButton';
import { toast } from 'sonner';

// ─── Earnings Calculator ─────────────────────────────────────────────────────

function EarningsCalculator() {
  const [events, setEvents] = useState(4);
  const [attendees, setAttendees] = useState(20);
  const [price, setPrice] = useState(800);

  const gross = events * attendees * price;
  const fee = Math.round(gross * 0.08);
  const net = gross - fee;

  const Slider = ({ label, min, max, value, onChange, format }: any) => (
    <div className="mb-8">
      <div className="flex justify-between items-baseline mb-3">
        <p className="font-mono text-[11px] uppercase tracking-widest text-white/50">{label}</p>
        <p className="font-display text-2xl text-white">{format(value)}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-0.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full"
      />
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[10px] text-white/25">{format(min)}</span>
        <span className="font-mono text-[10px] text-white/25">{format(max)}</span>
      </div>
    </div>
  );

  return (
    <section className="bg-bg-dark py-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-6">[ ESTIMATE YOUR EARNINGS ]</p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Slider label="Events per month" min={1} max={10} value={events} onChange={setEvents} format={(v: number) => v} />
            <Slider label="Avg attendees" min={5} max={50} value={attendees} onChange={setAttendees} format={(v: number) => v} />
            <Slider label="Ticket price" min={0} max={2000} value={price} onChange={setPrice} format={(v: number) => `₹${v}`} />
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/40 mb-3">Your estimated take-home</p>
            <motion.p
              key={net}
              className="font-display leading-none mb-4"
              style={{ fontSize: 'clamp(3rem,6vw,5rem)', color: '#FF5A1F' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_VERCEL }}
            >
              ₹{net.toLocaleString('en-IN')}
              <span className="font-sans text-lg text-white/40 ml-2">/month</span>
            </motion.p>
            <div className="border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex justify-between font-mono text-xs text-white/50">
                <span>Gross revenue</span>
                <span>₹{gross.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-mono text-xs text-white/50">
                <span>Platform fee (8%)</span>
                <span>- ₹{fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-mono text-xs text-accent">
                <span>Net payout</span>
                <span>₹{net.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Count-up Stat ────────────────────────────────────────────────────────────

function StatNum({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    const tick = () => {
      const p = Math.min((performance.now() - start) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How quickly will I get verified?', a: 'Most hosts are verified within 24 hours. We review your application and may request a quick video call.' },
  { q: 'What types of events can I host?', a: "Run clubs, dinners, workshops, meetups, book clubs, and more. As long as it's a real-life gathering, it qualifies." },
  { q: 'How do payouts work?', a: 'Revenue from ticket sales is transferred to your linked bank account within 3-5 business days after your event.' },
  { q: 'What is the platform fee?', a: 'UpSosh charges an 8% platform fee on paid events. Free events are always free to host.' },
  { q: 'Can I co-host an event with someone?', a: "Yes — you can add co-hosts when creating an event, and they'll have management access." },
  { q: 'What happens if I cancel an event?', a: "Attendees are automatically refunded. You'll receive an email to confirm the cancellation and reason." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 px-6 md:px-12 max-w-3xl mx-auto">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-4">[ FAQ ]</p>
      <h2 className="font-display text-4xl text-ink-primary mb-10" style={{ letterSpacing: '-0.03em' }}>Common questions.</h2>
      <div className="divide-y divide-border">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-5 text-left group"
            >
              <span className="font-display text-lg text-ink-primary group-hover:text-accent transition-colors">{faq.q}</span>
              <motion.span
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.2, ease: EASE_VERCEL }}
                className="font-sans text-xl text-ink-muted flex-shrink-0 ml-4"
              >+</motion.span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_VERCEL }}
                  className="overflow-hidden"
                >
                  <p className="font-sans text-base text-ink-muted leading-relaxed pb-5">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BecomeAHostPage() {
  const { user, isAuth } = useAuth();
  const router = useRouter();

  function handleApply() {
    if (!isAuth) { router.push('/signup?from=/become-a-host'); return; }
    const raw = user as any;
    const resolvedStatus = user?.hostStatus || ((raw?.hostVerified || raw?.isHost) ? 'verified' : 'none');
    if (resolvedStatus === 'verified') { toast.success("You're already a verified host!"); router.push('/host/dashboard'); return; }
    if (resolvedStatus === 'pending') { router.push('/host/pending'); return; }
    router.push('/onboarding/host-verification');
  }

  const STATS = [
    { value: 42, prefix: '₹', suffix: 'K', label: 'avg monthly revenue' },
    { value: 48, suffix: '★', label: 'avg host rating' },
    { value: 87, suffix: '%', label: 'repeat attendance' },
    { value: 24, suffix: 'hr', label: 'verification time' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] bg-bg-dark flex items-center overflow-hidden pt-20">
        {/* BG grain */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-16 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.p
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-6"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_VERCEL }}
            >
              [ HOST ON UPSOSH ]
            </motion.p>
            <motion.h1
              className="font-display text-white leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(3rem,7vw,6rem)', letterSpacing: '-0.04em' }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_VERCEL, delay: 0.1 }}
            >
              Turn your idea into a{' '}
              <em className="italic" style={{ color: '#FF5A1F' }}>gathering.</em>
            </motion.h1>
            <motion.p
              className="font-sans text-xl leading-relaxed mb-10"
              style={{ color: 'rgba(250,250,247,0.65)', maxWidth: '480px' }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.25 }}
            >
              Whether it's a Sunday run, a creator coffee, or a book circle — UpSosh gives you the tools to host with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.35 }}
            >
              <MagneticButton>
                <button
                  onClick={handleApply}
                  className="font-sans text-base font-medium bg-accent text-white px-8 py-4 rounded-full hover:bg-white hover:text-ink-primary transition-colors duration-300"
                >
                  Apply to host →
                </button>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Floating mockup */}
          <motion.div
            className="hidden md:flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-80 h-64 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">Host Dashboard</p>
                <span className="w-2 h-2 rounded-full bg-accent" />
              </div>
              {['Revenue this month', 'Total attendees', 'Upcoming events'].map((l, i) => (
                <div key={l} className="flex items-center justify-between py-3 border-b border-white/5">
                  <span className="font-sans text-sm text-white/50">{l}</span>
                  <span className="font-display text-lg text-white">
                    {i === 0 ? '₹42K' : i === 1 ? '284' : '3'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats band ────────────────────────────────────────────── */}
      <section className="bg-bg-primary border-b border-border py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <p className="font-display text-ink-primary" style={{ fontSize: 'clamp(2rem,4vw,3.5rem)' }}>
                <StatNum target={s.value} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
              </p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why host with us ──────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-4">[ WHY US ]</p>
        <h2 className="font-display text-4xl text-ink-primary mb-14" style={{ letterSpacing: '-0.03em' }}>Built for modern hosts.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Built-in audience', body: 'Your event is shown to thousands of curious people already looking for experiences like yours.' },
            { n: '02', title: 'AI-powered planning', body: 'Our Planner handles budgets, pricing, venue suggestions, and profit forecasting in seconds.' },
            { n: '03', title: 'Trust & payments handled', body: 'Razorpay-powered ticketing, automatic refunds, and verified host badges build credibility fast.' },
          ].map((p) => (
            <motion.div
              key={p.n}
              className="border border-border rounded-2xl p-8 bg-bg-primary hover:bg-bg-secondary transition-colors"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <p className="font-mono text-3xl text-border mb-6">{p.n}</p>
              <h3 className="font-display text-2xl text-ink-primary mb-3">{p.title}</h3>
              <p className="font-sans text-base text-ink-muted leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Earnings Calculator ────────────────────────────────────── */}
      <EarningsCalculator />

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="bg-bg-dark py-24 px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-6">[ GET STARTED ]</p>
        <h2 className="font-display text-white mb-4" style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', letterSpacing: '-0.04em' }}>
          Ready to host your first event?
        </h2>
        <p className="font-sans text-lg mb-10" style={{ color: 'rgba(250,250,247,0.55)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
          Join thousands of hosts building communities through real-life experiences.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <MagneticButton>
            <button
              onClick={handleApply}
              className="font-sans text-base font-medium bg-accent text-white px-8 py-4 rounded-full hover:bg-white hover:text-ink-primary transition-colors duration-300"
            >
              Apply to host →
            </button>
          </MagneticButton>
          <Link
            href="/contact"
            className="font-sans text-base border border-white/20 text-white/70 px-8 py-4 rounded-full hover:border-white/40 hover:text-white transition-colors duration-300"
          >
            Talk to our team
          </Link>
        </div>
      </section>
    </div>
  );
}
