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
  return <span className="text-accent mx-2 md:mx-3 select-none">·</span>;
}

export default function MarqueeBand() {
  return (
    <div className="bg-bg-dark py-5 overflow-hidden border-y border-white/5">
      <Marquee speed={35} gap={0}>
        {ITEMS.map((item) => (
          <span key={item} className="flex items-center">
            <span className="font-display italic text-white text-3xl md:text-5xl whitespace-nowrap px-2 md:px-3 leading-none">
              {item}
            </span>
            <Dot />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
