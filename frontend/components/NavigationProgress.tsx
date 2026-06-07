'use client';

/**
 * components/NavigationProgress.tsx
 * ───────────────────────────────────
 * Thin lime top bar that fills on every client-side route change.
 *
 * How it works:
 *  - `usePathname()` returns the current route string.
 *  - A `useEffect` fires whenever the pathname changes.
 *  - We call `NProgress.start()` on the *previous* render (via a ref that
 *    tracks the last-seen pathname) and `NProgress.done()` once the new
 *    pathname has mounted — i.e. the page is ready.
 *
 * This component is rendered once inside app/template.tsx so it runs on
 * every navigation automatically.
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress once at module load time.
// showSpinner: false — we only want the bar, not the spinner circle.
// speed / minimum: tune the feel to match the 250ms page transition.
NProgress.configure({
  showSpinner: false,
  speed: 250,
  minimum: 0.08,
  easing: 'ease',
  trickleSpeed: 200,
});

export default function NavigationProgress() {
  const pathname = usePathname();
  // Store the pathname we last *started* progress for so we don't double-fire.
  const lastPathname = useRef<string>(pathname);
  // Track whether progress is currently in flight.
  const inFlight = useRef(false);

  useEffect(() => {
    if (pathname !== lastPathname.current) {
      // A new pathname just mounted — navigation is complete.
      NProgress.done();
      inFlight.current = false;
      lastPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    /**
     * `<Link>` clicks fire a popstate / pushState before the template
     * re-renders. We intercept clicks on anchor elements that look like
     * internal navigations and call NProgress.start() immediately so the
     * bar appears with zero delay.
     */
    function handleAnchorClick(e: MouseEvent) {
      const target = (e.target as Element).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore: external, hash-only, mailto, tel, download, or same page.
      const isSamePage = href === pathname || href === window.location.pathname;
      const isExternal = href.startsWith('http') || href.startsWith('//');
      const isSpecial = href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:');
      const hasDownload = target.hasAttribute('download');
      const opensNewTab = target.target === '_blank';

      if (isSamePage || isExternal || isSpecial || hasDownload || opensNewTab) return;

      if (!inFlight.current) {
        NProgress.start();
        inFlight.current = true;
      }
    }

    // Also handle browser back/forward.
    function handlePopState() {
      if (!inFlight.current) {
        NProgress.start();
        inFlight.current = true;
      }
    }

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  // This component renders nothing — it only wires up side effects.
  return null;
}
