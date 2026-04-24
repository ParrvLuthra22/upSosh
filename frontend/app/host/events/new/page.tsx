'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface EventFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number | '';
  isFree: boolean;
  image: string;
}

const CATEGORIES = ['Run Club', 'Meetup', 'Workshop', 'Dinner Club', 'Book Club', 'Fitness', 'Social', 'Other'];

const DEFAULT: EventFormData = {
  title: '',
  description: '',
  category: 'Meetup',
  date: '',
  time: '',
  location: '',
  capacity: 20,
  price: '',
  isFree: true,
  image: '',
};

export default function NewEventPage() {
  const { isAuth, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>(DEFAULT);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function submit(draft: boolean) {
    if (!form.title || !form.date || !form.location) {
      toast.error('Fill in title, date and location.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.isFree ? 0 : Number(form.price) || 0,
        status: draft ? 'draft' : 'live',
      };
      const data = await api.post<{ event: { id: string } }>('/api/events', payload);
      toast.success(draft ? 'Saved as draft.' : 'Event published!');
      router.push(`/host/events/${data.event.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  // Preview card
  const Preview = () => (
    <div className="sticky top-28 border border-border rounded-2xl overflow-hidden bg-bg-secondary">
      <div className="h-48 bg-bg-dark flex items-center justify-center relative">
        {form.image ? (
          <img src={form.image} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <p className="font-mono text-xs text-white/30">Add an image URL</p>
        )}
        <div className="absolute bottom-3 left-3 bg-bg-primary/90 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
          <p className="font-display text-lg text-ink-primary">{form.date ? new Date(form.date).getDate() : '—'}</p>
          <p className="font-mono text-[9px] text-ink-muted uppercase">{form.date ? new Date(form.date).toLocaleString('en-IN', { month: 'short' }) : ''}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-1">{form.category}</p>
        <p className="font-display text-lg text-ink-primary mb-2 leading-snug">{form.title || 'Your event title'}</p>
        <p className="font-mono text-xs text-ink-muted mb-3">{form.time || '—'} · {form.location || 'Location'}</p>
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-ink-primary">{form.isFree ? 'Free' : `₹${form.price || 0}`}</span>
          <span className="font-mono text-xs text-ink-muted">{form.capacity} spots</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">[ NEW EVENT ]</p>
            <h1 className="font-display text-4xl text-ink-primary" style={{ letterSpacing: '-0.03em' }}>Create event.</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-10">
          {/* Form */}
          <div className="space-y-6">

            {/* Basic info */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Event details</p>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Sunday Run Club at Lodhi Garden"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Describe what attendees can expect…"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Date & Location */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Date & location</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Lodhi Garden, Gate 2, New Delhi"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted">Pricing & capacity</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => update('isFree', true)}
                  className={`px-5 py-2.5 rounded-full font-sans text-sm transition-colors ${form.isFree ? 'bg-ink-primary text-bg-primary' : 'border border-border text-ink-muted hover:text-ink-primary'}`}
                >
                  Free
                </button>
                <button
                  onClick={() => update('isFree', false)}
                  className={`px-5 py-2.5 rounded-full font-sans text-sm transition-colors ${!form.isFree ? 'bg-ink-primary text-bg-primary' : 'border border-border text-ink-muted hover:text-ink-primary'}`}
                >
                  Paid
                </button>
              </div>

              {!form.isFree && (
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Ticket price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => update('price', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="500"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-2">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => update('capacity', Number(e.target.value))}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Image */}
            <div className="border border-border rounded-2xl p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Cover image</p>
              <input
                type="url"
                value={form.image}
                onChange={(e) => update('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 font-sans text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => submit(false)}
                disabled={saving}
                className="flex-1 py-3.5 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-ink-primary transition-colors disabled:opacity-50"
              >
                {saving ? 'Publishing…' : 'Publish now'}
              </button>
              <button
                onClick={() => submit(true)}
                disabled={saving}
                className="px-6 py-3.5 border border-border text-ink-muted rounded-full font-sans text-sm hover:text-ink-primary transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="hidden md:block">
            <p className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-3">Live preview</p>
            <Preview />
          </div>
        </div>
      </div>
    </div>
  );
}
