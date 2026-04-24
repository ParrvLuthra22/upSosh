'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

const CATEGORIES = [
  'Run Club',
  'Creator Meetup',
  'Workshop',
  'Dinner Club',
  'Book Club',
  'Yoga & Wellness',
  'Live Music',
  'Art & Culture',
  'Tech & Startups',
  'Photography',
  'Food & Drink',
  'Networking',
];

function EventPreviewCard({
  title,
  category,
  date,
  time,
  location,
  ticketType,
  price,
}: {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  ticketType: 'free' | 'paid';
  price: string;
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-bg-primary">
      <div className="bg-bg-secondary h-[120px] flex items-center justify-center">
        <span className="font-mono text-xs text-ink-muted">Event image</span>
      </div>
      <div className="p-4 space-y-2">
        <p className="font-display text-lg text-ink-primary leading-tight">
          {title || 'Your event title'}
        </p>
        <div className="space-y-1">
          {date && (
            <p className="font-mono text-xs text-ink-muted">
              {date} {time && `· ${time}`}
            </p>
          )}
          {location && <p className="font-mono text-xs text-ink-muted">{location}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {category && (
            <span className="font-mono text-[10px] border border-border rounded-full px-2 py-0.5 text-ink-muted">
              {category}
            </span>
          )}
          <span
            className={`font-mono text-[10px] rounded-full px-2 py-0.5 ${
              ticketType === 'free'
                ? 'bg-verified/10 text-verified'
                : 'bg-accent/10 text-accent'
            }`}
          >
            {ticketType === 'free' ? 'Free' : price ? `₹${price}` : 'Paid'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SampleEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [ticketType, setTicketType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const canContinue = title.trim().length > 0 && date.length > 0;

  function handleContinue() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hv-event-title', title);
      sessionStorage.setItem('hv-event-category', category);
      sessionStorage.setItem('hv-event-description', description);
      sessionStorage.setItem('hv-event-date', date);
      sessionStorage.setItem('hv-event-time', time);
      sessionStorage.setItem('hv-event-location', location);
      sessionStorage.setItem('hv-event-capacity', String(capacity));
      sessionStorage.setItem('hv-event-ticket-type', ticketType);
      sessionStorage.setItem('hv-event-price', price);
    }
    router.push('/onboarding/host-verification/review');
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Plan your first event.
        </h1>
        <p className="font-sans text-sm text-ink-muted">
          Won't go live yet — helps us understand your style.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left — form */}
        <div className="flex-1 space-y-5">
          {/* Title — large serif */}
          <div className="border-b border-border">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sunday Run Club..."
              className="w-full bg-transparent py-3 font-display text-2xl text-ink-primary outline-none placeholder:text-ink-muted/40"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
              Category
            </label>
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              className={`w-full flex items-center justify-between border-2 rounded-2xl px-4 py-3 font-sans text-sm transition-all duration-200 ${
                catOpen ? 'border-accent bg-bg-primary' : 'border-border bg-bg-secondary'
              } ${category ? 'text-ink-primary' : 'text-ink-muted'}`}
            >
              {category || 'Select category'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${catOpen ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {catOpen && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-bg-primary border border-border rounded-2xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setCatOpen(false); }}
                    className="w-full text-left px-4 py-3 font-sans text-sm text-ink-primary hover:bg-bg-secondary transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
              Description
            </label>
            <div className="relative border-2 border-border rounded-2xl focus-within:border-accent bg-bg-secondary focus-within:bg-bg-primary transition-all">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Tell attendees what to expect..."
                className="w-full bg-transparent p-4 font-sans text-sm text-ink-primary outline-none resize-none placeholder:text-ink-muted/60"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
                Date
              </label>
              <div className="relative border-2 border-border rounded-2xl focus-within:border-accent bg-bg-secondary focus-within:bg-bg-primary transition-all px-4 py-3 flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 bg-transparent font-sans text-sm text-ink-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
                Time
              </label>
              <div className="relative border-2 border-border rounded-2xl focus-within:border-accent bg-bg-secondary focus-within:bg-bg-primary transition-all px-4 py-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-transparent font-sans text-sm text-ink-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
              Location
            </label>
            <div className="border-2 border-border rounded-2xl focus-within:border-accent bg-bg-secondary focus-within:bg-bg-primary transition-all px-4 py-3">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lodhi Garden, Delhi"
                className="w-full bg-transparent font-sans text-sm text-ink-primary outline-none placeholder:text-ink-muted/60"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
              Capacity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCapacity((c) => Math.max(2, c - 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center font-sans text-lg text-ink-muted hover:border-accent hover:text-accent transition-colors"
              >
                –
              </button>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Math.min(200, Math.max(2, parseInt(e.target.value) || 2)))}
                min={2}
                max={200}
                className="w-20 text-center border-2 border-border rounded-2xl py-2 font-sans text-sm text-ink-primary bg-bg-secondary outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setCapacity((c) => Math.min(200, c + 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center font-sans text-lg text-ink-muted hover:border-accent hover:text-accent transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Ticket type */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted block mb-1.5">
              Ticket type
            </label>
            <div className="flex gap-1 bg-bg-secondary border border-border rounded-full p-1 w-fit">
              {(['free', 'paid'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTicketType(type)}
                  className={`px-5 py-2 rounded-full font-sans text-sm capitalize transition-all duration-200 ${
                    ticketType === type
                      ? 'bg-ink-primary text-bg-primary'
                      : 'text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {ticketType === 'paid' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: EASE_VERCEL }}
                  className="overflow-hidden mt-3"
                >
                  <div className="flex items-center border-2 border-border rounded-2xl focus-within:border-accent bg-bg-secondary focus-within:bg-bg-primary transition-all px-4 py-3 gap-2">
                    <span className="font-sans text-sm text-ink-muted">₹</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="499"
                      min={0}
                      className="flex-1 bg-transparent font-sans text-sm text-ink-primary outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile preview toggle */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="font-mono text-sm text-accent"
            >
              {previewOpen ? 'Hide preview ↑' : 'Preview event ↓'}
            </button>
            <AnimatePresence>
              {previewOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_VERCEL }}
                  className="overflow-hidden mt-3"
                >
                  <EventPreviewCard
                    title={title}
                    category={category}
                    date={date}
                    time={time}
                    location={location}
                    ticketType={ticketType}
                    price={price}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right — live preview (desktop only) */}
        <div className="hidden md:block w-[280px] sticky top-24 self-start">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-muted mb-3">
            Live preview
          </p>
          <EventPreviewCard
            title={title}
            category={category}
            date={date}
            time={time}
            location={location}
            ticketType={ticketType}
            price={price}
          />
        </div>
      </div>

      {/* Continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/host-verification/profile')}
          className="font-mono text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back
        </button>
        <MagneticButton>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-ink-primary text-bg-primary font-sans text-sm font-medium px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors duration-300"
          >
            Continue
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
