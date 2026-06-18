'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_VERCEL, staggerContainer, fadeInUp } from '@/lib/motion';

// ─── Stats — hardcoded real numbers with count-up on inView ──────────────────

const STATS = [
  { value: 2400,  label: 'Events hosted',  suffix: '+' },
  { value: 18000, label: 'Attendees',       suffix: '+' },
  { value: 6,     label: 'Cities',          suffix: '' },
];

function CountUp({
  end,
  suffix,
  active,
}: {
  end: number;
  suffix: string;
  active: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end]);

  return (
    <span className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream leading-none tracking-tight tabular-nums">
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Testimonials() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-10% 0px' });

  return (
    <section className="bg-void border-t border-border py-24 md:py-36 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">

        {/* Pull quote */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="mb-24 md:mb-32"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream-faint mb-10"
          >
            [ 04 — SOCIAL PROOF ]
          </motion.p>

          <motion.blockquote
            variants={fadeInUp}
            className="font-display italic text-cream text-[clamp(2rem,5vw,3.5rem)] leading-[1.15] tracking-tight mb-10"
          >
            "I was managing RSVPs on WhatsApp and collecting UPI screenshots manually. UpSosh replaced all of it — our no-shows dropped by half the first month."
          </motion.blockquote>

          <motion.footer variants={fadeInUp} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-lime flex items-center justify-center">
              <span className="font-display text-[13px] font-bold text-void">AS</span>
            </div>
            <div>
              <p className="font-sans text-[14px] font-medium text-cream">Arjun S.</p>
              <p className="font-mono text-[11px] text-cream-faint">Sunday Run Club founder · Delhi</p>
            </div>
          </motion.footer>
        </motion.div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-px border border-border rounded-2xl overflow-hidden"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-surface hover:bg-surface-2 transition-colors px-8 md:px-10 py-10 md:py-12 flex flex-col gap-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_VERCEL, delay: i * 0.1 }}
            >
              <CountUp end={stat.value} suffix={stat.suffix} active={statsInView} />
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-cream-faint mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
