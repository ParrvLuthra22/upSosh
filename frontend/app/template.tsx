'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import NavigationProgress from '@/components/NavigationProgress';
import { scrollToTop } from '@/components/ui/SmoothScroll';
import { duration, ease, useReducedMotion } from '@/lib/motion';

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  // Scroll to top on every route change.
  // Uses Lenis's scrollTo so the virtual scroll position resets correctly.
  // template.tsx re-mounts on every navigation — ideal place for this.
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <NavigationProgress />
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? duration.instant : duration.base, ease: ease.out }}
      >
        {children}
      </motion.div>
    </>
  );
}
