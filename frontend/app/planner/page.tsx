'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSparkles,
  IconArrowLeft,
  IconBookmark,
  IconRefresh,
  IconPlus,
  IconMapPin,
  IconUsers,
  IconCoin,
  IconClock,
  IconBulb,
  IconChevronRight,
  IconStar,
  IconCalendar,
  IconBrandInstagram,
  IconTrash,
} from '@tabler/icons-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  type PlannerResult,
  type BudgetItem,
  type VenueSuggestion,
  type ScheduleItem,
} from '@/lib/plannerTypes';
import { withAuth } from '@/components/ProtectedRoute';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const VIBES = ['Intimate', 'Casual', 'High-energy', 'Wellness', 'Workshop', 'Outdoors'] as const;
type Vibe = (typeof VIBES)[number];

const LOADING_MESSAGES = [
  'Reading the room…',
  'Finding the right venues…',
  'Doing the math…',
  'Mapping the timeline…',
  'Polishing the plan…',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PastPlan {
  id: string;
  query: string;
  timestamp: Date;
  result: PlannerResult;
}

interface PlanForm {
  eventType: string;
  guestCount: number;
  budget: string;
  vibes: Vibe[];
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function formatTs(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function fmtRupee(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Rotating loading text ─────────────────────────────────────────────────────

function RotatingText({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % messages.length), 2000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="h-6 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          className="font-mono text-[13px] text-cream-dim absolute inset-0 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {messages[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ─── Venue card ───────────────────────────────────────────────────────────────

function VenueCard({ venue }: { venue: VenueSuggestion }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-[14px] font-medium text-cream">{venue.name}</p>
          <p className="font-mono text-[11px] text-cream-faint mt-0.5 flex items-center gap-1">
            <IconMapPin size={10} /> {venue.neighbourhood}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[13px] text-lime font-medium">
            {venue.price === 'Free' ? 'Free' : fmtRupee(venue.price as number)}
          </p>
          <p className="font-mono text-[10px] text-cream-faint flex items-center justify-end gap-0.5 mt-0.5">
            <IconStar size={9} className="fill-current text-lime" /> {venue.rating}
          </p>
        </div>
      </div>
      <p className="font-sans text-[13px] text-cream-dim leading-relaxed">{venue.why}</p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {venue.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] uppercase tracking-widest text-cream-faint bg-cream/5 px-2 py-0.5 rounded-full border border-border"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="font-mono text-[11px] text-cream-faint flex items-center gap-1 pt-0.5">
        <IconUsers size={10} /> Up to {venue.capacity} guests
      </p>
    </div>
  );
}

// ─── Budget table ─────────────────────────────────────────────────────────────

function BudgetTable({ items, total }: { items: BudgetItem[]; total: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-mono text-[10px] uppercase tracking-widest text-cream-faint px-4 py-3">Item</th>
            <th className="text-right font-mono text-[10px] uppercase tracking-widest text-cream-faint px-4 py-3">Cost</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.item} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <p className="font-sans text-[13px] text-cream">{item.item}</p>
                <p className="font-mono text-[11px] text-cream-faint mt-0.5">{item.note}</p>
              </td>
              <td className="px-4 py-3 text-right font-mono text-[13px] text-cream whitespace-nowrap">
                {item.cost === 0 ? <span className="text-emerald">Free</span> : fmtRupee(item.cost)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border-strong bg-surface-2">
            <td className="px-4 py-3 font-mono text-[12px] uppercase tracking-widest text-cream-dim">Total</td>
            <td className="px-4 py-3 text-right font-display text-[18px] text-lime">{fmtRupee(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          {/* spine */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-lime mt-1 flex-shrink-0 ring-2 ring-lime/20" />
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-0" />}
          </div>
          {/* content */}
          <div className={cn('pb-5', i === items.length - 1 && 'pb-0')}>
            <p className="font-mono text-[11px] text-lime uppercase tracking-widest">{item.time}</p>
            <p className="font-sans text-[14px] font-medium text-cream mt-0.5">{item.title}</p>
            <p className="font-sans text-[13px] text-cream-dim mt-1 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Marketing card ───────────────────────────────────────────────────────────

function MarketingCard({ result }: { result: PlannerResult }) {
  const { marketing, pricing } = result;
  return (
    <div className="space-y-4">
      {/* Caption */}
      <div>
        <p className="label text-cream-faint mb-2">Caption draft</p>
        <div className="bg-surface-2 border border-border rounded-xl p-4 font-sans text-[13px] text-cream-dim leading-relaxed whitespace-pre-line">
          {marketing.caption}
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <p className="label text-cream-faint mb-2">Hashtags</p>
        <div className="flex flex-wrap gap-1.5">
          {marketing.hashtags.map((tag) => (
            <span key={tag} className="font-mono text-[11px] text-lime bg-lime/10 px-2 py-0.5 rounded-full border border-lime/20">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Timing + platform */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface-2 border border-border rounded-xl p-3">
          <p className="label text-cream-faint mb-1">Best post time</p>
          <p className="font-sans text-[13px] text-cream flex items-center gap-1.5">
            <IconClock size={13} className="text-lime" /> {marketing.bestPostTime}
          </p>
        </div>
        <div className="bg-surface-2 border border-border rounded-xl p-3">
          <p className="label text-cream-faint mb-1">Platform</p>
          <p className="font-sans text-[13px] text-cream flex items-center gap-1.5">
            <IconBrandInstagram size={13} className="text-coral" /> {marketing.bestPlatform}
          </p>
        </div>
      </div>

      {/* Pricing suggestion */}
      <div className="bg-lime/5 border border-lime/20 rounded-xl p-4">
        <p className="label text-lime mb-2">Suggested ticket price</p>
        <p className="font-display text-[28px] text-lime leading-none">{fmtRupee(pricing.suggested)}</p>
        <p className="font-mono text-[12px] text-cream-dim mt-1">
          Range: {fmtRupee(pricing.min)} – {fmtRupee(pricing.max)} · Platform fee {pricing.platformFeePct}%
        </p>
        <p className="font-mono text-[12px] text-emerald mt-1">
          Est. revenue at capacity: {fmtRupee(Math.round(pricing.suggested * (1 - pricing.platformFeePct / 100) * pricing.capacity))}
        </p>
      </div>
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────

const RESULT_SECTIONS = [
  { id: 'venues',   label: 'Venues',          Icon: IconMapPin },
  { id: 'budget',   label: 'Budget',           Icon: IconCoin },
  { id: 'timeline', label: 'Timeline',         Icon: IconCalendar },
  { id: 'tips',     label: 'Marketing tips',   Icon: IconBulb },
] as const;

type SectionId = (typeof RESULT_SECTIONS)[number]['id'];

function ResultsView({
  result,
  onSave,
  onRefine,
  onNew,
}: {
  result: PlannerResult;
  onSave: () => void;
  onRefine: () => void;
  onNew: () => void;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>('venues');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <p className="label text-lime mb-3">[ Plan ready ]</p>
        <h2 className="font-display text-[32px] text-cream leading-tight">{result.overview.title}</h2>
        <p className="font-sans text-[15px] text-cream-dim mt-2 italic">"{result.overview.tagline}"</p>
        <p className="font-sans text-[14px] text-cream-dim mt-3 leading-relaxed max-w-2xl">
          {result.overview.description}
        </p>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { icon: IconClock, label: result.overview.duration },
            { icon: IconUsers, label: `${result.overview.attendeesMin}–${result.overview.attendeesMax} guests` },
            { icon: IconCoin, label: fmtRupee(result.budget.total) },
            { icon: IconMapPin, label: result.overview.format },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 bg-surface-2 border border-border rounded-full px-3 py-1 font-mono text-[11px] text-cream-dim">
              <Icon size={11} className="text-lime" /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
        {RESULT_SECTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all',
              activeSection === id
                ? 'bg-lime text-void font-semibold'
                : 'text-cream-dim hover:text-cream hover:bg-cream/5',
            )}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {activeSection === 'venues' && (
            <div className="space-y-3">
              {result.venues.map((v) => <VenueCard key={v.name} venue={v} />)}
            </div>
          )}
          {activeSection === 'budget' && (
            <BudgetTable items={result.budget.items} total={result.budget.total} />
          )}
          {activeSection === 'timeline' && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <Timeline items={result.schedule} />
            </div>
          )}
          {activeSection === 'tips' && (
            <div className="bg-surface border border-border rounded-2xl p-6">
              <MarketingCard result={result} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onSave}
          className="h-11 flex-1 bg-lime text-void rounded-xl font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors flex items-center justify-center gap-2"
        >
          <IconBookmark size={15} /> Save plan
        </button>
        <button
          onClick={onRefine}
          className="h-11 flex-1 bg-surface-2 text-cream border border-border rounded-xl font-sans text-[14px] hover:bg-cream/5 transition-colors flex items-center justify-center gap-2"
        >
          <IconRefresh size={15} /> Refine
        </button>
        <button
          onClick={onNew}
          className="h-11 flex-1 text-cream-dim border border-border rounded-xl font-sans text-[14px] hover:text-cream hover:bg-cream/5 transition-colors flex items-center justify-center gap-2"
        >
          <IconPlus size={15} /> New plan
        </button>
      </div>
    </motion.div>
  );
}

// ─── Past plans sidebar ────────────────────────────────────────────────────────

function PastPlansSidebar({
  plans,
  onSelect,
  onDelete,
}: {
  plans: PastPlan[];
  onSelect: (p: PastPlan) => void;
  onDelete: (id: string) => void;
}) {
  if (plans.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest">No past plans</p>
        <p className="font-sans text-[13px] text-cream-faint mt-2">Plans you generate will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 px-1">
      {plans.map((plan) => (
        <div key={plan.id} className="group relative">
          <button
            onClick={() => onSelect(plan)}
            className="w-full text-left bg-surface border border-border rounded-xl p-3 hover:border-border-strong transition-colors"
          >
            <p className="font-sans text-[13px] text-cream line-clamp-2 leading-snug">{plan.query}</p>
            <p className="font-mono text-[10px] text-cream-faint mt-1.5">{formatTs(plan.timestamp)}</p>
          </button>
          <button
            onClick={() => onDelete(plan.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-cream-faint hover:text-coral p-1 rounded"
          >
            <IconTrash size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Number stepper ───────────────────────────────────────────────────────────

function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center h-12 bg-surface border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-11 h-full flex items-center justify-center text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors font-sans text-lg flex-shrink-0 border-r border-border"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n) && n >= min && n <= max) onChange(n);
        }}
        className="flex-1 text-center bg-transparent text-cream font-sans text-[15px] outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-11 h-full flex items-center justify-center text-cream-dim hover:text-cream hover:bg-cream/5 transition-colors font-sans text-lg flex-shrink-0 border-l border-border"
      >
        +
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = 'form' | 'loading' | 'result';

function PlannerPage() {
  const [phase, setPhase] = useState<Phase>('form');
  const [form, setForm] = useState<PlanForm>({
    eventType: '',
    guestCount: 20,
    budget: '',
    vibes: [],
  });
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [pastPlans, setPastPlans] = useState<PastPlan[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const handleTypeInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  function toggleVibe(v: Vibe) {
    setForm((f) => ({
      ...f,
      vibes: f.vibes.includes(v) ? f.vibes.filter((x) => x !== v) : [...f.vibes, v],
    }));
  }

  async function handleGenerate() {
    if (!form.eventType.trim()) {
      textareaRef.current?.focus();
      return;
    }
    setPhase('loading');

    try {
      const data = await api.post<PlannerResult>('/api/ai/plan', {
        type: form.eventType,
        guestCount: form.guestCount,
        budget: form.budget ? parseInt(form.budget, 10) : undefined,
        vibes: form.vibes,
      });
      setResult(data);
      setPhase('result');
    } catch (err) {
      // Previously fell back to a fabricated plan on any failure — including a
      // missing OPENROUTER_API_KEY — with no indication it wasn't real. Show
      // the actual failure, distinguishing why it failed, and let the user
      // retry instead.
      const status = err instanceof Error ? (err as Error & { status?: number }).status : undefined;
      if (status === 429) {
        toast.error("You've hit the planner's hourly limit. Try again in a bit.");
      } else if (status === 503) {
        toast.error('The AI planner isn\'t configured yet — contact support.');
      } else {
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : 'Could not generate a plan. Please try again in a moment.',
        );
      }
      setPhase('form');
    }
  }

  function handleSave() {
    if (!result) return;
    const plan: PastPlan = {
      id: crypto.randomUUID(),
      query: form.eventType || result.query,
      timestamp: new Date(),
      result,
    };
    setPastPlans((p) => [plan, ...p]);
    // toast imported lazily to keep initial bundle small
    import('sonner').then(({ toast }) => toast.success('Plan saved.'));
  }

  function handleRefine() {
    setPhase('form');
  }

  function handleNew() {
    setForm({ eventType: '', guestCount: 20, budget: '', vibes: [] });
    setResult(null);
    setPhase('form');
  }

  function handleSelectPlan(plan: PastPlan) {
    setResult(plan.result);
    setForm((f) => ({ ...f, eventType: plan.query }));
    setPhase('result');
  }

  function handleDeletePlan(id: string) {
    setPastPlans((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 h-14 bg-void/90 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
        <Link
          href="/host/dashboard"
          className="flex items-center gap-2 font-sans text-[14px] text-cream-dim hover:text-cream transition-colors"
        >
          <IconArrowLeft size={16} /> Dashboard
        </Link>
        <span className="font-display text-[18px] text-cream tracking-tight">UpSosh</span>
        <div className="w-24" />
      </div>

      {/* Layout */}
      <div className="pt-14 xl:grid xl:grid-cols-[1fr_280px] xl:divide-x xl:divide-border min-h-screen">
        {/* Main */}
        <div className="max-w-3xl mx-auto px-6 py-16 xl:py-20 w-full">
          <AnimatePresence mode="wait">
            {/* ── Form phase ── */}
            {phase === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {/* Hero copy */}
                <p className="label text-lime mb-4">[ AI Planner ]</p>
                <h1 className="display-md text-cream text-balance">
                  Plan like you've done this{' '}
                  <em className="font-display not-italic text-cream-dim">a hundred times.</em>
                </h1>
                <p className="font-sans text-[17px] text-cream-dim mt-4 max-w-xl leading-relaxed">
                  Tell us about your event. We'll surface venues, budgets, and timing in seconds.
                </p>

                {/* Form card */}
                <div className="mt-12 bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
                  {/* Event type */}
                  <div>
                    <label className="label text-cream-faint block mb-2">What kind of event?</label>
                    <textarea
                      ref={textareaRef}
                      value={form.eventType}
                      onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))}
                      onInput={handleTypeInput}
                      placeholder="A Sunday morning run club for 30 people in South Delhi, budget ₹8,000…"
                      rows={3}
                      autoFocus
                      className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 font-sans text-[15px] text-cream placeholder:text-cream-faint resize-none outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-all min-h-[80px]"
                    />
                  </div>

                  {/* Guests + Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label text-cream-faint block mb-2">How many guests?</label>
                      <NumberStepper
                        value={form.guestCount}
                        onChange={(n) => setForm((f) => ({ ...f, guestCount: n }))}
                        min={2}
                        max={500}
                        step={5}
                      />
                    </div>
                    <div>
                      <label className="label text-cream-faint block mb-2">Budget?</label>
                      <div className="flex items-center h-12 bg-surface border border-border rounded-xl px-4 gap-2 focus-within:border-lime focus-within:ring-2 focus-within:ring-lime/20 transition-all">
                        <span className="font-mono text-[15px] text-cream-dim flex-shrink-0">₹</span>
                        <input
                          type="number"
                          value={form.budget}
                          onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                          placeholder="8000"
                          className="flex-1 bg-transparent text-cream font-sans text-[15px] outline-none placeholder:text-cream-faint [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vibe picker */}
                  <div>
                    <label className="label text-cream-faint block mb-2">Vibe</label>
                    <div className="flex flex-wrap gap-2">
                      {VIBES.map((vibe) => {
                        const active = form.vibes.includes(vibe);
                        return (
                          <button
                            key={vibe}
                            type="button"
                            onClick={() => toggleVibe(vibe)}
                            className={cn(
                              'h-9 px-4 rounded-full font-mono text-[11px] uppercase tracking-wider border transition-all',
                              active
                                ? 'bg-lime text-void border-lime font-semibold'
                                : 'bg-transparent text-cream-dim border-border hover:border-border-strong hover:text-cream',
                            )}
                          >
                            {vibe}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleGenerate}
                    disabled={!form.eventType.trim()}
                    className="w-full h-13 bg-lime text-void rounded-xl font-sans text-[15px] font-semibold hover:bg-lime/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    style={{ height: '3.25rem' }}
                  >
                    <IconSparkles size={16} />
                    Generate plan
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Loading phase ── */}
            {phase === 'loading' && (
              <motion.div
                key="loading"
                className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                {/* Ripple spinner */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Outer pulse rings */}
                  {[0, 1].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border border-lime/30"
                      animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                      transition={{ duration: 1.6, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                  ))}
                  {/* Spinning ring */}
                  <div className="w-10 h-10 rounded-full border-2 border-surface-2 border-t-lime animate-spin" />
                  <IconSparkles size={14} className="text-lime absolute" />
                </div>

                {/* Rotating message */}
                <RotatingText messages={LOADING_MESSAGES} />

                {/* Subtle query preview */}
                {form.eventType && (
                  <p className="font-mono text-[12px] text-cream-faint max-w-sm text-center line-clamp-2 px-4">
                    "{form.eventType}"
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Result phase ── */}
            {phase === 'result' && result && (
              <motion.div key="result">
                <ResultsView
                  result={result}
                  onSave={handleSave}
                  onRefine={handleRefine}
                  onNew={handleNew}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Past plans sidebar — visible on xl+ */}
        <div className="hidden xl:block px-6 py-20 overflow-y-auto max-h-screen sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <p className="label text-cream-faint">Past plans</p>
            {pastPlans.length > 0 && (
              <button
                onClick={() => setPastPlans([])}
                className="font-mono text-[10px] text-cream-faint hover:text-coral transition-colors uppercase tracking-wider"
              >
                Clear all
              </button>
            )}
          </div>
          <PastPlansSidebar
            plans={pastPlans}
            onSelect={handleSelectPlan}
            onDelete={handleDeletePlan}
          />
          {pastPlans.length === 0 && phase === 'form' && (
            <div className="mt-8 bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <IconChevronRight size={13} className="text-lime" />
                <p className="font-mono text-[11px] text-lime uppercase tracking-widest">Try asking</p>
              </div>
              {[
                'A rooftop dinner for 20 in Mumbai, ₹50k budget',
                'Weekend yoga retreat for 15, Pune',
                'Creator meetup in Bengaluru, casual, 40 guests',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setForm((f) => ({ ...f, eventType: prompt }))}
                  className="w-full text-left mt-2 font-sans text-[12px] text-cream-dim hover:text-cream transition-colors py-1 border-b border-border last:border-0 flex items-start gap-1.5"
                >
                  <span className="text-cream-faint mt-0.5">→</span> {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(PlannerPage);
