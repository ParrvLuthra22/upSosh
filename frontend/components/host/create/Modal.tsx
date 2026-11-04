'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { useReducedMotion } from '@/lib/motion';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  title: string;
  /** Esc, backdrop click and the X close without saving. */
  onClose: () => void;
  /** "Done" saves. Return false to keep the modal open (e.g. validation failed). */
  onDone?: () => void | boolean;
  doneLabel?: string;
  children: React.ReactNode;
}

/**
 * Small accessible dialog: Esc + backdrop close, focus is trapped inside and
 * restored on close, fade/scale only (instant when reduced motion is on).
 */
export function Modal({ open, title, onClose, onDone, doneLabel = 'Done', children }: ModalProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // Focus the first field, else the first control.
    const first = panel?.querySelector<HTMLElement>('input, textarea, select, [data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === firstEl || !panel.contains(active))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (active === lastEl || !panel.contains(active))) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      returnTo.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (typeof document === 'undefined') return null;

  const dur = reduced ? 0 : 0.16;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: dur }}
        >
          <div className="absolute inset-0 bg-void/80" onClick={onClose} data-testid="modal-backdrop" aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-2xl border border-border-strong bg-surface p-6 shadow-2xl"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.97 }}
            transition={{ duration: dur }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id={titleId} className="font-display text-xl text-cream">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 w-11 h-11 flex items-center justify-center rounded-full text-cream-dim hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-lime"
              >
                <IconX size={20} aria-hidden="true" />
              </button>
            </div>
            {children}
            {onDone && (
              <button
                type="button"
                onClick={() => { if (onDone() !== false) onClose(); }}
                className="mt-5 w-full min-h-[44px] rounded-full bg-lime text-void font-sans text-sm font-semibold hover:bg-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {doneLabel}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
