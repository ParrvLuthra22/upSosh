'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { currentMode, MODE_LINKS } from '@/lib/navLinks';

/** Attending / Hosting toggle for people who can host. Two links, so it works without JS and on every screen size. */
export default function ModeSwitch({ className = '', onNavigate }: { className?: string; onNavigate?: () => void }) {
  const mode = currentMode(usePathname());
  const item = (id: 'attending' | 'hosting', label: string) => (
    <Link
      href={MODE_LINKS[id]}
      onClick={onNavigate}
      aria-current={mode === id ? 'page' : undefined}
      className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
        mode === id ? 'bg-lime text-void' : 'text-cream-dim hover:text-cream'
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div role="group" aria-label="Switch between attending and hosting" className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 ${className}`}>
      {item('attending', 'Attending')}
      {item('hosting', 'Hosting')}
    </div>
  );
}
