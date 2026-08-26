'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useAuth } from '@/store/authStore';
import { api, getApiUrl } from '@/lib/api';
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

import { withAuth } from '@/components/ProtectedRoute';
function NewEventPage() {
  const { isAuth, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      update('image', data.url);
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err.message ?? 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

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
      // createEventSchema requires `type` and `venue` — this form only ever
      // collected `category` and `location`, so every submission 400'd
      // before reaching Prisma. `type` reuses the selected category (this
      // form has no separate formal/informal axis to offer).
      const { location, ...rest } = form;
      const payload = {
        ...rest,
        type: form.category,
        venue: location,
        price: form.isFree ? 0 : Number(form.price) || 0,
        status: draft ? 'draft' : 'live',
      };
      // POST /api/events returns the created event directly, not wrapped in
      // { event }. Previously this always threw here (data.event was
      // undefined) and showed "Failed to create event" even though the
      // event had just been created successfully.
      const event = await api.post<{ id: string }>('/api/events', payload);
      toast.success(draft ? 'Saved as draft.' : 'Event published!');
      router.push(`/host/events/${event.id}`);
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  // Preview card
  const Preview = () => (
    <div className="sticky top-28 border border-border rounded-2xl overflow-hidden bg-surface">
      <div className="h-48 bg-void flex items-center justify-center relative">
        {form.image ? (
          <Image src={form.image} alt="preview" fill unoptimized sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
        ) : (
          <p className="font-mono text-xs text-white/30">Add an image URL</p>
        )}
        <div className="absolute bottom-3 left-3 bg-void/90 rounded-lg px-2.5 py-1 text-center min-w-[44px]">
          <p className="font-display text-lg text-cream">{form.date ? new Date(form.date).getDate() : '—'}</p>
          <p className="font-mono text-[9px] text-cream-dim uppercase">{form.date ? new Date(form.date).toLocaleString('en-IN', { month: 'short' }) : ''}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="font-mono text-[10px] text-lime uppercase tracking-widest mb-1">{form.category}</p>
        <p className="font-display text-lg text-cream mb-2 leading-snug">{form.title || 'Your event title'}</p>
        <p className="font-mono text-xs text-cream-dim mb-3">{form.time || '—'} · {form.location || 'Location'}</p>
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-cream">{form.isFree ? 'Free' : `₹${form.price || 0}`}</span>
          <span className="font-mono text-xs text-cream-dim">{form.capacity} spots</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">[ NEW EVENT ]</p>
            <h1 className="font-display text-4xl text-cream" style={{ letterSpacing: '-0.03em' }}>Create event.</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_300px] gap-10">
          {/* Form */}
          <div className="space-y-6">

            {/* Basic info */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim">Event details</p>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Sunday Run Club at Lodhi Garden"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Describe what attendees can expect…"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Date & Location */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim">Date & location</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => update('date', e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => update('time', e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Lodhi Garden, Gate 2, New Delhi"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border border-border rounded-2xl p-6 space-y-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim">Pricing & capacity</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => update('isFree', true)}
                  className={`px-5 py-2.5 rounded-full font-sans text-sm transition-colors ${form.isFree ? 'bg-cream text-void' : 'border border-border text-cream-dim hover:text-cream'}`}
                >
                  Free
                </button>
                <button
                  onClick={() => update('isFree', false)}
                  className={`px-5 py-2.5 rounded-full font-sans text-sm transition-colors ${!form.isFree ? 'bg-cream text-void' : 'border border-border text-cream-dim hover:text-cream'}`}
                >
                  Paid
                </button>
              </div>

              {!form.isFree && (
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Ticket price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => update('price', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="500"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-2">Capacity</label>
                <input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => update('capacity', Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
                />
              </div>
            </div>

            {/* Image */}
            <div className="border border-border rounded-2xl p-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-4">Cover image</p>

              {/* Upload area */}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="relative w-full h-36 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-lime/50 hover:bg-lime/3 transition-colors mb-3"
              >
                {form.image ? (
                  <Image src={form.image} alt="preview" fill unoptimized sizes="(min-width: 768px) 400px, 100vw" className="object-cover rounded-xl" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-cream-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-mono text-xs text-cream-dim">
                      {uploadingImage ? 'Uploading…' : 'Click to upload image'}
                    </p>
                    <p className="font-mono text-[10px] text-cream-faint">JPG, PNG, WebP — max 10MB</p>
                  </>
                )}
              </button>

              {/* Or paste URL */}
              <p className="font-mono text-[10px] text-cream-dim mb-2 text-center">or paste an image URL</p>
              <input
                type="url"
                value={form.image}
                onChange={(e) => update('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 font-sans text-sm text-cream focus:outline-none focus:border-lime transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => submit(false)}
                disabled={saving}
                className="flex-1 py-3.5 bg-lime text-white rounded-full font-sans text-sm font-medium hover:bg-cream transition-colors disabled:opacity-50"
              >
                {saving ? 'Publishing…' : 'Publish now'}
              </button>
              <button
                onClick={() => submit(true)}
                disabled={saving}
                className="px-6 py-3.5 border border-border text-cream-dim rounded-full font-sans text-sm hover:text-cream transition-colors disabled:opacity-50"
              >
                Save draft
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="hidden md:block">
            <p className="font-mono text-[11px] uppercase tracking-widest text-cream-dim mb-3">Live preview</p>
            <Preview />
          </div>
        </div>
      </div>
    </div>
  );
}
export default withAuth(NewEventPage);
