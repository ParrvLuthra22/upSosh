'use client';

import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { IconPencil, IconMapPin, IconAlignLeft, IconCheck } from '@tabler/icons-react';
import { CoverImage } from './CoverImage';
import { Modal } from './Modal';
import { PLATFORM_FEE_FLAT } from '@/lib/booking';
import {
  CATEGORIES, defaultForm, buildPayload, missingFields, missingSummary,
  type CreateEventForm as FormState, type RequiredField,
} from '@/lib/createEvent';

export type CreateEventPayload = ReturnType<typeof buildPayload>;

interface Props {
  /** Send the payload; reject with an Error to show it inline (with Retry). */
  onSubmit: (payload: CreateEventPayload, draft: boolean) => Promise<void>;
  /** Injectable clock for the tomorrow default (tests). */
  now?: Date;
}

type ModalKey = 'location' | 'description' | 'category' | 'tickets' | 'capacity' | 'included' | null;

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime';
const FIELD = `w-full min-h-[44px] rounded-xl bg-void border border-border-strong px-4 font-sans text-sm text-cream placeholder:text-cream-dim ${RING}`;

const Row = forwardRef<HTMLButtonElement, {
  icon?: React.ReactNode; label: string; sub?: string; value?: string; onClick: () => void; testId?: string; describedBy?: string;
}>(function Row({ icon, label, sub, value, onClick, testId, describedBy }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-describedby={describedBy}
      className={`w-full min-h-[56px] flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-2 transition-colors touch-manipulation ${RING} focus-visible:ring-inset`}
    >
      {icon && <span className="text-cream-dim" aria-hidden="true">{icon}</span>}
      <span className="flex-1 min-w-0">
        <span className="block font-sans text-sm text-cream truncate">{label}</span>
        {(value || sub) && (
          <span className="block font-sans text-sm text-cream-dim truncate">{value || sub}</span>
        )}
      </span>
      <IconPencil size={16} className="text-cream-dim flex-shrink-0" aria-hidden="true" />
    </button>
  );
});

function OptionRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[48px] flex items-center justify-between gap-4 px-4 text-left hover:bg-surface-2 transition-colors touch-manipulation ${RING} focus-visible:ring-inset`}
    >
      <span className="font-sans text-sm text-cream">{label}</span>
      <span className="flex items-center gap-2 min-w-0 font-sans text-sm text-cream-dim">
        <span className="truncate tabular-nums">{value}</span>
        <IconPencil size={16} className="flex-shrink-0" aria-hidden="true" />
      </span>
    </button>
  );
}

/** Run `reset` each time a modal opens, so its local draft starts from the saved value. */
function useResetOnOpen(open: boolean, reset: () => void) {
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) { setWasOpen(true); reset(); }
  if (!open && wasOpen) setWasOpen(false);
}

/** Let the one-line title wrap and grow instead of clipping. */
function fitTitle(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

export default function CreateEventForm({ onSubmit, now }: Props) {
  const [form, setForm] = useState<FormState>(() => defaultForm(now));
  const [modal, setModal] = useState<ModalKey>(null);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState<null | 'live' | 'draft'>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lastDraft = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const locationRowRef = useRef<HTMLButtonElement>(null);
  const missingId = useId();

  const dirty = useRef(false);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => { dirty.current = true; setForm((p) => ({ ...p, [k]: v })); }
  const missing = missingFields(form);
  const isMissing = (f: RequiredField) => attempted && missing.includes(f);
  const close = () => setModal(null);

  async function submit(draft: boolean) {
    lastDraft.current = draft;
    setSubmitError(null);
    if (missing.length) {
      setAttempted(true);
      const first = missing[0];
      (first === 'title' ? titleRef.current : first === 'date' ? dateRef.current : locationRowRef.current)?.focus();
      return;
    }
    setSaving(draft ? 'draft' : 'live');
    try {
      await onSubmit(buildPayload(form, draft), draft);
      dirty.current = false;
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : 'Failed to create event');
    } finally {
      setSaving(null);
    }
  }

  const busy = saving !== null;
  const ticketValue = form.isFree ? 'Free' : INR.format(Number(form.price) || 0);

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[960px] mx-auto px-5 md:px-8 pt-24 pb-40 lg:pt-28 lg:pb-16">
        <h1 className="sr-only">Create event</h1>
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 lg:gap-12">
          {/* Left: the cover is the live preview */}
          <div className="lg:sticky lg:top-28 self-start">
            <CoverImage value={form.image} onChange={(u) => set('image', u)} />
          </div>

          {/* Right: one calm stack */}
          <div className="space-y-6 min-w-0">
            <div>
              <label htmlFor="event-title" className="sr-only">Event name</label>
              <textarea
                id="event-title"
                ref={titleRef}
                rows={1}
                value={form.title}
                onChange={(e) => { set('title', e.target.value.replace(/\n/g, ' ')); fitTitle(e.target); }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                placeholder="Event name"
                name="title"
                autoComplete="off"
                aria-invalid={isMissing('title') ? true : undefined}
                aria-describedby={isMissing('title') ? 'title-error' : undefined}
                className={`block w-full resize-none overflow-hidden bg-transparent border-0 border-b border-transparent px-0 py-2 font-display text-[40px] leading-tight text-cream placeholder:text-cream-dim ${RING} focus-visible:ring-0 focus-visible:border-lime`}
                style={{ letterSpacing: '-0.03em' }}
              />
              {isMissing('title') && <p id="title-error" className="mt-1 font-sans text-sm text-coral">Add an event name</p>}
            </div>

            {/* Date & time */}
            <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
              <div className="flex items-center justify-between gap-4 px-4 min-h-[56px]">
                <label htmlFor="event-date" className="font-sans text-sm text-cream">Date</label>
                <input
                  id="event-date"
                  name="date"
                  autoComplete="off"
                  ref={dateRef}
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  aria-invalid={isMissing('date') ? true : undefined}
                  className={`min-h-[44px] rounded-lg bg-void border border-border-strong px-3 font-sans text-sm text-cream ${RING}`}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="flex items-center justify-between gap-4 px-4 min-h-[56px]">
                <label htmlFor="event-time" className="font-sans text-sm text-cream">Time</label>
                <div className="flex items-center gap-2">
                  <input
                    id="event-time"
                    name="time"
                    autoComplete="off"
                    type="time"
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                    className={`min-h-[44px] rounded-lg bg-void border border-border-strong px-3 font-sans text-sm text-cream ${RING}`}
                    style={{ colorScheme: 'dark' }}
                  />
                  <span className="rounded-full border border-border-strong px-2.5 py-1 font-mono text-[11px] text-cream-dim" title="Indian Standard Time">IST</span>
                </div>
              </div>
            </div>
            {isMissing('date') && <p className="-mt-3 font-sans text-sm text-coral">Pick a date</p>}

            {/* Location & description */}
            <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
              <Row
                ref={locationRowRef}
                icon={<IconMapPin size={20} />}
                label={form.location || 'Add location'}
                sub={form.location ? undefined : 'Venue or area'}
                onClick={() => setModal('location')}
                testId="row-location"
                describedBy={isMissing('location') ? 'location-error' : undefined}
              />
              <Row
                icon={<IconAlignLeft size={20} />}
                label={form.description ? 'Description' : 'Add description'}
                value={form.description ? form.description.replace(/\s+/g, ' ') : undefined}
                sub="What should people expect?"
                onClick={() => setModal('description')}
                testId="row-description"
              />
            </div>
            {isMissing('location') && <p id="location-error" className="-mt-3 font-sans text-sm text-coral">Add a location</p>}

            {/* Event options */}
            <section aria-labelledby="options-heading">
              <h2 id="options-heading" className="mb-2 font-mono text-[11px] uppercase tracking-widest text-cream-dim">Event options</h2>
              <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
                <OptionRow label="Category" value={form.category} onClick={() => setModal('category')} />
                <OptionRow label="Tickets" value={ticketValue} onClick={() => setModal('tickets')} />
                <OptionRow label="Capacity" value={String(form.capacity)} onClick={() => setModal('capacity')} />
                <OptionRow
                  label="What's included"
                  value={form.included.trim() ? `${form.included.split('\n').filter((l) => l.trim()).length} items` : 'Optional'}
                  onClick={() => setModal('included')}
                />
              </div>
            </section>

            {submitError && (
              <div role="alert" className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 font-sans text-sm text-cream">
                <p>{submitError}</p>
                <button
                  type="button"
                  onClick={() => submit(lastDraft.current)}
                  disabled={busy}
                  className={`mt-2 min-h-[44px] underline underline-offset-2 ${RING}`}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Actions: sticky bar on mobile */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-void/95 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <div className="mx-auto max-w-[960px]">
                {attempted && missing.length > 0 && (
                  <p id={missingId} role="alert" className="mb-2 text-center font-sans text-sm text-coral">{missingSummary(missing)}</p>
                )}
                <button
                  type="button"
                  onClick={() => submit(false)}
                  disabled={busy}
                  aria-busy={saving === 'live'}
                  aria-describedby={attempted && missing.length ? missingId : undefined}
                  className="w-full min-h-[48px] rounded-full bg-lime text-void font-sans text-[15px] font-semibold hover:bg-cream transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-void"
                >
                  {saving === 'live' ? 'Creating…' : 'Create event'}
                </button>
                <button
                  type="button"
                  onClick={() => submit(true)}
                  disabled={busy}
                  className={`mt-1 w-full min-h-[44px] rounded-full font-sans text-sm text-cream-dim hover:text-cream transition-colors disabled:opacity-60 ${RING}`}
                >
                  {saving === 'draft' ? 'Saving…' : 'Save as draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LocationModal open={modal === 'location'} value={form.location} onSave={(v) => set('location', v)} onClose={close} />
      <TextModal
        open={modal === 'description'} title="Description" label="Tell people what to expect" rows={6}
        placeholder="Describe what attendees can expect…" value={form.description}
        onSave={(v) => set('description', v)} onClose={close}
      />
      <TextModal
        open={modal === 'included'} title="What's included" label="One item per line (optional)" rows={5}
        placeholder={'One item per line, e.g.\nChai after the run\nDigital ticket'}
        hint="Leave empty and the event page won't show a “What's included” section."
        value={form.included} onSave={(v) => set('included', v)} onClose={close}
      />
      <CategoryModal open={modal === 'category'} value={form.category} onPick={(c) => { set('category', c); close(); }} onClose={close} />
      <TicketsModal open={modal === 'tickets'} isFree={form.isFree} price={form.price} onSave={(isFree, price) => { set('isFree', isFree); set('price', price); }} onClose={close} />
      <CapacityModal open={modal === 'capacity'} value={form.capacity} onSave={(n) => set('capacity', n)} onClose={close} />
    </div>
  );
}

// ─── Modal bodies. Each edits a local draft; Done commits, Esc/backdrop discards ───

function LocationModal({ open, value, onSave, onClose }: { open: boolean; value: string; onSave: (v: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value);
  useResetOnOpen(open, () => setDraft(value));
  const save = () => onSave(draft.trim());
  return (
    <Modal open={open} title="Location" onClose={onClose} onDone={save}>
      <label htmlFor="loc-input" className="block mb-2 font-sans text-sm text-cream-dim">Venue or area</label>
      <input
        id="loc-input" name="location" autoComplete="off" type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); save(); onClose(); } }}
        placeholder="Lodhi Garden, Gate 2, New Delhi…" className={FIELD}
      />
    </Modal>
  );
}

function TextModal({ open, title, label, rows, placeholder, hint, value, onSave, onClose }: {
  open: boolean; title: string; label: string; rows: number; placeholder: string; hint?: string;
  value: string; onSave: (v: string) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useResetOnOpen(open, () => setDraft(value));
  const id = useId();
  return (
    <Modal open={open} title={title} onClose={onClose} onDone={() => onSave(draft)}>
      <label htmlFor={id} className="block mb-2 font-sans text-sm text-cream-dim">{label}</label>
      <textarea
        id={id} name={title.toLowerCase().replace(/\W+/g, '-')} autoComplete="off" rows={rows} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder}
        className={`${FIELD} py-3 resize-none`}
      />
      {hint && <p className="mt-2 font-sans text-xs text-cream-dim">{hint}</p>}
    </Modal>
  );
}

function CategoryModal({ open, value, onPick, onClose }: { open: boolean; value: string; onPick: (c: string) => void; onClose: () => void }) {
  return (
    <Modal open={open} title="Category" onClose={onClose}>
      <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c} type="button" role="radio" aria-checked={c === value} onClick={() => onPick(c)}
            className={`min-h-[44px] flex items-center justify-between gap-2 rounded-xl border touch-manipulation px-3 font-sans text-sm text-left ${RING} ${c === value ? 'border-lime bg-lime/10 text-cream' : 'border-border-strong text-cream-dim hover:text-cream'}`}
          >
            {c}{c === value && <IconCheck size={16} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function TicketsModal({ open, isFree, price, onSave, onClose }: {
  open: boolean; isFree: boolean; price: number | ''; onSave: (isFree: boolean, price: number | '') => void; onClose: () => void;
}) {
  const [free, setFree] = useState(isFree);
  const [amount, setAmount] = useState<string>(price === '' ? '' : String(price));
  const [error, setError] = useState<string | null>(null);
  useResetOnOpen(open, () => { setFree(isFree); setAmount(price === '' ? '' : String(price)); setError(null); });

  function save(): boolean {
    if (free) { onSave(true, ''); return true; }
    const n = Number(amount);
    if (!amount.trim() || !Number.isFinite(n) || n < 1) { setError('Enter a ticket price of at least ₹1, or choose Free.'); return false; }
    onSave(false, n);
    return true;
  }

  return (
    <Modal open={open} title="Tickets" onClose={onClose} onDone={save}>
      <div role="radiogroup" aria-label="Ticket type" className="grid grid-cols-2 gap-1 rounded-full border border-border-strong p-1">
        {([['Free', true], ['Paid', false]] as const).map(([label, v]) => (
          <button
            key={label} type="button" role="radio" aria-checked={free === v} onClick={() => { setFree(v); setError(null); }}
            className={`min-h-[44px] rounded-full font-sans text-sm ${RING} ${free === v ? 'bg-cream text-void font-semibold' : 'text-cream-dim hover:text-cream'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!free && (
        <div className="mt-4">
          <label htmlFor="ticket-price" className="block mb-2 font-sans text-sm text-cream-dim">Ticket price (₹)</label>
          <input
            id="ticket-price" name="price" autoComplete="off" type="number" inputMode="numeric" min={1} value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="500"
            aria-invalid={error ? true : undefined} aria-describedby={error ? 'ticket-error' : undefined} className={FIELD}
          />
          {error && <p id="ticket-error" role="alert" className="mt-2 font-sans text-sm text-coral">{error}</p>}
        </div>
      )}
      <p className="mt-4 font-sans text-xs text-cream-dim">A flat ₹{PLATFORM_FEE_FLAT} platform fee applies per booking, on top of your ticket price.</p>
    </Modal>
  );
}

function CapacityModal({ open, value, onSave, onClose }: { open: boolean; value: number; onSave: (n: number) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  useResetOnOpen(open, () => { setDraft(String(value)); setError(null); });

  function save(): boolean {
    const n = Number(draft);
    if (!Number.isInteger(n) || n < 2 || n > 500) { setError('Capacity must be a whole number between 2 and 500.'); return false; }
    onSave(n);
    return true;
  }
  return (
    <Modal open={open} title="Capacity" onClose={onClose} onDone={save}>
      <label htmlFor="capacity-input" className="block mb-2 font-sans text-sm text-cream-dim">Maximum guests</label>
      <input
        id="capacity-input" name="capacity" autoComplete="off" type="number" inputMode="numeric" min={2} max={500} value={draft}
        onChange={(e) => { setDraft(e.target.value); setError(null); }}
        aria-invalid={error ? true : undefined} aria-describedby={error ? 'capacity-error' : undefined} className={FIELD}
      />
      {error && <p id="capacity-error" role="alert" className="mt-2 font-sans text-sm text-coral">{error}</p>}
    </Modal>
  );
}
