'use client';

import { motion } from 'framer-motion';
import { EASE_VERCEL, staggerContainer, fadeInUp } from '@/lib/motion';
import MagneticButton from '@/components/ui/MagneticButton';

const FOOTER_COLS = [
  {
    heading: 'Product',
    links: ['Discover Events', 'Host an Event', 'AI Planner', 'Mobile App (Soon)'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press'],
  },
  {
    heading: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
  },
  {
    heading: 'Socials',
    links: ['Instagram', 'Twitter / X', 'LinkedIn', 'TikTok'],
  },
];

export default function CTAFooterSection() {
  return (
    <section className="bg-bg-primary border-t border-border">
      {/* CTA block */}
      <div className="px-6 md:px-16 pt-24 md:pt-36 pb-24 flex flex-col items-start">
        <motion.p
          className="font-mono text-xs uppercase tracking-[0.2em] text-ink-muted mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          [ 05 — GET STARTED ]
        </motion.p>

        <motion.h2
          className="font-display text-display-xl text-ink-primary leading-[0.95] tracking-[-0.03em] mb-12 max-w-3xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_VERCEL, delay: 0.1 }}
        >
          Your next event
          <br />
          <span className="italic text-ink-muted">is waiting.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          <MagneticButton strength={10}>
            <a
              href="/signup"
              data-cursor="JOIN"
              className="font-sans text-base font-medium bg-accent text-white px-8 py-4 rounded-full hover:bg-ink-primary transition-colors duration-300 inline-block"
            >
              Join UpSosh
            </a>
          </MagneticButton>
          <span className="font-mono text-xs text-ink-light tracking-wide">
            Free to join · No credit card required
          </span>
        </motion.div>
      </div>

      {/* Footer columns */}
      <div className="border-t border-border px-6 md:px-16 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-sans text-sm text-ink-muted hover:text-ink-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-border">
          <span className="font-mono text-xs tracking-widest text-ink-primary uppercase">UpSosh</span>
          <p className="font-mono text-xs text-ink-light">
            © {new Date().getFullYear()} UpSosh. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
