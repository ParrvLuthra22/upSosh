'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

// Module-level reference so any component can call getLenis()
// without needing React context.
let _lenis: Lenis | null = null;

/** Returns the active Lenis instance, or null before it mounts. */
export function getLenis(): Lenis | null {
  return _lenis;
}

/**
 * Scroll to y=0 using Lenis (respects its virtual scroll position).
 * Falls back to window.scrollTo when Lenis isn't ready.
 */
export function scrollToTop(): void {
  if (_lenis) {
    _lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    _lenis = lenis; // expose globally

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  return <>{children}</>;
}
