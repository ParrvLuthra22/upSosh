'use client';

/**
 * components/BookingFlow.tsx
 * ───────────────────────────
 * Global booking modal — mounts once in app/layout.tsx.
 * Controlled entirely by useBookingStore.
 *
 * Step 1 — Review booking + guest details
 * Step 2 — Choose payment method
 * Step 3 — Confirmation ("You're in.")
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import {
  IconX,
  IconCheck,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconCreditCard,
  IconShare,
  IconCalendarPlus,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  useBookingStore,
  downloadICS,
  type BookingEventData,
} from '@/lib/stores/booking';
import { getLenis } from '@/components/ui/SmoothScroll';
import { Input } from '@/components/ui/input';
import { cn, unitPrice, formatINR as fmtRupee } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: 'spring', stiffness: 320, damping: 28 } as const;


// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {([1, 2, 3] as const).map((s) => (
        <motion.div
          key={s}
          layout
          transition={SPRING}
          style={{
            borderRadius: 99,
            backgroundColor:
              s < step ? 'var(--lime)' : s === step ? 'var(--lime)' : 'rgba(244,241,234,0.2)',
            height: 8,
          }}
          animate={{ width: s === step ? 24 : 8 }}
        />
      ))}
    </div>
  );
}

// ─── Animated check SVG (step 3) ─────────────────────────────────────────────

function AnimatedCheck() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      {/* Outer circle */}
      <motion.circle
        cx="60" cy="60" r="54"
        stroke="var(--lime)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="339.3"
        initial={{ strokeDashoffset: 339.3, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
      />
      {/* Checkmark path — total length ≈ 75 */}
      <motion.path
        d="M36 62 L52 78 L84 44"
        stroke="var(--lime)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="75"
        initial={{ strokeDashoffset: 75 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.85 }}
      />
    </svg>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function useConfetti() {
  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      const fire = (particleRatio: number, opts: object) =>
        confetti({
          origin: { y: 0.55 },
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
        });

      fire(0.25, { spread: 26, startVelocity: 55, colors: ['var(--lime)', 'var(--cream)'] });
      fire(0.2,  { spread: 60, colors: ['var(--lime)', 'var(--coral)', '#34D399'] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['var(--lime)', 'var(--cream)'] });
      fire(0.1,  { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['var(--coral)'] });
      fire(0.1,  { spread: 120, startVelocity: 45, colors: ['var(--lime)'] });
    });
  }, []);
}

// ─── Event mini-card ──────────────────────────────────────────────────────────

function EventMiniCard({ event, guests }: { event: BookingEventData; guests: number }) {
  const img = event.imageUrl ?? event.image ?? '';
  const date = event.dateShort ?? (typeof event.date === 'string' ? event.date : '');
  const price = unitPrice(event.price);
  const serviceFee = Math.round(price * guests * 0.1);
  const total = price * guests + serviceFee;

  return (
    <>
      {/* Thumbnail + title */}
      <div className="flex items-center gap-3 bg-cream/5 rounded-xl p-3">
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
          {img && <Image src={img} alt={event.title} width={56} height={56} className="w-full h-full object-cover" />}
        </div>
        <div className="min-w-0">
          <p className="font-sans text-[14px] font-medium text-cream line-clamp-2 leading-snug">
            {event.title}
          </p>
          <p className="font-mono text-[11px] text-cream-dim mt-1 flex items-center gap-1.5">
            {date && <><IconCalendar size={10} />{date}</>}
            {event.time && <><span className="opacity-40">·</span><IconClock size={10} />{event.time}</>}
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      {price > 0 ? (
        <div className="mt-4 bg-cream/5 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between font-sans text-[13px] text-cream-dim">
            <span>{guests} × {fmtRupee(price)}</span>
            <span>{fmtRupee(price * guests)}</span>
          </div>
          <div className="flex justify-between font-sans text-[13px] text-cream-dim">
            <span>Service fee (10%)</span>
            <span>{fmtRupee(serviceFee)}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-border pt-2.5">
            <span className="font-sans text-[14px] text-cream font-medium">Total</span>
            <span
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontSize: 24,
                fontWeight: 400,
                color: 'var(--lime)',
                lineHeight: 1,
              }}
            >
              {fmtRupee(total)}
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-cream/5 rounded-xl p-4 flex justify-between items-center">
          <span className="font-sans text-[14px] text-cream font-medium">Total</span>
          <span
            style={{
              fontFamily: 'var(--font-fraunces, Georgia, serif)',
              fontSize: 24,
              fontWeight: 400,
              color: 'var(--lime)',
            }}
          >
            Free
          </span>
        </div>
      )}
    </>
  );
}

