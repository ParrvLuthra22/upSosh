'use client';

/**
 * components/ProtectedRoute.tsx
 * ──────────────────────────────
 * Two ways to protect a page:
 *
 *   1. Wrap the page JSX:
 *      <ProtectedRoute>
 *        <DashboardContent />
 *      </ProtectedRoute>
 *
 *   2. HOC — wrap the page component export:
 *      export default withAuth(DashboardPage);
 *
 *   3. Hook — use inside a component for custom guard logic:
 *      const { isReady, isAuthenticated } = useProtectedRoute();
 *
 * Behaviour:
 *   • Unauthenticated after hydration → redirect to /signin?from=<current path>
 *   • Pre-hydration / loading → show full-screen loading skeleton
 *   • Authenticated → render children
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth';

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-6">
      {/* Pulsing ring */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-lime/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-lime animate-spin" />
      </div>

      {/* Skeleton lines */}
      <div className="flex flex-col items-center gap-3 w-48">
        <div className="h-2 w-full rounded-full bg-surface animate-pulse" />
        <div className="h-2 w-3/4 rounded-full bg-surface animate-pulse" />
      </div>
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProtectedRoute() {
  const { user, isLoading, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isReady = hydrated && !isLoading;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace(`/signin?from=${encodeURIComponent(pathname)}`);
    }
  }, [isReady, isAuthenticated, pathname, router]);

  return { isReady, isAuthenticated, user };
}

// ─── Wrapper component ────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Override the redirect target (defaults to /signin) */
  redirectTo?: string;
  /** Custom fallback instead of the default skeleton */
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/signin',
  fallback,
}: ProtectedRouteProps) {
  const { user, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect once we know for sure there's no user (after hydration)
    if (!hydrated) return;
    if (!user) {
      router.replace(`${redirectTo}?from=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, pathname, redirectTo, router]);

  // Before localStorage has rehydrated we can't know if the user is logged in.
  // Show skeleton only during that brief moment (~50ms).
  if (!hydrated) {
    return <>{fallback ?? <AuthLoadingSkeleton />}</>;
  }

  // Hydrated + user exists → show content immediately.
  // refresh() runs in the background (AuthProvider); if it later resolves as
  // 401 the store clears the user and the useEffect above will redirect.
  if (user) return <>{children}</>;

  // Hydrated, no user, redirect in flight
  return <>{fallback ?? <AuthLoadingSkeleton />}</>;
}

// ─── HOC ──────────────────────────────────────────────────────────────────────

/**
 * Wraps a page component with auth protection.
 *
 * @example
 *   export default withAuth(DashboardPage);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: React.ReactNode }
) {
  const Guarded = (props: P) => (
    <ProtectedRoute
      redirectTo={options?.redirectTo}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </ProtectedRoute>
  );

  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name})`;
  return Guarded;
}
