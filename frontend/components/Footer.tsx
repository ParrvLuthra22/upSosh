/**
 * components/Footer.tsx — shim
 * ─────────────────────────────
 * The canonical footer is GlobalFooter, rendered via ConditionalFooter.
 * This file re-exports it so any old direct imports still compile without
 * a second copy of the footer ever rendering.
 */
export { default } from '@/components/layout/GlobalFooter';
