'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { mockPlannerResult, type BudgetItem, type VenueSuggestion } from '@/lib/mockPlannerResult';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'landing' | 'generating' | 'result';

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, isInView: boolean, duration = 1000): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    function tick() {
      const t = Math.min((performance.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, isInView, duration]);
  return value;
}

// ─── Animated gradient background ────────────────────────────────────────────

function AnimatedBg() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none -z-10"
      animate={{
        background: [
          'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(255,90,31,0.04) 0%, transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(255,90,31,0.035) 0%, transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 60% 80%, rgba(255,90,31,0.04) 0%, transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 20% 30%, rgba(255,90,31,0.04) 0%, transparent 70%)',
        ],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ─── Floating Sparkle ─────────────────────────────────────────────────────────

function Sparkle() {
  return (
    <>
      <motion.div
        className="fixed top-[22%] right-[8%] pointer-events-none select-none text-accent/25 text-3xl"
        animate={{ y: [-12, 12, -12], x: [-6, 6, -6], rotate: [0, 20, 0, -20, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      >
        ✦
      </motion.div>
      <motion.div
        className="fixed bottom-[30%] left-[6%] pointer-events-none select-none text-accent/15 text-xl"
        animate={{ y: [8, -8, 8], rotate: [0, -15, 0, 15, 0], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        ✦
      </motion.div>
    </>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ phase, query }: { phase: Phase; query: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14">
      <Link href="/" className="font-display text-lg text-ink-primary tracking-tight">
        UpSosh
      </Link>

      <AnimatePresence mode="wait">
        {phase !== 'landing' && query && (
          <motion.div
            key="query-pill"
            className="hidden md:flex items-center gap-2 max-w-md"
            initial={{ opacity: 0, y: -8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35, ease: EASE_VERCEL }}
          >
            <div className="flex items-center gap-2 bg-bg-secondary border border-border rounded-full px-4 py-1.5 max-w-sm">
              <span className="text-accent text-[11px]">✦</span>
              <span className="font-sans text-xs text-ink-muted truncate">{query}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href="/discover"
        className="font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors"
      >
        Exit planner
      </Link>
    </div>
  );
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'A creator coffee meetup for 20 in Bandra',
  'A book club evening for 15 in Koramangala',
  'A weekend yoga workshop for 25, Delhi',
];

// ─── Landing State ────────────────────────────────────────────────────────────

function LandingState({ onSubmit }: { onSubmit: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [query]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    onSubmit(query.trim());
  };

  return (
    <motion.div
      key="landing"
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-14 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: EASE_VERCEL }}
    >
      <div className="w-full max-w-[720px]">
        {/* Eyebrow */}
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-muted mb-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_VERCEL }}
        >
          [ AI Planner — Beta ]
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-display text-center leading-[1.05] tracking-[-0.03em] text-ink-primary mb-10"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.6, ease: EASE_VERCEL }}
        >
          What do you want
          <br />
          <em style={{ color: '#FF5A1F' }}>to create?</em>
        </motion.h1>

        {/* Input canvas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55, ease: EASE_VERCEL }}
        >
          <div
            className="relative rounded-3xl transition-all duration-300"
            style={{
              border: focused ? '2px solid #FF5A1F' : '2px solid #E8E4DC',
              boxShadow: focused ? '0 0 0 4px rgba(255,90,31,0.08), 0 8px 40px rgba(10,10,10,0.06)' : '0 2px 16px rgba(10,10,10,0.04)',
              background: '#FAFAF7',
            }}
          >
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              placeholder="A Sunday morning run club for 30 people in South Delhi, budget ₹8,000..."
              aria-label="Describe your event idea"
              rows={2}
              className="w-full bg-transparent resize-none font-sans text-[20px] text-ink-primary placeholder:text-ink-light focus:outline-none"
              style={{ padding: '24px 24px 16px 24px', lineHeight: 1.55, minHeight: 80 }}
            />

            {/* Bottom row inside input */}
            <div className="flex items-center justify-between px-6 pb-4">
              <span className="font-mono text-[10px] text-ink-light">
                {query.length > 0 ? `${query.length} chars · ⌘↵ to plan` : 'Describe your event idea in plain English'}
              </span>

              <AnimatePresence>
                {query.trim().length > 10 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85, x: 8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.85, x: 8 }}
                    transition={{ duration: 0.2, ease: EASE_VERCEL }}
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 bg-accent text-white font-sans text-sm font-medium px-4 py-2 rounded-2xl"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>✨</span>
                    Plan this
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Suggestion chips */}
        <motion.div
          className="flex flex-wrap justify-center gap-2.5 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.5 }}
        >
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              onClick={() => setQuery(s)}
              className="font-mono text-[11px] text-ink-muted border border-border rounded-full px-4 py-2 hover:bg-accent/5 hover:border-accent/30 hover:text-accent transition-all duration-200"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.35, ease: EASE_VERCEL }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {s}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Generating State ─────────────────────────────────────────────────────────

const GEN_MESSAGES = [
  'Analyzing your vision…',
  'Calculating costs…',
  'Suggesting venues…',
  'Building your plan.',
];

function StreamingText({ text }: { text: string }) {
  return (
    <span>
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${text}-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.025, duration: 0.15 }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

function GeneratingState({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const done = useCallback(onDone, [onDone]);

  useEffect(() => {
    const delays = [900, 1600, 2200, 2800];
    const timers = delays.map((d, i) =>
      setTimeout(() => {
        if (i < delays.length - 1) setMsgIdx(i + 1);
        else done();
      }, d)
    );
    return () => timers.forEach(clearTimeout);
  }, [done]);

  return (
    <motion.div
      key="generating"
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-14"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.4, ease: EASE_VERCEL }}
    >
      {/* Pulsing orb */}
      <div className="relative mb-10">
        <motion.div
          className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-8 h-8 rounded-full bg-accent/30"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
        </motion.div>
        {/* Orbit ring */}
        <motion.div
          className="absolute inset-[-8px] rounded-full border border-accent/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Streaming message */}
      <div className="text-center" role="status" aria-live="polite" aria-atomic="true" style={{ minHeight: 48 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            className="font-display text-2xl md:text-3xl text-ink-primary"
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: EASE_VERCEL }}
          >
            <StreamingText text={GEN_MESSAGES[msgIdx]} />
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 mt-8">
        {GEN_MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === msgIdx ? 24 : 6,
              backgroundColor: i <= msgIdx ? '#FF5A1F' : '#E8E4DC',
            }}
            style={{ height: 6 }}
            transition={{ duration: 0.3, ease: EASE_VERCEL }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Result Sections ──────────────────────────────────────────────────────────

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, clipPath: 'inset(0 0 8% 0)' }}
      animate={inView ? { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_VERCEL }}
    >
      {children}
    </motion.div>
  );
}

function ResultEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted mb-3">
      {children}
    </p>
  );
}

function ResultHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl text-ink-primary tracking-tight mb-5">
      {children}
    </h2>
  );
}

