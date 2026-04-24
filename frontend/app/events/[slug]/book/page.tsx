'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { mockEvents, MockEvent } from '@/lib/mockEvents';
import { EASE_VERCEL } from '@/lib/motion';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEvent(slug: string): MockEvent {
  return (
    mockEvents.find(
      (e) =>
        e.id === slug ||
        e.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '') === slug
    ) ?? mockEvents[0]
  );
}

const PLATFORM_FEE = 25;

function formatPrice(price: MockEvent['price']): string {
  if (price === 'Free') return '₹0';
  return `₹${price.toLocaleString()}`;
}

function total(price: MockEvent['price']): number {
  if (price === 'Free') return 0;
  return price + PLATFORM_FEE;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#FF5A1F', '#1F5F3F', '#E8E4DC', '#0A0A0A', '#FF8C5A', '#A8A29E'];

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotSpeed: number; isRect: boolean;
    }

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -30 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 2.5 + 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      isRect: Math.random() > 0.4,
    }));

    let animId: number;
    const start = performance.now();

    function draw() {
      if (!ctx || !canvas) return;
      const elapsed = performance.now() - start;
      const alpha = Math.max(0, 1 - elapsed / 3200);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isRect) {
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < 3500) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}

// ─── Step 1: Details ──────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

function DetailsStep({
  formData,
  setFormData,
  onContinue,
}: {
  formData: FormData;
  setFormData: (f: FormData) => void;
  onContinue: () => void;
}) {
  const valid =
    formData.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.phone.replace(/\D/g, '').length === 10;

  const inputCls =
    'w-full bg-bg-secondary border border-border rounded-2xl px-4 py-3.5 font-sans text-sm text-ink-primary placeholder:text-ink-light focus:outline-none focus:border-ink-primary transition-colors duration-200';

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="book-name" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-2">Full name</label>
        <input
          id="book-name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Priya Sharma"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="book-email" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-2">Email</label>
        <input
          id="book-email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="priya@example.com"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="book-phone" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-2">Phone</label>
        <div className="flex gap-3">
          <div className="bg-bg-secondary border border-border rounded-2xl px-4 py-3.5 font-mono text-sm text-ink-muted flex-shrink-0" aria-hidden="true">
            +91
          </div>
          <input
            id="book-phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData({ ...formData, phone: digits });
            }}
            placeholder="98765 43210"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="book-notes" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-2">
          Special requests <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="book-notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Dietary restrictions, accessibility needs, anything else…"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        onClick={onContinue}
        disabled={!valid}
        className="w-full bg-ink-primary text-bg-primary font-sans text-sm font-medium py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200 mt-2"
      >
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Review & Pay ────────────────────────────────────────────────────

