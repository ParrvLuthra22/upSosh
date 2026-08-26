'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

const CATEGORIES = [
  'Run Clubs',
  'Creator Meetups',
  'Workshops',
  'Dinner Clubs',
  'Book Clubs',
  'Yoga & Wellness',
  'Live Music',
  'Art & Culture',
  'Tech & Startups',
  'Photography',
  'Food & Drink',
  'Networking',
];

const EXPERIENCE_OPTIONS = [
  'First time hosting',
  'Hosted a few events',
  'Experienced (10+ events)',
];

export default function HostProfilePage() {
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [expOpen, setExpOpen] = useState(false);

  const canContinue = bio.length >= 50 && selectedCategories.length >= 1;

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleContinue() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hv-bio', bio);
      sessionStorage.setItem('hv-experience', experience);
      sessionStorage.setItem('hv-categories', JSON.stringify(selectedCategories));
      sessionStorage.setItem('hv-instagram', instagram);
      sessionStorage.setItem('hv-linkedin', linkedin);
      sessionStorage.setItem('hv-website', website);
    }
    router.push('/onboarding/host-verification/sample-event');
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-cream leading-tight">
          Tell us about your hosting.
        </h1>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-dim">
          Bio
        </label>
        <div
          className={`relative border-2 rounded-2xl transition-all duration-200 ${
            bio.length > 0 ? 'border-lime bg-void' : 'border-border bg-surface'
          }`}
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={5}
            placeholder="I host weekly run clubs at Lodhi Garden, focused on building a no-pressure running community for beginners..."
            className="w-full bg-transparent p-5 font-sans text-sm text-cream outline-none rounded-2xl resize-none placeholder:font-display placeholder:italic placeholder:text-cream-dim/60"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
          <span className="absolute bottom-3 right-4 font-mono text-[10px] text-cream-dim">
            {bio.length}/500
          </span>
        </div>
        {bio.length > 0 && bio.length < 50 && (
          <p className="font-mono text-[10px] text-cream-dim">
            {50 - bio.length} more characters needed
          </p>
        )}
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-dim">
          Hosting experience
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setExpOpen((v) => !v)}
            className={`w-full flex items-center justify-between border-2 rounded-2xl px-4 py-3.5 font-sans text-sm transition-all duration-200 ${
              expOpen ? 'border-lime bg-void' : 'border-border bg-surface'
            } ${experience ? 'text-cream' : 'text-cream-dim'}`}
          >
            {experience || 'Select your experience level'}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-200 ${expOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {expOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-void border border-border rounded-2xl shadow-lg overflow-hidden">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setExperience(opt);
                    setExpOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 font-sans text-sm text-cream hover:bg-surface transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-dim">
          What you'll host
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const sel = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`border rounded-2xl px-3 py-2.5 font-sans text-sm text-left flex items-center gap-2 transition-all duration-200 ${
                  sel
                    ? 'border-lime bg-lime/[0.08] text-cream'
                    : 'border-border bg-void text-cream-dim hover:bg-surface'
                }`}
              >
                {sel && <span className="text-lime text-xs">✓</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-dim">
            Social links
          </label>
          <span className="font-mono text-[9px] bg-surface border border-border rounded-full px-2 py-0.5 text-cream-dim">
            Optional
          </span>
        </div>

        {/* Instagram */}
        <div className="flex items-center border border-border rounded-xl px-4 py-3 gap-3 bg-surface focus-within:border-lime focus-within:bg-void transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cream-dim flex-shrink-0">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="instagram.com/yourusername"
            className="flex-1 bg-transparent font-sans text-sm text-cream outline-none placeholder:text-cream-dim/60"
          />
        </div>

        {/* LinkedIn */}
        <div className="flex items-center border border-border rounded-xl px-4 py-3 gap-3 bg-surface focus-within:border-lime focus-within:bg-void transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cream-dim flex-shrink-0">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="linkedin.com/in/yourusername"
            className="flex-1 bg-transparent font-sans text-sm text-cream outline-none placeholder:text-cream-dim/60"
          />
        </div>

        {/* Website */}
        <div className="flex items-center border border-border rounded-xl px-4 py-3 gap-3 bg-surface focus-within:border-lime focus-within:bg-void transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cream-dim flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="yourwebsite.com"
            className="flex-1 bg-transparent font-sans text-sm text-cream outline-none placeholder:text-cream-dim/60"
          />
        </div>
      </div>

      {/* Continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-void/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/host-verification/identity')}
          className="font-mono text-sm text-cream-dim hover:text-cream transition-colors"
        >
          ← Back
        </button>
        <MagneticButton>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="bg-cream text-void font-sans text-sm font-medium px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lime transition-colors duration-300"
          >
            Continue
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
