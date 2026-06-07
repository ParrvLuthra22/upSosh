'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import NavigationProgress from '@/components/NavigationProgress';
import { scrollToTop } from '@/components/ui/SmoothScroll';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Template({ children }: { children: React.ReactNode }) {
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {children}
      </motion.div>
    </>
  );
}
