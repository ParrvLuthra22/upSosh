'use client';

import Marquee from '@/components/ui/Marquee';

const ITEMS = [
  'Run clubs',
  'Creator meetups',
  'Workshops',
  'Dinner clubs',
  'Book circles',
  'Micro-events',
  'Pop-up galleries',
  'Hiking groups',
];

function Dot() {
  return <span className="text-lime mx-3 select-none opacity-60">·</span>;
}

export default function MarqueeBand() {
  return (
    <div className="bg-void py-5 overflow-hidden border-y border-border">
      <Marquee speed={35} gap={0}>
        {ITEMS.map((item) => (
          <span key={item} className="flex items-center">
            <span className="font-display italic text-cream text-3xl md:text-5xl whitespace-nowrap px-3 leading-none opacity-80">
              {item}
            </span>
            <Dot />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
