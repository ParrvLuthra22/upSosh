'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import MagneticButton from '@/components/ui/MagneticButton';

function FloatingInput({
  label,
  error,
  maxLength,
  showCounter,
  textarea,
  ...props
}: {
  label: string;
  error?: string;
  maxLength?: number;
  showCounter?: boolean;
  textarea?: boolean;
} & (React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>)) {
  const [focused, setFocused] = useState(false);
  const [valueLen, setValueLen] = useState(0);
  const hasValue = valueLen > 0;
  const lifted = focused || hasValue;

  const sharedProps = {
    className: `w-full bg-transparent px-4 pt-6 pb-2 font-sans text-sm text-ink-primary outline-none rounded-2xl resize-none`,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValueLen(e.target.value.length);
      if (props.onChange) (props.onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void)(e);
    },
    maxLength,
    ...(props as object),
  };

  return (
    <div className="relative">
      <div
        className={`relative border-2 rounded-2xl transition-all duration-200 ${
          error ? 'border-red-500' : focused ? 'border-accent' : 'border-border'
        } ${focused ? 'bg-bg-primary' : 'bg-bg-secondary'}`}
      >
        <label
          className={`absolute left-4 pointer-events-none transition-all duration-200 font-sans text-ink-muted ${
            lifted ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        >
          {label}
        </label>
        {textarea ? (
          <textarea rows={3} {...(sharedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
        ) : (
          <input {...(sharedProps as React.InputHTMLAttributes<HTMLInputElement>)} />
        )}
        {showCounter && maxLength && (
          <span className="absolute bottom-2 right-4 font-mono text-[10px] text-ink-muted">
            {valueLen}/{maxLength}
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 font-mono text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}

export default function OnboardingStep1() {
  const router = useRouter();
  const { name, photoUrl, bio, update } = useOnboardingStore();
  const [localName, setLocalName] = useState(name);
  const [localBio, setLocalBio] = useState(bio);
  const [localPhoto, setLocalPhoto] = useState(photoUrl);
  const [photoPreview, setPhotoPreview] = useState(photoUrl);
  const [photoHovered, setPhotoHovered] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canContinue = localName.trim().length >= 2;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    // Try to upload; fall back to objectURL
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        setLocalPhoto(url);
      } else {
        setLocalPhoto(objectUrl);
      }
    } catch {
      setLocalPhoto(objectUrl);
    }
  }

  function handleContinue() {
    update({ name: localName, bio: localBio, photoUrl: localPhoto });
    router.push('/onboarding/step-2');
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Let's start with you.
        </h1>
        <p className="font-sans text-sm text-ink-muted">
          This is how others will see you on UpSosh.
        </p>
      </div>

      {/* Photo upload */}
      <div className="flex justify-center">
        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload profile photo"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setPhotoHovered(true)}
            onMouseLeave={() => setPhotoHovered(false)}
            className="relative w-[120px] h-[120px] rounded-full overflow-hidden transition-all duration-200"
          >
            {photoPreview ? (
              <>
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                {photoHovered && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-white">Change</span>
                  </div>
                )}
              </>
            ) : (
              <div
                className={`w-full h-full rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors duration-200 ${
                  photoHovered ? 'border-accent bg-accent/5' : 'border-border bg-bg-secondary'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span className="font-mono text-[9px] text-ink-muted">Add photo</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Your name"
            value={localName}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalName(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4, ease: EASE_VERCEL }}
        >
          <FloatingInput
            label="Bio (optional)"
            textarea
            maxLength={140}
            showCounter
            value={localBio}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLocalBio(e.target.value)}
          />
        </motion.div>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <div />
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
