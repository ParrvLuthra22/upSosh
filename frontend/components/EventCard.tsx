'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  IconClock,
  IconStar,
  IconRosetteDiscountCheck,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  id: string;
  title: string;
  host: string;
  hostAvatar?: string;
  date: string;
  time: string;
  price: number | 'Free';
  currency?: string;
  category: string;
  imageUrl: string;
  attendeeCount?: number;
  spotsLeft: number;
  isVerified?: boolean;
  isSuperhost?: boolean;
  location: string;
}

function parseDateParts(date: string): { day: string; month: string } {
  // Try native Date parse first
  const parsed = new Date(date);
  if (!isNaN(parsed.getTime())) {
    const day = parsed.getDate().toString();
    const month = parsed.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return { day, month };
  }

  // Fallback: extract digits and alpha from string like "Sun 24 Nov"
  const match = date.match(/(\d+)\s+([A-Za-z]+)/);
  if (match) {
    return { day: match[1], month: match[2].toUpperCase().slice(0, 3) };
  }

  return { day: '—', month: '—' };
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function EventCard({
  id,
  title,
  host,
  hostAvatar,
  date,
  time,
  price,
  currency = '₹',
  category,
  imageUrl,
  spotsLeft,
  isVerified,
  isSuperhost,
  location,
}: EventCardProps) {
  const { day, month } = parseDateParts(date);
  const initials = getInitials(host);
  const isFree = price === 'Free' || price === 0;

  return (
    <motion.div
      whileHover={{ y: -6, borderColor: 'var(--border-strong)' }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        'bg-surface border border-border rounded-3xl overflow-hidden group cursor-pointer'
      )}
    >
      <Link href={`/events/${id}`} legacyBehavior={false} className="block">
        {/* Image area */}
        <div className="relative overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-[350ms]"
            style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
          />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(10,10,11,0.4)] to-transparent pointer-events-none" />

          {/* Date badge — top-left */}
          <div className="absolute top-3 left-3 bg-[rgba(10,10,11,0.6)] backdrop-blur-md rounded-xl px-3 py-2 flex flex-col items-center leading-none">
            <span
              className="text-cream text-[32px]"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, lineHeight: 1 }}
            >
              {day}
            </span>
            <span
              className="text-cream text-[10px] uppercase mt-0.5"
              style={{ fontFamily: 'Geist Mono, monospace', letterSpacing: '0.05em' }}
            >
              {month}
            </span>
          </div>

          {/* Category pill — top-right */}
          <div className="absolute top-3 right-3 bg-[rgba(244,241,234,0.10)] backdrop-blur-md text-cream font-mono text-[11px] uppercase tracking-wider rounded-full px-3 py-1">
            {category}
          </div>

          {/* Spots badge — bottom-right */}
          <SpotsBadge spotsLeft={spotsLeft} />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Host row */}
          <div className="flex items-center gap-2">
            {hostAvatar ? (
              <Image
                src={hostAvatar}
                alt={host}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-lime flex items-center justify-center shrink-0">
                <span
                  className="text-void text-[9px] font-bold"
                  style={{ fontFamily: 'Fraunces, serif' }}
                >
                  {initials}
                </span>
              </div>
            )}
            <span className="font-sans text-[13px] text-cream">{host}</span>
            {isSuperhost ? (
              <IconStar size={12} className="text-coral" />
            ) : isVerified ? (
              <IconRosetteDiscountCheck size={12} className="text-lime" />
            ) : null}
          </div>

          {/* Title */}
          <h3
            className="mt-3 text-[22px] text-cream line-clamp-2 leading-tight text-balance"
            style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
          >
            {title}
          </h3>

          {/* Footer row */}
          <div className="mt-4 flex items-center justify-between">
            {/* Left: time + location */}
            <div className="flex items-center gap-1.5 font-sans text-[12px] text-cream-dim">
              <IconClock size={12} />
              <span>{time}</span>
              <span className="opacity-40">·</span>
              <span className="truncate max-w-[60%]">{location}</span>
            </div>

            {/* Right: price */}
            {isFree ? (
              <span
                className="text-[20px] text-lime"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
              >
                Free
              </span>
            ) : (
              <div className="flex items-baseline">
                <span
                  className="text-[20px] text-lime"
                  style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
                >
                  {currency}
                  {(price as number).toLocaleString('en-IN')}
                </span>
                <span className="font-sans text-[11px] text-cream-dim ml-0.5">
                  /person
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SpotsBadge({ spotsLeft }: { spotsLeft: number }) {
  if (spotsLeft === 0) {
    return (
      <div className="absolute bottom-3 right-3 bg-coral/20 text-coral font-mono text-[11px] rounded-full px-3 py-1 backdrop-blur-md">
        Full
      </div>
    );
  }

  if (spotsLeft <= 3) {
    return (
      <motion.div
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-3 right-3 bg-coral/20 text-coral font-mono text-[11px] rounded-full px-3 py-1 backdrop-blur-md"
      >
        {spotsLeft} left
      </motion.div>
    );
  }

  return (
    <div className="absolute bottom-3 right-3 bg-[rgba(10,10,11,0.60)] text-cream-dim font-mono text-[11px] rounded-full px-3 py-1 backdrop-blur-md">
      {spotsLeft} spots
    </div>
  );
}

export default EventCard;
