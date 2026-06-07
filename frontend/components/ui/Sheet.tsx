'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type SheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'right' | 'left';
  className?: string;
};

export const Sheet = ({ isOpen, onClose, children, title, side = 'right', className }: SheetProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const panelAnimation =
    side === 'right'
      ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
      : { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-void/80 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed top-0 h-full w-full max-w-sm bg-surface-2 p-6 z-50',
              side === 'right'
                ? 'right-0 border-l border-border-strong'
                : 'left-0 border-r border-border-strong',
              className,
            )}
            {...panelAnimation}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cream-dim hover:text-cream transition-colors"
              aria-label="Close"
            >
              <IconX size={18} />
            </button>
            {title && (
              <p className="font-display text-[20px] text-cream mb-4">{title}</p>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sheet;
