'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'upsosh_intro_seen';

export default function IntroScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show once per browser session
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);

    // Auto-dismiss after 2.2 s
    const t = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(false);
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-void overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        >
          {/* Noise grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'url(/noise.svg)',
              backgroundRepeat: 'repeat',
              opacity: 0.035,
            }}
          />

          {/* Lime radial glow behind the wordmark */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 360,
              height: 360,
              background: 'radial-gradient(circle, rgba(212,255,63,0.18) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Wordmark */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <p
              style={{
                fontFamily: 'var(--font-fraunces, Georgia, serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(40px, 8vw, 72px)',
                fontWeight: 400,
                color: '#F4F1EA',
                letterSpacing: '-0.04em',
                lineHeight: 1,
              }}
            >
              upSosh
            </p>

            {/* Animated underline */}
            <motion.div
              style={{ height: 2, backgroundColor: '#D4FF3F', borderRadius: 999 }}
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            />

            {/* Tagline */}
            <motion.p
              style={{
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: 11,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(244,241,234,0.35)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.85 }}
            >
              Show up. Connect. Repeat.
            </motion.p>
          </motion.div>

          {/* Corner dot accents */}
          {[
            { top: 32, left: 40 },
            { top: 32, right: 40 },
            { bottom: 32, left: 40 },
            { bottom: 32, right: 40 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-lime/40"
              style={pos as any}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
