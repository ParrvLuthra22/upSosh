'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import MagneticButton from '@/components/ui/MagneticButton';

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Goa',
  'Chandigarh',
];

export default function OnboardingStep3() {
  const router = useRouter();
  const { city: savedCity, update } = useOnboardingStore();
  const [query, setQuery] = useState(savedCity);
  const [selectedCity, setSelectedCity] = useState(savedCity);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canContinue = selectedCity.length > 0;

  const filtered = CITIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectCity(city: string) {
    setSelectedCity(city);
    setQuery(city);
    setShowDropdown(false);
  }

  function handleLocationClick() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(() => {
      selectCity('Current location');
    });
  }

  function handleContinue() {
    update({ city: selectedCity });
    router.push('/onboarding/step-4');
  }

  const lifted = focused || query.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="font-display text-5xl text-ink-primary leading-tight">
          Where do you call home?
        </h1>
        <p className="font-sans text-sm text-ink-muted">
          We'll surface events near you first.
        </p>
      </div>

      {/* City input */}
      <div className="space-y-3">
        <div className="relative" ref={dropdownRef}>
          <div
            className={`relative border-2 rounded-2xl transition-all duration-200 ${
              focused ? 'border-accent bg-bg-primary' : 'border-border bg-bg-secondary'
            }`}
          >
            <label
              className={`absolute left-4 pointer-events-none transition-all duration-200 font-sans text-ink-muted ${
                lifted ? 'top-2 text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm'
              }`}
            >
              Your city
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedCity('');
                setShowDropdown(true);
              }}
              onFocus={() => {
                setFocused(true);
                setShowDropdown(true);
              }}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent px-4 pt-6 pb-2 font-sans text-sm text-ink-primary outline-none rounded-2xl"
            />
          </div>

          <AnimatePresence>
            {showDropdown && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: EASE_VERCEL }}
                className="absolute z-50 top-full mt-2 left-0 right-0 bg-bg-primary border border-border rounded-2xl shadow-lg overflow-hidden"
              >
                {filtered.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onMouseDown={() => selectCity(city)}
                    className="w-full text-left px-4 py-3 font-sans text-sm text-ink-primary hover:bg-bg-secondary transition-colors duration-150"
                  >
                    {city}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Geolocation button */}
        <button
          type="button"
          onClick={handleLocationClick}
          className="flex items-center gap-1.5 font-mono text-xs text-accent hover:opacity-80 transition-opacity"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Use my current location
        </button>

        {/* Map placeholder */}
        <AnimatePresence>
          {selectedCity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 160, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_VERCEL }}
              className="overflow-hidden"
            >
              <div className="h-[160px] bg-bg-secondary border border-border rounded-2xl flex items-center justify-center">
                <span className="font-mono text-xs text-ink-muted">
                  Map preview · {selectedCity}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-primary/95 backdrop-blur border-t border-border px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push('/onboarding/step-2')}
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
