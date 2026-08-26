import Marquee from '@/components/Marquee';
import HeroSection from '@/components/sections/HeroSection';
import HowItWorks from '@/components/sections/HowItWorks';
import FeaturedEvents from '@/components/sections/FeaturedEvents';
import AIPlanner from '@/components/sections/AIPlanner';
import Testimonials from '@/components/sections/Testimonials';
import { generateOrganizationSchema, safeJsonLd } from '@/lib/structuredData';

// ─── Shared content arrays ────────────────────────────────────────────────────

const NICHES = [
  'Run clubs',
  'Creator meetups',
  'Workshops',
  'Dinner clubs',
  'Book circles',
  'Pop-up galleries',
  'Hiking groups',
  'Wellness retreats',
];

const SHOW_UP = [
  'Show up.',
  'Connect.',
  'Repeat.',
  '—',
  'Show up.',
  'Connect.',
  'Repeat.',
  '—',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(generateOrganizationSchema()) }}
      />

      {/* 1 — Hero */}
      <HeroSection />

      {/* Marquee 1: after hero, cream, speed 35 */}
      <Marquee items={NICHES} speed={35} accent="cream" />

      {/* 2 — How it works */}
      <HowItWorks />

      {/* 3 — Featured events */}
      <FeaturedEvents />

      {/* Marquee 2: after events, reverse, lime, speed 50 */}
      <Marquee items={NICHES} speed={50} reverse accent="lime" />

      {/* 4 — AI Planner teaser */}
      <AIPlanner />

      {/* 5 — Testimonials + stats */}
      <Testimonials />

      {/* Marquee 3: above footer, speed 30 */}
      <Marquee items={SHOW_UP} speed={30} accent="cream" />
    </>
  );
}