// ── Donut chart ──

const DONUT_R = 52;
const DONUT_C = 2 * Math.PI * DONUT_R;

function DonutChart({ items }: { items: BudgetItem[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const nonZero = items.filter((i) => i.cost > 0);
  const total = nonZero.reduce((s, i) => s + i.cost, 0);

  let offset = 0;
  const segments = nonZero.map((item) => {
    const pct = item.cost / total;
    const dash = pct * DONUT_C;
    const seg = { item, dash, offset };
    offset += dash;
    return seg;
  });

  const CX = 65;
  const CY = 65;

  return (
    <svg ref={ref} viewBox="0 0 130 130" className="w-[120px] h-[120px] flex-shrink-0" style={{ rotate: '-90deg' }}>
      {/* Track */}
      <circle cx={CX} cy={CY} r={DONUT_R} fill="none" stroke="#E8E4DC" strokeWidth={14} />
      {/* Segments */}
      {segments.map((seg, i) => (
        <motion.circle
          key={seg.item.item}
          cx={CX}
          cy={CY}
          r={DONUT_R}
          fill="none"
          stroke={seg.item.color}
          strokeWidth={14}
          strokeLinecap="butt"
          initial={{ strokeDasharray: `0 ${DONUT_C}` }}
          animate={
            inView
              ? { strokeDasharray: `${seg.dash} ${DONUT_C}` }
              : { strokeDasharray: `0 ${DONUT_C}` }
          }
          strokeDashoffset={-seg.offset}
          transition={{ duration: 0.7, delay: i * 0.12, ease: EASE_VERCEL }}
        />
      ))}
    </svg>
  );
}

// ── Budget section ──

function BudgetSection({ items, total }: { items: BudgetItem[]; total: number }) {
  return (
    <SectionReveal>
      <ResultEyebrow>Budget breakdown</ResultEyebrow>
      <ResultHeading>Where your ₹8,000 goes</ResultHeading>

      <div className="flex gap-8 items-start">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="border-b border-border pb-2 mb-2 grid grid-cols-[1fr_80px_52px] gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Item</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-right">Cost</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted text-right">%</span>
          </div>
          <div className="space-y-0">
            {items.map((item) => (
              <div
                key={item.item}
                className="grid grid-cols-[1fr_80px_52px] gap-2 py-2.5 border-b border-border/50 group hover:bg-bg-secondary transition-colors -mx-2 px-2 rounded-lg"
              >
                <div>
                  <p className="font-sans text-sm text-ink-primary">{item.item}</p>
                  <p className="font-mono text-[10px] text-ink-light mt-0.5 line-clamp-1">{item.note}</p>
                </div>
                <p className="font-mono text-sm text-ink-primary text-right self-center">
                  {item.cost === 0 ? (
                    <span className="text-verified">Free</span>
                  ) : (
                    `₹${item.cost.toLocaleString('en-IN')}`
                  )}
                </p>
                <p className="font-mono text-sm text-ink-muted text-right self-center">
                  {item.cost === 0 ? '—' : `${Math.round((item.cost / total) * 100)}%`}
                </p>
              </div>
            ))}
            {/* Total row */}
            <div className="grid grid-cols-[1fr_80px_52px] gap-2 pt-3">
              <p className="font-sans text-sm font-semibold text-ink-primary">Total</p>
              <p className="font-display text-lg text-ink-primary text-right">₹{total.toLocaleString('en-IN')}</p>
              <p className="font-mono text-sm text-ink-muted text-right">100%</p>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="hidden sm:flex flex-col items-center gap-3 flex-shrink-0 pt-6">
          <DonutChart items={items} />
          <div className="space-y-1">
            {items.filter((i) => i.cost > 0).map((item) => (
              <div key={item.item} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="font-mono text-[9px] text-ink-muted truncate max-w-[96px]">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

// ── Venue cards ──

function VenueCard({ venue, index }: { venue: VenueSuggestion; index: number }) {
  return (
    <motion.div
      className="border border-border rounded-2xl p-5 hover:bg-bg-secondary transition-colors duration-200 group cursor-none"
      data-cursor="EXPLORE"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: EASE_VERCEL }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-xl text-ink-primary group-hover:text-accent transition-colors duration-200">
          {venue.name}
        </h3>
        {venue.price === 'Free' && (
          <span className="font-mono text-[10px] text-verified border border-verified/20 bg-verified/5 px-2 py-0.5 rounded-full flex-shrink-0 ml-3">
            Free
          </span>
        )}
      </div>
      <p className="font-mono text-[11px] text-ink-muted mb-3">{venue.address}</p>
      <p className="font-sans text-sm text-ink-muted italic leading-relaxed mb-4">{venue.why}</p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {venue.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="font-mono text-[9px] text-ink-muted border border-border px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <button className="font-mono text-[10px] text-ink-muted hover:text-accent transition-colors">
          Check availability →
        </button>
      </div>
    </motion.div>
  );
}

// ── Pricing slider ──

function PricingSection({ pricing }: { pricing: typeof mockPlannerResult.pricing }) {
  const [price, setPrice] = useState(pricing.suggested);
  const { totalCost, capacity, platformFeePct } = pricing;
  const netPerTicket = price * (1 - platformFeePct / 100);
  const revenue = netPerTicket * capacity;
  const profit = Math.round(revenue - totalCost);
  const breakEven = Math.ceil(totalCost / netPerTicket);
  const profitPositive = profit >= 0;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const countedProfit = useCountUp(Math.abs(profit), inView);

  return (
    <SectionReveal>
      <ResultEyebrow>Ticket pricing strategy</ResultEyebrow>
      <ResultHeading>Find your sweet spot</ResultHeading>

      <div ref={ref} className="bg-bg-secondary border border-border rounded-2xl p-6">
        {/* AI suggestion */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-accent/5 border border-accent/15 rounded-xl">
          <span className="text-accent text-sm mt-0.5">✦</span>
          <div>
            <p className="font-sans text-sm text-ink-primary">
              AI recommends{' '}
              <span className="font-semibold text-accent">₹{pricing.suggested}</span>
              {' '}— best balance of attendance and profit for your audience size and cost base.
            </p>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Ticket price</span>
            <span className="font-display text-3xl text-ink-primary">₹{price}</span>
          </div>
          <input
            type="range"
            min={pricing.min}
            max={pricing.max}
            step={50}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#FF5A1F' }}
          />
          <div className="flex justify-between font-mono text-[10px] text-ink-light mt-1.5">
            <span>₹{pricing.min}</span>
            <span>₹{pricing.max}</span>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Break-even</p>
            <p className="font-display text-2xl text-ink-primary">{breakEven}</p>
            <p className="font-mono text-[10px] text-ink-muted">of {capacity}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">
              {profitPositive ? 'Est. profit' : 'Est. loss'}
            </p>
            <p className={`font-display text-2xl ${profitPositive ? 'text-verified' : 'text-red-500'}`}>
              {profitPositive ? '+' : '-'}₹{countedProfit.toLocaleString('en-IN')}
            </p>
            <p className="font-mono text-[10px] text-ink-muted">at {capacity} sold</p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Net/ticket</p>
            <p className="font-display text-2xl text-ink-primary">₹{Math.round(netPerTicket)}</p>
            <p className="font-mono text-[10px] text-ink-muted">after {platformFeePct}% fee</p>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

// ── Marketing section ──

function MarketingSection({ marketing }: { marketing: typeof mockPlannerResult.marketing }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(marketing.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionReveal>
      <ResultEyebrow>Marketing plan</ResultEyebrow>
      <ResultHeading>Ready to post</ResultHeading>

      {/* Caption block */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-5 relative group">
        <p className="font-display text-lg text-ink-primary italic leading-relaxed whitespace-pre-line">
          {marketing.caption}
        </p>
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 font-mono text-[10px] text-ink-muted hover:text-ink-primary transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Hashtags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {marketing.hashtags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-xs text-accent border border-accent/20 bg-accent/5 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Timing */}
      <div className="flex items-center gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">Best time to post</p>
          <p className="font-sans text-sm text-ink-primary">{marketing.bestPostTime}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">Platform</p>
          <p className="font-sans text-sm text-ink-primary">{marketing.bestPlatform}</p>
        </div>
      </div>
    </SectionReveal>
  );
}

// ── Schedule section ──

function ScheduleSection({ items }: { items: typeof mockPlannerResult.schedule }) {
  return (
    <SectionReveal>
      <ResultEyebrow>Run of show</ResultEyebrow>
      <ResultHeading>Hour by hour</ResultHeading>

      <div className="relative">
        <div className="absolute left-[39px] top-6 bottom-6 w-px bg-border" />
        <div className="space-y-0">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="flex gap-6 group"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: EASE_VERCEL }}
            >
              <div className="flex flex-col items-center pt-4 flex-shrink-0">
                <span className="font-mono text-xs text-accent bg-accent/8 border border-accent/15 px-2 py-1 rounded-lg z-10 relative whitespace-nowrap">
                  {item.time}
                </span>
              </div>
              <div className="flex-1 pb-6 pt-3.5">
                <p className="font-display text-lg text-ink-primary mb-1 group-hover:text-accent transition-colors duration-150">
                  {item.title}
                </p>
                <p className="font-sans text-sm text-ink-muted leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  result,
  ticketPrice,
  onCreateEvent,
  onRegenerate,
}: {
  result: typeof mockPlannerResult;
  ticketPrice: number;
  onCreateEvent: () => void;
  onRegenerate: () => void;
}) {
  const [eventName, setEventName] = useState(result.summary.eventName);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const netPerTicket = ticketPrice * (1 - result.pricing.platformFeePct / 100);
  const profit = Math.round(netPerTicket * result.pricing.capacity - result.pricing.totalCost);
  const breakEven = Math.ceil(result.pricing.totalCost / netPerTicket);
  const profitPositive = profit >= 0;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const countedProfit = useCountUp(Math.abs(profit), inView, 1200);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const RISK_COLOR = {
    Low: 'text-verified',
    Medium: 'text-yellow-600',
    High: 'text-red-500',
  };

  return (
    <div ref={ref} className="border border-border rounded-3xl overflow-hidden bg-bg-primary shadow-xl shadow-ink-primary/4">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">Event name</p>
        {editing ? (
          <input
            ref={inputRef}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            className="font-display text-xl text-ink-primary bg-transparent border-b-2 border-accent focus:outline-none w-full pb-0.5"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-display text-xl text-ink-primary text-left hover:text-accent transition-colors group w-full"
            title="Click to edit"
          >
            {eventName}
            <span className="font-mono text-[10px] text-ink-light ml-2 opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 py-5 space-y-4">
        {/* Estimated profit */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">Estimated profit</p>
          <p className={`font-display text-[2.5rem] leading-none ${profitPositive ? 'text-verified' : 'text-red-500'}`}>
            {profitPositive ? '+' : '-'}₹{countedProfit.toLocaleString('en-IN')}
          </p>
          <p className="font-mono text-[10px] text-ink-light mt-1">at {result.pricing.capacity} tickets sold</p>
        </div>

        <div className="h-px bg-border" />

        {/* Break-even */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink-muted">Break-even</p>
          <p className="font-sans text-sm text-ink-primary font-medium">
            {breakEven} of {result.pricing.capacity} attendees
          </p>
        </div>

        {/* Risk */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink-muted">Risk level</p>
          <p className={`font-sans text-sm font-medium ${RISK_COLOR[result.summary.riskLevel]}`}>
            {result.summary.riskLevel}
          </p>
        </div>

        {/* Total cost */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink-muted">Total cost</p>
          <p className="font-sans text-sm text-ink-primary">₹{result.summary.totalCost.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-6 space-y-3">
        <motion.button
          onClick={onCreateEvent}
          className="w-full bg-accent text-white font-sans text-sm font-medium py-4 rounded-2xl flex items-center justify-center gap-2"
          whileHover={{ scale: 1.03, scaleX: 1.04, boxShadow: '0 0 28px rgba(255,90,31,0.35)', transition: { type: 'spring', stiffness: 300, damping: 18 } }}
          whileTap={{ scale: 0.97, scaleX: 0.98 }}
        >
          Create this event →
        </motion.button>
        <button
          onClick={onRegenerate}
          className="w-full border border-border text-ink-primary font-sans text-sm py-3.5 rounded-2xl hover:bg-bg-secondary transition-colors"
        >
          Regenerate plan
        </button>
        <button className="w-full font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors py-1">
          Save draft
        </button>
      </div>
    </div>
  );
}

// ─── Mobile Summary Bar ────────────────────────────────────────────────────────

function MobileSummaryBar({ result, onCreateEvent }: { result: typeof mockPlannerResult; onCreateEvent: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const profit = Math.round(result.pricing.suggested * (1 - result.pricing.platformFeePct / 100) * result.pricing.capacity - result.pricing.totalCost);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-primary border-t border-border">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_VERCEL }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-5 pb-2 grid grid-cols-3 gap-3 border-b border-border">
              {[
                { label: 'Est. profit', value: `+₹${profit.toLocaleString('en-IN')}`, accent: true },
                { label: 'Break-even', value: `${Math.ceil(result.pricing.totalCost / (result.pricing.suggested * 0.9))} ppl`, accent: false },
                { label: 'Risk', value: result.summary.riskLevel, accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} className="text-center">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-ink-muted mb-0.5">{label}</p>
                  <p className={`font-sans text-sm font-medium ${accent ? 'text-verified' : 'text-ink-primary'}`}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={() => setExpanded((v) => !v)} className="flex-1 text-left">
          <p className="font-display text-lg text-ink-primary">
            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN')}
          </p>
          <p className="font-mono text-[10px] text-ink-muted">{expanded ? 'tap to collapse' : 'estimated profit · tap for details'}</p>
        </button>
        <button
          onClick={onCreateEvent}
          className="bg-accent text-white font-sans text-sm font-medium px-5 py-3 rounded-2xl flex-shrink-0"
        >
          Create →
        </button>
      </div>
    </div>
  );
}

// ─── Result State ─────────────────────────────────────────────────────────────

function ResultState({ onRegenerate }: { onRegenerate: () => void }) {
  const result = mockPlannerResult;
  const [ticketPrice] = useState(result.pricing.suggested);

  const handleCreateEvent = () => {
    // Would navigate to event creation
    window.location.href = '/host/dashboard';
  };

  return (
    <motion.div
      key="result"
      className="min-h-screen pt-14 pb-32 lg:pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: EASE_VERCEL }}
    >
      {/* Mobile query banner */}
      <div className="lg:hidden px-6 py-3 border-b border-border bg-bg-secondary">
        <p className="font-mono text-xs text-ink-muted truncate">✦ {result.query}</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8">
        {/* Page title stagger */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_VERCEL }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-3">Your plan is ready</p>
          <h1
            className="font-display text-ink-primary leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            {result.overview.title}
          </h1>
          <p className="font-sans text-base text-ink-muted mt-2">{result.overview.tagline}</p>
        </motion.div>

        <div className="lg:grid lg:grid-cols-[60%_40%] gap-14 items-start">
          {/* ── Left: Plan ─────────────────────────────────────────── */}
          <div className="space-y-16 cursor-none" data-cursor="EXPLORE">

            {/* Overview */}
            <SectionReveal>
              <ResultEyebrow>Overview</ResultEyebrow>
              <ResultHeading>{result.overview.title}</ResultHeading>
              <p className="font-sans text-[17px] text-ink-primary leading-[1.75] max-w-[600px]">
                {result.overview.description.replace(
                  `${result.overview.attendeesMin}–${result.overview.attendeesMax}`,
                  `[[RANGE]]`
                ).split('[[RANGE]]').map((part, i) => (
                  i === 0
                    ? <span key={i}>{part}</span>
                    : <span key={i}><span className="text-accent font-semibold">{result.overview.attendeesMin}–{result.overview.attendeesMax} people</span>{part}</span>
                ))}
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                {[
                  { label: 'Format', value: result.overview.format },
                  { label: 'Duration', value: result.overview.duration },
                  { label: 'Capacity', value: `${result.overview.attendeesMin}–${result.overview.attendeesMax} people` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-bg-secondary border border-border rounded-xl px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-widest text-ink-muted mb-0.5">{label}</p>
                    <p className="font-sans text-sm text-ink-primary font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </SectionReveal>

            {/* Budget */}
            <BudgetSection items={result.budget.items} total={result.budget.total} />

            {/* Venues */}
            <SectionReveal>
              <ResultEyebrow>Venue suggestions</ResultEyebrow>
              <ResultHeading>Three perfect fits</ResultHeading>
              <div className="space-y-4">
                {result.venues.map((v, i) => (
                  <VenueCard key={v.name} venue={v} index={i} />
                ))}
              </div>
            </SectionReveal>

            {/* Schedule */}
            <ScheduleSection items={result.schedule} />

            {/* Pricing */}
            <PricingSection pricing={result.pricing} />

            {/* Marketing */}
            <MarketingSection marketing={result.marketing} />
          </div>

          {/* ── Right: Summary card ─────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SummaryCard
                result={result}
                ticketPrice={ticketPrice}
                onCreateEvent={handleCreateEvent}
                onRegenerate={onRegenerate}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile summary bar */}
      <MobileSummaryBar result={result} onCreateEvent={handleCreateEvent} />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [phase, setPhase] = useState<Phase>('landing');
  const [query, setQuery] = useState('');

  const handleSubmit = (q: string) => {
    setQuery(q);
    setPhase('generating');
  };

  const handleDone = useCallback(() => {
    setPhase('result');
  }, []);

  const handleRegenerate = () => {
    setPhase('generating');
  };

  return (
    <div className="relative min-h-screen bg-bg-primary overflow-x-hidden">
      <AnimatedBg />
      <TopBar phase={phase} query={query} />

      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <LandingState key="landing" onSubmit={handleSubmit} />
        )}
        {phase === 'generating' && (
          <GeneratingState key="generating" onDone={handleDone} />
        )}
        {phase === 'result' && (
          <ResultState key="result" onRegenerate={handleRegenerate} />
        )}
      </AnimatePresence>

      {/* Floating sparkles — only in result state */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.div
            key="sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Sparkle />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