// ─── Step 1 — Review ──────────────────────────────────────────────────────────

function Step1Review() {
  const { event, guestCount, guestDetails, setGuestDetails, next } = useBookingStore();
  const [errors, setErrors] = useState<Partial<typeof guestDetails>>({});
  if (!event) return null;

  function validate() {
    const e: Partial<typeof guestDetails> = {};
    if (!guestDetails.name.trim()) e.name = 'Name is required';
    if (!guestDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email))
      e.email = 'Enter a valid email';
    if (!guestDetails.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleContinue() {
    if (validate()) next();
  }

  return (
    <div>
      <div className="px-6 py-6">
        <h3
          className="text-cream mb-5"
          style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 24, fontWeight: 400 }}
        >
          Review your booking
        </h3>

        <EventMiniCard event={event} guests={guestCount} />

        {/* Guest details form */}
        <div className="mt-6 space-y-3">
          <p className="font-mono text-[11px] text-cream-dim uppercase tracking-widest">
            Your details
          </p>
          <Input
            label="Full name"
            value={guestDetails.name}
            onChange={(e) => setGuestDetails({ name: e.target.value })}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Email address"
            type="email"
            value={guestDetails.email}
            onChange={(e) => setGuestDetails({ email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Phone number"
            type="tel"
            value={guestDetails.phone}
            onChange={(e) => setGuestDetails({ phone: e.target.value })}
            error={errors.phone}
            autoComplete="tel"
          />
        </div>

        <div className="pt-6 pb-6 border-t border-border mt-6">
          <button
            onClick={handleContinue}
            className="w-full h-12 rounded-full font-sans font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--lime)', color: 'var(--void)' }}
          >
            Continue <IconArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Payment ─────────────────────────────────────────────────────────

function Step2Payment() {
  const {
    event,
    guestCount,
    paymentMethod,
    isProcessing,
    errorMessage,
    setPaymentMethod,
    back,
    submit,
  } = useBookingStore();
  const [terms, setTerms] = useState(false);
  if (!event) return null;

  const price = unitPrice(event.price);
  const isFree = price === 0;
  const total = price * guestCount + Math.round(price * guestCount * 0.1);

  const canSubmit = !isProcessing && terms && paymentMethod === 'instant';

  return (
    <div>
      <div className="px-6 py-6">
        <h3
          className="text-cream mb-5"
          style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 24, fontWeight: 400 }}
        >
          Pay your way
        </h3>

        {isFree ? (
          <div className="bg-lime/10 border border-lime/25 rounded-xl p-4 text-center">
            <p className="font-mono text-[12px] uppercase tracking-widest text-lime mb-1">Free event</p>
            <p className="font-sans text-[14px] text-cream-dim">No payment required — just confirm.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Card A — instant */}
            <button
              onClick={() => setPaymentMethod('instant')}
              className={cn(
                'relative w-full rounded-2xl border p-4 text-left transition-all',
                paymentMethod === 'instant'
                  ? 'border-lime bg-lime/5'
                  : 'border-border hover:border-border-strong',
              )}
            >
              {paymentMethod === 'instant' && (
                <span className="absolute top-4 right-4">
                  <IconCheck size={16} className="text-lime" strokeWidth={2.5} />
                </span>
              )}
              <div className="flex items-start gap-3 pr-6">
                <IconCreditCard size={18} className={paymentMethod === 'instant' ? 'text-lime' : 'text-cream-dim'} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[14px] font-medium text-cream">Instant payment</p>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-lime bg-lime/15 px-2 py-0.5 rounded-full border border-lime/25">
                      Recommended
                    </span>
                  </div>
                  <p className="font-sans text-[12px] text-cream-dim mt-0.5">
                    Card, UPI, wallets · instant confirmation
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Terms */}
        <label className="flex items-start gap-3 mt-6 cursor-pointer">
          <div
            className={cn(
              'w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all',
              terms ? 'bg-lime border-lime' : 'border-border',
            )}
            onClick={() => setTerms((t) => !t)}
          >
            {terms && <IconCheck size={11} style={{ color: 'var(--void)' }} strokeWidth={3} />}
          </div>
          <span className="font-sans text-[13px] text-cream-dim leading-relaxed">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="text-cream underline underline-offset-2 hover:text-lime transition-colors">
              terms of service
            </a>{' '}
            and cancellation policy.
          </span>
        </label>

        {/* Error */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[12px] text-coral mt-4"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="px-6 py-4 border-t border-border space-y-2">
        <button
          onClick={submit}
          disabled={!canSubmit && !isFree}
          className="w-full h-12 rounded-full font-sans font-semibold text-[15px] flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--lime)', color: 'var(--void)' }}
        >
          {isProcessing ? (
            <span className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
          ) : isFree ? (
            <>Confirm booking <IconCheck size={16} strokeWidth={2.5} /></>
          ) : (
            <>Pay {fmtRupee(total)} <IconArrowRight size={16} strokeWidth={2.5} /></>
          )}
        </button>
        <button
          onClick={back}
          className="w-full h-9 rounded-full font-sans text-[13px] text-cream-dim hover:text-cream transition-colors flex items-center justify-center gap-1.5 mt-2"
        >
          <IconArrowLeft size={14} /> Back
        </button>

        {/* Bottom padding for comfortable scroll on mobile */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ─── Step 3 — Confirmation ────────────────────────────────────────────────────

function Step3Confirmation() {
  useConfetti();
  const { event, guestCount, close } = useBookingStore();
  if (!event) return null;

  const img = event.imageUrl ?? event.image ?? '';
  const date = event.dateShort ?? (typeof event.date === 'string' ? event.date : '');
  const price = unitPrice(event.price);
  const serviceFee = Math.round(price * guestCount * 0.1);
  const total = price * guestCount + serviceFee;

  async function handleShare() {
    const text = `I'm going to "${event!.title}" on UpSosh! 🎉`;
    const url = `${window.location.origin}/events/${event!.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event!.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch { /* cancelled */ }
  }

  return (
    <div className="px-6 py-10 flex flex-col items-center text-center">
      {/* Animated check */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: 0.05 }}
      >
        <AnimatedCheck />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
      >
        <h2
          className="text-cream mt-6 mb-2"
          style={{ fontFamily: 'var(--font-fraunces, Georgia, serif)', fontSize: 40, fontWeight: 300, lineHeight: 1.1 }}
        >
          You're in.
        </h2>
        <p className="font-sans text-[15px] text-cream-dim">
          Your spot is confirmed. See you there.
        </p>
      </motion.div>

      {/* Event recap */}
      <motion.div
        className="w-full mt-8 bg-cream/5 rounded-2xl p-4 flex items-center gap-3 text-left"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.85 }}
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
          {img && <Image src={img} alt={event.title} width={56} height={56} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[14px] font-medium text-cream line-clamp-2 leading-snug">
            {event.title}
          </p>
          <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-cream-dim flex-wrap">
            {date && <span className="flex items-center gap-1"><IconCalendar size={10} /> {date}</span>}
            {event.time && <><span className="opacity-40">·</span><span className="flex items-center gap-1"><IconClock size={10} /> {event.time}</span></>}
          </div>
          {price > 0 && (
            <p className="font-mono text-[11px] text-lime mt-1">
              {guestCount} guest{guestCount > 1 ? 's' : ''} · {fmtRupee(total)} paid
            </p>
          )}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        className="w-full mt-6 space-y-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 1.0 }}
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => downloadICS(event)}
            className="h-11 rounded-xl border border-border font-sans text-[13px] text-cream-dim hover:text-cream hover:border-border-strong transition-colors flex items-center justify-center gap-2"
          >
            <IconCalendarPlus size={15} /> Add to calendar
          </button>
          <button
            onClick={handleShare}
            className="h-11 rounded-xl border border-border font-sans text-[13px] text-cream-dim hover:text-cream hover:border-border-strong transition-colors flex items-center justify-center gap-2"
          >
            <IconShare size={15} /> Share
          </button>
        </div>

        <button
          onClick={close}
          className="w-full h-11 rounded-xl bg-lime text-void font-sans text-[14px] font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Done <IconCheck size={15} strokeWidth={2.5} />
        </button>

        <a
          href="/discover"
          onClick={close}
          className="block text-center font-sans text-[13px] text-lime hover:opacity-80 transition-opacity py-1"
        >
          Browse more events <IconArrowRight size={12} className="inline mb-0.5" />
        </a>
      </motion.div>
    </div>
  );
}

// ─── Modal step content ────────────────────────────────────────────────────────

function ModalContent() {
  const { step, direction, close } = useBookingStore();

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
  };

  return (
    <>
      {/* Fixed header — never scrolls away */}
      {step < 3 && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <StepDots step={step} />
          <button
            onClick={close}
            aria-label="Close booking"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors"
          >
            <IconX size={17} />
          </button>
        </div>
      )}

      {/*
        THE SCROLL FIX:
        ───────────────
        `flex-1` lets this div grow to fill remaining panel height.
        `min-h-0` is critical — without it, flex children default to
        min-height:auto (their content size), so overflow never kicks in.
        With min-h-0 the div can shrink below content height and scroll.
      */}
      {/*
        data-lenis-prevent tells Lenis to ignore wheel events inside this div
        so native browser scroll takes over — essential when Lenis is running.
      */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
        data-lenis-prevent
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: EASE }}
          >
            {step === 1 && <Step1Review />}
            {step === 2 && <Step2Payment />}
            {step === 3 && <Step3Confirmation />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

// ─── Exported component — mounts once in layout ───────────────────────────────

export default function BookingFlow() {
  const { isOpen, close } = useBookingStore();

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [close]);

  // Scroll lock — stop Lenis so the page behind the modal doesn't scroll.
  // `document.body.style.overflow = 'hidden'` has no effect on Lenis because
  // Lenis drives scroll in JS, not via CSS. Must call lenis.stop() / start().
  useEffect(() => {
    const lenis = getLenis();
    if (isOpen) {
      lenis?.stop();
      // Belt-and-suspenders: also prevent native scroll in case Lenis isn't ready
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Intercept browser back button — close modal instead of navigating
  useEffect(() => {
    if (isOpen) window.history.pushState({ bookingModalOpen: true }, '');
  }, [isOpen]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (isOpen && !e.state?.bookingModalOpen) close();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Book event"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 sm:py-8"
          style={{ backgroundColor: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(16px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          {/*
            PANEL
            ─────
            Layout key: the panel is flex-col with an EXPLICIT height on desktop
            (not just maxHeight) so flex-1 + min-h-0 inside can calculate.

            Mobile  : full width, bottom-anchored, height auto up to 90dvh
            Desktop : centered, max-w-lg, fixed height 680px (or 90dvh if smaller)
          */}
          <motion.div
            className="relative w-full flex flex-col sm:max-w-lg rounded-t-[28px] sm:rounded-[28px]"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              // Mobile: height grows with content, capped at 90dvh
              // Desktop: fixed at min(90dvh, 680px) so flex-1 scroll works
              maxHeight: '90dvh',
              height: 'auto',
            }}
            // Apply the fixed height on sm+ via inline responsive (can't use Tailwind here
            // because Framer Motion controls the style prop).  We inject a global rule instead.
            initial={{ opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div style={{ width: 36, height: 4, borderRadius: 99, backgroundColor: 'var(--cream-faint)' }} />
            </div>

            <ModalContent />
          </motion.div>

          {/* Force the panel to a fixed height on desktop so flex-1 scroll works */}
          <style>{`
            @media (min-width: 640px) {
              [role="dialog"] > div:last-child {
                height: min(90dvh, 680px) !important;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