function ReviewStep({
  event,
  formData,
  onPay,
  paying,
}: {
  event: MockEvent;
  formData: FormData;
  onPay: () => void;
  paying: boolean;
}) {
  const [agreed, setAgreed] = useState(false);
  const [payMethod, setPayMethod] = useState<'razorpay' | 'upi'>('razorpay');
  const ticketPrice = event.price === 'Free' ? 0 : event.price;
  const grandTotal = total(event.price);

  return (
    <div className="space-y-6">
      {/* Event recap */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-4 flex gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base text-ink-primary leading-snug mb-1 line-clamp-2">{event.title}</p>
          <p className="font-mono text-xs text-ink-muted">{event.dateShort} · {event.time}</p>
          <p className="font-mono text-xs text-ink-muted truncate">{event.location}</p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border border-border rounded-2xl divide-y divide-border overflow-hidden">
        <div className="flex justify-between items-center px-5 py-3.5">
          <span className="font-sans text-sm text-ink-muted">Ticket</span>
          <span className="font-mono text-sm text-ink-primary">{event.price === 'Free' ? 'Free' : `₹${ticketPrice.toLocaleString()}`}</span>
        </div>
        {event.price !== 'Free' && (
          <div className="flex justify-between items-center px-5 py-3.5">
            <span className="font-sans text-sm text-ink-muted">Platform fee</span>
            <span className="font-mono text-sm text-ink-primary">₹{PLATFORM_FEE}</span>
          </div>
        )}
        <div className="flex justify-between items-center px-5 py-4 bg-bg-secondary">
          <span className="font-sans text-sm font-medium text-ink-primary">Total</span>
          <span className="font-display text-xl text-ink-primary">{event.price === 'Free' ? 'Free' : `₹${grandTotal.toLocaleString()}`}</span>
        </div>
      </div>

      {/* Payment method */}
      {event.price !== 'Free' && (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-muted mb-3">Payment method</p>
          <div className="grid grid-cols-2 gap-3">
            {(['razorpay', 'upi'] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPayMethod(method)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-sans transition-colors duration-200 ${
                  payMethod === method
                    ? 'border-ink-primary bg-ink-primary text-bg-primary'
                    : 'border-border text-ink-muted hover:border-ink-muted'
                }`}
              >
                {method === 'razorpay' ? '💳 Razorpay' : '📱 UPI'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agree checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={() => setAgreed((v) => !v)}
          className="sr-only"
        />
        <div
          aria-hidden="true"
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-150 ${
            agreed ? 'bg-ink-primary border-ink-primary' : 'border-border group-hover:border-ink-muted group-focus-within:border-ink-primary'
          }`}
        >
          {agreed && (
            <svg className="w-3 h-3 text-bg-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="font-sans text-sm text-ink-muted leading-relaxed">
          I agree to{' '}
          <span className="text-ink-primary underline underline-offset-2">UpSosh&#39;s cancellation policy</span>{' '}
          and terms of service
        </span>
      </label>

      {/* Pay button */}
      <button
        onClick={onPay}
        disabled={!agreed || paying}
        className="w-full bg-ink-primary text-bg-primary font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity duration-200"
      >
        {paying ? (
          <>
            <motion.span
              className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            Processing…
          </>
        ) : event.price === 'Free' ? (
          'Confirm booking →'
        ) : (
          `Pay ₹${grandTotal.toLocaleString()} →`
        )}
      </button>
    </div>
  );
}

// ─── Step 3: Confirmation ─────────────────────────────────────────────────────

function ConfirmationStep({ event }: { event: MockEvent }) {
  const router = useRouter();

  return (
    <div className="text-center">
      {/* Confetti */}
      <Confetti />

      {/* Checkmark */}
      <div className="flex justify-center mb-8">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Circle */}
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="#E8E4DC"
              strokeWidth="4"
            />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: EASE_VERCEL }}
              style={{ rotate: -90, transformOrigin: 'center' }}
            />
            {/* Check */}
            <motion.path
              d="M 32 52 L 44 64 L 68 38"
              fill="none"
              stroke="#0A0A0A"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE_VERCEL }}
            />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <motion.h2
        className="font-display text-[clamp(3rem,7vw,5rem)] text-ink-primary leading-[1] tracking-[-0.03em] mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: EASE_VERCEL }}
      >
        You're in.
      </motion.h2>
      <motion.p
        className="font-sans text-base text-ink-muted mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        Confirmation sent to your email. See you there.
      </motion.p>

      {/* Event recap */}
      <motion.div
        className="bg-bg-secondary border border-border rounded-2xl p-5 mb-6 text-left"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5, ease: EASE_VERCEL }}
      >
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base text-ink-primary leading-snug mb-1">{event.title}</p>
            <p className="font-mono text-xs text-ink-muted">{event.dateShort} · {event.time}</p>
            <p className="font-mono text-xs text-ink-muted truncate">{event.location}</p>
          </div>
        </div>

        {/* QR placeholder */}
        <div className="mt-5 pt-5 border-t border-border flex justify-center">
          <div className="text-center">
            <div
              className="w-28 h-28 bg-bg-primary border border-border rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #E8E4DC 0, #E8E4DC 1px, transparent 0, transparent 50%), repeating-linear-gradient(90deg, #E8E4DC 0, #E8E4DC 1px, transparent 0, transparent 50%)',
                backgroundSize: '14px 14px',
              }}
            >
              <span className="font-mono text-[10px] text-ink-light text-center leading-tight">QR<br/>Ticket</span>
            </div>
            <p className="font-mono text-[10px] text-ink-muted">Your entry pass</p>
          </div>
        </div>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.4 }}
      >
        <button className="w-full border border-border text-ink-primary font-sans text-sm py-3.5 rounded-2xl hover:bg-bg-secondary transition-colors flex items-center justify-center gap-2">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Add to calendar
        </button>
        <button className="w-full border border-border text-ink-primary font-sans text-sm py-3.5 rounded-2xl hover:bg-bg-secondary transition-colors flex items-center justify-center gap-2">
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          Share event
        </button>
        <button
          onClick={() => router.push('/discover')}
          className="w-full text-ink-muted font-mono text-xs py-3 transition-colors hover:text-ink-primary"
        >
          ← Back to discover
        </button>
      </motion.div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const steps = ['Details', 'Review', 'Done'];
  return (
    <div className="mb-10">
      {/* Thin progress line */}
      <div className="h-0.5 bg-border rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: EASE_VERCEL }}
        />
      </div>
      {/* Step labels */}
      <div className="flex justify-between">
        {steps.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const active = num === step;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono transition-colors duration-300 ${
                  done
                    ? 'bg-verified text-white'
                    : active
                    ? 'bg-ink-primary text-bg-primary'
                    : 'bg-border text-ink-muted'
                }`}
              >
                {done ? '✓' : num}
              </div>
              <span
                className={`font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  active ? 'text-ink-primary' : 'text-ink-muted'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slide Variants ───────────────────────────────────────────────────────────

const SLIDE = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
    filter: 'blur(6px)',
  }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    filter: 'blur(6px)',
  }),
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [paying, setPaying] = useState(false);

  const event = getEvent(slug);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPaying(false);
    goTo(3);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-bg-primary z-50 overflow-y-auto"
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_VERCEL }}
    >
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-bg-primary/95 backdrop-blur-xl border-b border-border z-10">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            {step < 3 ? (
              <button
                onClick={() => (step > 1 ? goTo(step - 1) : router.back())}
                className="font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors flex items-center gap-1.5 group"
              >
                <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                {step > 1 ? 'Back' : 'Cancel'}
              </button>
            ) : (
              <div />
            )}

            <p className="font-display text-base text-ink-primary">
              {step === 1 ? 'Your details' : step === 2 ? 'Review & pay' : 'Booking confirmed'}
            </p>

            {step < 3 && (
              <button
                onClick={() => router.back()}
                className="text-ink-muted hover:text-ink-primary transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-lg mx-auto w-full px-6 pt-10 pb-16">
          {step < 3 && <ProgressBar step={step} />}

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {step === 1 ? 'Step 1: Your details' : step === 2 ? 'Step 2: Review and pay' : 'Booking confirmed'}
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE_VERCEL }}
              >
                {/* Step heading */}
                <div className="mb-8">
                  <h2 className="font-display text-3xl text-ink-primary mb-1">Tell us about you</h2>
                  <p className="font-sans text-sm text-ink-muted">
                    This information stays private until the host accepts.
                  </p>
                </div>
                <DetailsStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => goTo(2)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE_VERCEL }}
              >
                <div className="mb-8">
                  <h2 className="font-display text-3xl text-ink-primary mb-1">Looks good?</h2>
                  <p className="font-sans text-sm text-ink-muted">
                    Review your booking and complete payment.
                  </p>
                </div>
                <ReviewStep
                  event={event}
                  formData={formData}
                  onPay={handlePay}
                  paying={paying}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE_VERCEL }}
              >
                <ConfirmationStep event={event} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
