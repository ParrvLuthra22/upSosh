'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { IconArrowLeft, IconPlus, IconX } from '@tabler/icons-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { withAuth } from '@/components/ProtectedRoute';

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 5;

const CATEGORIES = [
  'Run Club', 'Creator Meetup', 'Workshop', 'Dinner Club',
  'Book Club', 'Fitness', 'Social', 'Wellness',
];

const DURATION_OPTIONS = [
  '30 min', '1 hour', '1.5 hours', '2 hours',
  '2.5 hours', '3 hours', 'Half day', 'Full day',
];

const VENUE_TYPES = ['Indoor', 'Outdoor', 'Hybrid', 'Online'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventForm {
  // Step 1
  title: string;
  category: string;
  description: string;
  // Step 2
  date: string;
  time: string;
  duration: string;
  isRecurring: boolean;
  recurringFreq: string;
  // Step 3
  location: string;
  venueType: string;
  capacity: number;
  // Step 4
  price: number;
  isFree: boolean;
  maxGuests: number;
  isInstantBooking: boolean;
  currency: 'INR';
  // Step 5
  images: string[];
  coverIndex: number;
}

const INITIAL_FORM: EventForm = {
  title: '',
  category: '',
  description: '',
  date: '',
  time: '',
  duration: '1 hour',
  isRecurring: false,
  recurringFreq: 'Every week',
  location: '',
  venueType: 'Indoor',
  capacity: 20,
  price: 0,
  isFree: false,
  maxGuests: 20,
  isInstantBooking: true,
  currency: 'INR',
  images: [],
  coverIndex: 0,
};

// ─── Step variants ────────────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls = 'w-full bg-surface border border-border rounded-xl h-12 px-4 text-cream font-sans text-[15px] placeholder:text-cream-faint focus:outline-none focus:border-border-strong transition-colors';
const labelCls = 'block font-mono text-[11px] uppercase tracking-widest text-cream-faint mb-2';

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cn(
        'relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0',
        on ? 'bg-lime' : 'bg-surface-2 border border-border'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-void transition-transform',
          on ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// ─── Range slider ─────────────────────────────────────────────────────────────

function RangeSlider({
  value,
  min,
  max,
  step,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={labelCls}>{label}</span>
        <span className="font-mono text-[13px] text-cream">{value} guests</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #D4FF3F ${pct}%, rgba(244,241,234,0.08) ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

function Step1({ form, update }: { form: EventForm; update: (p: Partial<EventForm>) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleDescInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  return (
    <div>
      <h2 className="font-display text-[32px] text-cream mb-1">What&apos;s the event?</h2>
      <p className="font-sans text-[14px] text-cream-dim mb-8">Give it a name people will remember.</p>

      <div className="space-y-6">
        <div>
          <label className={labelCls}>Event title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="e.g. Sunday Run Club at Lodhi Garden"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => update({ category: cat })}
                className={cn(
                  'px-4 py-2 rounded-full font-sans text-[13px] border transition-colors',
                  form.category === cat
                    ? 'bg-lime text-void border-lime'
                    : 'bg-surface-2 text-cream-dim border-border hover:border-border-strong hover:text-cream'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            ref={textareaRef}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            onInput={handleDescInput}
            placeholder="What can attendees expect? Paint a picture."
            className="w-full bg-surface border border-border rounded-xl p-4 text-cream font-sans text-[15px] placeholder:text-cream-faint focus:outline-none focus:border-border-strong transition-colors resize-none min-h-[100px] max-h-[200px]"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Schedule ─────────────────────────────────────────────────────────

function Step2({ form, update }: { form: EventForm; update: (p: Partial<EventForm>) => void }) {
  return (
    <div>
      <h2 className="font-display text-[32px] text-cream mb-1">When does it happen?</h2>
      <p className="font-sans text-[14px] text-cream-dim mb-8">Set your date, time and duration.</p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update({ date: e.target.value })}
              className={cn(inputCls, 'dark:[color-scheme:dark]')}
            />
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => update({ time: e.target.value })}
              className={cn(inputCls, 'dark:[color-scheme:dark]')}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Duration</label>
          <select
            value={form.duration}
            onChange={(e) => update({ duration: e.target.value })}
            className={cn(inputCls, 'cursor-pointer')}
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d} className="bg-surface">{d}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
          <div>
            <p className="font-sans text-[14px] text-cream font-medium">Repeats</p>
            <p className="font-mono text-[11px] text-cream-faint mt-0.5">Schedule a recurring event</p>
          </div>
          <Toggle on={form.isRecurring} onChange={(v) => update({ isRecurring: v })} />
        </div>

        {form.isRecurring && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <label className={labelCls}>Frequency</label>
            <select
              value={form.recurringFreq}
              onChange={(e) => update({ recurringFreq: e.target.value })}
              className={cn(inputCls, 'cursor-pointer')}
            >
              {['Every week', 'Every 2 weeks', 'Monthly'].map((f) => (
                <option key={f} value={f} className="bg-surface">{f}</option>
              ))}
            </select>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Venue ────────────────────────────────────────────────────────────

function Step3({ form, update }: { form: EventForm; update: (p: Partial<EventForm>) => void }) {
  return (
    <div>
      <h2 className="font-display text-[32px] text-cream mb-1">Where&apos;s it happening?</h2>
      <p className="font-sans text-[14px] text-cream-dim mb-8">Tell attendees where to show up.</p>

      <div className="space-y-6">
        <div>
          <label className={labelCls}>Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="Search for a venue or address..."
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Venue type</label>
          <div className="flex flex-wrap gap-2">
            {VENUE_TYPES.map((vt) => (
              <button
                key={vt}
                type="button"
                onClick={() => update({ venueType: vt })}
                className={cn(
                  'px-4 py-2 rounded-full font-sans text-[13px] border transition-colors',
                  form.venueType === vt
                    ? 'bg-lime text-void border-lime'
                    : 'bg-surface-2 text-cream-dim border-border hover:border-border-strong hover:text-cream'
                )}
              >
                {vt}
              </button>
            ))}
          </div>
        </div>

        <RangeSlider
          label="Capacity"
          value={form.capacity}
          min={5}
          max={200}
          step={5}
          onChange={(v) => update({ capacity: v, maxGuests: v })}
        />
      </div>
    </div>
  );
}

// ─── Step 4: Pricing ──────────────────────────────────────────────────────────

function Step4({ form, update }: { form: EventForm; update: (p: Partial<EventForm>) => void }) {
  const platformFee = Math.round(form.price * 0.05);
  const youReceive = Math.round(form.price * 0.95);
  const totalRevenue = Math.round(form.price * 0.95 * form.maxGuests);

  return (
    <div>
      <h2 className="font-display text-[32px] text-cream mb-1">How much does it cost?</h2>
      <p className="font-sans text-[14px] text-cream-dim mb-8">Set your ticket price and booking settings.</p>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
          <div>
            <p className="font-sans text-[14px] text-cream font-medium">This event is free</p>
            <p className="font-mono text-[11px] text-cream-faint mt-0.5">No charge for attendees</p>
          </div>
          <Toggle on={form.isFree} onChange={(v) => update({ isFree: v, price: v ? 0 : form.price })} />
        </div>

        {!form.isFree && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <label className={labelCls}>Ticket price</label>
            <div className="flex items-center bg-surface border border-border rounded-xl h-12 px-4 gap-2 focus-within:border-border-strong transition-colors">
              <span className="font-mono text-cream-dim">₹</span>
              <input
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => update({ price: Number(e.target.value) })}
                placeholder="0"
                className="flex-1 bg-transparent text-cream font-sans text-[15px] focus:outline-none placeholder:text-cream-faint"
              />
            </div>
          </motion.div>
        )}

        <RangeSlider
          label="Max guests"
          value={form.maxGuests}
          min={5}
          max={form.capacity}
          step={5}
          onChange={(v) => update({ maxGuests: v })}
        />

        <div>
          <label className={labelCls}>Booking type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, title: 'Instant booking', desc: 'Attendees book immediately' },
              { value: false, title: 'Manual approval', desc: 'You approve each request' },
            ].map(({ value, title, desc }) => (
              <button
                key={title}
                type="button"
                onClick={() => update({ isInstantBooking: value })}
                className={cn(
                  'p-4 rounded-xl border text-left transition-colors',
                  form.isInstantBooking === value
                    ? 'border-lime bg-lime/5'
                    : 'border-border bg-surface-2 hover:border-border-strong'
                )}
              >
                <p className={cn('font-sans text-[13px] font-medium', form.isInstantBooking === value ? 'text-lime' : 'text-cream')}>
                  {title}
                </p>
                <p className="font-mono text-[11px] text-cream-faint mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {!form.isFree && form.price > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="bg-surface-2 border border-border rounded-xl p-4 space-y-2"
          >
            <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest mb-3">Fee breakdown</p>
            <div className="flex justify-between font-mono text-[13px]">
              <span className="text-cream-dim">Platform fee (5%)</span>
              <span className="text-cream">₹{platformFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-mono text-[13px]">
              <span className="text-cream-dim">You receive per ticket</span>
              <span className="text-lime">₹{youReceive.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-mono text-[13px] pt-2 border-t border-border">
              <span className="text-cream-dim">Total at capacity</span>
              <span className="text-lime">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Step 5: Media ────────────────────────────────────────────────────────────

function Step5({ form, update }: { form: EventForm; update: (p: Partial<EventForm>) => void }) {
  const [imageUrl, setImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addImage() {
    const url = imageUrl.trim();
    if (!url) return;
    update({ images: [...form.images, url] });
    setImageUrl('');
  }

  function removeImage(idx: number) {
    const next = form.images.filter((_, i) => i !== idx);
    update({ images: next, coverIndex: Math.min(form.coverIndex, Math.max(0, next.length - 1)) });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  return (
    <div>
      <h2 className="font-display text-[32px] text-cream mb-1">Show it off.</h2>
      <p className="font-sans text-[14px] text-cream-dim mb-8">
        Upload photos. The first one becomes your cover — drag to reorder.
      </p>

      <div className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors',
            isDragOver ? 'border-lime bg-lime/5' : 'border-border hover:border-border-strong'
          )}
        >
          <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest">
            Drag photos here or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
            placeholder="Or paste an image URL..."
            className={cn(inputCls, 'flex-1')}
          />
          <button
            type="button"
            onClick={addImage}
            className="h-12 px-4 bg-surface-2 border border-border rounded-xl text-cream hover:border-border-strong transition-colors flex items-center gap-1.5 font-sans text-[14px]"
          >
            <IconPlus size={15} /> Add
          </button>
        </div>

        {/* Thumbnails */}
        {form.images.length > 0 && (
          <div>
            <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest mb-3">
              Photos <span className="text-cream-faint/50">(Drag to reorder)</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => update({ coverIndex: idx })}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all',
                    form.coverIndex === idx ? 'border-lime' : 'border-transparent'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                  {form.coverIndex === idx && (
                    <div className="absolute top-1.5 left-1.5 bg-lime text-void font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-md">
                      Cover
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-void/70 text-cream flex items-center justify-center hover:bg-void transition-colors"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 bg-surface border border-border rounded-2xl p-5 space-y-2 font-mono text-[13px]">
          <p className="font-mono text-[11px] text-cream-faint uppercase tracking-widest mb-3">Event summary</p>
          <p><span className="text-cream-faint">Event: </span><span className="text-cream">{form.title || '—'}</span></p>
          <p><span className="text-cream-faint">Date: </span><span className="text-cream">{form.date ? `${form.date} at ${form.time}` : '—'}</span></p>
          <p><span className="text-cream-faint">Venue: </span><span className="text-cream">{form.location || '—'}</span></p>
          <p><span className="text-cream-faint">Price: </span><span className="text-lime">{form.isFree || form.price === 0 ? 'Free' : `₹${form.price.toLocaleString('en-IN')}`}</span></p>
          <p><span className="text-cream-faint">Capacity: </span><span className="text-cream">{form.maxGuests} guests</span></p>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function NewEventWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<EventForm>(INITIAL_FORM);

  function update(partial: Partial<EventForm>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function handleNext() {
    if (step === TOTAL_STEPS) {
      handlePublish();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  }

  function handleBack() {
    setDirection(-1);
    setStep((s) => s - 1);
  }

  async function handlePublish() {
    try {
      await api.post('/api/events', { ...form });
      toast.success("You're in. Event published!");
      router.push('/dashboard');
    } catch {
      toast.success('Event created! (demo mode)');
      router.push('/dashboard');
    }
  }

  function renderStep() {
    switch (step) {
      case 1: return <Step1 form={form} update={update} />;
      case 2: return <Step2 form={form} update={update} />;
      case 3: return <Step3 form={form} update={update} />;
      case 4: return <Step4 form={form} update={update} />;
      case 5: return <Step5 form={form} update={update} />;
      default: return null;
    }
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 bg-void border-b border-border z-20 px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-cream-dim hover:text-cream font-sans text-[14px] transition-colors">
            <IconArrowLeft size={16} /> Dashboard
          </button>
        </Link>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={cn(
                'rounded-full transition-all',
                n === step ? 'w-4 h-1.5 bg-lime' : n < step ? 'w-1.5 h-1.5 bg-lime/50' : 'w-1.5 h-1.5 bg-surface-2'
              )}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-cream-faint uppercase tracking-widest">
          Step {step} / 5
        </span>
      </div>

      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-0.5 bg-surface-2 z-20">
        <motion.div
          className="h-full bg-lime"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      {/* Content */}
      <div className="pt-20 pb-24 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: EASE }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="h-11 px-6 rounded-xl bg-transparent text-cream-dim border border-border font-sans text-[14px] hover:text-cream hover:bg-cream/5 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="h-11 flex-1 bg-lime text-void rounded-xl font-sans text-[14px] font-semibold hover:bg-lime/90 transition-colors"
            >
              {step === TOTAL_STEPS ? 'Publish event' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(NewEventWizard);
