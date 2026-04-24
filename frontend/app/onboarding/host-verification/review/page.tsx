'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import MagneticButton from '@/components/ui/MagneticButton';
import { toast } from 'sonner';

interface StoredData {
  idPreview: string;
  selfiePreview: string;
  bio: string;
  experience: string;
  categories: string[];
  eventTitle: string;
  eventCategory: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventCapacity: string;
  eventTicketType: string;
  eventPrice: string;
  idUrl: string;
  selfieUrl: string;
}

function SectionHeader({
  title,
  editHref,
}: {
  title: string;
  editHref: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">{title}</p>
      <Link
        href={editHref}
        className="font-mono text-[11px] text-accent hover:opacity-80 transition-opacity"
      >
        Edit
      </Link>
    </div>
  );
}

export default function ReviewPage() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<StoredData>({
    idPreview: '',
    selfiePreview: '',
    bio: '',
    experience: '',
    categories: [],
    eventTitle: '',
    eventCategory: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventCapacity: '10',
    eventTicketType: 'free',
    eventPrice: '',
    idUrl: '',
    selfieUrl: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setData({
        idPreview: sessionStorage.getItem('hv-id-preview') ?? '',
        selfiePreview: sessionStorage.getItem('hv-selfie-preview') ?? '',
        bio: sessionStorage.getItem('hv-bio') ?? '',
        experience: sessionStorage.getItem('hv-experience') ?? '',
        categories: JSON.parse(sessionStorage.getItem('hv-categories') ?? '[]'),
        eventTitle: sessionStorage.getItem('hv-event-title') ?? '',
        eventCategory: sessionStorage.getItem('hv-event-category') ?? '',
        eventDate: sessionStorage.getItem('hv-event-date') ?? '',
        eventTime: sessionStorage.getItem('hv-event-time') ?? '',
        eventLocation: sessionStorage.getItem('hv-event-location') ?? '',
        eventCapacity: sessionStorage.getItem('hv-event-capacity') ?? '10',
        eventTicketType: sessionStorage.getItem('hv-event-ticket-type') ?? 'free',
        eventPrice: sessionStorage.getItem('hv-event-price') ?? '',
        idUrl: sessionStorage.getItem('hv-id-url') ?? '',
        selfieUrl: sessionStorage.getItem('hv-selfie-url') ?? '',
      });
    }
  }, []);

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      await fetch('/api/hosts/apply', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          identity: { idUrl: data.idUrl, selfieUrl: data.selfieUrl },
          profile: {
            bio: data.bio,
            experience: data.experience,
            categories: data.categories,
          },
          sampleEvent: {
            title: data.eventTitle,
            category: data.eventCategory,
            date: data.eventDate,
            time: data.eventTime,
            location: data.eventLocation,
            capacity: parseInt(data.eventCapacity),
            ticketType: data.eventTicketType,
            price: data.eventPrice,
          },
          onboardingData: {
            name: store.name,
            city: store.city,
            interests: store.interests,
          },
        }),
      });
      router.push('/host/pending');
    } catch {
      // If API unavailable, still navigate
      router.push('/host/pending');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Review and submit.
        </h1>
      </div>

      {/* Identity section */}
      <div className="border border-border rounded-2xl p-5">
        <SectionHeader title="Identity" editHref="/onboarding/host-verification/identity" />
        <div className="flex gap-4">
          {data.idPreview ? (
            <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
              <img src={data.idPreview} alt="Government ID" className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-verified flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-[60px] h-[60px] rounded-xl bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[8px] text-ink-muted text-center">No ID</span>
            </div>
          )}
          {data.selfiePreview ? (
            <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
              <img src={data.selfiePreview} alt="Selfie with ID" className="w-full h-full object-cover" />
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-verified flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="w-[60px] h-[60px] rounded-xl bg-bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[8px] text-ink-muted text-center">No selfie</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile section */}
      <div className="border border-border rounded-2xl p-5">
        <SectionHeader title="Profile" editHref="/onboarding/host-verification/profile" />
        <div className="space-y-3">
          {data.bio && (
            <p className="font-sans text-sm text-ink-muted leading-relaxed">
              {data.bio.slice(0, 120)}{data.bio.length > 120 ? '...' : ''}
            </p>
          )}
          {data.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => (
                <span
                  key={cat}
                  className="font-mono text-[10px] border border-border rounded-full px-2 py-0.5 text-ink-muted"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sample event section */}
      <div className="border border-border rounded-2xl p-5">
        <SectionHeader title="Sample Event" editHref="/onboarding/host-verification/sample-event" />
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-bg-secondary h-[80px] flex items-center justify-center">
            <span className="font-mono text-xs text-ink-muted">Event image</span>
          </div>
          <div className="p-4 space-y-1.5">
            <p className="font-display text-lg text-ink-primary">
              {data.eventTitle || 'Untitled event'}
            </p>
            <div>
              {data.eventDate && (
                <p className="font-mono text-xs text-ink-muted">
                  {data.eventDate} {data.eventTime && `· ${data.eventTime}`}
                </p>
              )}
              {data.eventLocation && (
                <p className="font-mono text-xs text-ink-muted">{data.eventLocation}</p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-1">
              {data.eventCategory && (
                <span className="font-mono text-[10px] border border-border rounded-full px-2 py-0.5 text-ink-muted">
                  {data.eventCategory}
                </span>
              )}
              <span
                className={`font-mono text-[10px] rounded-full px-2 py-0.5 ${
                  data.eventTicketType === 'free'
                    ? 'bg-verified/10 text-verified'
                    : 'bg-accent/10 text-accent'
                }`}
              >
                {data.eventTicketType === 'free' ? 'Free' : data.eventPrice ? `₹${data.eventPrice}` : 'Paid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust note */}
      <div className="bg-bg-secondary border border-border rounded-2xl p-5 flex gap-3 items-start">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-muted flex-shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="font-sans text-sm text-ink-muted">
          Verification typically takes 24–48 hours. We'll email you once approved.
        </p>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/host-verification/sample-event')}
          className="font-mono text-sm text-ink-muted hover:text-ink-primary transition-colors"
        >
          ← Back
        </button>
        <MagneticButton>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-ink-primary text-bg-primary font-sans text-sm font-medium px-8 py-3.5 rounded-full disabled:opacity-60 hover:bg-accent transition-colors duration-300 flex items-center gap-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit for verification →'
            )}
          </button>
        </MagneticButton>
      </div>
    </div>
  );
}
