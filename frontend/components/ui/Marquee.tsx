'use client';

import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  gap?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export default function Marquee({
  children,
  speed = 40,
  direction = 'left',
  gap = 32,
  pauseOnHover = false,
  className,
}: MarqueeProps) {
  const duration = `${speed}s`;
  const animName = direction === 'left' ? 'marquee-left' : 'marquee-right';

  return (
    <div
      className={className}
      style={{ overflow: 'hidden', display: 'flex', userSelect: 'none' }}
      aria-hidden
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexShrink: 0,
            gap,
            animationName: animName,
            animationDuration: duration,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: 'running',
            willChange: 'transform',
          }}
          onMouseEnter={(e) => {
            if (pauseOnHover) (e.currentTarget as HTMLElement).style.animationPlayState = 'paused';
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover) (e.currentTarget as HTMLElement).style.animationPlayState = 'running';
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
