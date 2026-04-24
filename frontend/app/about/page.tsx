'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_VERCEL }}
    >
      {children}
    </motion.div>
  );
}

const VALUES = [
  { n: '01', title: 'Trust first', body: 'Every host is verified. Every event has accountability. We build safety into the platform, not as an afterthought.' },
  { n: '02', title: 'Real experiences', body: 'From rooftop dinners to book circles, we celebrate the full spectrum of how people actually gather.' },
  { n: '03', title: 'Host empowerment', body: 'We give hosts professional tools — pricing, analytics, ticketing — so they can focus on creating, not logistics.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-6"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_VERCEL }}
        >
          [ ABOUT US ]
        </motion.p>
        <motion.h1
          className="font-display text-ink-primary leading-[0.95] mb-8"
          style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE_VERCEL, delay: 0.08 }}
        >
          India's platform for<br />
          <em style={{ color: '#FF5A1F' }}>real gatherings.</em>
        </motion.h1>
        <motion.p
          className="font-sans text-xl text-ink-muted leading-relaxed max-w-2xl"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_VERCEL, delay: 0.18 }}
        >
          Building India's most trusted social discovery platform — one that reflects how people actually socialise in real life.
        </motion.p>
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 max-w-5xl mx-auto pb-24 border-t border-border">
        <div className="grid md:grid-cols-2 gap-12 pt-16">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-4">[ OUR STORY ]</p>
            <h2 className="font-display text-4xl text-ink-primary mb-6" style={{ letterSpacing: '-0.03em' }}>How it started.</h2>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <div className="space-y-5 pt-2 md:pt-12">
              <p className="font-sans text-base text-ink-muted leading-relaxed">
                UpSosh was founded by <strong className="text-ink-primary">Parrv Luthra</strong> and <strong className="text-ink-primary">Aadit Vachher</strong> with a shared belief that real social experiences deserve better structure, safety, and visibility.
              </p>
              <p className="font-sans text-base text-ink-muted leading-relaxed">
                While large platforms focus on concerts and commercial events, we noticed that the most meaningful experiences happen in smaller, informal settings — house parties, terrace gatherings, community meetups, creator-led sessions. These events were happening everywhere, yet they were fragmented, unstructured, and difficult to trust.
              </p>
              <p className="font-sans text-base text-ink-muted leading-relaxed">
                Together, we realised the core problem wasn't demand — people were already hosting and attending events. The real issue was the absence of a reliable platform that could bring structure, trust, and sustainability to both formal and informal events.
              </p>
              <p className="font-display text-xl text-ink-primary">That insight led to the creation of UpSosh.</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────── */}
      <section className="bg-bg-secondary py-20 px-6 md:px-12 border-t border-b border-border">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ WHAT WE BELIEVE ]</p>
            <h2 className="font-display text-4xl text-ink-primary mb-12" style={{ letterSpacing: '-0.03em' }}>Our values.</h2>
          </SectionReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <SectionReveal key={v.n} delay={i * 0.1}>
                <div className="border border-border rounded-2xl p-8 bg-bg-primary hover:bg-bg-secondary transition-colors">
                  <p className="font-mono text-3xl text-border mb-6">{v.n}</p>
                  <h3 className="font-display text-2xl text-ink-primary mb-3">{v.title}</h3>
                  <p className="font-sans text-base text-ink-muted leading-relaxed">{v.body}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we're building ───────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto border-b border-border">
        <SectionReveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ THE PLATFORM ]</p>
          <h2 className="font-display text-4xl text-ink-primary mb-8" style={{ letterSpacing: '-0.03em' }}>What we're building.</h2>
        </SectionReveal>
        <div className="grid md:grid-cols-2 gap-12">
          <SectionReveal delay={0.05}>
            <p className="font-sans text-base text-ink-muted leading-relaxed mb-4">
              UpSosh is a platform that allows users to seamlessly switch between formal and informal events — all in one place.
            </p>
            <p className="font-sans text-base text-ink-muted leading-relaxed">
              From workshops and curated experiences to house parties and community meetups, UpSosh enables structured, trustworthy social discovery.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <ul className="space-y-3">
              {[
                'Verified and accountable hosts',
                'Transparent pricing and clear refunds',
                'Safety standards and basic compliance',
                'Tools that help hosts run events sustainably',
                'Easier discovery of local social experiences',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  <span className="font-sans text-base text-ink-muted">{item}</span>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </section>

      {/* ── Founders ──────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <SectionReveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-3">[ TEAM ]</p>
          <h2 className="font-display text-4xl text-ink-primary mb-12" style={{ letterSpacing: '-0.03em' }}>The founders.</h2>
        </SectionReveal>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              name: 'Aadit Vachher',
              role: 'Co-Founder',
              img: '/assets/aadit-vachher.jpg',
              bio: 'Aadit comes from a business background and is a driven entrepreneur with strong people skills. He excels at delegation, coordination, and execution, ensuring ideas are translated into scalable systems.',
            },
            {
              name: 'Parrv Luthra',
              role: 'Co-Founder',
              img: '/assets/parrv-luthra.jpg',
              bio: 'Parrv comes from a business background and focuses on strategy, product direction, and the development of technology-led solutions. He brings a deep understanding of how communities interact with digital platforms.',
            },
          ].map((founder, i) => (
            <SectionReveal key={founder.name} delay={i * 0.1}>
              <div className="border border-border rounded-2xl p-8 bg-bg-primary hover:bg-bg-secondary transition-colors group">
                <div className="flex items-center gap-5 mb-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0 bg-bg-secondary">
                    <img
                      src={founder.img}
                      alt={founder.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-ink-primary">{founder.name}</h3>
                    <p className="font-mono text-xs text-accent uppercase tracking-widest mt-0.5">{founder.role}</p>
                  </div>
                </div>
                <p className="font-sans text-base text-ink-muted leading-relaxed">{founder.bio}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

    </div>
  );
}
