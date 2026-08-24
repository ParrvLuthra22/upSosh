'use client';

import Link from 'next/link';
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconHeartFilled,
} from '@tabler/icons-react';

const PRODUCT = [
  { label: 'Discover',      href: '/discover' },
  { label: 'AI Planner',    href: '/planner' },
  { label: 'Become a Host', href: '/become-a-host' },
];

const COMPANY = [
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/contact' },
];

const LEGAL = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy',    href: '/refund' },
  { label: 'Safety',           href: '/safety' },
];

// X/Twitter dropped — no live account to link (was href="#").
const SOCIAL = [
  { label: 'Instagram',   href: 'https://www.instagram.com/upsosh.app/', Icon: IconBrandInstagram },
  { label: 'LinkedIn',    href: 'https://www.linkedin.com/company/upsosh', Icon: IconBrandLinkedin },
];

function LinkColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="label text-cream-faint mb-4">{heading}</p>
      <ul className="space-y-1">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href}
              className="block font-sans text-[14px] text-cream-dim hover:text-cream py-1 transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GlobalFooter() {
  return (
    <footer className="bg-void border-t border-border py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand — col-span-5 */}
          <div className="md:col-span-5">
            <p className="font-display italic text-[40px] text-cream leading-none tracking-tight">
              UpSosh
            </p>
            <p className="font-sans text-[15px] text-cream-dim max-w-xs mt-4 leading-relaxed">
              The curated platform for micro-events worth showing up to.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-cream-dim hover:text-lime hover:border-lime/30 transition-all duration-200">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Product — col-span-2 */}
          <div className="md:col-span-2">
            <LinkColumn heading="Product" links={PRODUCT} />
          </div>

          {/* Company — col-span-2 */}
          <div className="md:col-span-2">
            <LinkColumn heading="Company" links={COMPANY} />
          </div>

          {/* Legal — col-span-3 */}
          <div className="md:col-span-3">
            <LinkColumn heading="Legal" links={LEGAL} />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-sans text-[13px] text-cream-faint">
            © {new Date().getFullYear()} UpSosh. All rights reserved.
          </p>
          <p className="font-sans text-[13px] text-cream-faint flex items-center gap-1.5">
            Made with <IconHeartFilled size={13} className="text-coral" aria-label="love" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
