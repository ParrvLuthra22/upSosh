'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EASE_VERCEL } from '@/lib/motion';

const PRODUCT_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'AI Planner', href: '/planner' },
  { label: 'Become a Host', href: '/become-a-host' },
  { label: 'Pricing', href: '/pricing' },
];

const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Features', href: '/features' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Safety', href: '/safety' },
];

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/upsosh.app/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/upsosh',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
];

export default function GlobalFooter() {
  return (
    <footer className="bg-bg-dark relative overflow-hidden">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Product */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Product</p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Company</p>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Legal</p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-sans text-sm text-white/60 hover:text-white transition-colors duration-200">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Connect</p>
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <p className="font-sans text-[13px] text-white/40 mt-5 leading-relaxed">
              The curated platform for<br />micro-events worth showing up to.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-white/30">© {new Date().getFullYear()} UpSosh. All rights reserved.</p>
          <p className="font-mono text-[11px] text-white/20">Made with care in India 🇮🇳</p>
        </div>
      </div>

      {/* Editorial wordmark — clipped at bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
        style={{ height: 'clamp(5rem, 10vw, 9rem)' }}
        aria-hidden="true"
      >
        <p
          className="font-display text-white/5 leading-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap select-none"
          style={{
            fontSize: 'clamp(6rem, 14vw, 12rem)',
            color: '#FF5A1F',
            opacity: 0.07,
            letterSpacing: '-0.04em',
          }}
        >
          UpSosh
        </p>
      </div>
    </footer>
  );
}
