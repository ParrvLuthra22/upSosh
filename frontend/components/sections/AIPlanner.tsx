'use client';

import { motion } from 'framer-motion';
import { EASE_VERCEL, fadeInUp, staggerContainer } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';
import TextReveal from '@/components/ui/TextReveal';

const SUGGESTIONS = [
  { label: 'Hyde Park Morning Run', time: '6AM · 8 spots', icon: '◎' },
  { label: 'Shoreditch Speed Run', time: '7AM · 12 spots', icon: '◎' },
  { label: 'Victoria Park Tempo', time: '7:30AM · 4 spots', icon: '◎' },
];

function PlannerMockup() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-8 bg-accent/10 rounded-[40px] blur-3xl pointer-events-none" />

      <div className="relative bg-bg-primary rounded-3xl border border-border shadow-2xl w-full max-w-sm mx-auto overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
          </div>
          <span className="font-mono text-xs text-ink-muted mx-auto">UpSosh AI Planner</span>
        </div>

        {/* Chat */}
        <div className="p-5 space-y-4 min-h-[320px]">
          {/* AI message */}
          <div className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs flex items-center justify-center font-mono flex-shrink-0">
              AI
            </span>
            <div className="bg-bg-secondary rounded-2xl rounded-tl-none px-4 py-3 text-sm font-sans text-ink-primary leading-relaxed max-w-[220px]">
              What kind of event are you planning? Tell me about your vibe.
            </div>
          </div>

          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-ink-primary rounded-2xl rounded-tr-none px-4 py-3 text-sm font-sans text-bg-primary leading-relaxed max-w-[220px]">
              Plan a run club for 25 people this Saturday morning
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-3">
            <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs flex items-center justify-center font-mono flex-shrink-0">
              AI
            </span>
            <div className="space-y-2 flex-1">
              <div className="bg-bg-secondary rounded-2xl rounded-tl-none px-4 py-3 text-sm font-sans text-ink-primary leading-relaxed">
                Perfect — 3 options near you:
              </div>
              {SUGGESTIONS.map((s) => (
                <div
                  key={s.label}
                  className="bg-bg-secondary rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-border hover:border-accent/30 transition-colors cursor-default group"
                >
                  <span className="text-accent font-mono text-sm">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-medium text-ink-primary truncate">{s.label}</p>
                    <p className="font-mono text-[10px] text-ink-muted">{s.time}</p>
                  </div>
                  <span className="font-mono text-[10px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Book →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="px-4 pb-4">
          <div className="bg-bg-secondary rounded-full px-4 py-3 flex items-center gap-3 border border-border">
            <span className="font-sans text-sm text-ink-light flex-1">Ask the planner…</span>
            <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6h10M6 1l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIPlanner() {
  return (
    <section className="bg-bg-secondary border-t border-border py-24 md:py-32 px-6 md:px-16 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        {/* Text side */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-6"
          >
            [ 03 — THE DIFFERENCE ]
          </motion.p>

          <motion.h2
            variants={fadeInUp}
            className="font-display text-display-md text-ink-primary leading-[1.1] tracking-tight mb-6"
          >
            Plan like you've done this a hundred times.
            <span className="italic text-ink-muted"> Even if it's your first.</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="font-sans text-base text-ink-muted leading-relaxed mb-10 max-w-md">
            The UpSosh AI Planner learns your vibe, budget, and guest count — then surfaces the right events, venues, and timings in seconds. No spreadsheets. No endless group chats.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <MagneticButton>
              <a
                href="/planner"
                data-cursor="TRY"
                className="font-sans text-sm font-medium text-ink-primary border border-ink-primary px-6 py-3 rounded-full hover:bg-ink-primary hover:text-bg-primary transition-colors duration-300 inline-block"
              >
                Try the Planner →
              </a>
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Mockup side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.9, ease: EASE_VERCEL }}
        >
          <PlannerMockup />
        </motion.div>
      </div>
    </section>
  );
}
