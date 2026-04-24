import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  circle?: boolean;
  style?: CSSProperties;
}

/**
 * Brand-matched skeleton with directional shimmer.
 * Uses the globals.css `skeleton-shimmer` keyframe.
 * Always aria-hidden — screen readers should never announce skeletons.
 */
export function Skeleton({ className, circle, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-bg-secondary',
        circle ? 'rounded-full' : 'rounded-lg',
        className,
      )}
      style={style}
      aria-hidden="true"
      role="presentation"
    >
      <div className="skeleton-shimmer-bar" />
    </div>
  );
}

// ─── Compound variants ─────────────────────────────────────────────────────────

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true" role="presentation">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonEventListRow() {
  return (
    <div
      className="hidden md:flex items-center gap-6 py-5 border-t border-border px-6 md:px-10"
      aria-hidden="true"
      role="presentation"
    >
      <div className="w-[40%] space-y-2.5">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
      <div className="w-[30%] space-y-2.5">
        <Skeleton className="h-5 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
      <div className="w-[30%] flex justify-end">
        <Skeleton className="w-[160px] h-[107px] rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div
      className="rounded-2xl border border-border overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <div className="h-px bg-border" />
        <div className="flex justify-between">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3.5 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div
      className="border border-border rounded-2xl p-6 bg-bg-primary"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="h-3 w-1/2 mb-4" />
      <Skeleton className="h-10 w-3/4 mb-3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
