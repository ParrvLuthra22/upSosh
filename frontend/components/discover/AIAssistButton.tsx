'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

interface AIAssistButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SUGGESTIONS = [
  'Run club for 20 people this Sunday morning',
  'Intimate dinner in Delhi under ₹1500',
  'Design workshop this weekend',
  'Book circle in Bangalore',
];

export default function AIAssistButton({ isOpen, onToggle }: AIAssistButtonProps) {
  const [query, setQuery] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    setSent(true);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-8 right-8 z-50">
        <MagneticButton strength={12} radius={80}>
          <motion.button
            onClick={onToggle}
            aria-label={isOpen ? 'Close AI Planner' : 'Open AI Planner'}
            aria-expanded={isOpen}
            className="relative w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/30"
            animate={{ scale: isOpen ? 0.9 : 1 }}
            transition={{ duration: 0.2 }}
            data-cursor=""
          >
            {/* Pulse ring */}
            {!isOpen && (
              <motion.span
                className="absolute inset-0 rounded-full bg-accent/40"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.svg
                  key="close"
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="ai"
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .23 2.71-1.13 2.71H3.93c-1.36 0-2.13-1.71-1.13-2.71L4.2 15.3" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </MagneticButton>
        {!isOpen && (
          <motion.p
            className="absolute -top-8 right-0 font-mono text-[10px] text-ink-muted whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            AI Assist
          </motion.p>
        )}
      </div>

      {/* AI Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="ai-overlay"
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            <motion.div
              key="ai-sheet"
              className="fixed bottom-28 right-8 z-50 w-[340px] bg-bg-primary rounded-3xl border border-border shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.3, ease: EASE_VERCEL }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="font-mono text-[10px] text-accent">AI</span>
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-ink-primary">AI Planner</p>
                  <p className="font-mono text-[10px] text-ink-muted">Tell me what you're looking for</p>
                </div>
              </div>

              {/* Suggestions */}
              {!sent && (
                <div className="px-5 py-4 space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">Try asking…</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="w-full text-left font-sans text-sm text-ink-muted hover:text-ink-primary bg-bg-secondary hover:bg-border/50 rounded-xl px-4 py-2.5 transition-colors duration-150"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Response stub */}
              {sent && (
                <div className="px-5 py-5">
                  <div className="bg-bg-secondary rounded-2xl rounded-tl-none px-4 py-3 text-sm font-sans text-ink-primary leading-relaxed">
                    Great choice! Based on your preferences, I found <span className="font-medium text-accent">3 events</span> matching your request. Check the feed above — I've highlighted the best matches.
                  </div>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-3 font-mono text-xs text-ink-muted hover:text-ink-primary transition-colors"
                  >
                    ← Ask something else
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="px-4 pb-4 border-t border-border pt-3">
                <div className="flex items-center gap-2 bg-bg-secondary rounded-full px-4 py-2.5 border border-border focus-within:border-ink-primary transition-colors">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="What kind of event…"
                    aria-label="Describe the event you're looking for"
                    className="flex-1 bg-transparent font-sans text-sm text-ink-primary placeholder:text-ink-light focus:outline-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!query.trim()}
                    aria-label="Send"
                    className="w-7 h-7 rounded-full bg-accent disabled:bg-border flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <svg aria-hidden="true" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
