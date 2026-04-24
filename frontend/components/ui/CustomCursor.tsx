'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  const onMove = useCallback((e: MouseEvent) => {
    pos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    function tick() {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove, { passive: true });

    const onEnter = (e: Event) => {
      const el = e.target as HTMLElement;
      setLabel(el.dataset.cursor ?? '');
      setIsHovering(true);
    };
    const onLeave = () => {
      setLabel('');
      setIsHovering(false);
    };

    const observe = () => {
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };

    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMove);
      mo.disconnect();
    };
  }, [onMove]);

  return (
    <div
      ref={cursorRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
        transform: 'translate(-100px, -100px)',
      }}
    >
      <div
        style={{
          width: isHovering ? 60 : 16,
          height: isHovering ? 60 : 16,
          borderRadius: '50%',
          backgroundColor: isHovering ? 'rgba(255, 90, 31, 0.15)' : '#FF5A1F',
          border: isHovering ? '1.5px solid #FF5A1F' : 'none',
          mixBlendMode: 'multiply',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isHovering ? -30 : -8,
          marginTop: isHovering ? -30 : -8,
          transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), height 0.35s cubic-bezier(0.22,1,0.36,1), margin 0.35s cubic-bezier(0.22,1,0.36,1), background-color 0.2s ease',
        }}
      >
        {label && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#FF5A1F',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
