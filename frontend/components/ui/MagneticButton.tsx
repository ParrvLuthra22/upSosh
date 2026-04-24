'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  radius = 100,
  strength = 8,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isTouch.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
      const pull = (1 - dist / radius) * strength;
      setOffset({ x: (dx / dist) * pull, y: (dy / dist) * pull });
    }
  }

  function onMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  const isNeutral = offset.x === 0 && offset.y === 0;

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'inline-block',
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isNeutral
          ? 'transform 0.5s cubic-bezier(0.22,1,0.36,1)'
          : 'transform 0.1s linear',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
