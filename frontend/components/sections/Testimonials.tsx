'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_VERCEL, staggerContainer, fadeInUp } from '@/lib/motion';

const STATS = [
  { value: 4200, label: 'Events hosted', suffix: '+' },
  { value: 38000, label: 'Attendees', suffix: '+' },
  { value: 24, label: 'Cities', suffix: '' },
];

function CountUp({ end, suffix, active }: { end: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, end]);

  return (
    <span className="font-display text-display-xl text-white leading-none tracking-tight tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Testimonials() {
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-10% 0px' });

  return (
    <section className="bg-bg-dark border-t border-white/5 py-24 md:py-36 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        {/* Quote */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px' }}
          className="mb-24 md:mb-32"
        >
          <motion.p
            variants={fadeInUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 mb-10"
          >
            [ 04 — SOCIAL PROOF ]
          </motion.p>

          <motion.blockquote
            variants={fadeInUp}
            className="font-display italic text-white text-[clamp(2rem,5vw,3.5rem)] leading-[1.15] tracking-tight mb-10"
          >
            "I used to dread social events. Now I host a run club every Saturday morning and I know half the city."
          </motion.blockquote>

          <motion.footer variants={fadeInUp} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
              <span className="font-mono text-xs text-accent">JK</span>
            </div>
            <div>
              <p className="font-mono text-sm text-white">James K.</p>
              <p className="font-mono text-xs text-white/40">Hyde Park Run Club founder · London</p>
            </div>
          </motion.footer>
        </motion.div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-px border border-white/10 rounded-2xl overflow-hidden"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-white/5 hover:bg-white/[0.07] transition-colors px-8 md:px-10 py-10 md:py-12 flex flex-col gap-2"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE_VERCEL, delay: i * 0.1 }}
            >
              <CountUp end={stat.value} suffix={stat.suffix} active={statsInView} />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/40 mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
