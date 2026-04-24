'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MagneticButton from '@/components/ui/MagneticButton';

interface UploadZoneProps {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  preview: string;
  onFile: (file: File) => void;
}

function UploadZone({ label, sublabel, icon, preview, onFile }: UploadZoneProps) {
  const [hovered, setHovered] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="flex-1">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-label={label}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative w-full h-[180px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
          hovered ? 'border-accent bg-accent/5' : 'border-border bg-bg-secondary'
        }`}
      >
        {preview ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            {/* Checkmark overlay */}
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-verified flex items-center justify-center">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {hovered && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="font-mono text-xs text-white">Replace</span>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="text-ink-muted">{icon}</div>
            <div className="text-center">
              <p className="font-sans text-sm text-ink-primary font-medium">{label}</p>
              <p className="font-mono text-[11px] text-ink-muted mt-0.5">{sublabel}</p>
            </div>
          </>
        )}
      </button>
    </div>
  );
}

export default function IdentityPage() {
  const router = useRouter();
  const [idPreview, setIdPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [idUrl, setIdUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canContinue = idUrl !== '' && selfieUrl !== '';

  async function uploadFile(file: File): Promise<string> {
    const objectUrl = URL.createObjectURL(file);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        return url;
      }
    } catch {}
    return objectUrl;
  }

  async function handleIdFile(file: File) {
    const preview = URL.createObjectURL(file);
    setIdPreview(preview);
    const url = await uploadFile(file);
    setIdUrl(url);
  }

  async function handleSelfieFile(file: File) {
    const preview = URL.createObjectURL(file);
    setSelfiePreview(preview);
    const url = await uploadFile(file);
    setSelfieUrl(url);
  }

  function handleContinue() {
    // Store URLs in sessionStorage for the review page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hv-id-url', idUrl);
      sessionStorage.setItem('hv-selfie-url', selfieUrl);
      sessionStorage.setItem('hv-id-preview', idPreview);
      sessionStorage.setItem('hv-selfie-preview', selfiePreview);
    }
    router.push('/onboarding/host-verification/profile');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Verify your identity.
        </h1>
        <p className="font-sans text-sm text-ink-muted">
          Required by Indian regulations and helps attendees trust your events.
        </p>
      </div>

      {/* Upload zones */}
      <div className="flex flex-col md:flex-row gap-4">
        <UploadZone
          label="Government ID"
          sublabel="Aadhaar · PAN · Passport"
          preview={idPreview}
          onFile={handleIdFile}
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <circle cx="8" cy="12" r="2" />
              <path d="M14 10h4M14 14h4" />
            </svg>
          }
        />
        <UploadZone
          label="Selfie with ID"
          sublabel="Hold your ID next to your face"
          preview={selfiePreview}
          onFile={handleSelfieFile}
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      {/* Privacy note */}
      <p className="font-mono text-[10px] text-ink-light">
        Your documents are encrypted and never shared publicly.
      </p>

      {/* Continue */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/step-5')}
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
